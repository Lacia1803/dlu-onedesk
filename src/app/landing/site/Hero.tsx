import {
  Activity,
  ArrowDown,
  ArrowRight,
  Boxes,
  CheckCircle2,
  GraduationCap,
  MapPin,
  QrCode,
  Star,
  Trees,
} from "lucide-react";
import { IMAGES, TICKER } from "./data";
import { DashboardMockup } from "./mockups";
import { PineMark } from "./ui-bits";
import { Reveal } from "./Reveal";

export function Hero({ onLogin }: { onLogin: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Nền: sương + nắng */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -top-40 right-0 h-[34rem] w-[34rem] rounded-full bg-gold-200/55 blur-[130px]" />
        <div className="absolute top-[28%] left-0 h-[30rem] w-[30rem] animate-mist rounded-full bg-pine-100/90 blur-[110px]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-ivory" />
        <svg
          className="absolute -top-10 -left-24 h-[26rem] w-[26rem] text-pine-800/8"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
        >
          {[30, 55, 80, 105, 130, 155].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} strokeWidth="1" />
          ))}
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-x-10 gap-y-16 px-5 pt-32 pb-24 sm:px-8 lg:grid-cols-12 lg:items-center lg:pt-40 lg:pb-32">
        {/* ---------- Nội dung ---------- */}
        <div className="lg:col-span-6">
          <Reveal variant="fade">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-pine-950/10 bg-pine-100/80 py-1.5 pr-4 pl-1.5">
              <span className="flex items-center gap-1.5 rounded-full bg-pine-800 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-gold-300 uppercase">
                <GraduationCap className="size-3" />
                Đồ án học phần
              </span>
              <span className="text-[12px] font-semibold text-pine-800">
                Trường Đại học Đà Lạt · Khoa Công nghệ Thông tin
              </span>
            </p>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-7 max-w-xl text-[clamp(2.6rem,5.6vw,4.6rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-pine-950 text-balance">
              Hỗ trợ kỹ thuật nhanh hơn.
              <br />
              <span className="text-pine-700">Phòng máy </span>
              <span className="relative inline-block text-pine-700">
                vận hành tốt hơn.
                <svg
                  className="absolute -bottom-1.5 left-0 h-3 w-full sm:-bottom-2.5"
                  viewBox="0 0 300 16"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 11 C 70 4, 155 15, 296 7"
                    fill="none"
                    stroke="#D6AE62"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="brush-path"
                  />
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-ink/65">
              DLU OneDesk kết nối ngườ{"i"} dùng và đội ngũ kỹ thuật trong một hệ thống — từ báo
              sự cố, theo dõi xử lý đến quản lý thiết bị phòng máy.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onLogin}
                className="group inline-flex items-center gap-2.5 rounded-full bg-pine-800 py-4 pr-6 pl-7 text-[15px] font-bold text-ivory shadow-lift transition-all duration-300 hover:-translate-y-1 hover:bg-pine-700"
              >
                Đăng nhập hệ thống
                <span className="grid size-6 place-items-center rounded-full bg-gold-400 text-pine-900 transition-transform duration-300 group-hover:rotate-45">
                  <ArrowRight className="size-3.5" />
                </span>
              </button>
              <a
                href="#gioi-thieu"
                className="group inline-flex items-center gap-2.5 rounded-full border border-pine-950/15 bg-paper/70 px-7 py-4 text-[15px] font-bold text-pine-900 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-pine-600/40 hover:bg-paper"
              >
                Khám phá tính năng
                <ArrowDown className="size-4 text-gold-700 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={340}>
            <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-pine-950/10 pt-6">
              {[
                { icon: QrCode, label: "Báo lỗi bằng mã QR" },
                { icon: Activity, label: "Cập nhật theo thờ" + "i gian thực" },
                { icon: Boxes, label: "Thiết bị tập trung một nơ" + "i" },
              ].map((c) => (
                <span key={c.label} className="flex items-center gap-2 text-[13px] font-semibold text-pine-900/75">
                  <c.icon className="size-4 text-gold-700" />
                  {c.label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ---------- Hình ảnh ---------- */}
        <div className="lg:col-span-6">
          <Reveal variant="right" delay={140} className="relative">
            <div className="relative mx-auto max-w-[560px] pb-14 pl-6 sm:pl-10 lg:pb-10">
              {/* Ảnh khuôn viên */}
              <div className="group relative overflow-hidden rounded-[34px] shadow-lift ring-1 ring-pine-950/15">
                <img
                  src={IMAGES.heroCampus}
                  alt="Đồi thông trong sương sớm — bối cảnh quanh Trường Đại học Đà Lạt"
                  className="aspect-[4/5] w-full scale-[1.02] object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pine-950/55 via-pine-900/8 to-pine-800/30" />
                <div className="absolute inset-0 bg-pine-800/12 mix-blend-multiply" />
                <div className="absolute top-5 left-1/2 flex w-max max-w-[86%] -translate-x-1/2 items-center gap-2.5 rounded-full bg-ivory/92 py-1.5 pr-4 pl-1.5 shadow-soft backdrop-blur-md">
                  <span className="grid size-7 place-items-center rounded-full bg-pine-100 text-pine-800">
                    <MapPin className="size-3.5" />
                  </span>
                  <p className="truncate text-[11.5px] font-bold text-pine-900">
                    Đồi thông Phù Đổng Thiên Vương — Đà Lạt
                  </p>
                  <span className="hidden text-[10px] font-extrabold tracking-wider text-gold-700 sm:block">
                    11.95°N · 108.44°E
                  </span>
                </div>
              </div>

              {/* Dashboard thật của hệ thống */}
              <div className="absolute bottom-0 left-0 w-[86%] sm:w-[80%]">
                <div className="animate-float-slow">
                  <DashboardMockup />
                </div>
                <p className="mt-3 flex items-center gap-1.5 pl-1 text-[11px] font-medium text-ink/45">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Giao diện tổng quan thực tế — dữ liệu minh họa
                </p>
              </div>

              {/* Thẻ ticket nổi */}
              <div className="absolute -top-6 -right-2 animate-float sm:-right-5">
                <div className="flex items-center gap-3 rounded-2xl border border-pine-950/10 bg-paper/95 px-4 py-3 shadow-lift backdrop-blur">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-[12px] font-extrabold tracking-tight text-pine-950">
                      #DLU-1041 · Máy chiếu B1
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10.5px] font-medium text-ink/50">
                      Hoàn thành
                      <Star className="size-2.5 fill-gold-400 text-gold-400" />
                      5/5 · 40 phút
                    </p>
                  </div>
                </div>
              </div>

              {/* Con dấu xoay */}
              <div aria-hidden="true" className="absolute -top-9 left-2 hidden sm:block">
                <div className="relative size-24">
                  <svg viewBox="0 0 100 100" className="size-full animate-spin-slower text-pine-800/85">
                    <defs>
                      <path
                        id="seal-circle"
                        d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
                        fill="none"
                      />
                    </defs>
                    <text fontSize="9.2" fontWeight="700" letterSpacing="2.6" fill="currentColor">
                      <textPath href="#seal-circle">DLU ONEDESK · ĐÀ LẠT · SƯƠNG VÀ THÔNG ·</textPath>
                    </text>
                  </svg>
                  <PineMark className="absolute inset-0 m-auto size-5 text-gold-600" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Dải chữ chạy ---------- */
export function Ticker() {
  return (
    <div className="relative z-10 overflow-hidden border-y border-pine-950/25 bg-pine-900 py-4">
      <div className="flex w-max animate-marquee">
        {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
          <span key={i} className="flex items-center whitespace-nowrap" aria-hidden={i >= TICKER.length}>
            <span className="px-7 text-[12.5px] font-bold tracking-[0.18em] text-pine-100/80 uppercase">
              {t}
            </span>
            <Trees className="size-4 shrink-0 text-gold-400/80" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-pine-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-pine-900 to-transparent" />
    </div>
  );
}
