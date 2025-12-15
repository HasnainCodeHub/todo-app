import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "The Evolution of Todo",
  description: "From Simple Tasks to Intelligent, Cloud-Native Productivity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-bg-primary text-text-secondary`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        {/* The footer can be conditional based on the page if needed */}
        {/* <Footer /> */}
      </body>
    </html>
  );
}