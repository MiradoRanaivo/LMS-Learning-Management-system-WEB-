import React, { useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, GraduationCap, LogIn, Menu, X } from 'lucide-react';

interface AcademicGreenLandingProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export const AcademicGreenLanding: React.FC<AcademicGreenLandingProps> = ({ onNavigateToLogin, onNavigateToSignup }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const goToLogin = () => {
    setMenuOpen(false);
    onNavigateToLogin();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          <a href="#accueil" className="flex items-center gap-3 text-inherit no-underline" aria-label="LMS Web, accueil">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2457A7] text-white"><GraduationCap className="h-6 w-6" aria-hidden="true" /></span>
            <span className="text-base font-bold tracking-tight">LMS Web</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#475569] md:flex" aria-label="Navigation principale">
            <a className="hover:text-[#2457A7]" href="#accueil">Accueil</a>
            <a className="hover:text-[#2457A7]" href="#formations">Formations</a>
            <a className="hover:text-[#2457A7]" href="#fonctionnement">À propos</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <button type="button" onClick={goToLogin} className="min-h-10 rounded-lg px-4 text-sm font-semibold text-[#142B4A] hover:bg-[#EAF1FA]">Se connecter</button>
            <button type="button" onClick={onNavigateToSignup} className="min-h-10 rounded-lg bg-[#2457A7] px-4 text-sm font-semibold text-white hover:bg-[#1D4788]">Créer un compte</button>
          </div>
          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#334155] md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && <nav className="grid gap-1 border-t border-[#E2E8F0] bg-white p-3 md:hidden" aria-label="Navigation mobile">
          <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-[#334155] hover:bg-[#F1F5F9]" href="#accueil">Accueil</a>
          <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-[#334155] hover:bg-[#F1F5F9]" href="#formations">Formations</a>
          <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-[#334155] hover:bg-[#F1F5F9]" href="#fonctionnement">À propos</a>
          <button type="button" onClick={goToLogin} className="min-h-11 rounded-lg px-3 text-left text-sm font-semibold text-[#142B4A]">Se connecter</button>
          <button type="button" onClick={() => { setMenuOpen(false); onNavigateToSignup(); }} className="min-h-11 rounded-lg bg-[#2457A7] px-3 text-left text-sm font-semibold text-white">Créer un compte</button>
        </nav>}
      </header>

      <main>
        <section id="accueil" className="border-b border-[#E2E8F0] bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl">Apprenez à votre rythme. Construisez vos compétences.</h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#475569]">Accédez à vos cours, développez vos compétences et suivez votre progression depuis un espace d’apprentissage conçu pour vous.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={goToLogin} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#2457A7] px-5 text-sm font-semibold text-white hover:bg-[#1D4788]">Explorer les formations <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                <button type="button" onClick={onNavigateToSignup} className="min-h-12 rounded-lg border border-[#CBD5E1] bg-white px-5 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]">Créer un compte</button>
              </div>
              <p className="mt-5 text-sm text-[#64748B]">L’accès au catalogue et aux espaces de cours nécessite une connexion.</p>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-8">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div><p className="text-sm font-semibold">Votre espace d’apprentissage</p><p className="mt-1 text-xs text-[#64748B]">Un point d’entrée pour vos activités pédagogiques</p></div>
                <span className="rounded-lg bg-[#EAF1FA] p-2.5 text-[#2457A7]"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
              </div>
              <div className="mt-5 divide-y divide-[#E2E8F0] rounded-lg border border-[#E2E8F0] bg-white px-4">
                <div className="flex items-center gap-3 py-4"><CheckCircle2 className="h-5 w-5 text-[#2457A7]" aria-hidden="true" /><div><p className="text-sm font-semibold">Cours et ressources</p><p className="mt-0.5 text-xs text-[#64748B]">Retrouvez les contenus associés à votre compte.</p></div></div>
                <div className="flex items-center gap-3 py-4"><CalendarDays className="h-5 w-5 text-[#2457A7]" aria-hidden="true" /><div><p className="text-sm font-semibold">Évaluations et échéances</p><p className="mt-0.5 text-xs text-[#64748B]">Consultez les activités et dates disponibles.</p></div></div>
                <div className="flex items-center gap-3 py-4"><GraduationCap className="h-5 w-5 text-[#2457A7]" aria-hidden="true" /><div><p className="text-sm font-semibold">Un espace selon votre rôle</p><p className="mt-0.5 text-xs text-[#64748B]">Des outils adaptés aux étudiants et aux équipes.</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="formations" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Les formations de votre espace</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#64748B]">Le catalogue est chargé après authentification afin de respecter les inscriptions et les permissions définies par la plateforme.</p></div>
            <div className="flex flex-col justify-between gap-5 rounded-xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center sm:p-6">
              <div><p className="text-sm font-semibold">Consulter vos formations</p><p className="mt-1 text-sm text-[#64748B]">Connectez-vous pour afficher les cours autorisés pour votre compte.</p></div>
              <button type="button" onClick={goToLogin} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#2457A7] px-4 text-sm font-semibold text-white hover:bg-[#1D4788]">Se connecter <LogIn className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </div>
        </section>

        <section id="fonctionnement" className="border-y border-[#E2E8F0] bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8 lg:py-20">
            <div><h2 className="text-2xl font-bold tracking-tight">Un espace clair pour apprendre et enseigner</h2></div>
            <p className="text-sm leading-7 text-[#475569]">Les étudiants retrouvent leurs cours, ressources, évaluations et résultats. Les enseignants disposent des outils de gestion pédagogique présents dans leur espace.</p>
            <p className="text-sm leading-7 text-[#475569]">L’accès aux fonctionnalités dépend du rôle du compte. Les rôles enseignant et administrateur sont attribués par l’établissement, et non par l’inscription publique.</p>
          </div>
        </section>

        <section className="bg-[#142B4A] text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div><h2 className="text-2xl font-bold">Accédez à votre espace LMS Web</h2><p className="mt-2 text-sm text-[#DCE8F7]">Connectez-vous avec votre compte universitaire.</p></div>
            <button type="button" onClick={goToLogin} className="min-h-11 rounded-lg bg-white px-5 text-sm font-semibold text-[#142B4A] hover:bg-[#EAF1FA]">Se connecter</button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-[#64748B] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <span className="font-semibold text-[#0F172A]">LMS Web</span>
          <div className="flex gap-5"><a href="#accueil" className="hover:text-[#2457A7]">Accueil</a><a href="#formations" className="hover:text-[#2457A7]">Formations</a><button type="button" onClick={goToLogin} className="text-left hover:text-[#2457A7]">Connexion</button></div>
        </div>
      </footer>
    </div>
  );
};