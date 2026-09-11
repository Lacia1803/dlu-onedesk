import { Check, MapPin, MountainSnow, ScrollText } from "lucide-react";
import { cn } from "../utils/cn";
import { FEATURES, IMAGES, STEPS, VALUES } from "./data";
import { MockupByKey } from "./mockups";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./ui-bits";

/* =========================================================
   GIÁ TRỊ
   ========================================================= */
export function Values() {
  return (
    <section id="gioi-thieu" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <span
        aria-hidden="true"
        className="text-stroke pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 text-[clamp(6rem,18vw,15rem)] font-black tracking-tighter whitespace-nowrap select-none"
      >
        ONEDESK
      </span>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Giá trị mang lại"
              title={
                <>
                  Ít rối hơn cho ngườ{"i"} dùng.
                  <br />
                  Rõ hơn cho đội kỹ thuật.
                </>
              }
            />
            <p className="max-w-sm text-[14.5px] leading-relaxed text-ink/60">
              Không chạy theo con số quảng cáo — OneDesk tập trung vào ba việc một hệ thống hỗ trợ
              kỹ thuật cần làm thật tốt.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.no} delay={i * 100}>
              <article className="group relative h-full overflow-hidden rounded-[28px] border border-pine-950/8 bg-paper p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-lift">
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-2 text-[92px] leading-none font-black tracking-tighter text-pine-100 transition-colors duration-500 select-none group-hover:text-gold-200"
                >
                  {v.no}
                </span>
                <span className="relative grid size-12 place-items-center rounded-2xl bg-pine-800 text-gold-300 shadow-soft transition-transform duration-500 group-hover:rotate-[-6deg]">
                  <v.icon className="size-5.5" />
                </span>
                <h3 className="relative mt-6 text-[19px] font-extrabold tracking-tight text-pine-950">
                  {v.title}
                </h3>
                <p className="relative mt-3 text-[14.5px] leading-relaxed text-ink/65">{v.desc}</p>
                <span className="relative mt-7 block h-1 w-10 rounded-full bg-gold-400 transition-all duration-500 group-hover:w-20" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   QUY TRÌNH
   ========================================================= */
export function Process() {
  return (
    <section id="quy-trinh" className="relative scroll-mt-24 px-3 sm:px-5">
      <div
        className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[40px] border border-pine-950/8 bg-gradient-to-b from-pine-100/80 to-pine-50 px-5 py-20 sm:px-10 sm:py-24 lg:px-16"
        style={{
          backgroundImage: "radial-gradient(rgb(23 63 53 / 0.1) 1px, transparent 1.6px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-pine-100/60 via-transparent to-pine-50/80" />

        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              center
              eyebrow="Quy trình sử dụng"
              title="Bốn bước từ sự cố đến hoàn thành"
              desc="Điểm dễ hiểu nhất của OneDesk: mọi thứ bắt đầu từ một mã QR trên thiết bị và kết thúc bằng một lượt đánh giá."
            />
          </Reveal>

          <div className="relative mt-16">
            <div
              aria-hidden="true"
              className="flow-line absolute top-[46px] right-[6%] left-[6%] hidden h-[2px] lg:block"
            />
            <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <Reveal key={s.no} delay={i * 110}>
                  <article className="group relative h-full rounded-[26px] border border-pine-950/8 bg-paper/95 p-7 shadow-soft backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:shadow-lift">
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-2xl bg-pine-800 text-gold-300 shadow-soft ring-4 ring-ivory transition-transform duration-500 group-hover:scale-110">
                        <s.icon className="size-5.5" />
                      </span>
                      <span className="text-4xl font-black tracking-tighter text-gold-400/80">
                        {s.no}
                      </span>
                    </div>
                    <h3 className="mt-6 text-[16.5px] leading-snug font-extrabold tracking-tight text-pine-950">
                      {s.title}
                    </h3>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink/60">{s.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TÍNH NĂNG — xen kẽ ảnh / chữ
   ========================================================= */
export function Features() {
  return (
    <section id="tinh-nang" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Tính năng chính"
              title={
                <>
                  Bốn mảng của hệ thống,
                  <br />
                  nhìn đúng như trong sản phẩm
                </>
              }
            />
            <p className="max-w-sm text-[14.5px] leading-relaxed text-ink/60">
              Các khung giao diện bên dưới được dựng lại nguyên trạng từ ứng dụng OneDesk — toàn bộ
              tên và số liệu là dữ liệu minh họa.
            </p>
          </div>
        </Reveal>

        <div className="mt-6">
          {FEATURES.map((f, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={f.index}
                className={cn(
                  "grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-16",
                  i > 0 && "border-t border-pine-950/8"
                )}
              >
                {/* Text */}
                <div className={cn("lg:col-span-5", flip && "lg:order-2")}>
                  <Reveal variant={flip ? "right" : "left"}>
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-pine-100 text-pine-800 ring-1 ring-pine-950/5">
                        <f.icon className="size-4.5" />
                      </span>
                      <span className="text-[11px] font-extrabold tracking-[0.24em] text-gold-700 uppercase">
                        {f.index} · {f.kicker}
                      </span>
                    </div>
                    <h3 className="mt-5 text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold tracking-[-0.02em] text-pine-950">
                      {f.title}
                    </h3>
                    <p className="mt-3.5 text-[15px] leading-relaxed text-ink/65">{f.desc}</p>
                    <ul className="mt-6 space-y-3">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-pine-800 text-gold-300">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                          <span className="text-[14.5px] font-medium text-ink/75">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </div>

                {/* Mockup */}
                <div className={cn("lg:col-span-7", flip && "lg:order-1")}>
                  <Reveal variant="zoom" delay={120}>
                    <div className="relative">
                      <div
                        aria-hidden="true"
                        className={cn(
                          "absolute -inset-6 -z-10 rounded-[36px] blur-2xl",
                          flip
                            ? "bg-gradient-to-tr from-gold-200/50 via-pine-100/40 to-transparent"
                            : "bg-gradient-to-tl from-gold-200/50 via-pine-100/40 to-transparent"
                        )}
                      />
                      <div className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-1.5">
                        <MockupByKey k={f.mockup} />
                      </div>
                      <p className="mt-4 flex items-center gap-1.5 pl-1 text-[11.5px] font-medium text-ink/45">
                        <span className="size-1.5 rounded-full bg-pine-400" />
                        {f.caption}
                      </p>
                    </div>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BẢN SẮC DLU
   ========================================================= */
export function Identity() {
  const facts = [
    {
      icon: MapPin,
      title: "01 Phù Đổng Thiên Vương",
      desc: "Khuôn viên trường nằm giữa những đồi thông cuối trung tâm Đà Lạt.",
    },
    {
      icon: MountainSnow,
      title: "Độ cao ~1.500 m",
      desc: "Sương quanh năm, mùa mưa dài — thiết bị phòng máy cần được theo dõi và bảo trì nghiêm ngặt.",
    },
    {
      icon: ScrollText,
      title: "Minh bạch về trạng thái",
      desc: "Đây là đồ án học phần: hướng tới bài toán thật, không phải hệ thống chính thức của trường.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-pine-900 py-24 text-ivory sm:py-32">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-gold-400/12 blur-[120px]" />
        <div className="absolute -right-32 -bottom-40 h-[30rem] w-[30rem] rounded-full bg-pine-500/25 blur-[130px]" />
        <span className="text-stroke-light absolute right-0 bottom-4 translate-x-[18%] text-[clamp(5rem,15vw,12rem)] font-black tracking-tighter whitespace-nowrap select-none">
          ĐÀ LẠT
        </span>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div>
          <Reveal>
            <SectionHeading
              light
              eyebrow="Bản sắc địa phương"
              title="Được xây dựng cho môi trường học tập tại DLU"
              desc={
                "Lấy bối cảnh vận hành phòng máy tại Trường Đại học Đà Lạt, DLU OneDesk hướng tới việc tập trung thông tin sự cố và giúp đội ngũ kỹ thuật theo dõi công việc rõ ràng hơn — thay cho những cuộc gọi và tin nhắn rờ" +
                "i rạc."
              }
            />
          </Reveal>

          <div className="mt-10 space-y-6">
            {facts.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="flex gap-4 border-b border-pine-700/50 pb-6 last:border-0 last:pb-0">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-pine-800 text-gold-300 ring-1 ring-pine-700">
                    <f.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-extrabold tracking-tight text-ivory">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-pine-100/70">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Collage ảnh */}
        <Reveal variant="right" delay={140}>
          <div className="relative mx-auto max-w-[560px]">
            <div className="relative overflow-hidden rounded-[30px] shadow-lift ring-1 ring-ivory/15">
              <img
                src={IMAGES.panorama}
                alt="Đồi thông Đà Lạt trong nắng sớm và sương mờ"
                className="aspect-[16/10] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pine-950/55 via-transparent to-pine-900/20" />
              <span className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-pine-950/60 px-3.5 py-1.5 text-[11px] font-bold text-pine-100 backdrop-blur-md">
                <MapPin className="size-3.5 text-gold-400" />
                11.95°N — 108.44°E
              </span>
            </div>

            <div className="absolute -bottom-10 -left-3 w-[56%] -rotate-3 transition-transform duration-700 hover:rotate-0 sm:-left-10">
              <div className="overflow-hidden rounded-[22px] border-[5px] border-pine-900 shadow-lift">
                <img
                  src={IMAGES.lab}
                  alt="Phòng thực hành máy tính — bối cảnh vận hành của OneDesk"
                  className="aspect-[5/4] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <p className="mt-14 text-right text-[11.5px] font-medium text-pine-100/55 sm:mt-12">
              Phòng thực hành máy tính — bối cảnh vận hành mà hệ thống hướng tới.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
