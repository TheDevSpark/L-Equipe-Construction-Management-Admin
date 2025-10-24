"use client";

import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../../lib/supabaseClinet";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useEffect(() => {
  //   const getUser = async () => {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();

  //     setUser(session?.user || null);
  //     setLoading(false);
  //   };

  //   getUser();

  //   const { data: listener } = supabase.auth.onAuthStateChange(
  //     async (event, session) => {
  //       setUser(session?.user || null);
  //       if (event === "SIGNED_OUT") router.push("/auth/signin");
  //     }
  //   );

  //   return () => {
  //     listener.subscription.unsubscribe();
  //   };
  // }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
