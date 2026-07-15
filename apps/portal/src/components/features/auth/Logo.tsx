import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <Image
        src="/logo.png"
        alt="SIGIZI Logo"
        width={313}
        height={114}
        className="w-full max-w-[260px] md:max-w-[313px] h-auto"
        priority
      />
    </div>
  );
}
