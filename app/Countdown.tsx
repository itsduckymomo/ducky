"use client";
import { useEffect, useState } from "react";

// Helper to get next May 25th in IST
function getNextBirthdayIST() {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);
  let year = nowIST.getFullYear();
  const birthday = new Date(Date.UTC(year, 4, 25, 0, 0, 0)); // May is 4 (0-indexed)
  if (nowIST > birthday) {
    year += 1;
  }
  return new Date(Date.UTC(year, 4, 25, 0, 0, 0));
}

function getTimeLeft(target: Date) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);
  const diff = target.getTime() - nowIST.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function Countdown() {
  const [target, setTarget] = useState(getNextBirthdayIST());
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(target));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  // When countdown ends, update to next year
  useEffect(() => {
    if (
      timeLeft.days === 0 &&
      timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0
    ) {
      setTarget(getNextBirthdayIST());
    }
  }, [timeLeft]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-2">
      <h1 className="text-3xl sm:text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-yellow-300 via-pink-400 to-green-300 bg-clip-text text-transparent drop-shadow-2xl tracking-tight font-[var(--font-geist-sans)]">
        Ducky's Birthday In
      </h1>
      <div className="relative flex flex-col items-center w-full">
        {/* Animated gradient overlay for depth */}
        <div className="absolute inset-0 z-0 pointer-events-none animate-gradient-move rounded-3xl" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,192,203,0.10) 100%)'}} />
        {/* Sparkle overlay */}
        <SparkleOverlay />
        {/* Glassmorphism card */}
        <div className="relative z-10 p-8 sm:p-12 rounded-3xl bg-black/60 backdrop-blur-2xl border border-pink-200/30 dark:border-pink-900/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] flex flex-col items-center max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-6 sm:gap-10">
            <TimeCircle value={timeLeft.days} label="Days" />
            <TimeCircle value={timeLeft.hours} label="Hours" />
            <TimeCircle value={timeLeft.minutes} label="Minutes" />
            <TimeCircle value={timeLeft.seconds} label="Seconds" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeCircle({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-black/70 via-pink-900/30 to-green-900/30 border-4 border-pink-200/60 dark:border-pink-400/30 shadow-xl relative">
      <div className="absolute inset-0 rounded-full border-2 border-yellow-200/40 animate-glow" />
      <span className="text-3xl sm:text-4xl font-extrabold font-[var(--font-geist-sans)] bg-gradient-to-br from-yellow-300 via-pink-300 to-green-300 bg-clip-text text-transparent drop-shadow-md">
        {String(value).padStart(2, "0")}
      </span>
      <span className="uppercase text-xs sm:text-base tracking-widest mt-1 text-white/80 font-semibold">
        {label}
      </span>
    </div>
  );
}

// Elegant animated sparkle overlay
function SparkleOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Example sparkles, can be expanded for more effect */}
      <span className="absolute left-1/4 top-6 w-1 h-1 bg-white rounded-full opacity-70 animate-sparkle" />
      <span className="absolute left-1/2 top-1/3 w-1.5 h-1.5 bg-yellow-200 rounded-full opacity-60 animate-sparkle-delay" />
      <span className="absolute right-1/4 top-1/4 w-1 h-1 bg-pink-200 rounded-full opacity-60 animate-sparkle" />
      <span className="absolute left-1/3 bottom-1/4 w-1 h-1 bg-green-200 rounded-full opacity-60 animate-sparkle-delay" />
      <span className="absolute right-1/3 bottom-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-70 animate-sparkle" />
      <span className="absolute left-1/2 bottom-1/5 w-1 h-1 bg-yellow-100 rounded-full opacity-60 animate-sparkle-delay" />
    </div>
  );
} 