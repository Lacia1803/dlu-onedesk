import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyChatLogs } from "@/app/actions/chatbot-actions";
import { format } from "date-fns";
import { Bot, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChatHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const logs = await getMyChatLogs();

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
          <span className="text-primary">▶</span> CHAT.HISTORY
        </h1>
        <p className="mt-1 text-lg font-semibold">Lịch sử trò chuyện với trợ lý AI</p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-sm border bg-card p-8 text-center text-muted-foreground font-mono text-xs">
          Chưa có cuộc trò chuyện nào
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="rounded-sm border bg-card p-4 space-y-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm whitespace-pre-wrap">
                  {log.question}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                  {log.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
