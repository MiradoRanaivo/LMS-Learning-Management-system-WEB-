import React, { useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, GraduationCap, Menu, ShieldCheck, Users, X } from 'lucide-react';

interface AcademicGreenLandingProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export const AcademicGreenLanding: React.FC<AcademicGreenLandingProps> = ({
  onNavigateToLogin,
  onNavigateToSignup,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const goToLogin = () => {
    setMenuOpen(false);
    onNavigateToLogin();
  };

  const goToSignup = () => {
    setMenuOpen(false);
    onNavigateToSignup();
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172B45]">
      <header className="relative z-30 border-b border-[#DCE3EC] bg-[#F7F8FA]">
        <div className="mx-auto flex min-h-[82px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
          <a href="#accueil" onClick={closeMenu} className="flex items-center gap-3 text-[#142B4A] no-underline" aria-label="LMS Web, accueil">
            <span className="flex h-11 w-11 items-center justify-center bg-[#142B4A] text-white">
              <GraduationCap className="h-7 w-7" aria-hidden="true" />
            </span>
            <span>
              <strong className="block text-[17px] font-extrabold tracking-[.08em]">LMS WEB</strong>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[.19em] text-[#64748B]">Plateforme pédagogique</span>
            </span>
          </a>

          <nav className="hidden items-center gap-9 text-[13px] font-semibold text-[#42536A] lg:flex" aria-label="Navigation principale">
            <a href="#accueil" className="transition-colors hover:text-[#2457A7]">Accueil</a>
            <a href="#plateforme" className="transition-colors hover:text-[#2457A7]">La plateforme</a>
            <a href="#espaces" className="transition-colors hover:text-[#2457A7]">Espaces</a>
            <a href="#apropos" className="transition-colors hover:text-[#2457A7]">À propos</a>
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <button type="button" onClick={goToLogin} className="text-[13px] font-bold text-[#142B4A] transition-colors hover:text-[#3973B8]">Se connecter</button>
            <button type="button" onClick={goToSignup} className="inline-flex min-h-11 items-center gap-3 bg-[#142B4A] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#2457A7]">
              Créer un compte <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center border border-[#DCE3EC] text-[#142B4A] lg:hidden" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="absolute left-0 right-0 top-full grid gap-0 border-b border-[#DCE3EC] bg-[#F7F8FA] px-5 py-3 shadow-lg lg:hidden" aria-label="Navigation mobile">
            <a onClick={closeMenu} href="#accueil" className="border-b border-[#E4E9F0] py-3 text-sm font-semibold text-[#142B4A]">Accueil</a>
            <a onClick={closeMenu} href="#plateforme" className="border-b border-[#E4E9F0] py-3 text-sm font-semibold text-[#142B4A]">La plateforme</a>
            <a onClick={closeMenu} href="#espaces" className="border-b border-[#E4E9F0] py-3 text-sm font-semibold text-[#142B4A]">Espaces</a>
            <a onClick={closeMenu} href="#apropos" className="py-3 text-sm font-semibold text-[#142B4A]">À propos</a>
            <button type="button" onClick={goToLogin} className="mt-2 min-h-11 bg-[#142B4A] px-4 text-left text-sm font-bold text-white">Se connecter</button>
            <button type="button" onClick={goToSignup} className="mt-2 min-h-11 border border-[#142B4A] px-4 text-left text-sm font-bold text-[#142B4A]">Créer un compte</button>
          </nav>
        )}
      </header>

      <main>
        <section id="accueil" className="mx-auto max-w-[1440px] px-5 pt-8 sm:px-8 lg:px-14 lg:pt-12">
          <div className="grid min-h-[570px] overflow-hidden bg-[#142B4A] lg:grid-cols-[.88fr_1.12fr]">
            <div className="flex flex-col justify-center px-7 py-14 text-white sm:px-12 lg:px-14 lg:py-20">
              <p className="mb-8 text-[11px] font-bold uppercase tracking-[.24em] text-[#A9C6E9]">L’apprentissage, au même endroit</p>
              <h1 className="max-w-[560px] text-[2.65rem] font-semibold leading-[1.12] tracking-[-.04em] sm:text-6xl xl:text-[4.4rem]">
                Le savoir se construit <span className="font-serif italic text-[#A9C6E9]">ensemble.</span>
              </h1>
              <p className="mt-8 max-w-[440px] text-[15px] leading-8 text-[#D3DFED] sm:text-base">
                Un espace numérique pour retrouver vos cours, partager les ressources pédagogiques et suivre les activités de votre parcours académique.
              </p>
              <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <button type="button" onClick={goToLogin} className="inline-flex min-h-14 items-center gap-5 bg-white px-6 text-sm font-bold text-[#142B4A] transition-colors hover:bg-[#EAF1FA]">
                  Accéder à mon espace <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <a href="#plateforme" className="text-sm font-semibold text-white underline decoration-[#7399C5] underline-offset-8 transition-colors hover:text-[#A9C6E9]">Explorer la plateforme</a>
              </div>
            </div>

            <div className="relative min-h-[330px] bg-[#D8E1EA] lg:min-h-full">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=85"
                alt="Étudiants réunis sur un campus universitaire"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102744]/65 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-7 text-white sm:p-10">
                <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#D6E5F6]">Enseigner · Apprendre · Progresser</span>
                <p className="max-w-md font-serif text-2xl leading-snug sm:text-3xl">Une communauté académique connectée par la connaissance.</p>
              </div>
              <span className="absolute right-0 top-0 bg-[#F7F8FA] px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#142B4A]">LMS Web</span>
            </div>
          </div>

          <div className="grid border-b border-[#DCE3EC] py-7 sm:grid-cols-3">
            <div className="flex items-center gap-3 border-b border-[#DCE3EC] pb-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pl-5">
              <BookOpen className="h-5 w-5 text-[#3973B8]" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#34465D]">Cours et ressources</span>
            </div>
            <div className="flex items-center gap-3 border-b border-[#DCE3EC] py-5 sm:border-b-0 sm:border-r sm:px-8 sm:py-0">
              <CalendarDays className="h-5 w-5 text-[#3973B8]" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#34465D]">Activités et échéances</span>
            </div>
            <div className="flex items-center gap-3 pt-5 sm:pl-8 sm:pt-0">
              <Users className="h-5 w-5 text-[#3973B8]" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#34465D]">Espaces par utilisateur</span>
            </div>
          </div>
        </section>

        <section id="plateforme" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#3973B8]">La plateforme</p>
              <h2 className="mt-5 max-w-sm font-serif text-4xl leading-tight text-[#142B4A] sm:text-5xl">Les outils essentiels à votre parcours.</h2>
            </div>
            <div>
              <p className="max-w-2xl text-base leading-8 text-[#607086]">
                LMS Web rassemble les activités pédagogiques dans un environnement unique. Chaque utilisateur retrouve les informations et les outils correspondant à son rôle.
              </p>
              <div className="mt-10 border-t border-[#C9D3DF]">
                <article className="grid gap-3 border-b border-[#C9D3DF] py-6 sm:grid-cols-[70px_1fr] sm:gap-7">
                  <span className="font-serif text-2xl text-[#7392B6]">01</span>
                  <div className="grid gap-2 sm:grid-cols-[.7fr_1fr] sm:gap-8">
                    <h3 className="text-lg font-bold text-[#142B4A]">Ressources pédagogiques</h3>
                    <p className="text-sm leading-7 text-[#607086]">Accédez aux cours et aux documents mis à disposition dans vos espaces pédagogiques.</p>
                  </div>
                </article>
                <article className="grid gap-3 border-b border-[#C9D3DF] py-6 sm:grid-cols-[70px_1fr] sm:gap-7">
                  <span className="font-serif text-2xl text-[#7392B6]">02</span>
                  <div className="grid gap-2 sm:grid-cols-[.7fr_1fr] sm:gap-8">
                    <h3 className="text-lg font-bold text-[#142B4A]">Suivi des activités</h3>
                    <p className="text-sm leading-7 text-[#607086]">Consultez les travaux, les évaluations et les échéances liés à vos cours.</p>
                  </div>
                </article>
                <article className="grid gap-3 border-b border-[#C9D3DF] py-6 sm:grid-cols-[70px_1fr] sm:gap-7">
                  <span className="font-serif text-2xl text-[#7392B6]">03</span>
                  <div className="grid gap-2 sm:grid-cols-[.7fr_1fr] sm:gap-8">
                    <h3 className="text-lg font-bold text-[#142B4A]">Progression académique</h3>
                    <p className="text-sm leading-7 text-[#607086]">Retrouvez les informations utiles pour suivre votre parcours et vos résultats.</p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="espaces" className="border-y border-[#DCE3EC] bg-white">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-14 lg:py-24">
            <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#3973B8]">Des espaces dédiés</p>
                <h2 className="mt-5 max-w-sm font-serif text-4xl leading-tight text-[#142B4A] sm:text-5xl">Un environnement pour chaque rôle.</h2>
              </div>
              <div className="divide-y divide-[#DCE3EC] border-y border-[#DCE3EC]">
                <article className="grid gap-4 py-7 sm:grid-cols-[56px_1fr_auto] sm:items-center sm:gap-6">
                  <GraduationCap className="h-8 w-8 text-[#3973B8]" aria-hidden="true" />
                  <div><h3 className="text-lg font-bold text-[#142B4A]">Étudiants</h3><p className="mt-1 text-sm leading-6 text-[#607086]">Cours, documents, devoirs, résultats et suivi des activités.</p></div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#7392B6]">Apprendre</span>
                </article>
                <article className="grid gap-4 py-7 sm:grid-cols-[56px_1fr_auto] sm:items-center sm:gap-6">
                  <Users className="h-8 w-8 text-[#3973B8]" aria-hidden="true" />
                  <div><h3 className="text-lg font-bold text-[#142B4A]">Enseignants</h3><p className="mt-1 text-sm leading-6 text-[#607086]">Gestion des cours, partage de ressources et suivi pédagogique.</p></div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#7392B6]">Enseigner</span>
                </article>
                <article className="grid gap-4 py-7 sm:grid-cols-[56px_1fr_auto] sm:items-center sm:gap-6">
                  <ShieldCheck className="h-8 w-8 text-[#3973B8]" aria-hidden="true" />
                  <div><h3 className="text-lg font-bold text-[#142B4A]">Administration</h3><p className="mt-1 text-sm leading-6 text-[#607086]">Gestion et supervision des espaces selon les autorisations.</p></div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#7392B6]">Administrer</span>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="apropos" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-14 lg:py-24">
          <div className="flex flex-col gap-8 border-l-4 border-[#3973B8] bg-[#EAF1FA] px-7 py-10 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:px-16">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#3973B8]">Votre espace académique</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-[#142B4A] sm:text-4xl">Retrouvez votre communauté pédagogique sur LMS Web.</h2>
              <p className="mt-4 text-sm leading-7 text-[#607086]">Connectez-vous pour accéder aux cours et aux fonctionnalités disponibles avec votre compte.</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <button type="button" onClick={goToLogin} className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#142B4A] px-6 text-sm font-bold text-white transition-colors hover:bg-[#2457A7]">
                Se connecter <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={goToSignup} className="min-h-12 border border-[#142B4A] px-6 text-sm font-bold text-[#142B4A] transition-colors hover:bg-white">
                Créer un compte
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#DCE3EC] bg-[#142B4A] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-14">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-[#A9C6E9]" aria-hidden="true" />
            <div><strong className="block text-sm tracking-[.08em]">LMS WEB</strong><span className="text-[10px] text-[#B8C9DC]">Plateforme pédagogique</span></div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[#D3DFED]" aria-label="Liens de pied de page">
            <a href="#accueil" className="hover:text-white">Accueil</a>
            <a href="#plateforme" className="hover:text-white">La plateforme</a>
            <a href="#espaces" className="hover:text-white">Espaces</a>
            <button type="button" onClick={goToLogin} className="hover:text-white">Connexion</button>
          </nav>
          <p className="text-xs text-[#B8C9DC]">© {new Date().getFullYear()} LMS Web. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};
