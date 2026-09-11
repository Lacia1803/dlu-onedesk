import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "../utils/cn";

/* ---------- Dấu ấn cây thông (đồng bộ favicon) ---------- */
export function PineMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <path d="M32 6 L48 26 H40 L52 42 H38 V56 H26 V42 H12 L24 26 H16 Z" fill="currentColor" />
    </svg>
  );
}

export function LogoChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl bg-pine-800 text-gold-300 shadow-sm ring-1 ring-pine-950/20",
        className
      )}
    >
      <PineMark className="size-5" />
    </span>
  );
}

export function LogoLockup({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className="group flex items-center gap-2.5">
      <LogoChip className="transition-transform duration-500 group-hover:rotate-[8deg]" />
      <span className="leading-none">
        <span
          className={cn(
            "block text-[15px] font-extrabold tracking-tight",
            light ? "text-ivory" : "text-pine-900"
          )}
        >
          DLU OneDesk
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[10px] font-medium tracking-[0.14em] uppercase",
            light ? "text-pine-200/70" : "text-pine-800/60"
          )}
        >
          Helpdesk phòng máy
        </span>
      </span>
    </a>
  );
}

/* ---------- Eyebrow & tiêu đề section ---------- */
export function Eyebrow({
  children,
  light = false,
  center = false,
}: {
  children: ReactNode;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-[11px] font-bold tracking-[0.22em] uppercase",
        center && "justify-center",
        light ? "text-gold-300" : "text-pine-700"
      )}
    >
      <span className="inline-block size-1.5 rounded-full bg-gold-400 shadow-[0_0_0_4px_rgb(214_174_98/0.18)]" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  desc,
  light = false,
  center = false,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  desc?: ReactNode;
  light?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      <Eyebrow light={light} center={center}>
        {eyebrow}
      </Eyebrow>
      <h2
        className={cn(
          "mt-4 text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold tracking-[-0.02em] text-balance",
          light ? "text-ivory" : "text-pine-900"
        )}
      >
        {title}
      </h2>
      {desc ? (
        <p
          className={cn(
            "mt-4 text-[15px] leading-relaxed text-pretty",
            light ? "text-pine-100/80" : "text-ink/70"
          )}
        >
          {desc}
        </p>
      ) : null}
    </div>
  );
}

/* ---------- Khung trình duyệt cho mockup ---------- */
export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-pine-950/10 bg-paper shadow-lift",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-pine-950/8 bg-pine-100/70 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#e8927c]" />
          <span className="size-2.5 rounded-full bg-gold-300" />
          <span className="size-2.5 rounded-full bg-pine-400" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/80 px-3 py-1 text-[10px] font-medium text-pine-950/55 ring-1 ring-pine-950/5">
          <Lock className="size-2.5" />
          {url}
        </div>
        <div className="w-9" />
      </div>
      <div className="pointer-events-none">{children}</div>
    </div>
  );
}

/* ---------- Khung ứng dụng (không có URL) ---------- */
export function AppFrame({
  title,
  icon,
  right,
  children,
  className,
}: {
  title: string;
  icon: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-pine-950/10 bg-paper shadow-lift",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-pine-950/8 bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-pine-800 text-gold-300">
            {icon}
          </span>
          <span className="text-[12px] font-bold tracking-tight text-pine-950">{title}</span>
        </div>
        {right}
      </div>
      <div className="pointer-events-none">{children}</div>
    </div>
  );
}

/* ---------- Nhãn trạng thái trong mockup ---------- */
export function Pill({
  tone,
  children,
}: {
  tone: "new" | "doing" | "done" | "wait" | "high";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    new: "bg-amber-100 text-amber-800 ring-amber-200",
    doing: "bg-teal-100 text-teal-800 ring-teal-200",
    done: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    wait: "bg-gold-100 text-gold-700 ring-gold-200",
    high: "bg-rose-100 text-rose-700 ring-rose-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold whitespace-nowrap ring-1",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full bg-pine-700 text-[9px] font-bold text-pine-50",
        className
      )}
    >
      {initials}
    </span>
  );
}
