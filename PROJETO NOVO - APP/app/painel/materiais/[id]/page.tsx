import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ResourcePage({params}:{params:Promise<{id:string}>}) {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
  const {id}=await params;
  const {data:resource}=await supabase.from("resources").select("*").eq("id",id).eq("published",true).single();
  if(!resource) notFound();
  const {data:files}=await supabase.from("resource_files").select("id,label,file_path").eq("resource_id",id);
  async function download(filePath:string) {
    "use server";
    const db=await createClient();
    const {data:{user:current}}=await db.auth.getUser(); if(!current) redirect("/login");
    const {data}=await db.storage.from("materiais").createSignedUrl(filePath,60);
    if(data?.signedUrl) redirect(data.signedUrl);
  }
  return <main className="content standalone"><Link href="/painel/materiais" className="back-link"><ArrowLeft size={16}/> Voltar aos materiais</Link><p className="eyebrow">{resource.grade}º ANO · {resource.bimester}º BIMESTRE</p><h1>{resource.title}</h1><p className="muted">{resource.description}</p><div className="detail-panel"><b>Informações pedagógicas</b><p>Área: {resource.content_area}</p><p>Tipo: {resource.resource_type}</p>{resource.bncc_skills?.length>0 && <p>Habilidades BNCC: {resource.bncc_skills.join(", ")}</p>}</div><h2>Arquivos disponíveis</h2>{files?.length ? files.map(f=><form action={download.bind(null,f.file_path)} key={f.id} className="file-row"><span><Download size={18}/>{f.label}</span><button>Baixar arquivo</button></form>):<p className="muted">Nenhum arquivo foi anexado a este material ainda.</p>}</main>;
}