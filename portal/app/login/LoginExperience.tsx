"use client";

import { useCallback, useRef } from "react";
import styles from "./login-experience.module.css";
import { LoginForm } from "./LoginForm";

export function LoginExperience() {
  const shellRef = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = shellRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${Math.max(0, Math.min(100, x))}%`);
    el.style.setProperty("--my", `${Math.max(0, Math.min(100, y))}%`);
  }, []);

  const onPointerLeave = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "45%");
  }, []);

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className={styles.ambient} aria-hidden />
      <div className={styles.spotlight} aria-hidden />
      <div className={styles.grid} aria-hidden />
      <div className={styles.vignette} aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className={`${styles.cardWrap} w-full max-w-[420px]`}>
          <div className={styles.cardFrame}>
            <div className={styles.cardShimmer} aria-hidden />
            <div className={`${styles.card} p-8 sm:p-10`}>
              <div className="space-y-5 text-center">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8E8E93]">
                    Endpoint Media
                  </p>
                  <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Welcome to Your Media Portal
                  </h1>
                </div>
                <p className="text-sm leading-relaxed text-[#98989D]">
                  Enter your unique access code to view your latest custom
                  content, captions, and creative assets. Everything we&apos;ve
                  built for your brand, all in one place.
                </p>
              </div>
              <div className="mt-8">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-sm space-y-3 text-center text-[0.7rem] leading-relaxed text-[#636366]">
          <p>
            Codes are issued by your agency. Need help? Contact them directly.
          </p>
          <p className="text-[#8E8E93]">
            <span className="block sm:inline">Frank Smit: </span>
            <a
              href="tel:+27769724559"
              className="text-white/80 underline decoration-white/25 underline-offset-2 hover:text-white"
            >
              076 972 4559
            </a>
            <span className="mx-1.5 hidden text-[#48484A] sm:inline">·</span>
            <span className="mt-1 block sm:mt-0 sm:inline">
              Email:{" "}
              <a
                href="mailto:hello@endpointmedia.co.za"
                className="text-white/80 underline decoration-white/25 underline-offset-2 hover:text-white"
              >
                hello@endpointmedia.co.za
              </a>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
