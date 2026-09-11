import { useEffect, useState } from "react";
import { ArrowUpRight, LockKeyhole, Menu, X, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "../utils/cn";
import { NAV } from "./data";
import { LogoChip, LogoLockup } from "./ui-bits";

export function Header({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[60] transition-all duration-500",
        scrolled
          ? "border-b border-pine-950/8 bg-ivory/85 shadow-[0_16px_44px_-24px_rgb(18_49_42/0.35)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center gap-4 px-5 transition-all duration-500 sm:px-8",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <LogoLockup />

        <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
          {NAV.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-[13.5px] font-semibold text-pine-900/70 transition-colors hover:bg-pine-100/90 hover:text-pine-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={onLogin}
            className="group inline-flex items-center gap-2 rounded-full bg-pine-800 px-5 py-2.5 text-[13.5px] font-bold text-ivory shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-pine-700 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-600 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            Đăng nhập
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Đóng menu" : "Mở menu"}
            className="grid size-11 place-items-center rounded-full border border-pine-950/10 bg-paper/80 text-pine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-600 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menu di động */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="mx-4 mb-4 space-y-1 rounded-3xl border border-pine-950/10 bg-paper p-3 shadow-lift">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-semibold text-pine-900 transition-colors hover:bg-pine-100"
              >
                {l.label}
                <ArrowUpRight className="size-4 text-gold-600" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- Modal đăng nhập ---------- */
export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-pine-950/55 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Đăng nhập DLU OneDesk"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-pine-950/10 bg-paper shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-pine-800 via-gold-400 to-pine-800" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ đăng nhập"
          className="absolute top-4 right-4 grid size-11 place-items-center rounded-full border border-pine-950/10 bg-white text-pine-900 transition hover:bg-pine-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-600"
        >
          <X className="size-5" />
        </button>

        <LoginForm onClose={onClose} />
      </div>
    </div>
  );
}

/* ---------- Login form (separate component resets state on mount) ---------- */
function LoginForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needOtp, setNeedOtp] = useState(false);
  const [otp, setOtp] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!needOtp) {
        const check = await fetch("/api/auth/check-2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const { twoFactorEnabled } = await check.json();
        if (twoFactorEnabled) {
          setNeedOtp(true);
          setLoading(false);
          return;
        }
      }

      const res = await signIn("credentials", {
        email,
        password,
        token: needOtp ? otp : undefined,
        redirect: false,
      });

      if (res?.error) {
        setError(needOtp ? "Mã xác thực OTP không chính xác" : "Email hoặc mật khẩu không chính xác.");
      } else {
        router.push("/dashboard");
        router.refresh();
        onClose();
      }
    } catch {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-7 sm:p-9">
      <div className="flex items-center gap-3">
        <LogoChip className="size-11 rounded-2xl" />
        <div>
          <p className="text-lg leading-tight font-extrabold tracking-tight text-pine-950">
            Đăng nhập DLU OneDesk
          </p>
          <p className="text-[12px] text-ink/55">Hệ thống hỗ trợ kỹ thuật phòng máy</p>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-pine-900 uppercase">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@dlu.edu.vn"
            className="w-full rounded-2xl border border-pine-950/12 bg-white px-4 py-3 text-sm text-pine-950 outline-none transition placeholder:text-ink/30 focus:border-pine-600 focus:ring-4 focus:ring-pine-100"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-pine-900 uppercase">
            Mật khẩu
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-pine-950/12 bg-white px-4 py-3 text-sm text-pine-950 outline-none transition placeholder:text-ink/30 focus:border-pine-600 focus:ring-4 focus:ring-pine-100"
          />
        </label>

        {needOtp && (
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-pine-900 uppercase">
              Mã xác thực OTP (6 chữ số)
            </span>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full font-mono text-center tracking-[0.3em] rounded-2xl border border-pine-950/12 bg-white px-4 py-3 text-base text-pine-950 outline-none transition placeholder:text-ink/30 focus:border-pine-600 focus:ring-4 focus:ring-pine-100"
              autoFocus
            />
            <span className="mt-1 block text-[11px] text-ink/60">
              Tài khoản đã bật 2FA. Vui lòng mở Authenticator để lấy mã.
            </span>
          </label>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pine-800 px-4 py-3.5 text-sm font-bold text-ivory shadow-soft transition hover:bg-pine-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LockKeyhole className="size-4 text-gold-300" />
          )}
          {loading ? "Đang đăng nhập..." : "Đăng nhập hệ thống"}
        </button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2 text-center text-[12px] text-ink/60">
        <p>
          Tài khoản demo:{" "}
          <span className="font-mono font-semibold text-pine-900">admin@dlu.edu.vn</span> /{" "}
          <span className="font-mono font-semibold text-pine-900">admin</span>
        </p>
        <Link
          href="/login"
          onClick={onClose}
          className="font-bold text-pine-700 underline underline-offset-4 hover:text-pine-900"
        >
          Mở trang đăng nhập chi tiết & đăng ký →
        </Link>
      </div>
    </div>
  );
}
