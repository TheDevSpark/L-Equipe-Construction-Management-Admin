"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import supabase from "../../../../lib/supabaseClinet";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // const handleSignup = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   if (password !== confirmPassword) {
  //     toast.error("Passwords do not match");
  //     setLoading(false);
  //     return;
  //   }

  //   const toastId = toast.loading("Creating your account...");

  //   // 1️⃣ Create user in Supabase Auth
  //   const { data, error: signUpError } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       emailRedirectTo: `${location.origin}/auth/signin`,
  //       data: {
  //         first_name: firstName,
  //         last_name: lastName,
  //         phone_number: phoneNumber,
  //       },
  //     },
  //   });

  //   if (signUpError) {
  //     toast.dismiss(toastId);
  //     toast.error(signUpError.message);
  //     setLoading(false);
  //     return;
  //   }

  //   // 2️⃣ Insert profile record if user was created successfully
  //   const user = data?.user;
  //   if (user) {
  //     const { error: insertError } = await supabase.from("profiles").insert([
  //       {
  //         id: user.id,
  //         email: email,
  //         first_name: firstName,
  //         last_name: lastName,
  //         phone_number: phoneNumber,
  //         role: "admin",
  //         created_at: new Date().toISOString(),
  //       },
  //     ]);

  //     if (insertError) {
  //       console.error("Error inserting profile:", insertError);
  //       toast.dismiss(toastId);
        
  //       // Check if it's an RLS policy error
  //       if (insertError.code === '42501') {
  //         toast.error("Database permission error. Please contact administrator.");
  //         console.log("💡 Solution: Run RLS policies in Supabase SQL Editor");
  //       } else {
  //         toast.error("Failed to save profile details: " + insertError.message);
  //       }
        
  //       setLoading(false);
  //       return;
  //     }
  //   }

  //   // 3️⃣ Reset form + show success toast
  //   setFirstName("");
  //   setLastName("");
  //   setEmail("");
  //   setPhoneNumber("");
  //   setPassword("");
  //   setConfirmPassword("");
  //   toast.dismiss(toastId);
  //   toast.success(
  //     "✅ Sign up successful! Check your email to verify your account."
  //   );

  //   setLoading(false);
  //   setTimeout(() => router.push("/auth/signin"), 1500);
  // };
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
  
    const toastId = toast.loading("Creating your account...");
  
    try {
      // 1️⃣ Create user in Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/signin`,
          data: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
          },
        },
      });
  
      if (signUpError) throw signUpError;
  
      const user = authData.user;
      if (!user) throw new Error("User creation failed");
  
      // 2️⃣ Insert profile in public.profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            user_id: user.id,           // Foreign key to auth.users
            email: email,
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            role: "admin",              // Enum: 'admin', 'team', 'owner'
          },
        ]);
  
      if (profileError) throw profileError;
  
      toast.dismiss(toastId);
      toast.success("✅ Sign up successful! Check your email to verify your account.");
  
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
  
      setTimeout(() => router.push("/auth/signin"), 1500);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || "Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div 
      className="flex items-center justify-center min-h-screen py-10"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Toaster position="top-center" />
      <div 
        className="shadow-xl border rounded-2xl p-8 w-full max-w-sm transform transition duration-300 hover:shadow-2xl"
        style={{ 
          backgroundColor: 'var(--card)', 
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)'
        }}
      >
        <div className="flex justify-center mb-6">
          <div 
            className="p-4 rounded-full shadow-lg"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
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
          Create Admin Account
        </h2>
        <p 
          className="text-center mb-6"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Sign up to access your admin dashboard
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--card-foreground)' }}
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              className="w-full border rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100"
              style={{
                backgroundColor: 'var(--input)',
                borderColor: 'var(--border)',
                color: 'var(--card-foreground)'
              }}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="+92 XXX XXXX"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 bg-white text-gray-900"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <a href="/auth/signin" className="text-indigo-600 hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
