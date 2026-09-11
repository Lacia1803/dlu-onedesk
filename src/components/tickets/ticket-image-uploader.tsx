"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";

interface TicketImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

export function TicketImageUploader({
  value = [],
  onChange,
  disabled = false,
}: TicketImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    if (value.length + files.length > 5) {
      toast.error("Tối đa chỉ được đính kèm 5 hình ảnh.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`File "${file.name}" không hợp lệ. Chỉ chấp nhận ảnh JPG, PNG, WEBP.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" vượt quá dung lượng 5MB.`);
        return;
      }
      formData.append("files", file);
    }

    try {
      setUploading(true);
      const res = await fetch("/api/tickets/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.urls) {
        onChange([...value, ...data.urls]);
        toast.success(`Đã tải lên ${data.urls.length} ảnh.`);
      } else {
        toast.error(data.error || "Tải ảnh thất bại.");
      }
    } catch {
      toast.error("Lỗi khi kết nối tải ảnh.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || uploading) return;
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled || uploading) return;
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleRemove(index: number) {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50 bg-muted/20"
        } ${disabled || uploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          disabled={disabled || uploading}
        />
        <div className="flex flex-col items-center justify-center gap-1.5 py-2">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
          <div className="text-xs font-mono">
            {uploading ? (
              <span className="text-primary font-medium">ĐANG TẢI ẢNH LÊN...</span>
            ) : (
              <span>
                <span className="text-primary font-medium">Nhấn để chọn ảnh</span> hoặc kéo thả vào
                đây
              </span>
            )}
          </div>
          <p className="text-[10px] font-mono text-muted-foreground">
            PNG, JPG, WEBP tối đa 5MB (Tối đa 5 ảnh)
          </p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-5 gap-2 pt-1">
          {value.map((url, idx) => (
            <div
              key={url + idx}
              className="group relative aspect-square rounded-sm border border-border bg-card overflow-hidden"
            >
              <Image
                src={url}
                alt={`Ảnh đính kèm ${idx + 1}`}
                width={120}
                height={120}
                unoptimized
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white hover:bg-destructive flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Xóa ảnh"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
