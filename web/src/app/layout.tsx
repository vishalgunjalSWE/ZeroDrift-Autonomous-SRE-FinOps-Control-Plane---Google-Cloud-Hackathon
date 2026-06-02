import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/query-client";
import { LeftSidebar } from "@/components/LeftSidebar";
import { HackathonBanner } from "@/components/HackathonBanner";
import { AuthWrapper } from "@/components/AuthWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });

export const metadata: Metadata = {
  title: "ZeroDrift | Autonomous SRE",
  description: "Agentic FinOps & Infrastructure Auto-Remediation Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased bg-obsidian text-[#EDEDED] selection:bg-azure/30 selection:text-white`} suppressHydrationWarning>
        {/* Removed ambient glows for strict enterprise graphite aesthetic */}
        <ReactQueryProvider>
          <AuthWrapper>
            <div className="flex h-screen w-screen overflow-hidden bg-obsidian">
              <LeftSidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <HackathonBanner />
                <div className="flex-1 overflow-y-auto">
                  {children}
                </div>
              </div>
            </div>
          </AuthWrapper>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
