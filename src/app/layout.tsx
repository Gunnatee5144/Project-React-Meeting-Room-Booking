import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { getRoomViewer } from "@/lib/room-access";
import { ToastProvider } from "@/context/toast-context";
import { AppProvider } from "@/context/app-context";
import { RouteMotion } from "@/components/ui/route-motion";
import { Footer } from "@/components/layout/footer";

const thai = IBM_Plex_Sans_Thai({ weight: ["400", "500", "600"], subsets: ["thai", "latin"], variable: "--font-thai", display: "swap" });
const cabinet = localFont({ src: [
  { path: "../../public/fonts/cabinet-grotesk-regular.woff2", weight: "400", style: "normal" },
  { path: "../../public/fonts/cabinet-grotesk-bold.woff2", weight: "700", style: "normal" },
], variable: "--font-cabinet", display: "swap" });

export const metadata: Metadata = {
  title: "MEETSYNC · จองห้องประชุม DII CMU",
  description:
    "ค้นหาห้องว่าง ดูรายละเอียด และจัดการรายการจองสำหรับบุคลากรและนักศึกษาวิทยาลัยนวัตกรรมดิจิทัล มหาวิทยาลัยเชียงใหม่",
};

// Server Component: reads the session cookie on the server (getRoomViewer) so the user is
// known before first paint, then hands only name and role to the client AuthProvider.
// Reading cookies makes every route render per request (SSR), not at build time.
export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getRoomViewer();
  return (
    <html lang="th">
      <body className={`${thai.variable} ${cabinet.variable}`}>
        <AuthProvider user={user ? { name: user.name, role: user.role } : null}>
          <ToastProvider>
            <AppProvider>
              <a className="skip-link" href="#main-content">ข้ามไปเนื้อหา</a>
              <Navigation />
              <main id="main-content" className="page-shell">
                <RouteMotion>{children}</RouteMotion>
              </main>
              <Footer />
            </AppProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
