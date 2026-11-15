 "use client";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
export default function SignOutButton() {
  return <button className="logout" onClick={async()=>{const supabase=createClient(); await supabase.auth.signOut(); window.location.href="/login";}}><LogOut size={17}/> Sair da conta</button>;
}