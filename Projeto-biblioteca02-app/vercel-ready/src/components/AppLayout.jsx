import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Link } from 'react-router-dom';

function CookieNotice() {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(localStorage.getItem('cookie-notice-dismissed') !== 'true'), []);
  if (!visible) return null;
  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[70] mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
      <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">Este app usa armazenamento local essencial para manter sua sessão e preferências. Não usamos cookies de publicidade. <Link to="/privacidade" className="font-semibold text-primary underline">Saiba mais</Link></p>
      <button onClick={() => { localStorage.setItem('cookie-notice-dismissed', 'true'); setVisible(false); }} className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white">Entendi</button>
    </aside>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-72">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-[1400px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <WhatsAppButton />
      <CookieNotice />
    </div>
  );
}
