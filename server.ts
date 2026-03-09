import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "gouni-secret-key-2026";

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Multer configuration for file uploads
const upload = multer({ storage: multer.memoryStorage() });

let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, fullName } = req.body;
    
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { fullName, role: 'student' }
      });

      if (authError) return res.status(400).json({ message: authError.message });

      const newUser = {
        id: authData.user.id,
        email,
        fullName,
        role: "student"
      };

      // 2. Create student profile in Supabase Database
      const studentProfile = {
        id: newUser.id,
        email,
        fullName,
        role: "student",
        phoneNumber: "",
        highSchoolType: "Not Set",
        score: 0,
        certificateType: "Not Set",
        selectedUniversity: "None",
        selectedMajor: "None",
        notes: "",
        internalNotes: "",
        applicationStatus: "Received",
        paymentInfo: {
          totalFee: 0,
          amountPaid: 0,
          status: "Pending",
          installments: [],
          history: [],
          manualPayments: []
        },
        documents: [],
        notifications: [
          { id: "1", message: "Welcome to GoUni! Your account has been created.", timestamp: Date.now(), read: false }
        ],
        tickets: [],
        recommendations: [],
        progress: {
          profileCompleted: true,
          academicCompleted: false,
          preferencesCompleted: false,
          documentsCompleted: false,
          finalReviewCompleted: false
        },
        createdAt: Date.now()
      };

      const { error: dbError } = await supabase
        .from('applications')
        .insert([studentProfile]);

      if (dbError) return res.status(400).json({ message: dbError.message });

      const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET);
      res.json({ token, user: studentProfile });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) return res.status(401).json({ message: authError.message });

      const userMetadata = authData.user.user_metadata;
      const role = userMetadata.role || 'student';

      if (role === 'manager' || role === 'admin') {
        const staffUser = { 
          id: authData.user.id, 
          email: authData.user.email, 
          fullName: userMetadata.fullName || "Staff Member", 
          role 
        };
        const token = jwt.sign({ id: staffUser.id, role: staffUser.role }, JWT_SECRET);
        return res.json({ token, user: staffUser });
      }

      // 2. Fetch profile from Supabase Database for students
      const { data: student, error: dbError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (dbError || !student) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const token = jwt.sign({ id: student.id, role: student.role }, JWT_SECRET);
      res.json({ token, user: student });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Middleware to verify token
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  // Student Routes
  app.get("/api/student/profile", authenticate, async (req: any, res) => {
    const { data: student, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (error || !student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  });

  app.patch("/api/student/profile", authenticate, async (req: any, res) => {
    const { data: student, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (fetchError || !student) return res.status(404).json({ message: "Student not found" });
    
    // Check if editable
    if (student.applicationStatus !== 'Received' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Application is under review and cannot be edited." });
    }

    const updates = req.body;
    
    // Update progress if academic info added
    if (updates.score !== undefined || updates.certificateType !== undefined) {
      if (!updates.progress) updates.progress = { ...student.progress };
      updates.progress.academicCompleted = true;
    }

    const { data: updatedStudent, error: updateError } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) return res.status(400).json({ message: updateError.message });
    res.json(updatedStudent);
  });

  app.post("/api/student/upload-document", authenticate, upload.single('file'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { type } = req.body;
    const studentId = req.user.id;

    try {
      const file = req.file;
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${studentId}/${type}_${Date.now()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (storageError) return res.status(500).json({ message: storageError.message });

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // 3. Update Student Profile
      const { data: student, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', studentId)
        .single();

      if (fetchError || !student) return res.status(404).json({ message: "Student not found" });

      const newDoc = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.originalname,
        type: type,
        status: 'Pending',
        url: publicUrl,
        uploadDate: Date.now()
      };

      const updatedDocuments = [...student.documents.filter((d: any) => d.type !== type), newDoc];
      
      const { data: updatedStudent, error: updateError } = await supabase
        .from('applications')
        .update({ documents: updatedDocuments })
        .eq('id', studentId)
        .select()
        .single();

      if (updateError) return res.status(400).json({ message: updateError.message });
      res.json(updatedStudent);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/student/upload-receipt", authenticate, upload.single('file'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { amount, notes } = req.body;
    const studentId = req.user.id;

    try {
      const file = req.file;
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${studentId}/receipt_${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (storageError) return res.status(500).json({ message: storageError.message });

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { data: student, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', studentId)
        .single();

      if (fetchError || !student) return res.status(404).json({ message: "Student not found" });

      const newManualPayment = {
        id: Math.random().toString(36).substr(2, 9),
        amount: Number(amount),
        receiptUrl: publicUrl,
        status: 'Pending Verification',
        timestamp: Date.now(),
        notes: notes || ''
      };

      const updatedManualPayments = [...(student.paymentInfo.manualPayments || []), newManualPayment];
      const updatedPaymentInfo = { ...student.paymentInfo, manualPayments: updatedManualPayments };
      
      const { data: updatedStudent, error: updateError } = await supabase
        .from('applications')
        .update({ paymentInfo: updatedPaymentInfo })
        .eq('id', studentId)
        .select()
        .single();

      if (updateError) return res.status(400).json({ message: updateError.message });
      res.json(updatedStudent);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin Routes
  app.get("/api/admin/students", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }

    let query = supabase
      .from('applications')
      .select('*')
      .order('createdAt', { ascending: false });
    
    // If Admin (staff), only show assigned students
    if (req.user.role === 'admin') {
      query = query.eq('assignedTo', req.user.id);
    }
    
    const { data: students, error } = await query;
    
    if (error) return res.status(500).json({ message: error.message });
    res.json(students);
  });

  app.get("/api/admin/staff", authenticate, async (req: any, res) => {
    if (req.user.role !== "manager") return res.status(403).json({ message: "Forbidden" });
    
    try {
      // List users from Supabase Auth
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) return res.status(500).json({ message: error.message });
      
      const staff = (data.users as any[])
        .filter(u => u.user_metadata?.role === 'admin' || u.user_metadata?.role === 'manager')
        .map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.user_metadata?.fullName || "Staff Member",
          role: u.user_metadata?.role
        }));

      // Get workload for each staff
      const { data: applications } = await supabase.from('applications').select('assignedTo, applicationStatus');
      
      const staffWithWorkload = staff.map(s => {
        const assignedApps = applications?.filter(a => a.assignedTo === s.id) || [];
        return {
          ...s,
          workload: assignedApps.length,
          completed: assignedApps.filter(a => a.applicationStatus === 'Finalized').length
        };
      });
        
      res.json(staffWithWorkload);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Stripe Payment Routes
  app.post("/api/student/create-checkout-session", authenticate, async (req: any, res) => {
    const s = getStripe();
    if (!s) return res.status(500).json({ message: "Stripe not configured" });

    const { amount, installmentId } = req.body;
    
    const { data: student, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !student) return res.status(404).json({ message: "Student not found" });

    try {
      const session = await s.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'egp',
            product_data: {
              name: installmentId ? `Installment Payment - ${student.fullName}` : `Service Fee - ${student.fullName}`,
              description: installmentId ? `Payment for installment #${installmentId}` : 'GoUni Educational Consulting Fee',
            },
            unit_amount: amount * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/dashboard?payment=cancel`,
        metadata: {
          studentId: student.id,
          installmentId: installmentId || '',
          amount: amount.toString()
        }
      });

      res.json({ id: session.id, url: session.url });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/payments/verify", authenticate, async (req: any, res) => {
    const { session_id } = req.query;
    const s = getStripe();
    if (!s) return res.status(500).json({ message: "Stripe not configured" });

    try {
      const session = await s.checkout.sessions.retrieve(session_id as string);
      if (session.payment_status === 'paid') {
        const studentId = session.metadata?.studentId;
        const amount = Number(session.metadata?.amount);
        const installmentId = session.metadata?.installmentId;

        const { data: student, error: fetchError } = await supabase
          .from('applications')
          .select('*')
          .eq('id', studentId)
          .single();

        if (fetchError || !student) return res.status(404).json({ message: "Student not found" });
          
        // Check if this session was already processed
        const alreadyProcessed = student.paymentInfo.history.some((h: any) => h.id === session.id);
        if (!alreadyProcessed) {
          const updatedPaymentInfo = { ...student.paymentInfo };
          updatedPaymentInfo.amountPaid += amount;
          
          // Update installment status if applicable
          if (installmentId) {
            updatedPaymentInfo.installments = updatedPaymentInfo.installments.map((i: any) => 
              i.id === installmentId ? { ...i, status: 'Paid', paymentDate: Date.now() } : i
            );
          }

          // Update overall status
          if (updatedPaymentInfo.amountPaid >= updatedPaymentInfo.totalFee) {
            updatedPaymentInfo.status = 'Paid';
          } else {
            updatedPaymentInfo.status = 'Partially Paid';
          }

          // Add to history
          updatedPaymentInfo.history.unshift({
            id: session.id,
            amount: amount,
            date: Date.now(),
            method: 'Card (Stripe)',
            receiptUrl: session.success_url
          });

          const updatedNotifications = [
            {
              id: Math.random().toString(36).substr(2, 9),
              message: `Payment of EGP ${amount.toLocaleString()} received successfully!`,
              timestamp: Date.now(),
              read: false
            },
            ...student.notifications
          ];

          const { data: updatedStudent, error: updateError } = await supabase
            .from('applications')
            .update({ 
              paymentInfo: updatedPaymentInfo,
              notifications: updatedNotifications
            })
            .eq('id', studentId)
            .select()
            .single();

          if (updateError) return res.status(400).json({ message: updateError.message });
          return res.json({ status: 'success', profile: updatedStudent });
        }
        return res.json({ status: 'success', profile: student });
      }
      res.status(400).json({ message: "Payment not verified" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/admin/students/:id", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.params;
    const updates = req.body;
    
    const { data: student, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !student) return res.status(404).json({ message: "Student not found" });
    
    // Check if Admin is allowed to update this student
    if (req.user.role === 'admin' && student.assignedTo !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Not assigned to you" });
    }
    
    const updatedStudentData = { ...student, ...updates };
    
    // Recalculate status if payment info updated
    if (updates.paymentInfo) {
      const p = updatedStudentData.paymentInfo;
      
      // Handle manual payment verification if present in updates
      if (updates.verifyManualPayment) {
        const { paymentId, status, adminNote } = updates.verifyManualPayment;
        const payment = p.manualPayments.find((mp: any) => mp.id === paymentId);
        
        if (payment && payment.status === 'Pending Verification') {
          payment.status = status;
          payment.adminNote = adminNote;
          
          if (status === 'Approved') {
            p.amountPaid += payment.amount;
            p.history.unshift({
              id: `manual-${paymentId}`,
              amount: payment.amount,
              date: Date.now(),
              method: 'Manual Transfer',
              receiptUrl: payment.receiptUrl
            });
          }
        }
        delete updatedStudentData.verifyManualPayment;
      }

      if (p.totalFee === 0) {
        p.status = 'Pending';
      } else if (p.amountPaid >= p.totalFee) {
        p.status = 'Paid';
      } else if (p.amountPaid > 0) {
        p.status = 'Partially Paid';
      } else {
        p.status = 'Pending';
      }

      // Auto-generate installments if totalFee is set and no installments exist
      if (p.totalFee > 0 && p.installments.length === 0) {
        const installmentAmount = Math.floor(p.totalFee / 3);
        p.installments = [
          { id: 'inst-1', amount: installmentAmount, dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, status: 'Pending' },
          { id: 'inst-2', amount: installmentAmount, dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, status: 'Pending' },
          { id: 'inst-3', amount: p.totalFee - (installmentAmount * 2), dueDate: Date.now() + 60 * 24 * 60 * 60 * 1000, status: 'Pending' }
        ];
      }
    }

    // Smart Recommendation Logic
    if (updates.score !== undefined) {
      const score = Number(updates.score);
      const recommendations = [];
      
      if (score >= 85) {
        recommendations.push(
          { id: '1', universityName: 'Cairo University', major: 'Engineering', reason: 'Top tier university for high achievers.', estimatedFees: 50000, tier: 'Top' },
          { id: '2', universityName: 'AUC', major: 'Business', reason: 'Prestigious private university.', estimatedFees: 150000, tier: 'Top' }
        );
      } else if (score >= 75) {
        recommendations.push(
          { id: '3', universityName: 'Ain Shams University', major: 'Commerce', reason: 'Strong academic reputation.', estimatedFees: 30000, tier: 'Mid' },
          { id: '4', universityName: 'GUC', major: 'Applied Arts', reason: 'Modern facilities and industry links.', estimatedFees: 90000, tier: 'Mid' }
        );
      } else if (score >= 65) {
        recommendations.push(
          { id: '5', universityName: 'Helwan University', major: 'Fine Arts', reason: 'Specialized programs available.', estimatedFees: 20000, tier: 'Available' },
          { id: '6', universityName: 'Modern Academy', major: 'Computer Science', reason: 'Accessible entry requirements.', estimatedFees: 45000, tier: 'Available' }
        );
      }
      updatedStudentData.recommendations = recommendations;
      updatedStudentData.progress.academicCompleted = true;
    }

    // Progress Tracking
    if (updatedStudentData.selectedUniversity !== "None") updatedStudentData.progress.preferencesCompleted = true;
    if (updatedStudentData.documents.length >= 4) updatedStudentData.progress.documentsCompleted = true;
    if (updatedStudentData.applicationStatus === 'Finalized') updatedStudentData.progress.finalReviewCompleted = true;

    // Specific Notifications
    const notifications = [...updatedStudentData.notifications];
    if (updates.documents) {
      const latestDoc = updates.documents[updates.documents.length - 1];
      if (latestDoc && latestDoc.status !== 'Pending') {
        notifications.unshift({
          id: Math.random().toString(36).substr(2, 9),
          message: `Your document "${latestDoc.type.replace('_', ' ')}" has been ${latestDoc.status.toLowerCase()}.`,
          timestamp: Date.now(),
          read: false
        });
      }
    }

    if (updates.applicationStatus) {
      notifications.unshift({
        id: Math.random().toString(36).substr(2, 9),
        message: `Your application status has been updated to: ${updates.applicationStatus}.`,
        timestamp: Date.now(),
        read: false
      });
    } else if (!updates.documents) {
      notifications.unshift({
        id: Math.random().toString(36).substr(2, 9),
        message: `Your profile information has been updated by an administrator.`,
        timestamp: Date.now(),
        read: false
      });
    }
    updatedStudentData.notifications = notifications;

    const { data: finalUpdatedStudent, error: updateError } = await supabase
      .from('applications')
      .update(updatedStudentData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) return res.status(400).json({ message: updateError.message });
    res.json(finalUpdatedStudent);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Support Ticket Routes
  app.get("/api/tickets", authenticate, async (req: any, res) => {
    try {
      if (req.user.role === 'student') {
        const { data: student } = await supabase.from('applications').select('tickets').eq('id', req.user.id).single();
        return res.json(student?.tickets || []);
      } else {
        // Admins see all tickets from all students
        const { data: students } = await supabase.from('applications').select('id, fullName, tickets');
        const allTickets = students?.flatMap(s => (s.tickets || []).map((t: any) => ({ ...t, studentId: s.id, studentName: s.fullName }))) || [];
        return res.json(allTickets);
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/tickets", authenticate, async (req: any, res) => {
    const { subject, message, priority } = req.body;
    try {
      const { data: student } = await supabase.from('applications').select('tickets').eq('id', req.user.id).single();
      const tickets = student?.tickets || [];
      
      const newTicket = {
        id: Math.random().toString(36).substr(2, 9),
        subject,
        status: 'Open',
        priority: priority || 'Medium',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [{
          id: 'msg-1',
          senderId: req.user.id,
          senderRole: req.user.role,
          message,
          timestamp: Date.now()
        }]
      };

      const { error } = await supabase.from('applications').update({ tickets: [...tickets, newTicket] }).eq('id', req.user.id);
      if (error) throw error;
      res.json(newTicket);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/tickets/:id/reply", authenticate, async (req: any, res) => {
    const { message, studentId } = req.body;
    const ticketId = req.params.id;
    const targetId = req.user.role === 'student' ? req.user.id : studentId;

    try {
      const { data: student } = await supabase.from('applications').select('tickets').eq('id', targetId).single();
      const tickets = student?.tickets || [];
      const ticketIndex = tickets.findIndex((t: any) => t.id === ticketId);
      
      if (ticketIndex === -1) return res.status(404).json({ message: "Ticket not found" });

      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: req.user.id,
        senderRole: req.user.role,
        message,
        timestamp: Date.now()
      };

      tickets[ticketIndex].messages.push(newMessage);
      tickets[ticketIndex].updatedAt = Date.now();
      if (req.user.role !== 'student') {
        tickets[ticketIndex].status = 'In Progress';
      }

      const { error } = await supabase.from('applications').update({ tickets }).eq('id', targetId);
      if (error) throw error;
      res.json(tickets[ticketIndex]);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
