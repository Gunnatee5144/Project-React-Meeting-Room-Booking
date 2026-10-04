import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/context/toast-context";
import { AppProvider } from "@/context/app-context";
import { SitePreloader } from "@/components/ui/preloader";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RouteMotion } from "@/components/ui/route-motion";

const cabinetGrotesk = localFont({
  src: [
    { path: "./fonts/cabinet-grotesk-400.woff2", weight: "400" },
    { path: "./fonts/cabinet-grotesk-500.woff2", weight: "500" },
    { path: "./fonts/cabinet-grotesk-700.woff2", weight: "700" },
    { path: "./fonts/cabinet-grotesk-800.woff2", weight: "800" },
  ],
  display: "swap",
  variable: "--font-cabinet",
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-ibm-plex-sans-thai",
});

export const metadata: Metadata = {
  title: "MEETSYNC · จองห้องประชุม DII CMU",
  description:
    "ค้นหาห้องว่าง ดูรายละเอียด และจัดการรายการจองสำหรับบุคลากรและนักศึกษาวิทยาลัยนวัตกรรมดิจิทัล มหาวิทยาลัยเชียงใหม่",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="th"
      className={`${cabinetGrotesk.variable} ${ibmPlexSansThai.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <ToastProvider>
          <AppProvider>
            <SitePreloader />
            <a
              href="#main-content"
              className="sr-only fixed left-4 top-4 z-[10001] rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow focus:not-sr-only focus:outline-2 focus:outline-blue-700"
            >
              ข้ามไปเนื้อหาหลัก
            </a>
            <Navbar />
            <div className="flex min-h-[calc(100dvh-6rem)] min-w-0 flex-col">
              <main
                id="main-content"
                className="site-main w-full max-w-full flex-1"
              >
                <RouteMotion>{children}</RouteMotion>
              </main>
              <Footer />
            </div>
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
