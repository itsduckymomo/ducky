"use client";
import { Card, CardContent } from "../components/ui/card";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useMemo } from "react";

function getNextBirthdayIST() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);
  let year = nowIST.getFullYear();
  const birthday = new Date(Date.UTC(year, 4, 25, 0, 0, 0)); // May is 4 (0-indexed)
  if (nowIST > birthday) year += 1;
  return new Date(Date.UTC(year, 4, 25, 0, 0, 0));
}

function getSecondsToBirthday() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);
  const nextBirthday = getNextBirthdayIST();
  return Math.max(0, Math.floor((nextBirthday.getTime() - nowIST.getTime()) / 1000));
}

export default function Home() {
  const duration = useMemo(() => getSecondsToBirthday(), []);
  // const nextBirthday = useMemo(() => getNextBirthdayIST(), []); // Removed as it's unused

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-background">
      <Card className="backdrop-blur-2xl bg-black/70 border-2 border-yellow-400/80 shadow-[0_8px_32px_0_rgba(255,215,0,0.25)] max-w-sm w-full mx-4 rounded-3xl relative overflow-visible">
        <CardContent className="flex flex-col items-center py-10 px-4 relative">
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-center bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200 bg-clip-text text-transparent drop-shadow-xl tracking-tight mb-8 mt-2">
            Ducky&apos;s Birthday In
          </h1>
          <div className="relative flex items-center justify-center">
            {/* Subtle gold glow behind the timer */}
            <span className="absolute w-[250px] h-[250px] rounded-full bg-gradient-to-br from-yellow-400/5 via-yellow-600/10 to-black/50 blur-xl z-0" />
            <CountdownCircleTimer
              isPlaying
              duration={duration}
              colors="#FFD700"
              strokeWidth={14}
              trailColor="rgba(50,50,50,0.5)"
              size={220}
              rotation="clockwise"
              onComplete={() => ({ shouldRepeat: true, delay: 1, newInitialRemainingTime: getSecondsToBirthday() })}
            >
              {({ remainingTime }) => <CountdownDisplay remainingTime={remainingTime} />}
            </CountdownCircleTimer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CountdownDisplay({ remainingTime }: { remainingTime: number }) {
  const days = Math.floor(remainingTime / (60 * 60 * 24));
  const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
  const seconds = remainingTime % 60;
  return (
    <div className="flex flex-col items-center justify-center w-full h-full z-10">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-center">
        <TimeBox value={days} label="Days" />
        <TimeBox value={hours} label="Hours" />
        <TimeBox value={minutes} label="Minutes" />
        <TimeBox value={seconds} label="Seconds" />
      </div>
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[70px]">
      <span className="text-3xl font-bold font-serif bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-100 bg-clip-text text-transparent drop-shadow-sm">
        {String(value).padStart(2, "0")}
      </span>
      <span className="uppercase text-[10px] tracking-wider mt-0.5 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200 bg-clip-text text-transparent font-semibold">
        {label}
      </span>
    </div>
  );
}
