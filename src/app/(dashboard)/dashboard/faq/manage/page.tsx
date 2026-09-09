import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FaqForm } from "@/components/faq/faq-form";
import { FaqDeleteButton } from "@/components/faq/faq-delete-button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ManageFaqPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    redirect("/dashboard/faq");
  }

  const faqs = await db.faq.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    include: { author: { select: { name: true } } }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/faq" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Cẩm nang FAQ</h1>
        </div>
        <FaqForm />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Câu hỏi</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Người tạo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Chưa có dữ liệu FAQ
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium max-w-[300px] truncate" title={faq.question}>
                    {faq.question}
                  </TableCell>
                  <TableCell>{faq.category}</TableCell>
                  <TableCell>{faq.author.name}</TableCell>
                  <TableCell>
                    {faq.isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Hiện</Badge>
                    ) : (
                      <Badge variant="secondary">Ẩn</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <FaqForm initialData={faq} />
                    <FaqDeleteButton id={faq.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
