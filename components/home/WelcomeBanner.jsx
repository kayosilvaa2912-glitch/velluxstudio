import { BookOpen } from 'lucide-react';

export default function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy px-6 py-6 text-white sm:px-7">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-2xl" />
      <div className="absolute -bottom-16 right-16 h-36 w-36 rounded-full bg-primary/20 blur-2xl" />
      <div className="relative max-w-[70%]">
        <p className="font-heading text-lg font-bold leading-snug sm:text-xl">
          Ensinar também é<br />transformar!
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/60">
          Menos tempo preparando avaliações.
        </p>
      </div>
      <div className="absolute bottom-4 right-5 flex items-end gap-1">
        <span className="h-9 w-3 rounded-sm bg-[#3B82F6]" />
        <span className="h-12 w-3 rounded-sm bg-[#10B981]" />
        <span className="h-7 w-3 rounded-sm bg-[#F59E0B]" />
        <BookOpen className="mb-1 ml-1 h-8 w-8 text-white/80" />
      </div>
    </div>
  );
}