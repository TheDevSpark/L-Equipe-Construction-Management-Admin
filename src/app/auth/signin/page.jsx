"use client";
import React from "react";
import { useAuthContext } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
function page() {
  const { user, setUser } = useAuthContext();
  const [phrase, setPhrase] = useState("");
  const router = useRouter();

  const handleSignIn = () => {
    console.log("In phrase");
    console.log(process.env.NEXT_PUBLIC_SECRET_PHRASE);
    console.log(phrase);
    if (phrase === process.env.NEXT_PUBLIC_SECRET_PHRASE) {
      setUser(true);
      router.push("/");
    } else {
      toast.error("Invalid phrase");
    }
  };
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <div className="w-1/3 flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <Input
          placeholder="Secret Phrase"
          onChange={(e) => setPhrase(e.target.value)}
        />
        <Button onClick={handleSignIn}>SignIn</Button>
      </div>
    </div>
  );
}

export default page;
