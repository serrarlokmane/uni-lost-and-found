import type { Metadata } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

// CSP with a nonce (added Fri Nov 13) only works on dynamic pages. See PLAN.md "Known pitfalls" #3.
export const dynamic = "force-dynamic";

// next/font serves the fonts from our own domain, so no request goes to Google.
const heading = Lexend({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Lqito: University Lost & Found",
  description: "Lost something on campus? Found something? Post it here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
