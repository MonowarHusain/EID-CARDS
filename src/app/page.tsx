"use client";

import { useState } from "react";
import { generateSecretKey, encryptMessage } from "@/lib/encryption";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { sendFeedback } from "./actions";

export default function Home() {
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [fbName, setFbName] = useState("");
  const [fbEmail, setFbEmail] = useState("");
  const [fbMessage, setFbMessage] = useState("");
  const [fbStatus, setFbStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const MAX_CHARS = 500;

  const handleGenerate = async () => {
    if (!message || message.length > MAX_CHARS) return;
    setIsGenerating(true);

    try {
      const secretKey = generateSecretKey();
      const encryptedMessage = encryptMessage(message, secretKey);
      const shortId = Math.random().toString(36).substring(2, 8);
      
      const expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + 30);

      await setDoc(doc(db, "capsules", shortId), {
        text: encryptedMessage,
        expiresAt: expireAt.toISOString(),
      });

      const url = `${window.location.origin}/card/${shortId}#${secretKey}`;
      setGeneratedUrl(url);
    } catch (error) {
      console.error("Encryption error:", error);
      alert("Failed to generate the secure link. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbMessage) return;
    
    setFbStatus("sending");
    try {
      await sendFeedback(fbName, fbEmail, fbMessage);
      setFbStatus("sent");
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setFbStatus("idle");
        setFbName(""); setFbEmail(""); setFbMessage("");
      }, 2000);
    } catch (error) {
      setFbStatus("error");
      setTimeout(() => setFbStatus("idle"), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-950 to-slate-950"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-950/80 to-transparent"></div>

      <div className="relative z-10 max-w-lg w-full bg-slate-900/50 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 p-8 sm:p-10 space-y-8">
        
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <svg className="w-10 h-10 text-amber-400 opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent pb-1">
            Private Eid Greeting
          </h1>
          <p className="text-emerald-100/60 text-sm sm:text-base font-light tracking-wide">
            Send a beautiful, private message. It safely disappears after 30 days.
          </p>
        </div>

        {!generatedUrl ? (
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 to-emerald-500/30 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bismillah... Write your private Eid wishes here..."
                  className="w-full h-44 p-5 bg-slate-950/80 border border-white/5 rounded-2xl text-emerald-50 placeholder:text-emerald-100/30 focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none resize-none transition-all leading-relaxed"
                />
                <span 
                  className={`absolute bottom-4 right-4 text-xs font-medium px-2 py-1 rounded-md bg-slate-900/80 border ${
                    message.length >= MAX_CHARS 
                      ? "text-red-400 border-red-500/30" 
                      : "text-amber-500/70 border-white/5"
                  }`}
                >
                  {message.length} / {MAX_CHARS}
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!message || message.length > MAX_CHARS || isGenerating}
              className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {isGenerating ? "Securing Message..." : "Create Private Link"}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="p-1 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-amber-500/30">
              <div className="p-5 bg-slate-950/90 rounded-xl space-y-3">
                <p className="text-sm text-amber-400/90 font-medium uppercase tracking-wider text-center">
                  Your Envelope is Ready
                </p>
                <div className="p-4 bg-black/50 rounded-lg border border-white/10 text-sm text-emerald-100/70 break-all font-mono selection:bg-amber-500/30 text-center">
                  {generatedUrl}
                </div>
              </div>
            </div>
            
            <button
              onClick={copyToClipboard}
              className="btn w-full"
            >
              <span>
                {copied ? "Link Copied!" : "Copy Secure Link"}
              </span>
            </button>
            
            <button
              onClick={() => {
                setGeneratedUrl("");
                setMessage("");
              }}
              className="w-full text-emerald-100/50 hover:text-amber-400 text-sm font-medium py-2 transition-colors uppercase tracking-widest"
            >
              Write Another
            </button>
          </div>
        )}
      </div>

      {/* Top Right Actions */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        {/* GitHub Icon */}
        <a href="https://github.com/MonowarHusain/EID-CARDS" target="_blank" rel="noopener noreferrer" className="text-emerald-100/40 hover:text-amber-400 transition-colors" title="View Source on GitHub">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg>
        </a>
        
        {/* Feedback Trigger */}
        <button onClick={() => setIsFeedbackOpen(true)} className="text-emerald-100/40 hover:text-amber-400 text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer">
          Leave Feedback
        </button>
      </div>

      {/* Floating Footer */}
      <div className="absolute bottom-6 w-full px-6 flex flex-col items-center gap-3 z-20 pointer-events-none">
        <div className="text-center">
          <p className="text-emerald-100/40 text-xs font-light tracking-widest uppercase">
            Crafted by{' '}
            <a href="https://www.mono.bro.bd/" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 font-medium hover:text-amber-400 hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all pointer-events-auto">
              Monowar Husain
            </a>
          </p>
          <p className="text-emerald-100/30 text-[10px] mt-1.5 font-mono">
            &copy; 2026 All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Feedback Modal Overlay */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setIsFeedbackOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <h3 className="text-xl font-serif text-amber-400">Feedback</h3>
            <p className="text-xs text-emerald-100/60">Help me improve this experience. Messages are sent directly to me.</p>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <input type="text" placeholder="Name (Optional)" value={fbName} onChange={(e) => setFbName(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg px-4 py-2 text-sm text-emerald-50 focus:border-amber-500/50 outline-none" />
              <input type="email" placeholder="Email (Optional)" value={fbEmail} onChange={(e) => setFbEmail(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg px-4 py-2 text-sm text-emerald-50 focus:border-amber-500/50 outline-none" />
              <textarea placeholder="Your message..." required value={fbMessage} onChange={(e) => setFbMessage(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg px-4 py-2 text-sm text-emerald-50 focus:border-amber-500/50 outline-none h-24 resize-none" />
              
              <button disabled={fbStatus === "sending" || fbStatus === "sent"} type="submit" className="w-full bg-emerald-900/50 hover:bg-emerald-800 text-amber-400 border border-emerald-500/30 rounded-lg py-2 text-sm font-medium tracking-wide transition-colors disabled:opacity-50">
                {fbStatus === "sending" ? "Sending..." : fbStatus === "sent" ? "Sent!" : fbStatus === "error" ? "Error" : "Send Feedback"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}