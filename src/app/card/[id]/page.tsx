"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { decryptMessage } from "@/lib/encryption";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CardReader() {
    const params = useParams();
    const id = params.id as string;

    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        const fetchAndDecrypt = async () => {
            try {
                const hashKey = window.location.hash.substring(1);

                if (!hashKey) {
                    setError("The cryptographic seal is missing. Invalid link.");
                    setIsLoading(false);
                    return;
                }

                const docRef = doc(db, "capsules", id);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    setError("This capsule has faded into the ether (Expired or Not Found).");
                    setIsLoading(false);
                    return;
                }

                const data = docSnap.data();

                if (new Date(data.expiresAt) < new Date()) {
                    setError("This capsule's time has passed and it has self-destructed.");
                    setIsLoading(false);
                    return;
                }

                setTimeout(() => {
                    const decryptedText = decryptMessage(data.text, hashKey);
                    if (!decryptedText) {
                        setError("The seal is broken or tampered with. Decryption failed.");
                    } else {
                        setMessage(decryptedText);
                    }
                    setIsLoading(false);
                }, 1500);

            } catch (err) {
                console.error("Decryption error:", err);
                setError("Something went wrong while opening this envelope.");
                setIsLoading(false);
            }
        };

        fetchAndDecrypt();
    }, [id]);

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="relative z-10 flex flex-col items-center gap-6"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="w-24 h-24 rounded-full border-t-2 border-amber-400/80 border-r-2 border-transparent shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                        />
                        <p className="text-amber-400/80 font-serif text-xl tracking-widest uppercase">
                            Opening Envelope...
                        </p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 max-w-lg w-full bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-red-500/20 p-10 text-center space-y-6 shadow-2xl"
                    >
                        <h1 className="text-2xl font-serif text-slate-200">Capsule Lost</h1>
                        <p className="text-red-400/80 text-sm leading-relaxed">{error}</p>
                        <Link href="/" className="inline-block mt-4 text-emerald-400 hover:text-amber-400 transition-colors text-sm uppercase tracking-widest font-medium">
                            Return to Sanctuary
                        </Link>
                    </motion.div>
                ) : !isUnlocked ? (
                    <motion.div
                        key="locked"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        className="relative z-10 max-w-md w-full text-center"
                    >
                        <button
                            onClick={() => setIsUnlocked(true)}
                            className="group relative w-40 h-40 mx-auto rounded-full bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 flex items-center justify-center hover:border-amber-400 hover:shadow-[0_0_50px_rgba(245,158,11,0.3)] transition-all duration-500"
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <svg className="w-12 h-12 text-amber-400 group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                        </button>
                        <p className="mt-8 text-emerald-100/60 font-serif tracking-widest uppercase text-sm animate-pulse">
                            Tap to Unfold Greeting
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="unlocked"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-10 max-w-2xl w-full bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 sm:p-12 overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50"></div>

                        <div className="text-center space-y-4 mb-10 relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                                className="flex justify-center mb-6"
                            >
                                <svg className="w-12 h-12 text-amber-400 opacity-90" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
                                </svg>
                            </motion.div>
                            <h1 className="text-4xl sm:text-5xl font-serif font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent pb-2">
                                Eid Mubarak
                            </h1>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 1 }}
                            className="relative p-8 rounded-2xl bg-black/40 border border-white/5 text-emerald-50 text-lg sm:text-xl leading-relaxed font-light text-center"
                        >
                            <p className="whitespace-pre-wrap selection:bg-amber-500/30">
                                {message}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 1 }}
                            className="mt-12 text-center"
                        >
                            <Link
                                href="/"
                                className="btn group w-full"
                            >
                                <span className="btn-inner">
                                    Send a Private Greeting
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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