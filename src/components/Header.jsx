"use client"
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Header({ onMenuToggle }) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };
  return (
    <header className="border-b bg-background px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu Button (Mobile) + Logo */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
          
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-primary">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground"
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
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              ProBuild PM
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Downtown Office Complex
            </p>
          </div>
        </div>

        {/* Right side - User Profile & Theme Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />

          {/* User Profile */}
          <div className="hidden sm:flex items-center space-x-2 text-muted-foreground">
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
            <span className="text-sm font-medium text-foreground">
              {user?.email ? user.email.split('@')[0] : 'Admin'}
            </span>
          </div>
          
          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2"
          >
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </Button>
          
          {/* Avatar */}
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
