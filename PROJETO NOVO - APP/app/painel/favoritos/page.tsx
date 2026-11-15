import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function Favorites() {
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
 return <main className="content standalone"><Link href="/painel" className="back-link">← Voltar ao painel</Link><p className="eyebrow">SUA ORGANIZAÇÃO</p><h1>Favoritos</h1><div className="empty-state"><p>A área de favoritos está prevista para a próxima etapa do MVP.</p></div></main>;
}