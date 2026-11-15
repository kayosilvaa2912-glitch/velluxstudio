import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, ArrowLeft, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function MaterialsPage({searchParams}:{searchParams:Promise<{q?:string;ano?:string;tipo?:string}>}) {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");
  const params=await searchParams;
  let query=supabase.from("resources").select("id,title,description,grade,bimester,content_area,resource_type,created_at").eq("published",true).order("created_at",{ascending:false});
  if(params.ano) query=query.eq("grade",Number(params.ano));
  if(params.tipo) query=query.eq("resource_type",params.tipo);
  if(params.q) query=query.ilike("search_text",`%${params.q}%`);
  const {data:resources,error}=await query.limit(60);
  return <main className="content standalone">
    <Link href="/painel" className="back-link"><ArrowLeft size={16}/> Voltar ao painel</Link>
    <p className="eyebrow">ACERVO PEDAGÓGICO</p><h1>Materiais</h1>
    <p className="muted">Pesquise e filtre os recursos disponíveis na biblioteca.</p>
    <form className="searchbar material-search"><Search size={19}/><input name="q" defaultValue={params.q} placeholder="Buscar por assunto ou conteúdo..."/><button>Buscar</button></form>
    {error ? <p className="error">Não foi possível carregar os materiais. Verifique a configuração do banco de dados.</p> :
      resources?.length ? <div className="resource-grid">{resources.map(r=><article className="resource-card" key={r.id}><span className="resource-type"><FileText size={16}/> {r.resource_type}</span><h3>{r.title}</h3><p>{r.description}</p><div className="resource-meta">{r.grade}º ano · {r.bimester}º bimestre · {r.content_area}</div><Link href={`/painel/materiais/${r.id}`}>Abrir material →</Link></article>)}</div> :
      <div className="empty-state"><FileText size={30}/><h3>Nenhum material cadastrado ainda</h3><p>Quando os recursos forem publicados no painel administrativo, aparecerão aqui.</p></div>}
  </main>;
}