import type { Metadata } from "next";
import "./globals.css";
import { AuditProvider } from "@/context/AuditContext";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import SimulatedDataBanner from "@/components/layout/SimulatedDataBanner";

export const metadata: Metadata = {
  title: "AWS Cloud Infrastructure Security & Technology Risk Audit Platform",
  description: "Enterprise IT Internal Audit and Cloud Risk Assessment Platform for Northstar Claims Technologies",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "AWS Cloud Infrastructure Security & Technology Risk Audit Platform",
    description: "Enterprise IT Internal Audit and Cloud Risk Assessment Platform for Northstar Claims Technologies",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 text-slate-900">
        <AuditProvider>
          <SimulatedDataBanner />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <TopNav />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/80">
                <div className="max-w-7xl mx-auto">{children}</div>
              </main>
            </div>
          </div>
        </AuditProvider>
      </body>
    </html>
  );
}

