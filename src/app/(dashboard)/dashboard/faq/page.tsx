import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Settings } from "lucide-react";
import { FaqSearch } from "@/components/faq/faq-search";

export default async function FaqPage() {
  const session = await getServerSession(authOptions);
  const isAdminOrTech = session?.user?.role === "ADMIN" || session?.user?.role === "TECHNICIAN";

  const faqs = await db.faq.findMany({
    where: { isActive: true },
    select: { id: true, question: true, answer: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cẩm nang Hỗ trợ (FAQ)</h1>
          <p className="text-muted-foreground mt-1">
            Tìm kiếm hướng dẫn tự khắc phục sự cố trước khi tạo Ticket.
          </p>
        </div>
        {isAdminOrTech && (
          <Link
            href="/dashboard/faq/manage"
            className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
          >
            <Settings className="mr-2 h-4 w-4" />
            Quản lý FAQ
          </Link>
        )}
      </div>

      <div className="bg-card border rounded-lg p-6 min-h-[500px]">
        <FaqSearch faqs={faqs} />
      </div>
    </div>
  );
}
