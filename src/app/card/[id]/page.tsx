"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { decryptMessage } from "@/lib/encryption";
import Link from "next/link";

export default function CardView() {
    const params = useParams();
    const id = params?.id as string;

    // States
    const [decryptedText, setDecryptedText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Animation Phases: "sealed" -> "breaking" -> "opened"
    const [phase, setPhase] = useState<"sealed" | "breaking" | "opened">("sealed");

    // Audio
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const fetchAndDecrypt = async () => {
            try {
                const hashUrl = typeof window !== "undefined" ? window.location.hash.substring(1) : "";
                if (!hashUrl) throw new Error("No decryption key found in URL.");

                if (!id) throw new Error("No envelope ID found.");

                const docRef = doc(db, "capsules", id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) throw new Error("This envelope does not exist or has expired.");

                const { text, expiresAt } = docSnap.data();
                if (new Date(expiresAt) < new Date()) throw new Error("This envelope has expired.");

                const decrypted = decryptMessage(text, hashUrl);
                if (!decrypted) throw new Error("Invalid decryption key.");

                setDecryptedText(decrypted);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to open envelope.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndDecrypt();
    }, [id]);

    const handleBreakSeal = () => {
        // 1. Trigger the visual fracture
        setPhase("breaking");

        // 2. Start the music immediately for emotional effect
        if (audioRef.current) {
            audioRef.current.volume = 0.4;
            audioRef.current.play().catch(() => console.log("Audio autoplay blocked"));
            setIsPlaying(true);
        }

        // 3. Wait 1.5 seconds for the "burst" animation before showing text
        setTimeout(() => {
            setPhase("opened");
        }, 1500);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Lighting */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-950 to-slate-950"></div>
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-950/80 to-transparent"></div>

            {/* Hidden Audio */}
            <audio ref={audioRef} src="/bg-music.mp3" loop />

            {/* Floating Audio Control (Only visible when opened) */}
            <AnimatePresence>
                {phase === "opened" && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => {
                            if (audioRef.current) {
                                if (isPlaying) {
                                    audioRef.current.pause();
                                } else {
                                    audioRef.current.play();
                                }
                                setIsPlaying(!isPlaying);
                            }
                        }}
                        className="absolute top-6 right-6 z-50 p-3 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-full text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] outline-none"
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Main Glass Card */}
            <motion.div
                layout
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="relative z-10 max-w-lg w-full bg-slate-900/50 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 p-8 sm:p-12 min-h-[400px] flex flex-col items-center justify-center overflow-hidden mb-16"
            >
                <AnimatePresence mode="wait">

                    {/* STATE 1: ERROR */}
                    {error && (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
                                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h2 className="text-xl font-serif text-red-400">Envelope Damaged</h2>
                            <p className="text-emerald-100/60 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* STATE 2: THE SEALED ENVELOPE */}
                    {!error && phase === "sealed" && (
                        <motion.div
                            key="sealed"
                            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer group"
                            onClick={handleBreakSeal}
                        >
                            <div className="relative">
                                {/* Outer pulsing ring */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -inset-4 bg-amber-500/20 rounded-full blur-xl"
                                />

                                {/* The Golden Seal */}
                                <div className="w-24 h-24 bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transition-all duration-500 border-2 border-amber-200/50">
                                    <svg className="w-10 h-10 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-8 text-amber-400/80 uppercase tracking-[0.3em] text-sm font-medium group-hover:text-amber-300 transition-colors">
                                Tap to Unseal
                            </p>
                        </motion.div>
                    )}

                    {/* STATE 3: THE BREAKING TRANSITION */}
                    {!error && phase === "breaking" && (
                        <motion.div
                            key="breaking"
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 20, opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute w-32 h-32 bg-amber-400 rounded-full blur-2xl"
                        />
                    )}

                    {/* STATE 4: THE OPENED MESSAGE */}
                    {!error && phase === "opened" && (
                        <motion.div
                            key="opened"
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="w-full flex flex-col h-full"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent pb-1">
                                    Eid Mubarak
                                </h1>
                                <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto mt-4"></div>
                            </div>

                            <div className="flex-grow flex items-center justify-center">
                                <p className="text-emerald-50 text-lg sm:text-xl font-light leading-relaxed text-center whitespace-pre-wrap">
                                    {decryptedText}
                                </p>
                            </div>

                            <div className="mt-12 text-center">
                                <Link
                                    href="/"
                                    className="inline-block text-emerald-100/40 hover:text-amber-400 text-xs font-medium uppercase tracking-widest transition-colors"
                                >
                                    Send a Private Greeting
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Floating Footer */}
            <div className="absolute bottom-6 w-full text-center z-20 pointer-events-none">
                <p className="text-emerald-100/40 text-xs font-light tracking-widest uppercase">
                    Crafted by{' '}
                    <a
                        href="https://www.mono.bro.bd/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-500/70 font-medium hover:text-amber-400 hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all pointer-events-auto"
                    >
                        Monowar Husain
                    </a>
                </p>
                <p className="text-emerald-100/30 text-[10px] mt-1.5 font-mono">
                    &copy; 2026 All Rights Reserved.
                </p>
            </div>
        </main>
    );
}