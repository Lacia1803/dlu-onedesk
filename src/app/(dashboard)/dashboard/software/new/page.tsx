import { SoftwareForm } from "@/components/software/software-form";

export default function NewSoftwarePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Thêm Phần mềm</h1>
      <SoftwareForm />
    </div>
  );
}
