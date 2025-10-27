"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { redirect, useRouter } from "next/navigation";

export default function Home() {
  redirect("/dashboard/admin");
}
