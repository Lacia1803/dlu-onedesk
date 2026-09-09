import { db } from "@/lib/db";
import { SoftwareForm } from "@/components/software/software-form";
import { notFound } from "next/navigation";

export default async function EditSoftwarePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const software = await db.software.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!software) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Sửa Phần mềm: {software.name}</h1>
      <SoftwareForm initialData={software} />
    </div>
  );
}
