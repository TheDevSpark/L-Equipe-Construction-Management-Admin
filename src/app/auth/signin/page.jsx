"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext"
import supabase from "../../../../lib/supabaseClinet";

export default function SigninPage() {
  const auth = useAuth();
  const { user } = auth || {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const REQUIRED_ROLE = "admin";

  // Redirect if already logged in
  if (user) {
    router.push("/dashboard/admin");
    return null;
  }

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    // 1️⃣ Sign in user
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      toast.error(signInError.message);
      setLoading(false);
      return;
    }

    const user = signInData?.user;
    if (!user) {
      toast.error("Sign in failed. Please try again.");
      setLoading(false);
      return;
    }

    // 2️⃣ Fetch user profile to check role
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      toast.error(`Could not fetch user profile: ${error.message}`);
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // 3️⃣ Check role and redirect
    if (data) {
      console.log(user);
      toast.success("Welcome back!");
      setTimeout(() => router.push("/dashboard/admin"), 800);
    } else {
      console.log(data);
      toast.error("Access denied — only admins can log in.");
      // await supabase.auth.signOut();
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-10 bg-background">
      <div className="shadow-xl border rounded-2xl p-8 w-full max-w-sm bg-card text-card-foreground">
        <div className="flex justify-center mb-6">
          <div 
            className="p-4 rounded-full shadow-lg"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-briefcase-icon"
              style={{ color: 'var(--primary-foreground)' }}
            >
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              <rect width="20" height="14" x="2" y="6" rx="2" />
            </svg>
          </div>
        </div>

        <h2 
          className="text-center text-2xl font-bold mb-2"
          style={{ color: 'var(--card-foreground)' }}
        >
          Welcome back
        </h2>
        <p 
          className="text-center mb-6"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Sign in to your ClientHub account
        </p>

        <form onSubmit={handleSignin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--card-foreground)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition"
              style={{
                backgroundColor: 'var(--input)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)'
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--card-foreground)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition"
              style={{
                backgroundColor: 'var(--input)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)'
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right text-sm mt-1">
              <a 
                href="#" 
                className="hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold py-3 rounded-xl shadow-md transition disabled:opacity-50"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.opacity = '1';
              }
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div 
          className="mt-6 text-center text-sm"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Don&apos;t have an account?{" "}
          <a 
            href="/auth/signup" 
            className="hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
