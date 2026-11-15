import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, BookOpen, ClipboardList, FileCheck, Bookmark, CalendarDays, GraduationCap, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./sign-out-button";

const years = ["6º ano", "7º ano", "8º ano", "9º ano"];
const shortcuts = [
  { title: "Por bimestre", desc: "Encontre conteúdos por período letivo", icon: CalendarDays, href: "/painel/bimestres" },
  { title: "Aulas e conteúdos", desc: "Explicações, exemplos e planos", icon: BookOpen, href: "/painel/materiais" },
  { title: "Atividades", desc: "Práticas prontas para aplicar", icon: ClipboardList, href: "/painel/materiais?tipo=atividade" },
  { title: "Avaliações", desc: "Instrumentos para acompanhar a turma", icon: FileCheck, href: "/painel/materiais?tipo=avaliacao" },
  { title: "Favoritos", desc: "Seus materiais salvos", icon: Bookmark, href: "/painel/favoritos" }
];

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Professor(a)";

  return <main className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/painel"><span className="brand-mark small">BP</span><span>Biblioteca<br/><b>do Professor</b></span></Link>
      <p className="nav-label">MENU PRINCIPAL</p>
      <Link className="nav-item active" href="/painel"><GraduationCap size={18}/> Visão geral</Link>
      <Link className="nav-item" href="/painel/materiais"><BookOpen size={18}/> Todos os materiais</Link>
      <Link className="nav-item" href="/painel/favoritos"><Bookmark size={18}/> Favoritos</Link>
      <div className="sidebar-bottom"><SignOutButton /></div>
    </aside>
    <section className="main-area">
      <header className="topbar"><span className="muted">Área do professor</span><span className="user-chip">{user.email}</span></header>
      <div className="content">
        <div className="welcome">
          <div><p className="eyebrow">BIBLIOTECA PEDAGÓGICA</p><h1>Olá, {displayName}.</h1><p className="muted">O que você precisa preparar para sua próxima aula?</p></div>
          <div className="welcome-icon"><GraduationCap size={34}/></div>
        </div>
        <form className="searchbar" action="/painel/materiais"><Search size={20}/><input name="q" placeholder="Pesquise um assunto, gênero textual ou habilidade..." /><button>Buscar</button></form>
        <div className="section-heading"><div><h2>Escolha o ano escolar</h2><p className="muted">Acesse os materiais de acordo com sua turma.</p></div></div>
        <div className="year-grid">{years.map((year, i)=><Link className="year-card" href={`/painel/materiais?ano=${6+i}`} key={year}><span className="year-number">{year}</span><span className="card-link">Explorar materiais <b>→</b></span></Link>)}</div>
        <div className="section-heading"><div><h2>Acesso rápido</h2><p className="muted">Vá direto ao tipo de material que procura.</p></div></div>
        <div className="shortcut-grid">{shortcuts.map(({title,desc,icon:Icon,href})=><Link href={href} className="shortcut-card" key={title}><span className="shortcut-icon"><Icon size={20}/></span><span><b>{title}</b><small>{desc}</small></span><span className="arrow">↗</span></Link>)}</div>
        <div className="notice"><b>Uma biblioteca organizada para facilitar sua rotina.</b><span>Os materiais serão identificados por ano, bimestre, assunto e tipo de recurso.</span></div>
      </div>
    </section>
  </main>;
}