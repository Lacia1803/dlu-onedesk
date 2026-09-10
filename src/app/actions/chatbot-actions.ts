"use server";

import { db } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `Bạn là trợ lý AI của DLU OneDesk — hệ thống hỗ trợ kỹ thuật Trung tâm CNTT Trường Đại học Đà Lạt.

Nhiệm vụ và GIỚI HẠN (QUAN TRỌNG):
1. CHỈ giúp chẩn đoán lỗi thiết bị, phần mềm, mạng và hướng dẫn khắc phục đơn giản dựa trên FAQ.
2. KHÔNG tự nhận mình là kỹ thuật viên con người. Bạn chỉ là AI.
3. KHÔNG tự ý khẳng định đã sửa được lỗi hệ thống, reset mật khẩu hay thực hiện thao tác trên hệ thống. Bạn không có quyền truy cập dữ liệu.
4. TỪ CHỐI trả lời các câu hỏi ngoài phạm vi IT Support (ví dụ: tư vấn tình cảm, chính trị, viết code, làm bài tập). Hãy nói: "Tôi chỉ hỗ trợ các vấn đề về kỹ thuật IT."
5. NẾU FAQ có câu trả lời, PHẢI dùng thông tin từ FAQ làm nguồn chính.
6. Khi không giải quyết được hoặc thao tác cần quyền Admin/Kỹ thuật viên, khuyên người dùng tạo ticket.

Trả lời bằng tiếng Việt, ngắn gọn, lịch sự, dễ hiểu.`;

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function getMyChatLogs() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  return db.chatLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
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

    // Persist last Q/A pair to chat history (logged-in users only)
    const lastUserMsg = messages[messages.length - 1];
    if (session?.user?.id && lastUserMsg?.role === "user") {
      db.chatLog.create({
        data: { userId: session.user.id, question: lastUserMsg.text, answer: reply },
      }).catch(() => { /* ponytail: fire-and-forget; upgrade to queue if logging failures matter */ });
    }

    return { reply, shouldCreateTicket };
  } catch (error) {
    console.error("Chatbot error:", error);
    return {
      reply: "Đã xảy ra lỗi. Vui lòng thử lại hoặc tạo ticket để được hỗ trợ.",
      shouldCreateTicket: true,
    };
  }
}
