"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketCommentSchema, TicketCommentFormValues } from "@/lib/validations/ticket";
import { addTicketComment } from "@/app/actions/ticket-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { CannedReplyLite, TicketCommentWithAuthor } from "@/types";

interface TicketCommentsProps {
  ticketId: string;
  comments: TicketCommentWithAuthor[];
  currentUserId: string;
  cannedReplies?: CannedReplyLite[];
}

export function TicketComments({
  ticketId,
  comments,
  currentUserId,
  cannedReplies = [],
}: TicketCommentsProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TicketCommentFormValues>({
    resolver: zodResolver(ticketCommentSchema) as Resolver<TicketCommentFormValues>,
    defaultValues: { content: "" },
  });

  async function onSubmit(data: TicketCommentFormValues) {
    setLoading(true);
    const res = await addTicketComment(ticketId, data);
    setLoading(false);

    if (res.success) {
      reset();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-muted/50 font-medium">Thảo luận</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
        {comments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Chưa có bình luận nào.</div>
        ) : (
          comments.map((comment) => {
            const isMe = comment.authorId === currentUserId;
            return (
              <div key={comment.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className={isMe ? "bg-primary text-primary-foreground" : "bg-secondary"}
                  >
                    {(comment.author.name || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {comment.author.name || "Người dùng"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "dd/MM HH:mm")}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-lg text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t bg-muted/20">
        {cannedReplies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {cannedReplies.map((r) => (
              <Button
                key={r.id}
                variant="outline"
                size="xs"
                className="text-xs h-6"
                title={`Chèn trả lời mẫu: "${r.content.slice(0, 50)}..."`}
                onClick={() => setValue("content", r.content)}
              >
                {r.title}
              </Button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <Textarea
            {...register("content")}
            placeholder="Nhập bình luận của bạn..."
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(onSubmit)();
              }
            }}
          />
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content?.message as string}</p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} size="sm">
              {loading ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
