import Image from "next/image";
import Countdown from "@/components/ui/countdown";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <Image src="/havenly-logo.png" alt="Havenly Solutions" width={36} height={36} className="rounded" />
            <span className="text-headline-md font-semibold text-on-surface">Havenly Solutions</span>
          </div>
          {children}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(70,72,212,0.35),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(186,26,26,0.25),transparent_45%)]" />
        <div className="relative flex h-full flex-col justify-end p-14">
          <div className="mb-8">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest block mb-2">LAUNCH DATE — 13 OCT 2026</span>
            <Countdown dark />
          </div>
          <p className="text-display-lg text-on-primary">Command every part of Havenly Solutions from one place.</p>
          <p className="mt-3 max-w-md text-body-base text-on-primary/70">
            Live SOS response, helpdesk, customer support, and growth analytics for the whole
            organization — one command center, role by role.
          </p>
        </div>
      </div>
    </div>
  );
}
