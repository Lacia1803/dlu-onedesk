import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  FolderGit2,
  Mail,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import { cn } from "../utils/cn";
import { FAQS, FOOTER_PRODUCT, FOOTER_PROJECT, IMAGES } from "./data";
import { Reveal } from "./Reveal";
import { LogoLockup, SectionHeading } from "./ui-bits";

/* =========================================================
   FAQ
   ========================================================= */
export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.35fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <SectionHeading
              eyebrow="Câu hỏi thường gặp"
              title="Trước khi bạn bắt đầu"
              desc="Những câu hỏi thực dụng nhất về việc sử dụng OneDesk trong phạm vi đồ án."
            />
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 flex items-start gap-3.5 rounded-[24px] border border-pine-950/8 bg-pine-100/70 p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pine-800 text-gold-300">
                <MessagesSquare className="size-4.5" />
              </span>
              <div>
                <p className="text-[14px] font-extrabold tracking-tight text-pine-950">
                  Chưa thấy câu hỏi của bạn?
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink/60">
                  Nhóm phát triển luôn sẵn lòng trình bày thêm về kiến trúc, cơ sở dữ liệu và quy
                  trình nghiệp vụ trong buổi demo hoặc bảo vệ đồ án.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <div className="overflow-hidden rounded-[28px] border border-pine-950/8 bg-paper px-7 shadow-soft sm:px-9">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className="border-b border-pine-950/8 last:border-0">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center justify-between gap-5 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-600 focus-visible:ring-offset-2"
                  >
                    <span className="flex items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className="hidden text-[12px] font-black text-gold-700 sm:block"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[16px] font-extrabold tracking-tight text-pine-950 transition-colors group-hover:text-pine-700">
                        {f.q}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full border border-pine-950/12 text-pine-900 transition-all duration-500",
                        isOpen && "rotate-180 border-pine-800 bg-pine-800 text-gold-300"
                      )}
                    >
                      <ChevronDown className="size-4" />
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-7 pl-0 text-[14.5px] leading-relaxed text-ink/65 sm:pl-11">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================
   CTA cuối trang
   ========================================================= */
export function Cta({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="px-3 pb-24 sm:px-5">
      <Reveal variant="zoom">
        <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[40px] bg-pine-900">
          {/* Ảnh macro lá thông + sương */}
          <div aria-hidden="true" className="absolute inset-0">
            <img
              src={IMAGES.pineMacro}
              alt=""
              loading="lazy"
              className="absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pine-900 via-pine-900/92 to-pine-900/30" />
            <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-gold-400/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-28">
            <p className="flex items-center gap-2.5 text-[11px] font-bold tracking-[0.24em] text-gold-300 uppercase">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-gold-400" />
              Sẵn sàng trải nghiệm
            </p>
            <h2 className="mt-5 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.06] font-extrabold tracking-[-0.03em] text-ivory text-balance">
              Một điểm truy cập cho mọi nhu cầu hỗ trợ kỹ thuật.
            </h2>
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-pine-100/75">
              Đăng nhập để báo sự cố đầu tiên của bạn — hoặc khám phá quy trình bốn bước trước khi
              quyết định.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onLogin}
                className="group inline-flex items-center gap-2.5 rounded-full bg-gold-400 py-4 pr-6 pl-7 text-[15px] font-extrabold text-pine-950 shadow-lift transition-all duration-300 hover:-translate-y-1 hover:bg-gold-300"
              >
                Đăng nhập DLU OneDesk
                <ArrowRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <a
                href="#quy-trinh"
                className="inline-flex items-center gap-2 rounded-full border border-ivory/25 px-7 py-4 text-[15px] font-bold text-ivory/90 transition-all duration-300 hover:border-gold-400/60 hover:text-gold-300"
              >
                Xem lại quy trình
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* =========================================================
   Chân trang
   ========================================================= */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-pine-950 pt-16 pb-8 text-pine-100">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* Thương hiệu */}
          <div>
            <LogoLockup light />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-pine-100/60">
              Hệ thống tiếp nhận và xử lý yêu cầu hỗ trợ kỹ thuật phòng máy — được thiết kế và phát
              triển như một đồ án học phần tại Trường Đại học Đà Lạt.
            </p>
            <p className="mt-5 inline-flex items-start gap-2 rounded-2xl border border-gold-400/25 bg-gold-400/8 px-4 py-3 text-[12px] leading-relaxed font-semibold text-gold-200">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Đồ án học phần — không phải hệ thống chính thức do trường công bố.
            </p>
          </div>

          {/* Sản phẩm */}
          <nav aria-label="Sản phẩm">
            <p className="text-[11px] font-extrabold tracking-[0.22em] text-gold-300/90 uppercase">
              Sản phẩm
            </p>
            <ul className="mt-5 space-y-3">
              {FOOTER_PRODUCT.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="group inline-flex items-center gap-1.5 text-[13.5px] font-medium text-pine-100/70 transition-colors hover:text-gold-300"
                  >
                    {l.label}
                    <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Đồ án */}
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.22em] text-gold-300/90 uppercase">
              Tài liệu đồ án
            </p>
            <ul className="mt-5 space-y-3">
              {FOOTER_PROJECT.map((t) => (
                <li key={t} className="flex items-center gap-2 text-[13.5px] text-pine-100/60">
                  <span className="size-1 rounded-full bg-pine-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Kết nối */}
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.22em] text-gold-300/90 uppercase">
              Kết nối
            </p>
            <ul className="mt-5 space-y-3.5">
              <li>
                <a
                  href="https://dlu.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 text-[13.5px] font-medium text-pine-100/70 transition-colors hover:text-gold-300"
                >
                  <span className="grid size-9 place-items-center rounded-xl border border-pine-700 bg-pine-900/60 text-pine-200 transition-colors group-hover:text-gold-300">
                    <ExternalLink className="size-4" />
                  </span>
                  Trường Đại học Đà Lạt
                </a>
              </li>
              <li>
                <span className="group flex cursor-pointer items-center gap-3 text-[13.5px] font-medium text-pine-100/70 transition-colors hover:text-gold-300">
                  <span className="grid size-9 place-items-center rounded-xl border border-pine-700 bg-pine-900/60 text-pine-200 transition-colors group-hover:text-gold-300">
                    <FolderGit2 className="size-4" />
                  </span>
                  Mã nguồn của đồ án
                </span>
              </li>
              <li>
                <a
                  href="#faq"
                  className="group flex items-center gap-3 text-[13.5px] font-medium text-pine-100/70 transition-colors hover:text-gold-300"
                >
                  <span className="grid size-9 place-items-center rounded-xl border border-pine-700 bg-pine-900/60 text-pine-200 transition-colors group-hover:text-gold-300">
                    <Mail className="size-4" />
                  </span>
                  Liên hệ nhóm phát triển
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-pine-800/60 pt-7 text-[12px] text-pine-100/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 DLU OneDesk · Lấy cảm hứng từ thành phố sương mù — 11.95°N, 108.44°E, 1.500 m.
          </p>
          <p className="sm:text-right">
            Ảnh: Pexels — Tan Dao · Dongdilac · HONG SON · Thành Đỗ và cộng tác viên.
          </p>
        </div>
      </div>
    </footer>
  );
}
