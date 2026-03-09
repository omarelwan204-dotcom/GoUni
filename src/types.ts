
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'admin' | 'manager';
  password?: string;
}

export type ApplicationStatus = 'Received' | 'Under Review' | 'Submitted' | 'Decision' | 'Finalized';
export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Missing';

export interface Document {
  id: string;
  name: string;
  type: 'ID_FRONT' | 'ID_BACK' | 'CERTIFICATE' | 'PHOTO' | 'PASSPORT' | 'OTHER';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Missing';
  url: string;
  uploadDate: number;
  feedback?: string;
}

export interface Installment {
  id: string;
  amount: number;
  dueDate: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentDate?: number;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  date: number;
  method: string;
  receiptUrl?: string;
}

export interface UniversityRecommendation {
  id: string;
  universityName: string;
  major: string;
  reason: string;
  estimatedFees: number;
  tier: 'Top' | 'Mid' | 'Available';
}

export interface ManualPayment {
  id: string;
  amount: number;
  receiptUrl: string;
  status: 'Pending Verification' | 'Approved' | 'Rejected';
  timestamp: number;
  notes?: string;
  adminNote?: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderRole: 'student' | 'admin' | 'manager';
  message: string;
  timestamp: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  messages: TicketMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface StudentProfile extends User {
  phoneNumber: string;
  highSchoolType: string;
  score: number;
  certificateType: string;
  selectedUniversity: string;
  selectedMajor: string;
  notes?: string;
  internalNotes?: string;
  assignedTo?: string; // ID of the Admin assigned to this student
  applicationStatus: ApplicationStatus;
  paymentInfo: {
    totalFee: number;
    amountPaid: number;
    status: 'Paid' | 'Partially Paid' | 'Pending';
    installments: Installment[];
    history: PaymentHistory[];
    manualPayments: ManualPayment[];
  };
  documents: Document[];
  notifications: Notification[];
  tickets: SupportTicket[];
  recommendations: UniversityRecommendation[];
  progress: {
    profileCompleted: boolean;
    academicCompleted: boolean;
    preferencesCompleted: boolean;
    documentsCompleted: boolean;
    finalReviewCompleted: boolean;
  };
  createdAt: number;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface University {
  id: string;
  nameEn: string;
  nameAr: string;
  typeEn: string;
  typeAr: string;
  locationEn: string;
  locationAr: string;
  facultiesEn?: string[];
  facultiesAr?: string[];
  notes?: string;
}

export type Language = 'en' | 'ar';

export interface ApplicationFormData {
  fullName: string;
  score: string;
  certificateType: string;
  desiredMajor: string;
  phone: string;
}

export interface ContactFormData {
  name: string;
  phone: string;
  message: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Added GroundingChunk interface for Google Search and Maps grounding support
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}
