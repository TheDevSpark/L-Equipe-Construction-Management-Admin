"use client";
import React from "react";
import { useAuthContext } from "../context/AuthContext";
import { redirect, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
function AuthCheck({ children }) {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  if (!user && pathname !== "/auth/signin") {
    redirect("/auth/signin");
  }
  return children;
}

export default AuthCheck;
