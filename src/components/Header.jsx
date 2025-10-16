"use client"
import { useEffect, useState } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialize from localStorage / system preference
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (stored === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Project */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              ProBuild PM
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Downtown Office Complex
            </p>
          </div>
        </div>

        {/* Right side - User Profile & Theme Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700"
          >
            {isDark ? (
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4.22 5.47a1 1 0 011.415-1.414l.707.707a1 1 0 11-1.414 1.414l-.708-.707zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm7 7a1 1 0 011-1v-1a1 1 0 10-2 0v1a1 1 0 011 1zM15.778 14.53a1 1 0 00-1.415 1.414l.707.707a1 1 0 001.415-1.414l-.707-.707zM17 10a1 1 0 00-1-1h-1a1 1 0 100 2h1a1 1 0 001-1z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-800"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm-7 8a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zM16 11a1 1 0 100-2h-1a1 1 0 100 2h1zM6.22 5.47A1 1 0 107.64 6.88l-.71.71A1 1 0 106.22 5.47z" />
              </svg>
            )}
          </button>

          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-200">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm font-medium">Admin</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JM</span>
          </div>
        </div>
      </div>
    </header>
  );
}
