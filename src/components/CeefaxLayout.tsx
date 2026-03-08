"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CeefaxLayoutProps {
  children: React.ReactNode;
  pageNumber?: string;
}

function CeefaxClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-ceefax-white">
      {date} {time}
    </span>
  );
}

const fastext = [
  { label: "SEARCH", color: "bg-ceefax-red", textColor: "text-ceefax-white", href: "/search" },
  { label: "LEADERBOARD", color: "bg-ceefax-green", textColor: "text-black", href: "/leaderboard" },
  { label: "MAP", color: "bg-ceefax-yellow", textColor: "text-black", href: "/map" },
  { label: "CHARTS", color: "bg-ceefax-blue", textColor: "text-ceefax-white", href: "/charts" },
] as const;

export default function CeefaxLayout({
  children,
  pageNumber = "100",
}: CeefaxLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-black font-teletext">
      {/* Header bar */}
      <header className="flex items-center justify-between px-2 py-1 bg-ceefax-blue gap-2">
        <Link href="/" className="text-ceefax-yellow text-xl sm:text-2xl md:text-3xl tracking-wider font-bold whitespace-nowrap hover:brightness-110 transition-none">
          PINT MARKETS V001
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-lg md:text-xl whitespace-nowrap">
          <span className="text-ceefax-white">{pageNumber}</span>
          <CeefaxClock />
        </div>
      </header>

      {/* Thin separator line */}
      <div className="h-0.5 bg-ceefax-cyan" />

      {/* Main content */}
      <main className="flex-1 px-3 py-2 pb-12 text-lg md:text-xl leading-relaxed">
        {children}
      </main>

      {/* FASTEXT footer buttons — sticky bottom */}
      <footer className="sticky bottom-0 z-50">
        <div className="h-0.5 bg-ceefax-cyan" />
        <nav className="grid grid-cols-4">
          {fastext.map((btn) => (
            <Link
              key={btn.label}
              href={btn.href}
              className={`${btn.color} ${btn.textColor} text-center py-1.5 text-xs sm:text-sm md:text-xl font-bold tracking-wide hover:brightness-110 transition-none`}
            >
              {btn.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
