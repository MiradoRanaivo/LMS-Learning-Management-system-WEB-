import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  Calendar,
  MessageSquare,
  ArrowRight,
  Eye,
  CheckCircle2,
  Shield,
  X,
  Laptop,
  Check,
  Sparkles,
  Lock,
  LogIn,
  UserPlus,
  Clock,
  BarChart2
} from 'lucide-react';
import { UserRole } from '../App';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: (initialRole?: UserRole) => void;
}

interface CuratedMockup {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  highlights: string[];
  role: UserRole;
  previewUrl?: string;
  badge: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToSignup,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [lightboxMockup, setLightboxMockup] = useState<CuratedMockup | null>(null);

  // Curated collection of the 6 essential LMS screens (avoiding overwhelming 18 cards)
  const curatedScreens: CuratedMockup[] = [
    {
      id: 'dashboard-student',
      number: '01',
      title: 'Tableau de bord Étudiant',
      category: 'Espace Étudiant',
      badge: 'Vue Principale',
      description: 'Espace de travail centralisé pour l\'étudiant avec suivi en temps réel de la progression globale, compte à rebours des devoirs et récapitulatif des crédits ECTS.',
      highlights: [
        'Suivi de progression globale en pourcentage',
        'Accès direct aux modules récents (Web, SQL, Algo)',
        'Alertes d\'échéances pour les travaux notés',
        'Moyenne générale pondérée et validation ECTS'
      ],
      role: 'student',
    },
    {
      id: 'courses-student',
      number: '02',
      title: 'Catalogue des Cours & Syllabus',
      category: 'Pédagogie & Leçons',
      badge: '10 Modules L3',
      description: 'Programme officiel Licence 3 Informatique (INF-101 à INF-110). Chaque module comprend un syllabus chapitré, des supports PDF et des leçons interactives.',
      highlights: [
        'Organisation structurée par unité d\'enseignement',
        'Lecteur de leçons multimédia avec plan pliable',
        'Supports de cours téléchargeables (diaporamas, PDF)',
        'Indicateur de leçons complétées et verrouillées'
      ],
      role: 'student',
    },
    {
      id: 'quiz',
      number: '03',
      title: 'Évaluations & Quiz Interactifs',
      category: 'Évaluations',
      badge: 'Notation sur 20',
      description: 'Sessions d\'examen et tests d\'entraînement avec questions à choix multiples, minuteur académique décompté et correction explicative instantanée.',
      highlights: [
        'Chronomètre officiel d\'examen par session',
        'Notation instantanée avec barème sur 20 points',
        'Explications détaillées pour chaque question',
        'Archivage sécurisé des tentatives pour l\'enseignant'
      ],
      role: 'student',
    },
    {
      id: 'assignments-grades',
      number: '04',
      title: 'Dépôt des Devoirs & Relevé de Notes',
      category: 'Résultats & Remises',
      badge: 'Validation ECTS',
      description: 'Remise de travaux pratiques par téléversement de fichiers, calendrier des dates limites, suivi des corrections annotées et relevé de 30 crédits semestriels.',
      highlights: [
        'Dépôt sécurisé de fichiers (.zip, .pdf, .sql)',
        'Statut de correction et retour personnalisé de l\'enseignant',
        'Relevé de notes officiel semestriel avec moyennes',
        'Validation transparente des crédits académiques'
      ],
      role: 'student',
    },
    {
      id: 'dashboard-teacher',
      number: '05',
      title: 'Tableau de bord Enseignant',
      category: 'Espace Enseignant',
      badge: 'Pilotage Promo',
      description: 'Console dédiée aux professeurs pour la gestion des promotions : file d\'attente des copies à noter, publication de devoirs et statistiques de réussite.',
      highlights: [
        'Gestion centralisée des copies d\'étudiants à évaluer',
        'Formulaire de notation sur 20 avec feedback direct',
        'Suivi statistique des taux de complétion par matière',
        'Modération du forum d\'entraide par unité d\'enseignement'
      ],
      role: 'teacher',
    },
    {
      id: 'dashboard-admin',
      number: '06',
      title: 'Supervision Administrateur',
      category: 'Espace Administration',
      badge: 'Gouvernance',
      description: 'Console globale pour superviser l\'établissement : gestion des comptes (étudiants, professeurs), contrôle des inscriptions et sécurité système.',
      highlights: [
        'Annuaire des utilisateurs avec attribution de rôles',
        'Supervision du catalogue officiel des 10 cours',
        'Journal d\'activité et historique des connexions',
        'Conformité stricte à la charte graphique officielle'
      ],
      role: 'admin',
    },
  ];

  const currentMockup = curatedScreens[activeTab];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#ECFDF5] selection:text-[#047857]">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-[10px] bg-[#047857] text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-[#0F172A] tracking-tight leading-tight">
                LMS Web Université
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#047857] tracking-wider">
                Plateforme Académique Officielle
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#475569]">
            <a href="#hero" className="hover:text-[#047857] transition-colors whitespace-nowrap">
              Accueil
            </a>
            <a href="#fonctionnalites" className="hover:text-[#047857] transition-colors whitespace-nowrap">
              Fonctionnalités
            </a>
            <a href="#apercu" className="hover:text-[#047857] transition-colors whitespace-nowrap">
              Aperçu des écrans
            </a>
            <a href="#espaces" className="hover:text-[#047857] transition-colors whitespace-nowrap">
              Espaces universitaires
            </a>
            <a href="#apropos" className="hover:text-[#047857] transition-colors whitespace-nowrap">
              À propos
            </a>
          </nav>

          {/* Action CTAs: Protected access (login or register) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToLogin}
              className="px-4 py-2 text-xs font-semibold text-[#064E3B] hover:text-[#047857] hover:bg-[#ECFDF5] rounded-[10px] transition-colors whitespace-nowrap"
            >
              Se connecter
            </button>
            <button
              onClick={() => onNavigateToSignup()}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065F46] rounded-[10px] shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Créer un compte</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Access Restriction Notice Bar */}
      <div className="bg-[#ECFDF5] border-b border-[#A7F3D0] py-2 px-4 text-center text-xs text-[#065F46] font-medium flex items-center justify-center gap-2">
        <Lock className="w-3.5 h-3.5 text-[#047857]" />
        <span>Portail sécurisé : L'accès aux cours et aux tableaux de bord nécessite une inscription ou une connexion universitaire.</span>
      </div>

      {/* 2. Hero Section */}
      <section id="hero" className="relative pt-12 pb-20 md:py-24 overflow-hidden border-b border-[#E2E8F0]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ECFDF5] rounded-full blur-3xl pointer-events-none -z-10 opacity-70" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#CBD5E1] rounded-[10px] text-xs font-semibold text-[#065F46] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#047857]" />
                <span>Espace Numérique de Travail • Licence 3 Informatique</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
                Apprenez, progressez et réussissez avec{' '}
                <span className="text-[#047857]">LMS Web Université</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
                Retrouvez vos cours, consultez vos ressources pédagogiques, passez vos évaluations et suivez votre progression dans un espace universitaire centralisé.
              </p>

              {/* Action Buttons: strictly routing to signup and preview scroll */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigateToSignup()}
                  className="px-6 py-3.5 bg-[#047857] hover:bg-[#065F46] text-white font-semibold rounded-[10px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Rejoindre la plateforme (Inscription)</span>
                </button>
                <a
                  href="#apercu"
                  className="px-6 py-3.5 bg-white border border-[#CBD5E1] hover:border-[#047857] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold rounded-[10px] shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4 text-[#047857]" />
                  <span>Découvrir la plateforme</span>
                </a>
              </div>

              {/* Access Policy Note */}
              <p className="text-xs text-[#64748B] flex items-center gap-1.5 pt-1">
                <Lock className="w-3.5 h-3.5 text-[#047857]" />
                <span>Inscription gratuite réservée aux étudiants, enseignants et administrateurs.</span>
              </p>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#047857] tabular-nums">10</div>
                  <div className="text-xs text-[#64748B] font-medium mt-0.5">Modules L3 complets</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#047857] tabular-nums">3</div>
                  <div className="text-xs text-[#64748B] font-medium mt-0.5">Espaces dédiés</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#047857] tabular-nums">100%</div>
                  <div className="text-xs text-[#64748B] font-medium mt-0.5">Sécurisé & certifié</div>
                </div>
              </div>
            </div>

            {/* Right Mockup Showcase Column (Protected Preview) */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-xl lg:max-w-none">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-200 via-emerald-100 to-slate-200 rounded-2xl shadow-xl border border-slate-200">
                  <div className="bg-white rounded-[10px] overflow-hidden border border-[#E2E8F0] shadow-sm">
                    {/* Simulated Browser Bar with Lock */}
                    <div className="h-9 bg-[#F1F5F9] border-b border-[#E2E8F0] px-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="px-3 py-0.5 bg-white rounded border border-[#E2E8F0] text-[10px] text-[#64748B] font-mono flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-[#047857]" />
                        <span>lms.universite.edu/espace-etudiant</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#047857]">Espace Protégé</span>
                    </div>

                    {/* Official Dashboard Preview Frame */}
                    <div className="p-4 sm:p-5 space-y-4 bg-[#F8FAFC]">
                      {/* Top banner */}
                      <div className="bg-gradient-to-r from-[#064E3B] to-[#047857] text-white p-4 rounded-[10px] shadow-xs flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-emerald-200 font-medium">Aperçu du tableau de bord étudiant</p>
                          <h3 className="text-base font-bold">Andry Rakoto (Licence 3)</h3>
                          <p className="text-xs text-emerald-100 mt-0.5">Semestre 5 • Licence Informatique</p>
                        </div>
                        <div className="text-right bg-white/10 px-3 py-1.5 rounded-[10px] backdrop-blur-xs">
                          <span className="text-[10px] block text-emerald-200">Crédits ECTS</span>
                          <span className="text-sm font-bold text-white tabular-nums">28 / 30</span>
                        </div>
                      </div>

                      {/* KPI mini-cards */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white p-2.5 rounded-[10px] border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#64748B] block">Progression</span>
                          <span className="text-sm font-bold text-[#047857]">74%</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-[10px] border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#64748B] block">Moyenne</span>
                          <span className="text-sm font-bold text-[#0F172A]">15.8 / 20</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-[10px] border border-[#E2E8F0]">
                          <span className="text-[10px] text-[#64748B] block">Devoirs dus</span>
                          <span className="text-sm font-bold text-amber-600">2</span>
                        </div>
                      </div>

                      {/* Courses snippet */}
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded-[10px] border border-[#E2E8F0] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#0F172A]">INF-101 : Développement Web</p>
                              <p className="text-[10px] text-[#64748B]">Progression semestrielle active</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#047857] shrink-0">72%</span>
                        </div>
                        <div className="bg-white p-3 rounded-[10px] border border-[#E2E8F0] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#0F172A]">INF-102 : Bases de Données & SQL</p>
                              <p className="text-[10px] text-[#64748B]">Devoir TP 2 à rendre demain</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#047857] shrink-0">54%</span>
                        </div>
                      </div>

                      {/* Gate callout: requires registration */}
                      <div className="pt-2 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[10px] border border-emerald-200">
                        <div className="flex items-center gap-2 text-xs text-[#064E3B]">
                          <Lock className="w-4 h-4 text-[#047857] shrink-0" />
                          <span>Créez un compte pour accéder à vos cours</span>
                        </div>
                        <button
                          onClick={() => onNavigateToSignup('student')}
                          className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white rounded-[10px] text-xs font-semibold shadow-xs transition flex items-center gap-1.5 shrink-0"
                        >
                          <span>S'inscrire maintenant</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section Fonctionnalités (6 piliers pédagogiques) */}
      <section id="fonctionnalites" className="py-20 bg-white border-b border-[#E2E8F0]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#047857]">
              Architecture Pédagogique Universitaire
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Tout votre cursus universitaire en un seul endroit
            </h2>
            <p className="text-sm sm:text-base text-[#64748B]">
              Une plateforme moderne conçue pour simplifier la vie des étudiants, dynamiser l'enseignement des professeurs et garantir une gouvernance transparente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-6 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-[10px] bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Cours et leçons par matière</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Catalogue de 10 unités d'enseignement (INF-101 à INF-110) avec plan de cours chapitré, leçons interactives, vidéos intégrées et suivi de complétion en temps réel.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#047857] flex items-center gap-1">
                <span>10 cours L3 Informatique</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-6 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-[10px] bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Quiz et évaluations interactifs</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                QCM académiques chronométrés avec correction sécurisée, affichage immédiat de la note sur 20, explications détaillées pour chaque question et archivage des tentatives.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#047857] flex items-center gap-1">
                <span>Notation instantanée sur 20</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 3 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-6 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-[10px] bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Dépôt des devoirs & corrections</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Soumission des travaux pratiques par glisser-déposer (.zip, .pdf, .sql), respect des dates limites, interface de correction dédiée aux enseignants et retour annoté.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#047857] flex items-center gap-1">
                <span>Suivi des remises & annotations</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 4 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-6 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-[10px] bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Notes et crédits ECTS</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Relevé de notes officiel semestriel avec calcul pondéré de la moyenne générale, validation des 30 crédits ECTS du semestre et export PDF conforme au référentiel.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#047857] flex items-center gap-1">
                <span>Calcul automatique des ECTS</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 5 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-6 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-[10px] bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Calendrier universitaire</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Planning synchronisé des cours magistraux, travaux dirigés, séances d'examens et échéances de devoirs avec alertes programmées et codes couleurs par matière.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#047857] flex items-center gap-1">
                <span>Emploi du temps synchronisé</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 6 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-6 hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-[10px] bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Ressources & Forum d'entraide</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Bibliothèque numérique de supports PDF, annales et documentations, couplée à un forum d'entraide par matière avec modération et validation des réponses par les professeurs.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#047857] flex items-center gap-1">
                <span>Bibliothèque & entraide certifiée</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section Aperçu épuré des écrans clés (remplace la grille surchargée des 18 maquettes) */}
      <section id="apercu" className="py-20 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#047857]">
              Aperçu Pédagogique
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Découvrez l'interface du LMS Web Université
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Explorez les principaux écrans de la plateforme. Pour accéder à vos cours, vos notes ou votre espace personnel, une inscription préalable est nécessaire.
            </p>
          </div>

          {/* Interactive Screen Selector Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {curatedScreens.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 text-xs font-semibold rounded-[10px] transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === idx
                    ? 'bg-[#047857] text-white shadow-xs'
                    : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] opacity-75">{s.number}.</span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>

          {/* Featured Screen Showcase Card */}
          <div className="bg-white border border-[#CBD5E1] rounded-[10px] shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
              {/* Left Details */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E2E8F0] space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#047857] border border-emerald-200">
                      Écran #{currentMockup.number} • {currentMockup.badge}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {currentMockup.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0F172A]">
                    {currentMockup.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {currentMockup.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Points clés de cet écran :
                    </h4>
                    <div className="space-y-2">
                      {currentMockup.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#334155]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#047857] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Strict Access CTA: Prompt to register or login */}
                <div className="pt-6 border-t border-[#E2E8F0] space-y-3">
                  <div className="p-3 bg-[#F8FAFC] rounded-[10px] border border-[#CBD5E1] flex items-center gap-2 text-xs text-[#64748B]">
                    <Lock className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>L'accès interactif nécessite un compte universitaire actif.</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => onNavigateToSignup(currentMockup.role)}
                      className="w-full sm:flex-1 py-2.5 px-4 bg-[#047857] hover:bg-[#065F46] text-white rounded-[10px] text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>S'inscrire pour accéder</span>
                    </button>
                    <button
                      onClick={() => setLightboxMockup(currentMockup)}
                      className="w-full sm:w-auto py-2.5 px-3 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] rounded-[10px] text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#047857]" />
                      <span>Agrandir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Visual Simulated Screen Frame */}
              <div className="lg:col-span-7 bg-gradient-to-br from-slate-100 to-emerald-50/40 p-6 sm:p-8 flex flex-col justify-center">
                <div className="bg-white rounded-[10px] border border-[#CBD5E1] shadow-md overflow-hidden">
                  {/* Miniature header */}
                  <div className="h-8 bg-[#F1F5F9] border-b border-[#E2E8F0] px-3 flex items-center justify-between text-[11px] text-[#64748B]">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                    </div>
                    <span className="font-mono text-[10px] text-[#047857] font-semibold">
                      LMS • {currentMockup.title}
                    </span>
                    <Lock className="w-3 h-3 text-[#047857]" />
                  </div>

                  {/* High fidelity wireframe preview content */}
                  <div className="p-5 space-y-4 bg-[#F8FAFC]">
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-[#0F172A]">{currentMockup.title}</h4>
                        <span className="text-[10px] text-[#64748B]">Licence 3 Informatique • Année 2025–2026</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#047857]">
                        {currentMockup.badge}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-[10px] border border-[#E2E8F0] space-y-1.5">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Statut pédagogique</span>
                        <p className="text-xs font-bold text-[#0F172A]">{currentMockup.highlights[0]}</p>
                      </div>
                      <div className="bg-white p-3 rounded-[10px] border border-[#E2E8F0] space-y-1.5">
                        <span className="text-[10px] text-[#64748B] block font-semibold">Accès réservé</span>
                        <p className="text-xs font-bold text-[#047857]">{currentMockup.category}</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-[10px] border border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                        <span>Fonctionnalités incluses dans ce module</span>
                        <span className="text-[10px] text-[#047857]">Protégé par compte</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#047857] w-3/4 rounded-full" />
                      </div>
                      <p className="text-[11px] text-[#64748B] pt-1">
                        {currentMockup.highlights[1]}
                      </p>
                    </div>

                    {/* Lock overlay banner */}
                    <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-3 rounded-[10px] flex items-center justify-between text-xs text-[#065F46]">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#047857]" />
                        <span>Création de compte gratuite requise</span>
                      </div>
                      <button
                        onClick={() => onNavigateToSignup(currentMockup.role)}
                        className="text-xs font-bold text-[#047857] hover:underline"
                      >
                        S'inscrire →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Présentation des 3 Espaces (Étudiant, Enseignant, Administrateur) */}
      <section id="espaces" className="py-20 bg-white border-b border-[#E2E8F0]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#047857]">
              Expérience Multi-Rôles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Trois espaces spécialisés pour la communauté universitaire
            </h2>
            <p className="text-sm sm:text-base text-[#64748B]">
              Choisissez votre profil pour créer votre compte universitaire. L'accès aux tableaux de bord est strictement réservé aux utilisateurs enregistrés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Espace 1: Étudiant */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[10px] p-6 flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-[10px] bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#047857]">Profil 01</span>
                  <h3 className="text-lg font-bold text-[#0F172A]">Espace Étudiant</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">Pour les étudiants de Licence & Master</p>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Apprendre, consulter les cours en ligne, lire les leçons multimédias, déposer les devoirs dans les délais impartis, passer les quiz chronométrés et suivre son relevé de notes avec crédits ECTS.
                </p>
                <ul className="space-y-2 text-xs text-[#334155] border-t border-[#E2E8F0] pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                    <span>Accès aux 10 cours d'informatique</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                    <span>Passage de quiz notés sur 20</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                    <span>Dépôt de devoirs et travaux pratiques</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                    <span>Relevé officiel des 30 crédits ECTS</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onNavigateToSignup('student')}
                  className="w-full py-2.5 px-4 bg-[#047857] hover:bg-[#065F46] text-white rounded-[10px] text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Créer mon compte Étudiant</span>
                </button>
              </div>
            </div>

            {/* Espace 2: Enseignant */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[10px] p-6 flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-[10px] bg-[#ECFDF5] text-[#065F46] flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#065F46]">Profil 02</span>
                  <h3 className="text-lg font-bold text-[#0F172A]">Espace Enseignant</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">Pour les professeurs & chargés de TD</p>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Gérer les unités d'enseignement, créer et structurer les leçons, publier des supports pédagogiques PDF, corriger les travaux pratiques avec barème et notes sur 20, et suivre la réussite de la promotion.
                </p>
                <ul className="space-y-2 text-xs text-[#334155] border-t border-[#E2E8F0] pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#065F46] shrink-0" />
                    <span>Gestion et édition des syllabus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#065F46] shrink-0" />
                    <span>Correction et notation sur 20 avec feedback</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#065F46] shrink-0" />
                    <span>Statistiques globales de la promotion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#065F46] shrink-0" />
                    <span>Modération du forum académique</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onNavigateToSignup('teacher')}
                  className="w-full py-2.5 px-4 bg-[#065F46] hover:bg-[#064E3B] text-white rounded-[10px] text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Créer mon compte Enseignant</span>
                </button>
              </div>
            </div>

            {/* Espace 3: Administrateur */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[10px] p-6 flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-[10px] bg-[#ECFDF5] text-[#064E3B] flex items-center justify-center font-bold">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]">Profil 03</span>
                  <h3 className="text-lg font-bold text-[#0F172A]">Espace Administrateur</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">Direction des études & scolarité</p>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Superviser l'ensemble de la plateforme, gérer les comptes utilisateurs (étudiants, professeurs, admins), administrer le catalogue officiel des cours et assurer la sécurité du système.
                </p>
                <ul className="space-y-2 text-xs text-[#334155] border-t border-[#E2E8F0] pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#064E3B] shrink-0" />
                    <span>Annuaire et gestion des rôles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#064E3B] shrink-0" />
                    <span>Supervision du catalogue des 10 cours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#064E3B] shrink-0" />
                    <span>Journal des audits de sécurité</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#064E3B] shrink-0" />
                    <span>Gestion des quotas universitaires</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={onNavigateToLogin}
                  className="w-full py-2.5 px-4 bg-[#064E3B] hover:bg-slate-900 text-white rounded-[10px] text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Connexion Administrateur</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section À Propos & Normes */}
      <section id="apropos" className="py-20 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#CBD5E1] rounded-[10px] p-8 lg:p-12 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#047857]">
                  Architecture & Normes
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  Une plateforme développée pour les exigences académiques
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Le système LMS Web Université garantit la confidentialité des évaluations, l'étanchéité des rôles et l'accès sécurisé aux données pédagogiques.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 text-xs text-[#334155]">
                    <div className="w-2 h-2 rounded-full bg-[#047857]" />
                    <span><strong>Accès sécurisé obligatoire :</strong> aucune ressource privée n'est accessible sans inscription validée.</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#334155]">
                    <div className="w-2 h-2 rounded-full bg-[#047857]" />
                    <span><strong>100% Responsive :</strong> navigation fluide sur grand écran, ordinateur portable et smartphone.</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#334155]">
                    <div className="w-2 h-2 rounded-full bg-[#047857]" />
                    <span><strong>Base de données MySQL :</strong> compatible environnement XAMPP (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">C:\xampp\htdocs\lms\</code>).</span>
                  </div>
                </div>
              </div>

              {/* Technical highlight box */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[10px] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Spécifications Techniques
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#047857]">
                    Conforme Référentiel
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Palette officielle</span>
                    <span className="font-mono font-medium text-[#047857]">#064E3B, #047857, #059669, #10B981</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Contrôle d'accès</span>
                    <span className="font-medium text-[#0F172A]">Inscription / Connexion obligatoire</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Coins des cartes</span>
                    <span className="font-medium text-[#0F172A]">Arrondis à 10 px</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Catalogue de formation</span>
                    <span className="font-medium text-[#0F172A]">Licence 3 Informatique (10 cours)</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#64748B]">Bascule des comptes</span>
                    <span className="font-medium text-[#047857]">Multi-comptes style Gmail</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section Finale (CTA Inscription) */}
      <section id="rejoindre" className="py-20 bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#065F46] text-white">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-block px-3 py-1 bg-white/10 rounded-[10px] text-xs font-semibold text-emerald-200 backdrop-blur-xs">
            Inscriptions ouvertes pour l'année universitaire 2025–2026
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Prêt à commencer votre parcours universitaire ?
          </h2>

          <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Inscrivez-vous dès maintenant pour accéder à vos cours, consulter vos ressources pédagogiques et suivre vos évaluations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigateToSignup()}
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#064E3B] hover:bg-emerald-50 font-bold rounded-[10px] shadow-lg transition-transform hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#064E3B]" />
              <span>Créer mon compte gratuitement</span>
            </button>
            <button
              onClick={onNavigateToLogin}
              className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-[10px] transition text-sm flex items-center justify-center gap-2 border border-white/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Se connecter à un compte existant</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#0F172A] text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#047857] text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-sm">LMS Web Université</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Plateforme universitaire d'apprentissage en ligne. Accès réservé aux étudiants, enseignants et administrateurs autorisés.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-1.5">
                <li><a href="#hero" className="hover:text-emerald-400 transition">Accueil</a></li>
                <li><a href="#fonctionnalites" className="hover:text-emerald-400 transition">Fonctionnalités</a></li>
                <li><a href="#apercu" className="hover:text-emerald-400 transition">Aperçu des écrans</a></li>
                <li><a href="#espaces" className="hover:text-emerald-400 transition">Espaces universitaires</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Accès & Inscription</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => onNavigateToSignup('student')} className="hover:text-emerald-400 transition text-left">
                    Inscription Étudiant
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateToSignup('teacher')} className="hover:text-emerald-400 transition text-left">
                    Inscription Enseignant
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateToLogin} className="hover:text-emerald-400 transition text-left">
                    Connexion Utilisateur
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Mentions Académiques</h4>
              <p className="text-xs text-slate-400">
                Département d'Informatique • Licence 3<br />
                Modules INF-101 à INF-110<br />
                Année Universitaire 2025–2026
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 LMS Web Université. Tous droits réservés.
            </div>
            <div className="flex items-center gap-4">
              <span>Vert Émeraude officiel : #064E3B • #047857 • #059669 • #10B981</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal (Protected Preview Zoom) */}
      {lightboxMockup && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] border border-[#CBD5E1] shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#047857] text-white">
                  Écran #{lightboxMockup.number}
                </span>
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">{lightboxMockup.title}</h3>
                  <span className="text-xs text-[#64748B]">{lightboxMockup.category}</span>
                </div>
              </div>
              <button
                onClick={() => setLightboxMockup(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-[10px] hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-gradient-to-br from-slate-100 to-emerald-50 rounded-[10px] border border-[#CBD5E1] p-6 shadow-inner text-center">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-14 h-14 rounded-[10px] bg-[#047857] text-white mx-auto flex items-center justify-center shadow-xs">
                    <Laptop className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-[#0F172A]">{lightboxMockup.title}</h4>
                  <p className="text-xs text-[#64748B]">{lightboxMockup.description}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
                  Fonctionnalités incluses :
                </h4>
                <div className="space-y-2">
                  {lightboxMockup.highlights.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-[10px] text-xs text-[#334155]">
                      <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strict Notice in Lightbox */}
              <div className="p-3.5 bg-[#ECFDF5] border border-emerald-200 rounded-[10px] text-xs text-[#064E3B] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#047857] shrink-0" />
                <span>Pour ouvrir et manipuler cet écran, vous devez être connecté avec un compte universitaire.</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-3">
              <button
                onClick={() => setLightboxMockup(null)}
                className="px-4 py-2 border border-[#CBD5E1] text-[#475569] hover:bg-slate-100 rounded-[10px] text-xs font-semibold transition"
              >
                Fermer
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setLightboxMockup(null);
                    onNavigateToLogin();
                  }}
                  className="px-4 py-2 border border-[#047857] text-[#047857] hover:bg-[#ECFDF5] rounded-[10px] text-xs font-semibold transition"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => {
                    const role = lightboxMockup.role;
                    setLightboxMockup(null);
                    onNavigateToSignup(role);
                  }}
                  className="px-5 py-2.5 bg-[#047857] hover:bg-[#065F46] text-white rounded-[10px] text-xs font-semibold shadow-xs transition flex items-center gap-2"
                >
                  <span>Créer mon compte pour accéder</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
