import React, { useState } from 'react';
import {
  ArrowRight, BookOpen, CalendarDays, CheckCircle2, ChevronRight, ClipboardCheck,
  GraduationCap, LayoutDashboard, LogIn, Menu, PlayCircle, ShieldCheck, Sparkles,
  Users, X, ChartNoAxesCombined, Clock3
} from 'lucide-react';

interface AcademicGreenLandingProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

const features = [
  { icon: BookOpen, title: 'Des cours bien organisés', description: 'Retrouvez vos matières, supports de cours et ressources pédagogiques au même endroit.' },
  { icon: ChartNoAxesCombined, title: 'Une progression visible', description: 'Suivez vos activités et visualisez votre avancement au fil de votre apprentissage.' },
  { icon: ClipboardCheck, title: 'Des évaluations centralisées', description: 'Consultez les travaux, les échéances et les résultats associés à vos cours.' },
];

export const AcademicGreenLanding: React.FC<AcademicGreenLandingProps> = ({ onNavigateToLogin, onNavigateToSignup }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const goToLogin = () => {
    setMenuOpen(false);
    onNavigateToLogin();
  };

  const goToSignup = () => {
    setMenuOpen(false);
    onNavigateToSignup();
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#F4F7FB] text-[#172B45]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#102744]/95 text-white shadow-lg shadow-[#102744]/10 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#accueil" className="flex items-center gap-3 text-white no-underline" aria-label="LMS Web, accueil">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#1E559B] shadow-md shadow-black/10">
              <GraduationCap className="h-7 w-7" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-extrabold tracking-tight">LMS <span className="text-[#8DBBFA]">WEB</span></span>
              <span className="block text-[10px] font-semibold uppercase tracking-[.2em] text-blue-100/65">Learning platform</span>
            </span>
          </a>

          <nav className="hidden items-center gap-9 text-sm font-medium text-blue-50/80 md:flex" aria-label="Navigation principale">
            <a className="transition hover:text-white" href="#accueil">Accueil</a>
            <a className="transition hover:text-white" href="#fonctionnalites">Fonctionnalités</a>
            <a className="transition hover:text-white" href="#formations">Formations</a>
            <a className="transition hover:text-white" href="#apropos">À propos</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button type="button" onClick={goToLogin} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Se connecter</button>
            <button type="button" onClick={goToSignup} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#173B68] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-blue-50">
              Créer un compte <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-white md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="grid gap-1 border-t border-white/10 bg-[#102744] p-4 md:hidden" aria-label="Navigation mobile">
            <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-blue-50 hover:bg-white/10" href="#accueil">Accueil</a>
            <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-blue-50 hover:bg-white/10" href="#fonctionnalites">Fonctionnalités</a>
            <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-blue-50 hover:bg-white/10" href="#formations">Formations</a>
            <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-blue-50 hover:bg-white/10" href="#apropos">À propos</a>
            <button type="button" onClick={goToLogin} className="mt-2 min-h-11 rounded-xl border border-white/20 px-3 text-left text-sm font-semibold text-white">Se connecter</button>
            <button type="button" onClick={goToSignup} className="min-h-11 rounded-xl bg-white px-3 text-left text-sm font-bold text-[#173B68]">Créer un compte</button>
          </nav>
        )}
      </header>

      <main>
        <section id="accueil" className="relative isolate overflow-hidden bg-[#102744] text-white">
          <div className="pointer-events-none absolute -right-40 -top-48 h-[560px] w-[560px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-20 -top-28 h-[400px] w-[400px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-[-250px] left-[-120px] h-[430px] w-[430px] rounded-full bg-[#2457A7]/30 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[.92fr_1.08fr] lg:gap-10 lg:py-28">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200/20 bg-white/[.07] px-4 py-2 text-xs font-semibold tracking-wide text-blue-100">
                <Sparkles className="h-4 w-4 text-[#9BC5FF]" aria-hidden="true" />
                Votre environnement d’apprentissage
              </div>
              <h1 className="text-[2.75rem] font-extrabold leading-[1.08] tracking-[-.045em] sm:text-6xl xl:text-[4.25rem]">
                Apprendre aujourd’hui. <span className="text-[#8DBBFA]">Réussir demain.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-blue-100/75 sm:text-lg">
                Tous vos cours, ressources, évaluations et outils pédagogiques réunis dans un seul espace. Apprenez, enseignez et suivez votre progression simplement.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={goToLogin} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#4F83CC] px-7 text-sm font-bold text-white shadow-xl shadow-blue-950/30 transition hover:-translate-y-1 hover:bg-[#6095DF]">
                  Accéder à mon espace <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={goToSignup} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[.06] px-7 text-sm font-semibold text-white transition hover:bg-white/10">
                  Découvrir la plateforme
                </button>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-blue-100/65">
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#8DBBFA]" /> Un espace centralisé</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#8DBBFA]" /> Accès selon votre rôle</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[650px] lg:ml-auto">
              <div className="absolute -inset-5 rounded-[2rem] bg-[#4F83CC]/15 blur-2xl" />
              <div className="relative rotate-0 rounded-[1.6rem] border border-white/15 bg-white/[.08] p-2.5 shadow-2xl shadow-black/30 backdrop-blur-sm sm:rotate-[1deg] sm:p-3">
                <div className="overflow-hidden rounded-[1.15rem] bg-[#F4F7FB] text-[#172B45] shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF1FA] text-[#2457A7]"><GraduationCap className="h-5 w-5" /></span>
                      <div><p className="text-xs font-extrabold">Mon espace LMS</p><p className="text-[10px] text-slate-400">Tableau de bord</p></div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">Espace personnel</span>
                  </div>
                  <div className="grid gap-4 p-4 sm:grid-cols-[1fr_ .72fr] sm:p-6">
                    <div className="space-y-4">
                      <div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#66809F]">Bienvenue</p><p className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">Prêt à progresser ?</p><p className="mt-1 text-xs text-slate-500">Retrouvez vos activités en un coup d’œil.</p></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2457A7]"><BookOpen className="h-4 w-4" /></span><p className="mt-3 text-lg font-extrabold">Cours</p><p className="text-[10px] text-slate-400">Vos contenus pédagogiques</p></div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><ClipboardCheck className="h-4 w-4" /></span><p className="mt-3 text-lg font-extrabold">Travaux</p><p className="text-[10px] text-slate-400">Activités et évaluations</p></div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between"><p className="text-xs font-bold">Activité récente</p><span className="text-[10px] font-semibold text-[#2457A7]">Voir tout</span></div>
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#2457A7]"><BookOpen className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">Ressources de cours</p><p className="text-[10px] text-slate-400">Supports et documents</p></div><ChevronRight className="h-4 w-4 text-slate-300" /></div>
                          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><CalendarDays className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">Calendrier académique</p><p className="text-[10px] text-slate-400">Dates et échéances</p></div><ChevronRight className="h-4 w-4 text-slate-300" /></div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden space-y-4 sm:block">
                      <div className="rounded-xl bg-[#173B68] p-4 text-white">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"><ChartNoAxesCombined className="h-5 w-5" /></span>
                        <p className="mt-5 text-xs font-semibold text-blue-100/70">Votre apprentissage</p><p className="mt-1 text-lg font-extrabold">En évolution</p>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-2/3 rounded-full bg-[#8DBBFA]" /></div>
                        <p className="mt-2 text-[10px] text-blue-100/65">Suivez votre progression</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-bold">Accès rapides</p>
                        <div className="mt-3 space-y-3 text-[11px] font-semibold text-slate-600">
                          <div className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-[#2457A7]" /> Tableau de bord</div>
                          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#2457A7]" /> Calendrier</div>
                          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#2457A7]" /> Espace de cours</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-400 sm:px-6"><span>Une plateforme, plusieurs espaces.</span><span className="inline-flex items-center gap-1 font-semibold text-[#2457A7]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Interface LMS</span></div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white/70 bg-white px-4 py-3 text-[#172B45] shadow-xl shadow-black/15 sm:flex">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#2457A7]"><PlayCircle className="h-5 w-5" /></span>
                <span><span className="block text-xs font-extrabold">Apprenez à votre rythme</span><span className="block text-[10px] text-slate-500">Cours et ressources accessibles</span></span>
              </div>
            </div>
          </div>
          <div className="relative border-t border-white/10 bg-white/[.035]">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-5 py-6 sm:grid-cols-3 sm:px-8 sm:py-7">
              <div className="flex items-center gap-3 sm:justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#A9CCFA]"><BookOpen className="h-5 w-5" /></span><span><strong className="block text-sm">Cours & ressources</strong><small className="text-xs text-blue-100/60">Tout au même endroit</small></span></div>
              <div className="flex items-center gap-3 sm:justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#A9CCFA]"><CalendarDays className="h-5 w-5" /></span><span><strong className="block text-sm">Suivi des activités</strong><small className="text-xs text-blue-100/60">Dates et évaluations</small></span></div>
              <div className="flex items-center gap-3 sm:justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#A9CCFA]"><Users className="h-5 w-5" /></span><span><strong className="block text-sm">Espaces dédiés</strong><small className="text-xs text-blue-100/60">Selon votre rôle</small></span></div>
            </div>
          </div>
        </section>

        <section id="fonctionnalites" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-[.2em] text-[#3973B8]">Une plateforme pensée pour vous</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#142B4A] sm:text-4xl">Tout ce dont vous avez besoin pour avancer</h2>
            <p className="mt-5 text-base leading-7 text-slate-500">Un environnement numérique pour simplifier l’apprentissage, l’enseignement et le suivi pédagogique.</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="group rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-[0_8px_30px_rgba(20,43,74,.035)] transition duration-300 hover:-translate-y-1 hover:border-[#B8CDE8] hover:shadow-[0_18px_45px_rgba(20,43,74,.09)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#2457A7] transition group-hover:bg-[#2457A7] group-hover:text-white"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <span className="mt-7 block text-xs font-bold tracking-widest text-[#7A91AD]">0{index + 1}</span>
                <h3 className="mt-2 text-lg font-extrabold text-[#142B4A]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="formations" className="border-y border-[#E2E8F0] bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[.2em] text-[#3973B8]">Votre espace pédagogique</span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#142B4A] sm:text-4xl">Un parcours adapté à chaque utilisateur</h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-500">Étudiants, enseignants et administrateurs disposent d’espaces et d’outils adaptés à leurs responsabilités au sein de la plateforme.</p>
              <ul className="mt-7 space-y-4">
                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3973B8]" /> Retrouvez les cours et les ressources associés à votre compte.</li>
                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3973B8]" /> Consultez les activités, les évaluations et les échéances.</li>
                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3973B8]" /> Accédez aux outils autorisés selon votre rôle.</li>
              </ul>
              <button type="button" onClick={goToLogin} className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#2457A7] px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#1D4788]">Découvrir mon espace <ArrowRight className="h-4 w-4" /></button>
            </div>
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-[#EAF1FA]" />
              <div className="relative grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#173B68] p-6 text-white shadow-xl shadow-[#173B68]/15 sm:translate-y-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10"><GraduationCap className="h-6 w-6" /></span>
                  <h3 className="mt-7 text-xl font-extrabold">Étudiants</h3>
                  <p className="mt-2 text-sm leading-6 text-blue-100/70">Cours, ressources, devoirs, résultats et progression.</p>
                  <div className="mt-7 flex items-center gap-2 text-xs font-bold text-[#A9CCFA]"><BookOpen className="h-4 w-4" /> Espace d’apprentissage</div>
                </div>
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xl shadow-[#173B68]/5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#2457A7]"><Users className="h-6 w-6" /></span>
                  <h3 className="mt-7 text-xl font-extrabold text-[#142B4A]">Enseignants</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Gestion des cours, ressources et activités pédagogiques.</p>
                  <div className="mt-7 flex items-center gap-2 text-xs font-bold text-[#3973B8]"><LayoutDashboard className="h-4 w-4" /> Espace pédagogique</div>
                </div>
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xl shadow-[#173B68]/5 sm:col-span-2 sm:ml-10">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#2457A7]"><ShieldCheck className="h-6 w-6" /></span>
                    <div><h3 className="font-extrabold text-[#142B4A]">Administration</h3><p className="mt-1 text-sm text-slate-500">Gestion et supervision de la plateforme selon les autorisations.</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="apropos" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#142B4A] px-7 py-12 text-white shadow-2xl shadow-[#142B4A]/15 sm:px-12 sm:py-16 lg:px-16">
            <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />
            <div className="absolute -right-5 -top-16 h-52 w-52 rounded-full border border-white/10" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <span className="text-xs font-extrabold uppercase tracking-[.2em] text-[#9BC5FF]">Prêt à commencer ?</span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Votre espace d’apprentissage vous attend.</h2>
                <p className="mt-4 text-sm leading-7 text-blue-100/70 sm:text-base">Connectez-vous pour retrouver vos cours et les fonctionnalités disponibles avec votre compte.</p>
              </div>
              <div className="relative flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
                <button type="button" onClick={goToLogin} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-extrabold text-[#142B4A] transition hover:-translate-y-0.5 hover:bg-blue-50">Se connecter <ArrowRight className="h-4 w-4" /></button>
                <button type="button" onClick={goToSignup} className="min-h-12 rounded-xl border border-white/25 px-6 text-sm font-bold text-white transition hover:bg-white/10">Créer un compte</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#2457A7]"><GraduationCap className="h-5 w-5" /></span><span><strong className="block text-sm text-[#142B4A]">LMS Web</strong><small className="text-xs text-slate-400">Learning Management System</small></span></div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-500"><a href="#accueil" className="transition hover:text-[#2457A7]">Accueil</a><a href="#fonctionnalites" className="transition hover:text-[#2457A7]">Fonctionnalités</a><a href="#formations" className="transition hover:text-[#2457A7]">Espaces</a><button type="button" onClick={goToLogin} className="transition hover:text-[#2457A7]">Connexion</button></div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} LMS Web. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};
