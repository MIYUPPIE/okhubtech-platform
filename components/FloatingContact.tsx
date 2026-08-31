"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, X, Send } from "lucide-react";

import { TEL, whatsappLink } from "@/lib/contact";

const predefinedMessages = [
    "Hi OKHub, I'd like to know more about your training programmes.",
    "Hi OKHub, I have a project I'd like built. Can we talk?",
    "Hi OKHub, I'd like to schedule a call.",
];

export default function FloatingContact() {
    const [isOpen, setIsOpen] = useState(false);

    const handleWhatsApp = (message: string) => {
        window.open(whatsappLink(message), "_blank");
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-80 rounded-3xl border border-white/10 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/95"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-display text-lg font-medium text-black dark:text-white">
                                Send a Message
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1.5 text-black/50 hover:bg-black/5 hover:text-black dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {predefinedMessages.map((msg, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleWhatsApp(msg)}
                                    className="group flex items-start gap-3 rounded-2xl bg-black/5 p-3 text-left transition hover:bg-green-500/10 dark:bg-white/5 dark:hover:bg-green-500/20"
                                >
                                    <Send className="mt-0.5 h-4 w-4 shrink-0 text-black/40 group-hover:text-green-600 dark:text-white/40 dark:group-hover:text-green-400" />
                                    <span className="text-sm text-black/80 group-hover:text-black dark:text-white/80 dark:group-hover:text-white">
                                        {msg}
                                    </span>
                                </button>
                            ))}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="mt-2 w-full rounded-2xl border border-black/10 py-2.5 text-sm font-medium text-black/60 transition hover:bg-black/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-3">
                {/* Phone Call Button */}
                <a
                    href={TEL}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-110 hover:bg-blue-700"
                    aria-label="Call Us"
                >
                    <Phone className="h-5 w-5" />
                </a>

                {/* WhatsApp Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-110 hover:bg-green-600"
                    aria-label="Chat on WhatsApp"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
                </button>
            </div>
        </div>
    );
}
