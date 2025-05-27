"use client";
import Link from "next/link";
import { useState, useEffect, FormEvent, useCallback } from "react";

// SVG Icon Components (simple inline SVGs for brevity)
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 inline-block opacity-80">
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 inline-block opacity-80">
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
  </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 inline-block opacity-70">
        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 01.75.75v1a.75.75 0 01-.75.75H5.5a.75.75 0 01-.75-.75v-1z" clipRule="evenodd" />
    </svg>
);

interface PastMessage {
  id: string;
  yearWritten: number;
  message: string;
}

export default function BirthdayPreviewPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentMessageInput, setCurrentMessageInput] = useState("");
  const [allMessages, setAllMessages] = useState<PastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const isDevMode = process.env.NODE_ENV === 'development';
  const currentYear = new Date().getFullYear();
  const messageAlreadySentThisYear = !isDevMode && isClient && allMessages.some(msg => msg.yearWritten === currentYear);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("[DEBUG] fetchMessages called");
    try {
      const response = await fetch('/api/messages');
      console.log("[DEBUG] API Response Status:", response.status);
      if (!response.ok) {
        const errData = await response.json();
        console.error("[DEBUG] API Error Data:", errData);
        throw new Error(errData.error || `Failed to fetch messages: ${response.status}`);
      }
      const data: PastMessage[] = await response.json();
      console.log("[DEBUG] Fetched Data:", data);
      setAllMessages(data);
    } catch (err: unknown) {
      console.error("[DEBUG] Fetch messages error (in catch block):", err);
      if (err instanceof Error) {
        setError(err.message || "Could not load messages. Please try again later.");
      } else {
        setError("An unknown error occurred while loading messages. Please try again later.");
      }
    } finally {
      setIsLoading(false);
      console.log("[DEBUG] fetchMessages finished, isLoading:", false);
    }
  }, []);

  useEffect(() => {
    console.log("[DEBUG] useEffect for initial fetch, isClient:", isClient);
    if (!isClient) {
      setIsClient(true);
    }
    fetchMessages();
  }, [isClient, fetchMessages]);

  const handleSaveNewMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentMessageInput.trim()) {
        setSubmitError("Message cannot be empty.");
        return;
    }
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMessageInput.trim(), yearWritten: currentYear }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to save message: ${response.status}`);
      }
      setCurrentMessageInput("");
      setSubmitSuccess("Your message has been saved for next year! 🎉");
      await fetchMessages(); 
    } catch (err: unknown) {
      console.error("Save message error:", err);
      if (err instanceof Error) {
        setSubmitError(err.message || "Could not save your message. Please try again.");
      } else {
        setSubmitError("An unknown error occurred while saving your message. Please try again.");
      }
    }
  };

  const handleClearAllMessages = async () => {
    if (confirm("Are you sure you want to delete ALL saved past messages from the KV store? This cannot be undone.")) {
      setSubmitError(null);
      setSubmitSuccess(null);
      try {
        const response = await fetch('/api/messages', { method: 'DELETE' });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Failed to clear messages: ${response.status}`);
        }
        setAllMessages([]);
        alert("All messages cleared from KV store.");
      } catch (err: unknown) {
        console.error("Clear messages error:", err);
        if (err instanceof Error) {
          alert(`Error clearing messages: ${err.message}`);
        } else {
          alert("An unknown error occurred while clearing messages.");
        }
      }
    }
  };
  
  const sortedMessages = [...allMessages].sort((a, b) => b.yearWritten - a.yearWritten);

  if (typeof window !== 'undefined') {
    console.log("[DEBUG] Rendering - isClient:", isClient, "isLoading:", isLoading, "error:", error);
    console.log("[DEBUG] Rendering - allMessages count:", allMessages.length, "sortedMessages count:", sortedMessages.length);
    if (allMessages.length > 0) {
        console.log("[DEBUG] Rendering - First message in allMessages:", allMessages[0]);
    }
  }

  if (!isClient || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 text-white p-4">
        <div className="text-2xl text-slate-300 flex items-center">
          <svg className="animate-spin h-8 w-8 mr-3 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Its Birthday Time...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 text-white p-4 sm:p-6 font-sans overflow-y-auto">
      <main className="text-center w-full max-w-3xl px-2 sm:px-4 py-8 flex flex-col flex-grow">
        <div className="mb-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent animate-pulse">
            🎉 Happy Birthday, Ducky! 🎉
          </h1>
          <p className="mt-5 text-xl text-slate-300">
            Hope you have a fantastic and quack-tastic day!
          </p>
        </div>

        <section className="my-8 p-6 sm:p-8 bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl w-full transition-all duration-300 ease-in-out hover:shadow-purple-600/40">
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent mb-6 flex items-center justify-center">
            <PencilIcon /> A Message to Your Future Self
          </h2>
          <p className="text-slate-300 mb-4 text-base">
            Write a message today, and future Ducky will see it here on this day next year!
          </p>
          
          {messageAlreadySentThisYear && (
            <div className="mb-5 p-3.5 bg-green-600/15 border border-green-500/40 rounded-lg text-green-300 text-sm shadow-inner">
              ✓ You have successfully left a message from this birthday! Check back next year.
            </div>
          )}

          <form onSubmit={handleSaveNewMessage} className="space-y-5">
            <textarea
              rows={5}
              className={`w-full p-4 bg-slate-800/50 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400/80 focus:ring-2 focus:ring-pink-500 focus:border-pink-600 focus:bg-slate-800/70 transition-all duration-200 ease-in-out shadow-lg text-base leading-relaxed resize-none ${messageAlreadySentThisYear ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="What wisdom, hopes, or funny thoughts do you want to send to your future self?" 
              value={currentMessageInput}
              onChange={(e) => setCurrentMessageInput(e.target.value)}
              disabled={messageAlreadySentThisYear}
            />
            <button
              type="submit"
              disabled={!currentMessageInput.trim() || messageAlreadySentThisYear}
              className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-fuchsia-700 hover:from-pink-700 hover:via-purple-700 hover:to-fuchsia-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900/50 disabled:from-slate-500 disabled:to-slate-600 disabled:hover:from-slate-500 disabled:hover:to-slate-600 disabled:cursor-not-allowed disabled:opacity-70 text-white font-semibold rounded-lg shadow-xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-150 ease-in-out text-base"
            >
              Save Message from This Birthday
            </button>
            {submitError && <p className="text-red-400 text-sm mt-3 bg-red-700/20 p-3 rounded-lg">Error: {submitError}</p>}
            {submitSuccess && <p className="text-green-400 text-sm mt-3 bg-green-700/20 p-3 rounded-lg">{submitSuccess}</p>}
          </form>
        </section>

        {error && (
            <div className="my-6 p-4 bg-red-900/40 backdrop-blur-md border border-red-600/60 rounded-lg text-red-300 w-full shadow-lg">
              <p className="font-semibold mb-1">Oops! Failed to load messages:</p>
              <p className="text-sm">{error}</p>
              <button onClick={fetchMessages} className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-md text-xs font-medium transition-colors">Try Again</button>
            </div>
        )}

        {sortedMessages.length > 0 && (
          <section className="my-8 p-6 sm:p-8 bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl w-full transition-all duration-300 ease-in-out hover:shadow-pink-600/40">
            <h2 className="text-3xl font-semibold bg-gradient-to-r from-purple-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-8 flex items-center justify-center">
              <MailIcon /> Messages from Past Birthdays
            </h2>
            <div className="space-y-8">
              {sortedMessages.map((msg, index) => (
                <div 
                  key={msg.id} 
                  className="p-6 bg-slate-800/50 backdrop-blur-lg border border-slate-700/80 rounded-2xl shadow-xl text-left transition-all duration-300 ease-out hover:shadow-teal-400/40 hover:border-slate-600/90 hover:-translate-y-1.5"
                  style={{ animationDelay: `${index * 120}ms`, opacity: 0, animationFillMode: 'forwards', animationName: 'fadeInUp' }}
                >
                  <p className="text-xs text-purple-300/90 mb-2 font-semibold uppercase tracking-wider flex items-center">
                    <CalendarIcon /> From your <span className="font-bold text-purple-200/90 text-sm ml-1">{msg.yearWritten}</span> self:
                  </p>
                  <p className="text-slate-100/90 whitespace-pre-wrap text-base leading-relaxed selection:bg-purple-600 selection:text-white pl-1">{msg.message}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {isDevMode && (
          <div className="my-8 pt-8 border-t border-white/15 w-full">
            <h3 className="text-xl font-semibold text-slate-400 mb-4">Dev Controls</h3>
            <button
              onClick={handleClearAllMessages}
              className="px-6 py-3 bg-gradient-to-r from-red-600 via-pink-700 to-rose-700 hover:from-red-700 hover:via-pink-800 hover:to-rose-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900/50 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-150 ease-in-out">
              Clear All Saved Messages (Dev Only)
            </button>
          </div>
        )}

        <div className="mt-auto pt-10">
            <Link href="/" legacyBehavior>
                <a className="px-10 py-4 bg-gradient-to-r from-purple-600 via-teal-500 to-sky-500 hover:from-purple-700 hover:via-teal-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950 text-white font-semibold rounded-lg shadow-xl hover:shadow-teal-500/50 transform hover:scale-105 transition-all duration-150 ease-in-out text-base">
                    &larr; Back to Countdown
                </a>
            </Link>
        </div>
      </main>
      <footer className="w-full text-center text-slate-500 text-sm py-8">
        <p>This is the Ducky birthday experience page.</p>
      </footer>
    </div>
  );
}

/* Add this to your globals.css or in a <style jsx global> tag in layout.tsx if you want the fadeInUp animation */
/* @keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
} 

.animate-fadeInUp {
  animation-name: fadeInUp;
  animation-duration: 0.5s; 
  animation-fill-mode: forwards;
} */ 