"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/app/actions/auth";

const initial: LoginActionState = null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="space-y-2">
        <label
          htmlFor="portal-password"
          className="block text-sm font-medium text-white"
        >
          Access code
        </label>
        <input
          id="portal-password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoCorrect="off"
          spellCheck={false}
          required
          className="box-border w-full min-h-12 rounded-md border border-white/20 bg-black/50 px-4 py-3 text-base text-white outline-none placeholder:text-[#8E8E93]/55 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-500/15"
          placeholder="Your access code"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full rounded-md bg-white px-4 py-3 text-sm font-semibold text-black transition-[opacity,transform] duration-200 hover:bg-white/95 active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
        style={{
          transitionTimingFunction: "cubic-bezier(0.22, 0.25, 0, 1)",
        }}
      >
        {pending ? "Entering…" : "Enter Workspace"}
      </button>
    </form>
  );
}
