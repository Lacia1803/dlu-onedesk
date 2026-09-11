import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  baseUrl: string; // e.g. "/dashboard/tickets"
  searchParams: Record<string, string | undefined>;
}

export function PaginationControls({
  page,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  function buildUrl(targetPage: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    params.set("page", String(targetPage));
    return `${baseUrl}?${params.toString()}`;
  }

  const linkClass = buttonVariants({ variant: "outline", size: "sm" });

  return (
    <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
      <span>
        Trang <strong className="text-foreground">{page}</strong> / {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={buildUrl(page - 1)} className={linkClass}>
            Trang trước
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Trang trước
          </Button>
        )}

        {page < totalPages ? (
          <Link href={buildUrl(page + 1)} className={linkClass}>
            Trang sau
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Trang sau
          </Button>
        )}
      </div>
    </div>
  );
}
