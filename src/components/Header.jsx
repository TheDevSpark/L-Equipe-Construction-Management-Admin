"use client";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Image from "next/image";
import { signOut } from "../utils/helpers";
import { useRouter } from "next/navigation";
export default function Header({ onMenuToggle }) {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      console.log("sign out");

      signOut();
      router.push("/auth/signin");
      toast.success("Logged out successfully");
      router;
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

          <Image
            src={"/logo.png"}
            width={50}
            height={50}
            alt="logo"
            className="scale-200"
          />

          <div>
            <Image
              src={"/text.png"}
              width={75}
              height={20}
              alt="text"
              className="scale-200 ml-[40%]"
            />
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
            <span className="text-sm font-medium text-foreground">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
