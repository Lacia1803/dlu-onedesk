"use server";

import { db } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `Bạn là trợ lý AI của DLU OneDesk — hệ thống hỗ trợ kỹ thuật Trung tâm CNTT Trường Đại học Đà Lạt.

Nhiệm vụ:
- Giúp người dùng chẩn đoán lỗi thiết bị, phần mềm, mạng.
- Hướng dẫn các bước khắc phục đơn giản.
- Nếu không giải quyết được, gợi ý tạo Ticket.

Ngữ cảnh FAQ được cung cấp bên dưới. Dùng nó làm nguồn chính để trả lời.
Nếu câu hỏi ngoài phạm vi FAQ, hãy trả lời dựa trên kiến thức chung về IT support.
Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu.
Khi không chắc chắn, khuyên người dùng tạo ticket để kỹ thuật viên kiểm tra.`;

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function chatWithBot(
  messages: ChatMessage[]
): Promise<{ reply: string; shouldCreateTicket: boolean }> {
  try {
    // Rate limit per user (10 requests/minute)
    const session = await getServerSession(authOptions);
    const rateLimitKey = `chatbot:${session?.user?.id ?? "anon"}`;
    const { allowed } = rateLimit(rateLimitKey, 10, 60_000);
    if (!allowed) {
      return { reply: "Quá nhiều yêu cầu. Vui lòng thử lại sau.", shouldCreateTicket: false };
    }

    // Get active FAQs as context
    const faqs = await db.faq.findMany({
      where: { isActive: true },
      select: { question: true, answer: true, category: true },
      take: 30,
    });

    const faqContext = faqs.length
      ? "\n\n--- FAQ CỦA HỆ THỐNG ---\n" +
        faqs.map((f) => `[${f.category}] Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
      : "";

    const response = await genai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        systemInstruction: { text: SYSTEM_PROMPT + faqContext },
      },
    });

    const reply = response.text ?? "Xin lỗi, tôi không thể xử lý yêu cầu.";

    // Detect if ticket creation is suggested
    const shouldCreateTicket =
      reply.toLowerCase().includes("tạo ticket") ||
      reply.toLowerCase().includes("gửi ticket") ||
      reply.toLowerCase().includes("liên hệ kỹ thuật") ||
      reply.toLowerCase().includes("nhân viên kỹ thuật");

    return { reply, shouldCreateTicket };
  } catch (error) {
    console.error("Chatbot error:", error);
    return {
      reply: "Đã xảy ra lỗi. Vui lòng thử lại hoặc tạo ticket để được hỗ trợ.",
      shouldCreateTicket: true,
    };
  }
}
