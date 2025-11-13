import { useRouter } from "next/navigation";
import supabase from "../lib/supabaseClinet";

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return error.message;
  }
};
