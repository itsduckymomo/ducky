"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

// Helper function to determine the start epoch of the next May 25th in IST.
// This is the precise moment (00:00:00 IST) the countdown targets or the birthday begins.
function getNextBirthdayStartEpochIST(): number {
  const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
  const nowGlobal = new Date(); // Current global Date object

  // Determine current wall-clock year in IST to start our calculation
  const nowISTForYearCalc = new Date(nowGlobal.getTime() + istOffsetMilliseconds);
  let targetCalendarYearIST = nowISTForYearCalc.getUTCFullYear();

  // Calculate the epoch for May 25th, 00:00:00 IST of this targetCalendarYearIST
  // Date.UTC() takes month as 0-indexed (4 for May)
  let targetBirthdayStartEpoch = Date.UTC(targetCalendarYearIST, 4, 25, 0, 0, 0) - istOffsetMilliseconds;

  // If the current global time is already at or past the calculated start of May 25th IST
  if (nowGlobal.getTime() >= targetBirthdayStartEpoch) {
    // This means we are either on May 25th (IST) or past it for the targetCalendarYearIST.
    // We need to check if May 25th (IST) for targetCalendarYearIST is completely over.
    // The end of May 25th IST is just before May 26th 00:00:00 IST.
    const startOfMay26ISTEpoch = Date.UTC(targetCalendarYearIST, 4, 26, 0, 0, 0) - istOffsetMilliseconds;

    if (nowGlobal.getTime() >= startOfMay26ISTEpoch) {
      // Current time is on or after May 26th 00:00:00 IST for targetCalendarYearIST.
      // So, the target birthday must be for the next year.
      targetCalendarYearIST += 1;
      targetBirthdayStartEpoch = Date.UTC(targetCalendarYearIST, 4, 25, 0, 0, 0) - istOffsetMilliseconds;
}
    // If it's still May 25th in IST (i.e., nowGlobal.getTime() < startOfMay26ISTEpoch),
    // targetBirthdayStartEpoch correctly points to the start of the current birthday period.
    // In this case, getSecondsToTargetEpoch() will yield <= 0 seconds.
  }
  return targetBirthdayStartEpoch;
}

// Helper function to calculate seconds remaining until a target epoch.
function getSecondsToTargetEpoch(targetEpoch: number): number {
  const nowGlobal = new Date();
  const diffMilliseconds = targetEpoch - nowGlobal.getTime();
  return Math.max(0, Math.floor(diffMilliseconds / 1000));
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(totalSeconds: number): TimeLeft {
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

const quotes = [
  "The wound is the place where the Light enters you.",
  "What stands in the way becomes the way.",
  "We are not punished for our anger, but by our anger.",
  "The deeper that sorrow carves into your being, the more joy you can contain.",
  "He who has a why to live can bear almost any how.",
  "The only true wisdom is in knowing you know nothing.",
  "Excellence is not an act, but a habit.",
  "To live is the rarest thing in the world. Most people exist, that is all.",
  "The cave you fear to enter holds the treasure you seek.",
  "Man is not what he thinks he is, he is what he hides.",
  "If you are depressed you are living in the past. If you are anxious you are living in the future. If you are at peace you are living in the present.",
  "The unexamined life is not worth living.",
  "It is not death that one should fear, but one should fear never beginning to live.",
  "Everything can be taken from a man but one thing: the last of the human freedoms—to choose one's attitude in any given set of circumstances.",
  "The quieter you become, the more you are able to hear.",
  "We suffer more often in imagination than in reality.",
  "The only journey is the one within.",
  "Knowing yourself is the beginning of all wisdom.",
  "The truth is rarely pure and never simple.",
  "Do not go where the path may lead, go instead where there is no path and leave a trail.",
  "We must be willing to let go of the life we planned so as to have the life that is waiting for us.",
  "Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.",
  "The price of anything is the amount of life you exchange for it.",
  "Life is not a problem to be solved, but a reality to be experienced.",
  "The heart has its reasons which reason knows not.",
  "What is necessary to change a person is to change his awareness of himself.",
  "You have power over your mind – not outside events. Realize this, and you will find strength.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "Become what you are.",
  "There is nothing either good or bad, but thinking makes it so.",
  "Our lives begin to end the day we become silent about things that matter.",
  "The fool doth think he is wise, but the wise man knows himself to be a fool.",
  "It is the mark of an educated mind to be able to entertain a thought without accepting it.",
  "The world breaks everyone, and afterward, some are strong at the broken places.",
  "Happiness is not something ready-made. It comes from your own actions.",
  "When I let go of what I am, I become what I might be.",
  "The only way out of the labyrinth of suffering is to forgive.",
  "We are all in the gutter, but some of us are looking at the stars.",
  "What we achieve inwardly will change outer reality.",
  "The aim of art is to represent not the outward appearance of things, but their inward significance.",
  "Be yourself; everyone else is already taken.",
  "The path to our destination is not always a straight one. We go down the wrong road, we get lost, we turn back.",
  "Pain is inevitable. Suffering is optional.",
  "He who is not courageous enough to take risks will accomplish nothing in life.",
  "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.",
  "The best way out is always through.",
  "We are spiritual beings having a human experience.",
  "You will face many defeats in life, but never let yourself be defeated.",
  "Until you make the unconscious conscious, it will direct your life and you will call it fate.",
  "The privilege of a lifetime is to become who you truly are.",
  "Life shrinks or expands in proportion to one's courage.",
  "If you look for perfection, you'll never be content.",
  "The purpose of life is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.",
  "Difficulties strengthen the mind, as labor does the body.",
  "There is a crack in everything, that's how the light gets in.",
  "We must accept finite disappointment, but never lose infinite hope.",
  "One cannot step twice in the same river.",
  "The only thing necessary for the triumph of evil is for good men to do nothing.",
  "Freedom is not worth having if it does not include the freedom to make mistakes.",
  "The mind is everything. What you think you become.",
  "An unexamined life is not worth living for a human being.",
  "The measure of intelligence is the ability to change.",
  "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
  "What you become by achieving your goals is more important than what you get.",
  "The first and best victory is to conquer self.",
  "Judge by questions rather than by answers.",
  "To find yourself, think for yourself.",
  "I can't go back to yesterday because I was a different person then.",
  "The art of being wise is the art of knowing what to overlook.",
  "What worries you, masters you.",
  "If you want to awaken all of humanity, then awaken all of yourself.",
  "The only real failing is the one from which we learn nothing.",
  "We are shaped by our thoughts; we become what we think.",
  "Life is a series of natural and spontaneous changes. Don't resist them; that only creates sorrow.",
  "The soul usually knows what to do to heal itself. The challenge is to silence the mind.",
  "A book must be the axe for the frozen sea within us.",
  "The journey of a thousand miles begins with a single step.",
  "The more you know, the more you know you don't know.",
  "It is never too late to be what you might have been.",
  "Our intention creates our reality.",
  "Small minds discuss people; average minds discuss events; great minds discuss ideas.",
  "Nothing is permanent except change.",
  "The desire for safety stands against every great and noble enterprise.",
  "If you are irritated by every rub, how will your mirror be polished?",
  "He who is brave is free.",
  "Knowing others is intelligence; knowing yourself is true wisdom. Mastering others is strength; mastering yourself is true power.",
  "Wisdom begins in wonder.",
  "The secret of change is to focus all of your energy, not on fighting the old, but on building the new.",
  "In the middle of difficulty lies opportunity.",
  "The things you own end up owning you.",
  "There is more to life than increasing its speed.",
  "You create your own universe as you go along.",
  "The real tragedy of life is when men are afraid of the light.",
  "What the caterpillar calls the end of the world, the master calls a butterfly.",
  "To dare is to lose one's footing momentarily. Not to dare is to lose oneself.",
  "The mystery of human existence lies not in just staying alive, but in finding something to live for.",
  "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
  "Start with what is right rather than what is acceptable.",
  "The man who moves a mountain begins by carrying away small stones.",
  "Turn your wounds into wisdom."
];

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  // Calculate initial state values using memoization to avoid re-computation on every render
  const { /* initialTargetEpoch, */ initialSecondsToTarget, initialIsBirthdayPeriod, initialNextBirthdayYear } = useMemo(() => {
    const targetEpoch = getNextBirthdayStartEpochIST();
    const secondsToTarget = getSecondsToTargetEpoch(targetEpoch);
    const isBirthday = secondsToTarget <= 0;
    
    const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
    const dateForYearDisplay = new Date(targetEpoch + istOffsetMilliseconds); // Convert epoch back to IST wall time components
    const year = dateForYearDisplay.getUTCFullYear();

    return {
      // initialTargetEpoch: targetEpoch, // Removed as it's unused
      initialSecondsToTarget: secondsToTarget,
      initialIsBirthdayPeriod: isBirthday,
      initialNextBirthdayYear: year,
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(initialSecondsToTarget));
  const [isBirthdayPeriod, setIsBirthdayPeriod] = useState(initialIsBirthdayPeriod);
  const [nextBirthdayYear, setNextBirthdayYear] = useState(initialNextBirthdayYear);
  const [currentQuote, setCurrentQuote] = useState(() => {
    if (initialIsBirthdayPeriod) return "";
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    return quotes[currentMonth % quotes.length];
  });

  useEffect(() => {
    setIsClient(true);

    const intervalId = setInterval(() => {
      const currentTargetEpoch = getNextBirthdayStartEpochIST();
      const currentSecondsToTarget = getSecondsToTargetEpoch(currentTargetEpoch);
      const currentlyIsBirthdayPeriod = currentSecondsToTarget <= 0;

      setTimeLeft(calculateTimeLeft(currentSecondsToTarget));
      setIsBirthdayPeriod(currentlyIsBirthdayPeriod);

      const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
      const dateForDisplay = new Date(currentTargetEpoch + istOffsetMilliseconds);
      setNextBirthdayYear(dateForDisplay.getUTCFullYear());

      if (!currentlyIsBirthdayPeriod) {
        const nowForQuote = new Date();
        const currentMonthForQuote = nowForQuote.getMonth();
        setCurrentQuote(quotes[currentMonthForQuote % quotes.length]);
      } else {
        setCurrentQuote("");
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount.

  if (!isClient) {
    // Render a placeholder or null on the server to avoid hydration mismatch
    // Or, use the initial memoized values for a static first paint if suitable.
    let ssrQuote = "";
    if (!initialIsBirthdayPeriod) {
      const now = new Date(); 
      const currentMonth = now.getMonth();
      ssrQuote = quotes[currentMonth % quotes.length];
    }
  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
            Ducky&apos;s Birthday Countdown
          </h1>
          {!initialIsBirthdayPeriod && (
            <p className="mt-4 text-xl text-slate-300">
              Counting down to the big day in {initialNextBirthdayYear}!
            </p>
          )}
          {!initialIsBirthdayPeriod && ssrQuote && (
            <p className="mt-6 text-lg italic text-slate-400 max-w-2xl mx-auto">
              &ldquo;{ssrQuote}&rdquo;
            </p>
          )}
        </header>
         {/* Static display for SSR/initial paint can be based on initialIsBirthdayPeriod */} 
        {initialIsBirthdayPeriod ? (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-yellow-400">Happy Birthday, Ducky!</h2>
            <p className="mt-3 text-lg text-slate-200">Hope you have a fantastic day!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <TimeUnit value={calculateTimeLeft(initialSecondsToTarget).days} label="Days" />
            <TimeUnit value={calculateTimeLeft(initialSecondsToTarget).hours} label="Hours" />
            <TimeUnit value={calculateTimeLeft(initialSecondsToTarget).minutes} label="Minutes" />
            <TimeUnit value={calculateTimeLeft(initialSecondsToTarget).seconds} label="Seconds" />
          </div>
        )}
        <footer className="mt-16 text-center text-slate-400 text-sm">
          <p>Made by Sky 🦋</p>
        </footer>
    </div>
  );
}

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
          Ducky&apos;s Birthday Countdown
        </h1>
        {!isBirthdayPeriod && (
            <p className="mt-4 text-xl text-slate-300">
              Counting down to the big day in {nextBirthdayYear}!
            </p>
        )}
        {!isBirthdayPeriod && currentQuote && (
          <p className="mt-6 text-lg italic text-slate-400 max-w-2xl mx-auto">
            &ldquo;{currentQuote}&rdquo;
          </p>
        )}
      </header>

      {isBirthdayPeriod ? (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-yellow-400">
            Happy Birthday, Ducky!
          </h2>
          <p className="mt-3 text-lg text-slate-200">Hope you have a fantastic day!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
          <TimeUnit value={timeLeft.days} label="Days" />
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <TimeUnit value={timeLeft.seconds} label="Seconds" />
        </div>
      )}

      <footer className="mt-16 text-center text-slate-400 text-sm">
        <p>Made by 🦋</p>
        <div className="mt-4">
          <Link href="/birthday-preview" legacyBehavior>
            <a className="px-4 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors duration-150 ease-in-out">
              (Dev: Preview Birthday)
            </a>
          </Link>
      </div>
      </footer>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-2xl min-w-[100px] sm:min-w-[120px] md:min-w-[140px]">
      <div className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs sm:text-sm uppercase tracking-wider text-slate-300 mt-2">
        {label}
      </div>
    </div>
  );
}
