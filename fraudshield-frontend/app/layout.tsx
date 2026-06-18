import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FraudShield – AI-Powered Fraud Detection",
  description: "Real-time AI fraud detection dashboard for financial institutions. Monitor transactions, review alerts, and manage fraud detection thresholds.",
  keywords: "fraud detection, real-time, AI, machine learning, banking security",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
