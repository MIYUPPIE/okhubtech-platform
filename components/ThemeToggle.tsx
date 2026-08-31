"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-9 w-9" />;
    }

    const currentTheme = theme === "system" ? systemTheme : theme;

    const toggleTheme = () => {
        setTheme(currentTheme === "dark" ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-black/80 transition-colors hover:bg-black/10 hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Toggle theme"
        >
            <Sun className="h-4 w-4 scale-100 transition-all dark:scale-0 dark:opacity-0" />
            <Moon className="absolute h-4 w-4 scale-0 opacity-0 transition-all dark:scale-100 dark:opacity-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
