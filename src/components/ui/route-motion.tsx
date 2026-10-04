"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function RouteMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        scope.current,
        { opacity: 0.8 },
        {
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          clearProps: "opacity",
        },
      );
    },
    { scope, dependencies: [pathname], revertOnUpdate: true },
  );

  return <div ref={scope}>{children}</div>;
}
