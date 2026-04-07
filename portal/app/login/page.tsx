import { LoginForm } from "@/app/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 sm:px-6">
      <div className="flex w-full max-w-[420px] flex-col gap-8 rounded-md border border-white/15 bg-[#1D1D1F] p-8 sm:p-10">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Client portal
          </h1>
          <p className="text-sm leading-relaxed text-[#8E8E93]">
            Enter the access code your agency gave you. You will only see your
            company&apos;s content.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
