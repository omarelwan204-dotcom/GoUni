
import { GoogleGenAI } from "@google/genai";

// Always initialize a fresh client to ensure the latest API key is used
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // Simple text task: use gemini-3-flash-preview
  async getAdmissionAdvice(userQuery: string) {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userQuery,
        config: {
          systemInstruction: `You are GoUni Assistant, a professional admission specialist. 
          Your goal is to help students with information about private and national universities in Egypt. 
          Be polite, professional, and concise. 
          Focus on: Major recommendations, application deadlines, and general certificate requirements (IG, Thanaweya Amma, etc.).
          Always encourage students to book a consultation with the main team via the application form on the website.
          Contact Info: Phone/WhatsApp: 01004564067, Email: workoe2023@gmail.com.
          Social Media: Facebook (GoUni), Instagram (@gouni._), TikTok (@gouni._).`,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm sorry, I'm having trouble connecting. Please try again or use our contact form.";
    }
  },

  // Complex text task: use gemini-3-pro-preview
  async chat(message: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
    });
    return response;
  },

  // Image generation task: use gemini-2.5-flash-image
  async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16") {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    // Find and return the base64 image data from the parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  },

  // Grounding task: use gemini-2.5-flash for maps support as required by guidelines
  async explore(query: string, location?: { lat: number, lng: number }) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        } : undefined
      }
    });
    return response;
  },

  // Video generation task: use veo-3.1-fast-generate-preview
  async generateVideo(prompt: string) {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for video generation completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    // Append the API key to the download link as required by the Veo API
    return `${downloadLink}&key=${process.env.API_KEY}`;
  }
};
