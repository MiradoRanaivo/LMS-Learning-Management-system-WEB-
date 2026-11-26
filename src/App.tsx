/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * LMS Web - Plateforme Universitaire d'Apprentissage
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  FileText,
  MessageSquare,
  Folder,
  Calendar as CalendarIcon,
  User,
  Settings,
  Bell,
  Search,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Play,
  Lock,
  Plus,
  ChevronRight,
  Download,
  ExternalLink,
  ThumbsUp,
  Shield,
  LogOut,
  Users,
  Activity,
  AlertCircle,
  BarChart2,
  FileCheck,
  X,
  Code,
  Eye,
  EyeOff,
  Database,
  Layers,
  Sparkles,
  Menu,
  Video,
  Terminal,
  FileCode,
  UserPlus
} from 'lucide-react';
import { SignupPage } from './components/SignupPage';
import { AcademicGreenLanding } from './components/AcademicGreenLanding';

// Types
export type UserRole = 'student' | 'teacher' | 'admin';

export interface CurrentUser {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  avatarUrl: string;
  phone: string;
  bio: string;
}

type ThemeId = 'marine' | 'petrol' | 'indigo' | 'anthracite';

type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  complementary: string;
  soft: string;
};

const THEME_OPTIONS: ThemeDefinition[] = [
  {
    id: 'marine',
    name: 'Bleu marine',
    description: 'Universitaire classique',
    primary: '#102A43',
    secondary: '#243B53',
    accent: '#486581',
    complementary: '#829AB1',
    soft: '#F0F4F8',
  },
  {
    id: 'petrol',
    name: 'Bleu pétrole',
    description: 'Élégant et professionnel',
    primary: '#164E63',
    secondary: '#0E7490',
    accent: '#0891B2',
    complementary: '#67E8F9',
    soft: '#ECFEFF',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    description: 'Académique et numérique',
    primary: '#312E81',
    secondary: '#4338CA',
    accent: '#6366F1',
    complementary: '#A5B4FC',
    soft: '#EEF2FF',
  },
  {
    id: 'anthracite',
    name: 'Anthracite & or',
    description: 'Haut de gamme',
    primary: '#18181B',
    secondary: '#27272A',
    accent: '#52525B',
    complementary: '#CA8A04',
    soft: '#FEFCE8',
  },
];

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  kind: 'course' | 'resource' | 'user';
  courseId?: number;
};

const normalizeSearchText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export type ScreenId =
  | 'landing'               // Public welcome landing page (default)
  | 'signup'                // Registration form
  | 'dashboard-student'     // 1
  | 'dashboard-teacher'     // 2
  | 'dashboard-admin'       // 3
  | 'courses-student'       // 4
  | 'course-detail'         // 5
  | 'lesson-reader'         // 6
  | 'quiz'                  // 7
  | 'assignments'           // 8
  | 'grades'                // 9
  | 'calendar'              // 10
  | 'resources'             // 11
  | 'forum'                 // 12
  | 'profile'               // 13
  | 'settings'              // 14
  | 'notifications'         // 15
  | 'users-management'      // 16
  | 'courses-management'    // 17
  | 'ui-components'         // 18
  | 'login';

export default function App() {
  // Current user
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: 1,
    name: 'Andry Rakoto (Jean Martin)',
    firstname: 'Andry',
    lastname: 'Rakoto',
    email: 'andry.rakoto@exemple.com',
    role: 'student',
    avatarInitials: 'AR',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
    phone: '+261 34 12 345 67',
    bio: 'Étudiant en Licence 3 Informatique, passionné par le développement web moderne et les architectures distribuées.'
  });

  const [activeScreen, setActiveScreen] = useState<ScreenId>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [signupInitialRole, setSignupInitialRole] = useState<UserRole>('student');
  const [authPanel, setAuthPanel] = useState<'login' | 'signup'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showXamppModal, setShowXamppModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);
  const [catalogCourses, setCatalogCourses] = useState<any[]>([]);
  const [courseContent, setCourseContent] = useState<any | null>(null);
  const [courseContentLoading, setCourseContentLoading] = useState(false);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<number>(3);
  const [notificationCount, setNotificationCount] = useState<number>(3);
  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('lms-notification-preferences');
      return saved ? JSON.parse(saved) as { emailCourses: boolean; emailQuizzes: boolean; emailDeadlines: boolean; emailForum: boolean; inApp: boolean } : {
        emailCourses: true, emailQuizzes: true, emailDeadlines: true, emailForum: true, inApp: true,
      };
    } catch {
      return { emailCourses: true, emailQuizzes: true, emailDeadlines: true, emailForum: true, inApp: true };
    }
  });
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('lms-theme');
      return saved && THEME_OPTIONS.some((theme) => theme.id === saved) ? (saved as ThemeId) : 'marine';
    } catch {
      return 'marine';
    }
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [showAdminUserModal, setShowAdminUserModal] = useState(false);
  const [editingAdminUserId, setEditingAdminUserId] = useState<number | null>(null);
  const [adminUserDraft, setAdminUserDraft] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: 'student' as UserRole,
  });
  const [adminUserFormError, setAdminUserFormError] = useState('');

  // Accounts available in the account switcher
  const [registeredAccounts, setRegisteredAccounts] = useState<CurrentUser[]>([
    {
      id: 1,
      name: 'Andry Rakoto (Jean Martin)',
      firstname: 'Andry',
      lastname: 'Rakoto',
      email: 'andry.rakoto@exemple.com',
      role: 'student',
      avatarInitials: 'AR',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
      phone: '+261 34 12 345 67',
      bio: 'Étudiant en Licence 3 Informatique, passionné par le développement web moderne et les architectures distribuées.'
    },
    {
      id: 5,
      name: 'Dr. Tahina Ramanantsoa',
      firstname: 'Dr. Tahina',
      lastname: 'Ramanantsoa',
      email: 'tahina.ramanantsoa@exemple.com',
      role: 'teacher',
      avatarInitials: 'TR',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
      phone: '+261 34 01 234 56',
      bio: 'Maître de Conférences en Informatique, spécialité Technologies Web & Bases de Données.'
    },
    {
      id: 7,
      name: 'Tiana Rasoanaivo (Admin)',
      firstname: 'Tiana',
      lastname: 'Rasoanaivo',
      email: 'tiana.rasoanaivo@exemple.com',
      role: 'admin',
      avatarInitials: 'AD',
      avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=256&h=256&q=80',
      phone: '+261 33 11 222 33',
      bio: 'Administratrice Principale de la Plateforme Numérique Universitaire.'
    },
    {
      id: 2,
      name: 'Fara Randria',
      firstname: 'Fara',
      lastname: 'Randria',
      email: 'fara.randria@exemple.com',
      role: 'student',
      avatarInitials: 'FR',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
      phone: '+261 32 45 678 90',
      bio: 'Étudiante en Génie Logiciel, passionnée par l\'UX et le développement mobile.'
    },
    {
      id: 6,
      name: 'Prof. Lova Razafindrazaka',
      firstname: 'Prof. Lova',
      lastname: 'Razafindrazaka',
      email: 'lova.razaf@exemple.com',
      role: 'teacher',
      avatarInitials: 'LR',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
      phone: '+261 32 99 876 54',
      bio: 'Professeur Titulaire, Responsable du département Réseaux & Télécommunications.'
    }
  ]);

  const selectAccount = (account: CurrentUser) => {
    setCurrentUser(account);
    setIsAuthenticated(true);
    if (account.role === 'admin') {
      setActiveScreen('dashboard-admin');
    } else if (account.role === 'teacher') {
      setActiveScreen('dashboard-teacher');
    } else {
      setActiveScreen('dashboard-student');
    }
    setIsAccountMenuOpen(false);
  };

  const openAdminUserModal = (account?: CurrentUser) => {
    setAdminUserFormError('');
    setEditingAdminUserId(account?.id ?? null);
    setAdminUserDraft(account ? {
      firstname: account.firstname,
      lastname: account.lastname,
      email: account.email,
      phone: account.phone,
      role: account.role === 'admin' ? 'teacher' : account.role,
    } : { firstname: '', lastname: '', email: '', phone: '', role: 'student' });
    setShowAdminUserModal(true);
  };

  const saveAdminUser = (event: React.FormEvent) => {
    event.preventDefault();
    const firstname = adminUserDraft.firstname.trim();
    const lastname = adminUserDraft.lastname.trim();
    const email = adminUserDraft.email.trim().toLowerCase();
    if (!firstname || !lastname || !email || !email.includes('@')) {
      setAdminUserFormError('Veuillez renseigner un prénom, un nom et une adresse email valide.');
      return;
    }
    if (adminUserDraft.role === 'admin') {
      setAdminUserFormError('Le rôle administrateur est réservé au compte principal et ne peut pas être attribué depuis cette interface.');
      return;
    }
    if (registeredAccounts.some((account) => account.email.toLowerCase() === email && account.id !== editingAdminUserId)) {
      setAdminUserFormError('Cette adresse email est déjà associée à un compte.');
      return;
    }

    const existing = registeredAccounts.find((account) => account.id === editingAdminUserId);
    const user: CurrentUser = {
      id: existing?.id ?? Date.now(),
      name: `${firstname} ${lastname}`,
      firstname,
      lastname,
      email,
      role: adminUserDraft.role,
      avatarInitials: `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase(),
      avatarUrl: existing?.avatarUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      phone: adminUserDraft.phone.trim(),
      bio: existing?.bio ?? 'Compte universitaire créé par un administrateur.',
    };

    setRegisteredAccounts((accounts) => existing
      ? accounts.map((account) => account.id === existing.id ? user : account)
      : [...accounts, user]);
    if (currentUser.id === user.id) setCurrentUser(user);
    setShowAdminUserModal(false);
  };

  // Lesson completion state
  const [completedLessons, setCompletedLessons] = useState<number[]>([1, 2]);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(2); // Question 3 / 10
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>('a');
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Assignment submissions
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      assignmentId: 1,
      studentName: 'Andry Rakoto',
      studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
      courseTitle: 'Développement Web',
      title: 'TP 1 : Interface responsive CSS Grid & Flexbox',
      file: 'devoir_web_andry.zip',
      grade: 17.5,
      feedback: 'Excellent travail. La grille responsive et les contrastes de couleur respectent fidèlement les maquettes.',
      status: 'corrige',
      submittedAt: '21 oct. 2026'
    },
    {
      id: 2,
      assignmentId: 2,
      studentName: 'Fara Randria',
      studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
      courseTitle: 'Bases de données',
      title: 'Exercice SQL : Modélisation clinique',
      file: 'modele_sql_fara.sql',
      grade: null as number | null,
      feedback: '',
      status: 'rendu',
      submittedAt: 'Aujourd\'hui 09:15'
    }
  ]);

  // Grading modal for teacher
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [gradeInput, setGradeInput] = useState('16.0');
  const [feedbackInput, setFeedbackInput] = useState('Code bien structuré, requêtes optimisées.');

  // Role quick switch with real portraits
  const switchRole = (newRole: UserRole) => {
    if (newRole === 'student') {
      setCurrentUser({
        id: 1,
        name: 'Andry Rakoto (Jean Martin)',
        firstname: 'Andry',
        lastname: 'Rakoto',
        email: 'andry.rakoto@exemple.com',
        role: 'student',
        avatarInitials: 'AR',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
        phone: '+261 34 12 345 67',
        bio: 'Étudiant en Licence 3 Informatique.'
      });
      setActiveScreen('dashboard-student');
    } else if (newRole === 'teacher') {
      setCurrentUser({
        id: 5,
        name: 'Dr. Tahina Ramanantsoa',
        firstname: 'Dr. Tahina',
        lastname: 'Ramanantsoa',
        email: 'tahina.ramanantsoa@exemple.com',
        role: 'teacher',
        avatarInitials: 'TR',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
        phone: '+261 34 01 234 56',
        bio: 'Maître de Conférences en Informatique, Technologies Web & BD.'
      });
      setActiveScreen('dashboard-teacher');
    } else {
      setCurrentUser({
        id: 7,
        name: 'Tiana Rasoanaivo',
        firstname: 'Tiana',
        lastname: 'Rasoanaivo',
        email: 'tiana.rasoanaivo@exemple.com',
        role: 'admin',
        avatarInitials: 'TR',
        avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=256&h=256&q=80',
        phone: '+261 33 11 222 33',
        bio: 'Administratrice système LMS Web.'
      });
      setActiveScreen('dashboard-admin');
    }
  };

  const handleLessonToggle = (id: number) => {
    if (completedLessons.includes(id)) {
      setCompletedLessons(completedLessons.filter((item) => item !== id));
    } else {
      setCompletedLessons([...completedLessons, id]);
    }
  };

  // 10 Courses with rich Unsplash technology photos and instructor photos
  const coursesList = [
    {
      id: 1,
      code: 'INF-103',
      title: 'Développement Web',
      category: 'Frontend & Backend',
      chapter: 'Chapitre 3 : JavaScript ES6+',
      progress: 72,
      hours: '3h restantes',
      students: 32,
      iconColor: 'bg-emerald-600',
      level: 'Débutant',
      chaptersCount: 5,
      totalHours: '12h de contenu',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&h=400&q=80',
      instructorName: 'Dr. Tahina Ramanantsoa',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 2,
      code: 'INF-104',
      title: 'Base de données',
      category: 'SQL & Modélisation',
      chapter: 'Chapitre 2 : SQL Avancé & Index',
      progress: 54,
      hours: '3h restantes',
      students: 28,
      iconColor: 'bg-teal-600',
      level: 'Intermédiaire',
      chaptersCount: 6,
      totalHours: '15h de contenu',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&h=400&q=80',
      instructorName: 'Dr. Tahina Ramanantsoa',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 3,
      code: 'INF-105',
      title: 'Réseaux & Protocoles',
      category: 'Systèmes & TCP/IP',
      chapter: 'Chapitre 1 : Modèle OSI & TCP',
      progress: 38,
      hours: '3h restantes',
      students: 41,
      iconColor: 'bg-cyan-600',
      level: 'Intermédiaire',
      chaptersCount: 5,
      totalHours: '14h de contenu',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&h=400&q=80',
      instructorName: 'Prof. Lova Razafindrazaka',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 4,
      code: 'INF-109',
      title: 'PHP 8+ Avancé & PDO',
      category: 'Backend Universitaire',
      chapter: 'Chapitre 4 : Sessions & Auth',
      progress: 61,
      hours: '2h restantes',
      students: 23,
      iconColor: 'bg-emerald-700',
      level: 'Avancé',
      chaptersCount: 6,
      totalHours: '15h de contenu',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&h=400&q=80',
      instructorName: 'Dr. Tahina Ramanantsoa',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 5,
      code: 'INF-101',
      title: 'Algorithmique & Structures',
      category: 'Fondamentaux',
      chapter: 'Chapitre 5 : Arbres Binaires',
      progress: 85,
      hours: '1h restante',
      students: 45,
      iconColor: 'bg-emerald-800',
      level: 'Débutant',
      chaptersCount: 6,
      totalHours: '18h de contenu',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&h=400&q=80',
      instructorName: 'Dr. Hery Andriantsoa',
      instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 6,
      code: 'INF-102',
      title: 'Programmation C/C++',
      category: 'Système & Bas Niveau',
      chapter: 'Chapitre 3 : Les Pointeurs',
      progress: 42,
      hours: '4h restantes',
      students: 30,
      iconColor: 'bg-slate-700',
      level: 'Intermédiaire',
      chaptersCount: 6,
      totalHours: '16h de contenu',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=400&q=80',
      instructorName: 'Prof. Lova Razafindrazaka',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 7,
      code: 'INF-106',
      title: 'Génie Logiciel & Agile',
      category: 'Méthodes & UML',
      chapter: 'Chapitre 2 : Diagrammes UML',
      progress: 20,
      hours: '5h restantes',
      students: 36,
      iconColor: 'bg-emerald-600',
      level: 'Avancé',
      chaptersCount: 5,
      totalHours: '12h de contenu',
      thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&h=400&q=80',
      instructorName: 'Dr. Tahina Ramanantsoa',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 8,
      code: 'INF-107',
      title: 'Systèmes d\'Exploitation',
      category: 'Kernel & Processus',
      chapter: 'Chapitre 4 : Ordonnancement',
      progress: 50,
      hours: '3h restantes',
      students: 39,
      iconColor: 'bg-teal-700',
      level: 'Intermédiaire',
      chaptersCount: 5,
      totalHours: '14h de contenu',
      thumbnailUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&h=400&q=80',
      instructorName: 'Prof. Lova Razafindrazaka',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 9,
      code: 'INF-108',
      title: 'Analyse & Conception SI',
      category: 'Architectures SI',
      chapter: 'Chapitre 1 : Exigences Métier',
      progress: 15,
      hours: '6h restantes',
      students: 29,
      iconColor: 'bg-emerald-500',
      level: 'Avancé',
      chaptersCount: 4,
      totalHours: '10h de contenu',
      thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&h=400&q=80',
      instructorName: 'Dr. Hery Andriantsoa',
      instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 10,
      code: 'INF-110',
      title: 'Sécurité & Cryptographie',
      category: 'Cybersécurité',
      chapter: 'Chapitre 3 : Injections SQL & XSS',
      progress: 30,
      hours: '4h restantes',
      students: 34,
      iconColor: 'bg-emerald-900',
      level: 'Avancé',
      chaptersCount: 5,
      totalHours: '12h de contenu',
      thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&h=400&q=80',
      instructorName: 'Prof. Lova Razafindrazaka',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
    },
  ];

  const averageCourseProgress = Math.round(coursesList.reduce((total, course) => total + course.progress, 0) / coursesList.length);

  const staticCurrentCourse = coursesList.find((c) => c.id === selectedCourseId) || coursesList[0];
  const currentCourse = courseContent?.course && Number(courseContent.course.id) === selectedCourseId
    ? {
        ...staticCurrentCourse,
        code: courseContent.course.code || staticCurrentCourse.code,
        title: courseContent.course.title || staticCurrentCourse.title,
        category: courseContent.course.category_name || staticCurrentCourse.category,
        level: courseContent.course.level || staticCurrentCourse.level,
        chaptersCount: courseContent.chapters?.length ?? staticCurrentCourse.chaptersCount,
        totalHours: `${courseContent.course.hours_total || 0}h de contenu`,
        instructorName: `${courseContent.course.teacher_firstname || ''} ${courseContent.course.teacher_lastname || ''}`.trim() || staticCurrentCourse.instructorName,
      }
    : staticCurrentCourse;
  const currentLesson = courseContent?.chapters?.flatMap((chapter: any) => chapter.lessons || [])
    .find((lesson: any) => Number(lesson.id) === selectedLessonId);
  const adminTeacherCount = registeredAccounts.filter((account) => account.role === 'teacher').length;
  const adminStudentCount = registeredAccounts.filter((account) => account.role === 'student').length;
  const adminCount = registeredAccounts.filter((account) => account.role === 'admin').length;

  const searchResults: SearchResult[] = [];
  const normalizedQuery = normalizeSearchText(searchQuery.trim());
  if (normalizedQuery) {
    coursesList.forEach((course) => {
      const searchableText = normalizeSearchText(
        `${course.code} ${course.title} ${course.category} ${course.chapter} ${course.instructorName}`
      );
      if (searchableText.includes(normalizedQuery)) {
        searchResults.push({
          id: `course-${course.id}`,
          title: course.title,
          subtitle: `${course.code} · ${course.category}`,
          kind: 'course',
          courseId: course.id,
        });
      }
    });

    [
      'Guide JavaScript (PDF)',
      'Exemple de projet PHP',
      'Vidéos - Bases de données',
      'Fiche récapitulative HTML/CSS',
    ].forEach((title) => {
      if (normalizeSearchText(title).includes(normalizedQuery)) {
        searchResults.push({ id: `resource-${title}`, title, subtitle: 'Ressource pédagogique', kind: 'resource' });
      }
    });

    if (currentUser.role === 'admin') {
      registeredAccounts.forEach((account) => {
        const searchableText = normalizeSearchText(`${account.name} ${account.email} ${account.role}`);
        if (searchableText.includes(normalizedQuery)) {
          searchResults.push({
            id: `user-${account.id}`,
            title: account.name,
            subtitle: `${account.email} · ${account.role}`,
            kind: 'user',
          });
        }
      });
    }
  }

  const openSearchResult = (result: SearchResult) => {
    setSearchQuery('');
    if (result.kind === 'course' && result.courseId) {
      setSelectedCourseId(result.courseId);
      setActiveScreen(currentUser.role === 'student' ? 'course-detail' : 'courses-management');
    } else if (result.kind === 'resource') {
      setActiveScreen('resources');
    } else if (result.kind === 'user') {
      setActiveScreen('users-management');
    }
  };

  // Screen selector list (18 maquettes de référence)
  const allScreens: { id: ScreenId; label: string; group: string }[] = [
    { id: 'dashboard-student', label: '1. Dashboard Élève', group: 'Tableaux de bord' },
    { id: 'dashboard-teacher', label: '2. Dashboard Enseignant', group: 'Tableaux de bord' },
    { id: 'dashboard-admin', label: '3. Dashboard Admin', group: 'Tableaux de bord' },
    { id: 'courses-student', label: '4. Mes cours Élève', group: 'Pédagogie' },
    { id: 'course-detail', label: '5. Détail d\'un cours', group: 'Pédagogie' },
    { id: 'lesson-reader', label: '6. Lecteur de leçon', group: 'Pédagogie' },
    { id: 'quiz', label: '7. Quiz – Élève', group: 'Évaluations' },
    { id: 'assignments', label: '8. Devoirs / Évaluations', group: 'Évaluations' },
    { id: 'grades', label: '9. Relevé de notes ECTS', group: 'Évaluations' },
    { id: 'calendar', label: '10. Calendrier Élève', group: 'Organisation' },
    { id: 'resources', label: '11. Ressources', group: 'Organisation' },
    { id: 'forum', label: '12. Forum Universitaire', group: 'Organisation' },
    { id: 'profile', label: '13. Profil Élève', group: 'Compte' },
    { id: 'settings', label: '14. Paramètres & Notifs', group: 'Compte' },
    { id: 'notifications', label: '15. Centre de Notifications', group: 'Compte' },
    { id: 'users-management', label: '16. Gestion Utilisateurs', group: 'Administration' },
    { id: 'courses-management', label: '17. Gestion des Cours', group: 'Administration' },
    { id: 'ui-components', label: '18. Composants UI (Styleguide)', group: 'Design System' },
    { id: 'login', label: '0. Écran Connexion', group: 'Authentification' }
  ];

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  const mapApiUser = (user: any): CurrentUser => ({
    id: Number(user.id),
    name: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    email: user.email || '',
    role: user.role === 'admin' || user.role === 'teacher' ? user.role : 'student',
    avatarInitials: user.avatar_initials || `${(user.firstname || 'U').charAt(0)}${(user.lastname || '').charAt(0)}`.toUpperCase(),
    avatarUrl: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    phone: user.phone || '',
    bio: user.bio || '',
  });

  const handleLoginSubmit = async (e?: React.FormEvent, overrides?: { email?: string; password?: string }) => {
    if (e) e.preventDefault();
    setIsLoginSubmitting(true);
    setLoginError('');
    try {
      const response = await fetch('/lms/api/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: (overrides?.email ?? loginEmail).trim().toLowerCase(),
          password: overrides?.password ?? loginPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.error || 'Identifiants incorrects. Vérifiez votre email et votre mot de passe.');
      }
      setCurrentUser(mapApiUser(data.user));
      setCsrfToken(data.csrf_token || '');
      setIsAuthenticated(true);
      setActiveScreen(data.user.role === 'admin' ? 'dashboard-admin' : data.user.role === 'teacher' ? 'dashboard-teacher' : 'dashboard-student');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Connexion impossible. Vérifiez que XAMPP et MySQL sont démarrés.');
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/lms/api/auth/logout.php', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
    } finally {
      setIsAuthenticated(false);
      setCsrfToken('');
      setMyCourses([]);
      setCatalogCourses([]);
      setActiveScreen('landing');
      setIsAccountMenuOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleRegisterSuccess = (newUser: CurrentUser) => {
    setRegisteredAccounts((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    if (newUser.role === 'teacher') {
      setActiveScreen('dashboard-teacher');
    } else if (newUser.role === 'admin') {
      setActiveScreen('dashboard-admin');
    } else {
      setActiveScreen('dashboard-student');
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/lms/api/auth/me.php', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Session indisponible');
        if (!cancelled && data.authenticated && data.user) {
          setCurrentUser(mapApiUser(data.user));
          setCsrfToken(data.csrf_token || '');
          setIsAuthenticated(true);
          setActiveScreen(data.user.role === 'admin' ? 'dashboard-admin' : data.user.role === 'teacher' ? 'dashboard-teacher' : 'dashboard-student');
        }
      })
      .catch(() => {
        if (!cancelled) setIsAuthenticated(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || currentUser.role !== 'student') return;
    let cancelled = false;
    setCoursesLoading(true);
    setCoursesError('');
    Promise.all([
      fetch('/lms/api/courses/list.php?scope=catalog', { credentials: 'include', headers: { Accept: 'application/json' } }),
      fetch('/lms/api/courses/list.php', { credentials: 'include', headers: { Accept: 'application/json' } }),
    ])
      .then(async ([catalogResponse, enrolledResponse]) => {
        const [catalogData, enrolledData] = await Promise.all([catalogResponse.json(), enrolledResponse.json()]);
        if (!catalogResponse.ok || !catalogData.success) throw new Error(catalogData.error || 'Impossible de charger le catalogue.');
        if (!enrolledResponse.ok || !enrolledData.success) throw new Error(enrolledData.error || 'Impossible de charger vos cours.');
        if (!cancelled) {
          setCatalogCourses(Array.isArray(catalogData.courses) ? catalogData.courses : []);
          setMyCourses(Array.isArray(enrolledData.courses) ? enrolledData.courses : []);
        }
      })
      .catch((error) => {
        if (!cancelled) setCoursesError(error instanceof Error ? error.message : 'Erreur lors du chargement des cours.');
      })
      .finally(() => { if (!cancelled) setCoursesLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated, currentUser.id, currentUser.role, activeScreen]);

  useEffect(() => {
    if (!isAuthenticated || !['course-detail', 'lesson-reader'].includes(activeScreen)) return;
    let cancelled = false;
    setCourseContentLoading(true);
    fetch(`/lms/api/courses/detail.php?id=${selectedCourseId}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Impossible de charger le contenu du cours.');
        if (!cancelled) setCourseContent(data);
      })
      .catch((error) => {
        if (!cancelled) setCoursesError(error instanceof Error ? error.message : 'Erreur de chargement du cours.');
      })
      .finally(() => { if (!cancelled) setCourseContentLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated, activeScreen, selectedCourseId]);

  const markLessonComplete = async (lessonId: number, completed: boolean) => {
    try {
      const response = await fetch('/lms/api/courses/progress.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ lesson_id: lessonId, is_completed: completed ? 1 : 0 }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Impossible d’enregistrer la progression.');
      setCourseContent((previous: any) => previous ? ({
        ...previous,
        chapters: previous.chapters.map((chapter: any) => ({
          ...chapter,
          lessons: (chapter.lessons || []).map((lesson: any) => Number(lesson.id) === lessonId ? { ...lesson, is_completed: completed ? 1 : 0 } : lesson),
        })),
      }) : previous);
      setCompletedLessons((previous) => completed ? [...new Set([...previous, lessonId])] : previous.filter((id) => id !== lessonId));
    } catch (error) {
      setCoursesError(error instanceof Error ? error.message : 'Progression non enregistrée.');
    }
  };

  const handleEnrollCourse = async (courseId: number) => {
    setEnrollingCourseId(courseId);
    setCoursesError('');
    try {
      let token = csrfToken;
      if (!token) {
        const sessionResponse = await fetch('/lms/api/auth/me.php', { credentials: 'include' });
        const sessionData = await sessionResponse.json();
        token = sessionData.csrf_token || '';
        setCsrfToken(token);
      }
      const response = await fetch('/lms/api/courses/enroll.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-Token': token },
        body: JSON.stringify({ action: 'enroll', course_id: courseId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Inscription au cours impossible.');
      const [catalogResponse, enrolledResponse] = await Promise.all([
        fetch('/lms/api/courses/list.php?scope=catalog', { credentials: 'include' }),
        fetch('/lms/api/courses/list.php', { credentials: 'include' }),
      ]);
      const [catalogData, enrolledData] = await Promise.all([catalogResponse.json(), enrolledResponse.json()]);
      setCatalogCourses(catalogData.courses || []);
      setMyCourses(enrolledData.courses || []);
    } catch (error) {
      setCoursesError(error instanceof Error ? error.message : 'Inscription au cours impossible.');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  useEffect(() => {
    if (currentUser.role === 'admin' && ['course-detail', 'lesson-reader', 'quiz'].includes(activeScreen)) {
      setActiveScreen('courses-management');
    }
  }, [currentUser.role, activeScreen]);

  const updateNotificationPreference = (key: keyof typeof notificationPreferences, checked: boolean) => {
    const updated = { ...notificationPreferences, [key]: checked };
    setNotificationPreferences(updated);
    setSettingsSaved(false);
    try {
      localStorage.setItem('lms-notification-preferences', JSON.stringify(updated));
    } catch {
      // Preferences remain active for this session when browser storage is unavailable.
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('lms-notification-preferences', JSON.stringify(notificationPreferences));
    } catch {
      // Preferences still remain in state for this session.
    }
    setSettingsSaved(true);
  };

  const activeTheme = THEME_OPTIONS.find((theme) => theme.id === selectedThemeId) ?? THEME_OPTIONS[0];

  useEffect(() => {
    try {
      localStorage.setItem('lms-theme', selectedThemeId);
    } catch {
      // No browser storage available; theme remains in memory for this session.
    }
  }, [selectedThemeId]);

  const themeStyles = {
    '--color-primary': activeTheme.primary,
    '--color-primary-hover': activeTheme.secondary,
    '--color-primary-dark': activeTheme.secondary,
    '--color-accent': activeTheme.id === 'anthracite' ? '#A16207' : activeTheme.accent,
    '--color-primary-light': activeTheme.soft,
    '--color-primary-subtle': activeTheme.soft,
    '--color-background': activeTheme.soft,
    '--color-surface': '#FFFFFF',
    '--color-surface-muted': '#F8FAFC',
    '--color-text': '#0F172A',
    '--color-text-muted': '#64748B',
    '--color-border': '#E2E8F0',
  } as React.CSSProperties;

  const demoModeNotice = (
    <p className="academic-demo-note" role="note">
      Démonstration locale : cette connexion n’utilise pas les sessions ni l’authentification PHP.
    </p>
  );

  return (
    <div className="academic-app flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans" style={themeStyles}>
      {/* Access Gate: If visitor is NOT authenticated, only show Landing, Signup, or Login */}
      {!isAuthenticated ? (
        activeScreen === 'signup' ? (
          <SignupPage
            initialRole={signupInitialRole}
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setActiveScreen('login')}
            onNavigateToLanding={() => setActiveScreen('landing')}
          />
        ) : activeScreen === 'login' ? (
          <main className="modern-auth-shell">
            <div className={`modern-auth-container${authPanel === 'signup' ? ' active' : ''}`} id="modern-auth-container">
              <SignupPage
                embedded
                initialRole={signupInitialRole}
                onRegisterSuccess={handleRegisterSuccess}
                onNavigateToLogin={() => setAuthPanel('login')}
                onNavigateToLanding={() => setActiveScreen('landing')}
              />

              <div className="form-container sign-in">
                <form onSubmit={handleLoginSubmit}>
                  <h1>Connexion</h1>
                  <div className="social-icons">
                    <span className="icon"><GraduationCap className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="icon"><BookOpen className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="icon"><Shield className="h-4 w-4" aria-hidden="true" /></span>
                  </div>
                  <span>ou utilisez votre compte universitaire</span>

                  {loginError && (
                    <div role="alert" className="modern-auth-error">{loginError}</div>
                  )}

                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Email universitaire"
                    aria-label="Email universitaire"
                  />
                  <div className="password-field">
                    <input
                      type={loginShowPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Mot de passe"
                      aria-label="Mot de passe"
                    />
                    <button type="button" className="password-toggle-small" onClick={() => setLoginShowPassword((v) => !v)} aria-label={loginShowPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                      {loginShowPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>

                  <a href="#" onClick={() => setLoginError('Réinitialisation de mot de passe : utilisez le compte universitaire de référence.')}>Mot de passe oublié ?</a>
                  <button type="submit" disabled={isLoginSubmitting}>
                    {isLoginSubmitting ? 'Connexion…' : 'Se connecter'}
                  </button>

                  <p className="modern-auth-register-prompt">
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      className="modern-auth-register-link"
                      onClick={() => { setSignupInitialRole('student'); setAuthPanel('signup'); }}
                    >
                      Créer un compte
                    </button>
                  </p>
                </form>
              </div>

              <div className="toggle-container">
                <div className="toggle">
                  <div className="toggle-panel toggle-left">
                    <h1>Bon retour !</h1>
                    <p>Connectez-vous pour retrouver vos cours, vos notes et votre espace d’apprentissage.</p>
                    <button className="toggle-action" id="login" type="button" onClick={() => setAuthPanel('login')}>Connexion</button>
                  </div>
                  <div className="toggle-panel toggle-right">
                    <h1>Bienvenue !</h1>
                    <p>Créez votre compte pour accéder à toutes les ressources de l’établissement.</p>
                    <button className="toggle-action" id="register" type="button" onClick={() => { setSignupInitialRole('student'); setAuthPanel('signup'); }}>Inscription</button>
                  </div>
                </div>
              </div>
            </div>
          </main>
      ) : (
        /* Visitor Default: Public Welcome Landing Page */
        <AcademicGreenLanding
          onNavigateToLogin={() => setActiveScreen('login')}
          onNavigateToSignup={() => { setSignupInitialRole('student'); setAuthPanel('signup'); setActiveScreen('login'); }}
        />
      )
    ) : activeScreen === 'landing' ? (
      /* Authenticated user optionally viewing public landing page */
      <div className="relative">
        <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#475569] sm:px-6">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#047857]" />
            <span>Connecté : <strong className="text-[#0F172A]">{currentUser.name}</strong></span>
          </span>
          <button
            onClick={() => {
              if (currentUser.role === 'teacher') setActiveScreen('dashboard-teacher');
              else if (currentUser.role === 'admin') setActiveScreen('dashboard-admin');
              else setActiveScreen('dashboard-student');
            }}
            className="min-h-10 rounded-lg border border-[#CBD5E1] px-3 text-xs font-semibold text-[#064E3B] hover:bg-[#ECFDF5]"
          >
            Retour à mon espace
          </button>
        </div>
        <AcademicGreenLanding
          onNavigateToLogin={() => setActiveScreen('login')}
          onNavigateToSignup={() => { setSignupInitialRole('student'); setAuthPanel('signup'); setActiveScreen('login'); }}
        />
      </div>
    ) : (
        /* Authenticated LMS Interface matching the 18 mockups */
        <div className="academic-dashboard flex flex-1 relative">
          {/* Mobile Drawer Backdrop */}
          {isMobileMenuOpen && (
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
              aria-hidden="true"
            />
          )}

          {/* Universal Left Sidebar matching all mockups */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 ${
              isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
            }`}
          >
            {/* Brand Header */}
            <div className="h-16 px-5 border-b border-[#F1F5F9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#047857] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[15px] text-[#0F172A] leading-tight">LMS Web</span>
                  <span className="text-[9.5px] uppercase tracking-wider font-semibold text-[#047857]">E-LEARNING</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Menu */}
            <div className="flex-1 p-3 space-y-6 overflow-y-auto">
              {currentUser.role === 'admin' ? (
                /* Admin Navigation Group */
                <div>
                  <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Gestion
                  </div>
                  <nav className="space-y-1">
                    <button
                      onClick={() => { setActiveScreen('dashboard-admin'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'dashboard-admin'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                      aria-current={activeScreen === 'dashboard-admin' ? 'page' : undefined}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Tableau de bord
                    </button>
                    <button
                      onClick={() => { setActiveScreen('users-management'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'users-management'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                      aria-current={activeScreen === 'users-management' ? 'page' : undefined}
                    >
                      <Users className="w-4 h-4" />
                      Utilisateurs
                    </button>
                    <button
                      onClick={() => { setActiveScreen('courses-management'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'courses-management'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                      aria-current={activeScreen === 'courses-management' ? 'page' : undefined}
                    >
                      <BookOpen className="w-4 h-4" />
                      Cours
                    </button>
                    <button
                      onClick={() => { setActiveScreen('dashboard-admin'); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
                    >
                      <Activity className="w-4 h-4" />
                      Activité plateforme
                    </button>
                    <button
                      onClick={() => { setActiveScreen('dashboard-admin'); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Signalements
                    </button>
                    <button
                      onClick={() => { setShowXamppModal(true); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
                    >
                      <FileText className="w-4 h-4" />
                      Journal système
                    </button>
                  </nav>
                </div>
              ) : currentUser.role === 'teacher' ? (
                /* Teacher Navigation Group */
                <div>
                  <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Navigation
                  </div>
                  <nav className="space-y-1">
                    <button
                      onClick={() => { setActiveScreen('dashboard-teacher'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'dashboard-teacher'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Tableau de bord
                    </button>
                    <button
                      onClick={() => { setActiveScreen('courses-management'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'courses-management'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Mes cours
                    </button>
                    <button
                      onClick={() => { setActiveScreen('assignments'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'assignments'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      Mes évaluations
                    </button>
                    <button
                      onClick={() => { setActiveScreen('forum'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'forum'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Forum
                    </button>
                    <button
                      onClick={() => { setActiveScreen('resources'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'resources'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <Folder className="w-4 h-4" />
                      Ressources
                    </button>
                    <button
                      onClick={() => { setActiveScreen('calendar'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'calendar'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Calendrier
                    </button>
                  </nav>
                </div>
              ) : (
                /* Student Navigation Group */
                <div>
                  <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Navigation
                  </div>
                  <nav className="space-y-1">
                    <button
                      onClick={() => { setActiveScreen('dashboard-student'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'dashboard-student'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Tableau de bord
                    </button>
                    <button
                      onClick={() => { setActiveScreen('courses-student'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'courses-student' || activeScreen === 'course-detail' || activeScreen === 'lesson-reader'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Mes cours
                    </button>
                    <button
                      onClick={() => { setActiveScreen('quiz'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'quiz' || activeScreen === 'assignments' || activeScreen === 'grades'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      Évaluations / Quiz
                    </button>
                    <button
                      onClick={() => { setActiveScreen('forum'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'forum'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Forum
                    </button>
                    <button
                      onClick={() => { setActiveScreen('resources'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'resources'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <Folder className="w-4 h-4" />
                      Ressources
                    </button>
                    <button
                      onClick={() => { setActiveScreen('calendar'); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                        activeScreen === 'calendar'
                          ? 'bg-[#047857] text-white font-semibold'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Calendrier
                    </button>
                  </nav>
                </div>
              )}

              {/* Compte Section */}
              <div>
                <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                  Compte
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => { setActiveScreen('profile'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                      activeScreen === 'profile'
                        ? 'bg-[#047857] text-white font-semibold'
                        : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profil
                  </button>
                  <button
                    onClick={() => { setActiveScreen('settings'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                      activeScreen === 'settings'
                        ? 'bg-[#047857] text-white font-semibold'
                        : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </button>
                  <button
                    onClick={() => { setActiveScreen('ui-components'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition ${
                      activeScreen === 'ui-components'
                        ? 'bg-[#047857] text-white font-semibold'
                        : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Composants UI
                  </button>
                </nav>
              </div>

            </div>

            {/* Bottom Current User Block with Real Portrait Photo */}
            <div className="p-3.5 border-t border-[#E2E8F0] flex items-center gap-3 bg-white">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#064E3B] text-white flex items-center justify-center font-semibold text-xs shrink-0 ring-2 ring-[#ECFDF5]">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-[#64748B] capitalize">
                  {currentUser.role === 'student' ? 'Étudiant' : currentUser.role === 'teacher' ? 'Enseignante' : 'Administrateur'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Déconnexion"
                className="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Top Navigation Bar with Hamburger on mobile */}
            <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="relative flex items-center gap-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-3 py-1.5 w-44 sm:w-64 md:w-72 focus-within:bg-white focus-within:border-[#047857] focus-within:ring-2 focus-within:ring-[#ECFDF5] transition">
                  <button
                    type="button"
                    onClick={() => searchResults[0] && openSearchResult(searchResults[0])}
                    className="shrink-0 text-[#94A3B8] hover:text-[#047857]"
                    aria-label="Lancer la recherche"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults[0]) openSearchResult(searchResults[0]);
                      if (e.key === 'Escape') setSearchQuery('');
                    }}
                    aria-label="Rechercher dans la plateforme"
                    aria-expanded={Boolean(normalizedQuery)}
                    aria-controls="global-search-results"
                    placeholder={
                      currentUser.role === 'admin'
                        ? 'Rechercher...'
                        : currentUser.role === 'teacher'
                        ? 'Rechercher un cours...'
                        : 'Rechercher un cours, ressource...'
                    }
                    className="w-full text-xs text-[#0F172A] placeholder-[#94A3B8] bg-transparent outline-none truncate"
                  />
                  {normalizedQuery && (
                    <div id="global-search-results" className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl z-50">
                      {searchResults.length ? searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => openSearchResult(result)}
                          className="w-full rounded-lg px-3 py-2 text-left hover:bg-[#ECFDF5] transition"
                        >
                          <span className="block truncate text-xs font-semibold text-[#0F172A]">{result.title}</span>
                          <span className="block truncate text-[11px] text-[#64748B]">{result.subtitle}</span>
                        </button>
                      )) : (
                        <p className="px-3 py-2 text-xs text-[#64748B]">Aucun résultat trouvé.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Secondary navigation shortcuts */}
                {currentUser.role === 'student' && (
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-[#475569] border-r border-[#E2E8F0] pr-3 mr-1">
                    <button
                      onClick={() => setActiveScreen('assignments')}
                      className={`px-2.5 py-1 rounded transition ${activeScreen === 'assignments' ? 'bg-[#ECFDF5] text-[#047857] font-medium' : 'hover:bg-slate-100'}`}
                    >
                      Devoirs
                    </button>
                    <button
                      onClick={() => setActiveScreen('grades')}
                      className={`px-2.5 py-1 rounded transition ${activeScreen === 'grades' ? 'bg-[#ECFDF5] text-[#047857] font-medium' : 'hover:bg-slate-100'}`}
                    >
                      Notes ECTS
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowNotificationsModal(true)}
                  className="w-9 h-9 rounded-lg border border-transparent hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center relative transition"
                >
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#10B981]" />
                  )}
                </button>

                {/* Gmail-Style Account Switcher Popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className={`flex items-center gap-2 cursor-pointer p-0.5 rounded-full transition relative ${
                      isAccountMenuOpen
                        ? 'ring-2 ring-[#047857]'
                        : 'hover:ring-2 hover:ring-[#047857]/60'
                    }`}
                    title="Compte LMS (cliquer pour dérouler)"
                    aria-expanded={isAccountMenuOpen}
                  >
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
                    />
                  </button>

                  {/* Gmail Style Dropdown Card */}
                  {isAccountMenuOpen && (
                    <>
                      {/* Transparent backdrop to close on outside click */}
                      <div
                        className="fixed inset-0 z-40 bg-black/5"
                        onClick={() => setIsAccountMenuOpen(false)}
                      />

                      <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] z-50 overflow-hidden animate-in fade-in duration-150">
                        {/* Header: User Profile Info */}
                        <div className="p-5 pb-4 text-center border-b border-[#F1F5F9] relative bg-slate-50/70">
                          <div className="flex justify-between items-center text-xs text-[#64748B] mb-2 px-1">
                            <span className="font-mono text-[11px] truncate max-w-60">
                              {currentUser.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsAccountMenuOpen(false)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/60 transition"
                              title="Fermer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="relative inline-block my-1.5">
                            <img
                              src={currentUser.avatarUrl}
                              alt={currentUser.name}
                              className="w-18 h-18 rounded-full object-cover border-3 border-white shadow-md mx-auto"
                            />
                            <span
                              className={`absolute bottom-0.5 right-1 w-4 h-4 rounded-full border-2 border-white ${
                                currentUser.role === 'admin'
                                  ? 'bg-rose-500'
                                  : currentUser.role === 'teacher'
                                  ? 'bg-blue-500'
                                  : 'bg-[#10B981]'
                              }`}
                              title="Compte actif"
                            />
                          </div>

                          <h3 className="font-bold text-sm text-[#0F172A] mt-1.5">
                            Bonjour, {currentUser.firstname || currentUser.name.split(' ')[0]} !
                          </h3>
                          <p className="text-xs text-[#64748B] font-medium">{currentUser.name}</p>
                          
                          <div className="mt-1 flex items-center justify-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#047857] border border-emerald-200">
                              {currentUser.role === 'admin'
                                ? 'Administrateur Système'
                                : currentUser.role === 'teacher'
                                ? 'Enseignante Chercheuse'
                                : 'Étudiant (Licence 3)'}
                            </span>
                          </div>

                          {/* "Gérer votre compte" button faithful to Google's "Gérer votre compte Google" */}
                          <div className="mt-3.5">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveScreen('profile');
                                setIsAccountMenuOpen(false);
                              }}
                              className="px-4 py-2 border border-[#CBD5E1] hover:border-[#047857] hover:bg-white text-[#0F172A] hover:text-[#047857] text-xs font-semibold rounded-full transition shadow-2xs inline-flex items-center gap-1.5"
                            >
                              <User className="w-3.5 h-3.5 text-[#047857]" />
                              Gérer votre compte
                            </button>
                          </div>
                        </div>

                        {/* Middle: Registered Accounts List */}
                        <div className="p-3">
                          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
                            <span>Comptes enregistrés</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                              {registeredAccounts.length}
                            </span>
                          </div>

                          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                            {registeredAccounts.map((account) => {
                              const isCurrent = account.id === currentUser.id;
                              return (
                                <button
                                  type="button"
                                  key={account.id}
                                  onClick={() => selectAccount(account)}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition text-left ${
                                    isCurrent
                                      ? 'bg-[#ECFDF5] border border-emerald-200'
                                      : 'hover:bg-slate-50 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={account.avatarUrl}
                                      alt={account.name}
                                      className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-[#0F172A] truncate">
                                        {account.name}
                                      </p>
                                      <p className="text-[11px] text-[#64748B] truncate">
                                        {account.email}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5 pl-2">
                                    {isCurrent ? (
                                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#047857] bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                                        <Check className="w-3 h-3 text-[#10B981]" />
                                        Actif
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                                        {account.role === 'admin'
                                          ? 'Admin'
                                          : account.role === 'teacher'
                                          ? 'Prof'
                                          : 'Élève'}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* "Ajouter un autre compte" like in Gmail */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsAccountMenuOpen(false);
                              setShowAddAccountModal(true);
                            }}
                            className="w-full mt-2 flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition border border-dashed border-[#CBD5E1]"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#047857]">
                              <UserPlus className="w-4 h-4" />
                            </div>
                            <span>Ajouter un autre compte</span>
                          </button>
                        </div>

                        {/* Bottom Actions: Paramètres du compte & Déconnexion */}
                        <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] p-3 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveScreen('settings');
                              setIsAccountMenuOpen(false);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl hover:bg-white hover:shadow-2xs text-xs font-medium text-[#475569] transition border border-transparent hover:border-[#E2E8F0]"
                          >
                            <Settings className="w-3.5 h-3.5 text-[#047857]" />
                            <span>Paramètres</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl hover:bg-rose-50 hover:text-rose-700 text-xs font-medium text-[#475569] transition border border-transparent hover:border-rose-200"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* Dynamic Screen Contents (18 screens faithful to mockup) */}
            <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto w-full">
              {/* SCREEN 1: Dashboard – Élève */}
              {activeScreen === 'dashboard-student' && (
                <div className="space-y-6 w-full">
                  {/* Greeting & Progress Banner */}
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-xl font-bold text-[#0F172A]">Bonjour, {currentUser.firstname || currentUser.name}</h1>
                      <p className="text-xs text-[#64748B] mt-0.5">Continuez votre apprentissage, vous êtes sur la bonne voie.</p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 flex items-center gap-3 shadow-xs" aria-label="Progression globale">
                      <div>
                        <div className="text-xs text-[#64748B]">Progression globale</div>
                        <div className="text-sm font-bold text-[#0F172A]">—</div>
                      </div>
                    </div>
                  </div>


                  {/* Cours récents et accès au calendrier */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="md:col-span-2 rounded-xl border border-dashed border-[#CBD5E1] bg-white p-6">
                      <h2 className="text-base font-semibold text-[#0F172A]">Vos cours apparaîtront ici</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">Aucun cours n’est chargé depuis le compte connecté dans cette interface.</p>
                    </div>

                    {/* Accès calendrier */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <div className="flex h-full flex-col items-start justify-between gap-5">
                        <div><h3 className="text-sm font-semibold text-[#0F172A]">Calendrier universitaire</h3><p className="mt-2 text-sm leading-6 text-[#64748B]">Consultez les dates et événements associés à votre compte.</p></div>
                        <button type="button" onClick={() => setActiveScreen('calendar')} className="min-h-10 rounded-lg border border-[#CBD5E1] px-4 text-sm font-semibold text-[#064E3B] hover:bg-[#ECFDF5]">Ouvrir le calendrier</button>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row : Temps d'apprentissage & À faire */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Temps d'apprentissage */}
                    <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-[#0F172A]">Temps d’apprentissage</h3>
                          <p className="text-[11px] text-[#64748B]">Cette semaine</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ECFDF5] text-[#047857] rounded text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          —
                        </div>
                      </div>

                      {/* Bar chart mockup faithful to screenshot */}
                      <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] px-4 py-6 text-center">
                        <p className="max-w-md text-sm leading-6 text-[#64748B]">Aucune durée d’apprentissage n’est disponible pour le compte connecté.</p>
                      </div>
                    </div>

                    {/* À faire */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-[#0F172A]">À faire</h3>
                          <button onClick={() => setActiveScreen('assignments')} className="text-xs text-[#047857] hover:underline font-medium">
                            Voir tout
                          </button>
                        </div>

                        <div className="rounded-lg border border-dashed border-[#E2E8F0] p-4">
                          <p className="text-sm leading-6 text-[#64748B]">Aucune échéance n’est disponible pour ce compte dans l’interface actuelle.</p>
                          <button type="button" onClick={() => setActiveScreen('assignments')} className="mt-3 min-h-10 text-sm font-semibold text-[#047857] hover:underline">Consulter les devoirs</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progression et accès aux ressources */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-[#0F172A]">Mes cours</h3>
                        <button onClick={() => setActiveScreen('courses-student')} className="text-xs text-[#047857] hover:underline font-medium">
                          Voir tout
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-[#E2E8F0] p-5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm leading-6 text-[#64748B]">Les cours et leur progression s’afficheront lorsqu’ils seront chargés pour votre compte.</p>
                          <button type="button" onClick={() => setActiveScreen('courses-student')} className="min-h-10 shrink-0 rounded-lg bg-[#047857] px-4 text-sm font-semibold text-white hover:bg-[#065F46]">Consulter mes cours</button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                      <h3 className="text-sm font-semibold text-[#0F172A]">Ressources</h3>
                      <p className="mt-2 text-sm leading-6 text-[#64748B]">Consultez les documents accessibles à votre profil.</p>
                      <button type="button" onClick={() => setActiveScreen('resources')} className="mt-4 min-h-10 rounded-lg border border-[#CBD5E1] px-4 text-sm font-semibold text-[#064E3B] hover:bg-[#ECFDF5]">Ouvrir les ressources</button>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 2: Dashboard – Enseignant */}
              {activeScreen === 'dashboard-teacher' && (
                <div className="space-y-6 w-full">
                  {/* Greeting */}
                  <div>
                    <h1 className="text-xl font-bold text-[#0F172A]">Bonjour, {currentUser.firstname || currentUser.name}</h1>
                    <p className="text-xs text-[#64748B] mt-0.5">Voici un aperçu de votre activité d'enseignement.</p>
                  </div>


                  {/* 4 Stat KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                      <p className="text-xs text-[#64748B]">Mes cours</p>
                      <p className="text-2xl font-bold text-[#0F172A] mt-1">—</p>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                      <p className="text-xs text-[#64748B]">Étudiants</p>
                      <p className="text-2xl font-bold text-[#0F172A] mt-1">—</p>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                      <p className="text-xs text-[#64748B]">Quiz</p>
                      <p className="text-2xl font-bold text-[#0F172A] mt-1">—</p>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                      <p className="text-xs text-[#64748B]">À corriger</p>
                      <p className="text-2xl font-bold text-[#0F172A] mt-1">—</p>
                    </div>
                  </div>

                  {/* Middle Row : Mes cours & Actions rapides */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Mes cours table */}
                    <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-[#0F172A]">Mes cours</h3>
                        <button onClick={() => setActiveScreen('courses-management')} className="text-xs text-[#047857] hover:underline font-medium">
                          Voir tout
                        </button>
                      </div>

                      <p className="rounded-lg border border-dashed border-[#E2E8F0] p-4 text-sm leading-6 text-[#64748B]">Les cours attribués à votre compte s’afficheront ici.</p>
                    </div>

                    {/* Actions rapides */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Actions rapides</h3>
                      <p className="mb-3 text-xs text-[#64748B]">Les créations persistantes sont disponibles dans l’application PHP.</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveScreen('courses-management')}
                          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/40 text-xs font-medium text-[#0F172A] transition text-left"
                        >
                          <Plus className="w-4 h-4 text-[#047857]" />
                          Gérer les cours
                        </button>
                        <button
                          onClick={() => setActiveScreen('quiz')}
                          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/40 text-xs font-medium text-[#0F172A] transition text-left"
                        >
                          <Plus className="w-4 h-4 text-[#047857]" />
                          Ouvrir les quiz
                        </button>
                        <button
                          onClick={() => setActiveScreen('assignments')}
                          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/40 text-xs font-medium text-[#0F172A] transition text-left"
                        >
                          <FileCheck className="w-4 h-4 text-[#047857]" />
                          Voir les devoirs
                        </button>
                        <button
                          onClick={() => setActiveScreen('users-management')}
                          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/40 text-xs font-medium text-[#0F172A] transition text-left"
                        >
                          <Users className="w-4 h-4 text-[#047857]" />
                          Mes étudiants (aucune donnée connectée)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row : Activité récente & Évaluations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <h3 className="text-sm font-semibold text-[#0F172A]">Évaluations</h3>
                      <p className="mt-3 text-sm leading-6 text-[#64748B]">Consultez et corrigez les devoirs disponibles dans votre espace.</p>
                      <button type="button" onClick={() => setActiveScreen('assignments')} className="mt-4 min-h-10 rounded-lg bg-[#047857] px-4 text-sm font-semibold text-white hover:bg-[#065F46]">Ouvrir les devoirs</button>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Devoirs à corriger</h3>
                      <p className="text-sm leading-6 text-[#64748B]">Le nombre de devoirs à corriger apparaîtra avec les soumissions de votre compte.</p>
                      <button type="button" onClick={() => setActiveScreen('assignments')} className="mt-4 min-h-10 rounded-lg border border-[#CBD5E1] px-4 text-sm font-semibold text-[#064E3B] hover:bg-[#ECFDF5]">Consulter les devoirs</button>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 3: Dashboard – Administrateur */}
              {activeScreen === 'dashboard-admin' && (
                <div className="space-y-6 w-full">
                  {/* Greeting */}
                  <div>
                    <h1 className="text-xl font-bold text-[#0F172A]">Bonjour, {currentUser.firstname || currentUser.name}</h1>
                    <p className="text-xs text-[#64748B] mt-0.5">Vue des comptes locaux de cette session.</p>
                  </div>


                  {/* 4 KPIs Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                      <p className="text-xs text-[#64748B]">Comptes locaux</p>
                      <p className="text-2xl font-bold text-[#0F172A] mt-1">{registeredAccounts.length}</p>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                      <p className="text-xs text-[#64748B]">Enseignants</p>
                      <p className="text-2xl font-bold text-[#0F172A] mt-1">{adminTeacherCount}</p>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                      <p className="text-xs text-[#64748B]">Cours</p>
                      <p className="text-2xl font-bold text-[#0F172A] mt-1">{coursesList.length}</p>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
                      <p className="text-xs text-[#64748B]">Quiz</p>
                      <p className="text-2xl font-bold text-[#0F172A] mt-1">—</p>
                    </div>
                  </div>

                  {/* Middle Row : Activité de la plateforme & Actions rapides */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Répartition des rôles disponibles dans les comptes locaux */}
                    <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-[#0F172A]">Répartition des rôles</h3>
                        <span className="text-xs text-[#64748B]">Cette session</span>
                      </div>
                      <p className="mb-4 text-xs leading-5 text-[#64748B]">Ces nombres comptent uniquement les comptes chargés dans cette session.</p>
                      <div className="divide-y divide-[#E2E8F0]">
                        {([
                          ['Étudiants', adminStudentCount],
                          ['Enseignants', adminTeacherCount],
                          ['Administrateurs', adminCount],
                        ] as const).map(([label, count]) => (
                          <div key={label} className="flex items-center justify-between py-3 text-sm">
                            <span className="text-[#475569]">{label}</span>
                            <span className="font-semibold tabular-nums text-[#0F172A]">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Actions rapides</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => { openAdminUserModal(); }}
                          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/40 text-xs font-medium text-[#0F172A] transition text-left"
                        >
                          <Plus className="w-4 h-4 text-[#047857]" />
                          Ajouter un utilisateur
                        </button>
                        <button
                          onClick={() => setActiveScreen('courses-management')}
                          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/40 text-xs font-medium text-[#0F172A] transition text-left"
                        >
                          <Plus className="w-4 h-4 text-[#047857]" />
                          Consulter le catalogue des cours
                        </button>
                        <button
                          onClick={() => setActiveScreen('users-management')}
                          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/40 text-xs font-medium text-[#0F172A] transition text-left"
                        >
                          <Shield className="w-4 h-4 text-[#047857]" />
                          Gérer les rôles
                        </button>
                        <button
                          onClick={() => setShowXamppModal(true)}
                          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#047857] hover:bg-[#ECFDF5]/40 text-xs font-medium text-[#0F172A] transition text-left"
                        >
                          <FileText className="w-4 h-4 text-[#047857]" />
                          Consulter les informations système
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row : Utilisateurs récents & Signalements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Utilisateurs récents */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Comptes enregistrés dans cette session</h3>
                      <div className="space-y-3">
                        {registeredAccounts.slice(0, 5).map((u) => (
                          <div key={u.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
                              />
                              <div>
                                <p className="text-xs font-semibold text-[#0F172A]">{u.name}</p>
                                <p className="text-[11px] text-[#64748B]">{u.email} · {u.role}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signalements */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
                      <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Signalements</h3>
                      <div className="space-y-3">
                        <p className="text-sm text-[#64748B]">Aucun signalement n’est disponible.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 4: Catalogue et cours inscrits */}
              {activeScreen === 'courses-student' && (
                <div className="space-y-7 w-full">
                  <div>
                    <h1 className="text-xl font-bold text-[#0F172A]">Mes cours</h1>
                    <p className="text-xs text-[#64748B] mt-1">Retrouvez vos cours inscrits ou découvrez le catalogue pour commencer une formation.</p>
                  </div>
                  {coursesError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{coursesError}</div>}
                  {coursesLoading && <p className="text-sm text-[#64748B]">Chargement des cours depuis la base de données…</p>}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold text-[#0F172A]">Mes inscriptions <span className="text-xs font-normal text-[#64748B]">({myCourses.length})</span></h2>
                    </div>
                    {myCourses.length === 0 && !coursesLoading ? (
                      <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-5 text-sm text-[#64748B]">Vous n’êtes inscrit à aucun cours pour le moment. Choisissez un cours dans le catalogue ci-dessous.</div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {myCourses.map((course) => (
                          <article key={course.id} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-[10px] font-mono font-semibold text-[#047857]">{course.code}</span>
                                <h3 className="mt-1 text-sm font-semibold text-[#0F172A]">{course.title}</h3>
                                <p className="mt-1 text-xs text-[#64748B]">{course.category_name || 'Sans catégorie'} · {course.level || 'Niveau non précisé'}</p>
                                <p className="mt-1 text-xs text-[#64748B]">Enseignant : {course.teacher_firstname || ''} {course.teacher_lastname || ''}</p>
                              </div>
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">{course.enrollment_status === 'termine' ? 'Terminé' : 'En cours'}</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Number(course.progress_percent) || 0}%` }} /></div>
                              <span className="text-xs font-semibold text-slate-700">{Number(course.progress_percent) || 0}%</span>
                            </div>
                            <button type="button" onClick={() => { setSelectedCourseId(Number(course.id)); setActiveScreen('course-detail'); }} className="mt-3 rounded-lg bg-[#047857] px-4 py-2 text-xs font-semibold text-white hover:bg-[#065F46]">Ouvrir le cours</button>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                  <section className="space-y-3">
                    <div>
                      <h2 className="text-base font-semibold text-[#0F172A]">Catalogue des cours</h2>
                      <p className="text-xs text-[#64748B] mt-1">Les cours publiés par les enseignants sont chargés depuis MySQL.</p>
                    </div>
                    {catalogCourses.length === 0 && !coursesLoading ? (
                      <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-5 text-sm text-[#64748B]">Aucun cours publié n’est disponible. Demandez à un enseignant ou à un administrateur de publier un cours.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {catalogCourses.map((course) => {
                          const enrolled = myCourses.some((item) => Number(item.id) === Number(course.id));
                          return (
                            <article key={course.id} className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
                              <div className="flex-1">
                                <span className="rounded bg-[#ECFDF5] px-2 py-1 text-[10px] font-mono font-semibold text-[#047857]">{course.code}</span>
                                <h3 className="mt-3 text-sm font-semibold text-[#0F172A]">{course.title}</h3>
                                <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#64748B]">{course.description || 'Aucune description disponible.'}</p>
                                <div className="mt-3 space-y-1 text-[11px] text-[#64748B]">
                                  <p>{course.category_name || 'Sans catégorie'} · {course.level || 'Niveau non précisé'}</p>
                                  <p>Enseignant : {course.teacher_firstname || ''} {course.teacher_lastname || ''}</p>
                                  <p>{Number(course.total_chapters) || 0} chapitres · {Number(course.total_lessons) || 0} leçons</p>
                                </div>
                              </div>
                              <button type="button" disabled={enrolled || enrollingCourseId === Number(course.id)} onClick={() => handleEnrollCourse(Number(course.id))} className="mt-4 w-full rounded-lg bg-[#047857] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#065F46] disabled:cursor-not-allowed disabled:bg-slate-300">
                                {enrolled ? 'Déjà inscrit' : enrollingCourseId === Number(course.id) ? 'Inscription…' : 'S’inscrire au cours'}
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* SCREEN 5: Détail d'un cours */}
              {activeScreen === 'course-detail' && (
                <div className="space-y-6 w-full">
                  {/* Course Header Banner with Real Thumbnail */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden shadow-xs border border-slate-200 shrink-0">
                        <img
                          src={currentCourse.thumbnailUrl}
                          alt={currentCourse.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#047857] text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold shadow-xs">
                          {currentCourse.code}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded">
                            {currentCourse.category}
                          </span>
                          <span className="text-xs text-[#64748B]">Niveau : {currentCourse.level}</span>
                        </div>
                        <h1 className="text-xl font-bold text-[#0F172A]">{currentCourse.title}</h1>
                        <p className="text-xs text-[#64748B] mt-1 max-w-xl">
                          Programme officiel universitaire couvrant les architectures modernes, les bonnes pratiques de conception et les TP notés.
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="w-48 sm:w-60 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#047857] rounded-full" style={{ width: '73%' }} />
                          </div>
                          <span className="text-xs font-bold text-[#0F172A]">73%</span>
                          <span className="text-xs text-[#64748B]">4 / 6 chapitres validés</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs : Contenu, Ressources, Forum, Notes */}
                  <div className="flex items-center gap-2 border-b border-[#E2E8F0] overflow-x-auto">
                    <button className="px-4 py-2 border-b-2 border-[#047857] text-[#047857] font-semibold text-xs -mb-px shrink-0">
                      Contenu du cours
                    </button>
                    <button onClick={() => setActiveScreen('resources')} className="px-4 py-2 text-[#64748B] hover:text-[#0F172A] font-medium text-xs shrink-0">
                      Ressources (4)
                    </button>
                    <button onClick={() => setActiveScreen('forum')} className="px-4 py-2 text-[#64748B] hover:text-[#0F172A] font-medium text-xs shrink-0">
                      Forum du cours
                    </button>
                    <button onClick={() => setActiveScreen('grades')} className="px-4 py-2 text-[#64748B] hover:text-[#0F172A] font-medium text-xs shrink-0">
                      Notes & Barème
                    </button>
                  </div>

                  {/* Main Grid : Chapters & Sidebar Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chapters List with specialized media icons */}
                    <div className="lg:col-span-2 space-y-3">
                      {(courseContent?.chapters || []).map((chapter: any) => (
                        <div key={chapter.id} className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
                          <div className="border-b border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3">
                            <h3 className="text-xs font-semibold text-[#0F172A]">{chapter.title}</h3>
                          </div>
                          {(chapter.lessons || []).length === 0 ? (
                            <p className="px-4 py-3 text-xs text-[#64748B]">Aucune leçon publiée dans ce chapitre.</p>
                          ) : (chapter.lessons || []).map((lesson: any) => (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => { setSelectedLessonId(Number(lesson.id)); setActiveScreen('lesson-reader'); }}
                              className="flex w-full items-center justify-between gap-3 border-b border-[#F1F5F9] px-4 py-3 text-left last:border-b-0 hover:bg-[#F8FAFC]"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-[#0F172A]">{lesson.title}</span>
                                <span className="mt-1 block text-[11px] text-[#64748B]">{lesson.lesson_type || 'Leçon'}{lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ''}</span>
                              </span>
                              {Number(lesson.is_completed) === 1
                                ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                                : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
                            </button>
                          ))}
                        </div>
                      ))}

                        <div
                          key={ch.num}
                          onClick={() => {
                            if (!ch.locked) {
                              setSelectedLessonId(ch.num);
                              setActiveScreen('lesson-reader');
                            }
                          }}
                          className={`bg-white border rounded-xl p-4 shadow-xs flex items-center justify-between transition cursor-pointer ${
                            ch.current
                              ? 'border-[#047857] ring-2 ring-[#047857]/20 bg-[#ECFDF5]/10'
                              : 'border-[#E2E8F0] hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-9 h-9 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold text-xs shrink-0">
                              {ch.type === 'video' ? (
                                <Video className="w-4 h-4 text-[#047857]" />
                              ) : ch.type === 'code' ? (
                                <Terminal className="w-4 h-4 text-[#047857]" />
                              ) : ch.type === 'lab' ? (
                                <FileCode className="w-4 h-4 text-[#047857]" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-[#047857]" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-[#0F172A] block truncate">{ch.title}</span>
                              <span className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                                <span className="uppercase text-[9.5px] font-bold text-[#047857] bg-[#ECFDF5] px-1.5 py-0.2 rounded">
                                  {ch.type}
                                </span>
                                <span>{ch.duration}</span>
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 ml-3">
                            {ch.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#047857]" />
                            ) : ch.current ? (
                              <span className="px-2.5 py-1 bg-[#047857] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">
                                <Play className="w-3 h-3 fill-white" /> En cours
                              </span>
                            ) : (
                              <Lock className="w-4 h-4 text-[#94A3B8]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Info Box with Professor Photo */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-5">
                      <div>
                        <h3 className="text-xs font-semibold text-[#0F172A] mb-3">Informations académiques</h3>
                        <div className="space-y-2 text-xs text-[#64748B]">
                          <p className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#047857]" />
                            5 chapitres pédagogiques
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#047857]" />
                            12h de contenu & TPs
                          </p>
                          <p className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#047857]" />
                            Coefficient 2.0 • 5 Crédits ECTS
                          </p>
                        </div>
                      </div>

                      {/* Verified Teacher Card with Real Photo */}
                      <div className="border-t border-[#F1F5F9] pt-4">
                        <h4 className="text-xs font-semibold text-[#0F172A] mb-2.5">Enseignante responsable</h4>
                        <div className="flex items-center gap-3">
                          <img
                            src={currentCourse.instructorAvatar}
                            alt={currentCourse.instructorName}
                            className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/20"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0F172A] truncate">{currentCourse.instructorName}</p>
                            <p className="text-[11px] text-[#047857] font-medium">Maître de Conférences</p>
                            <p className="text-[10px] text-[#64748B] truncate">Département Informatique</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => { setSelectedLessonId(3); setActiveScreen('lesson-reader'); }}
                        className="w-full py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg transition"
                      >
                        Reprendre la leçon 3.1
                      </button>

                      <div className="border-t border-[#F1F5F9] pt-4 text-center">
                        <span className="text-xs text-[#64748B] block mb-2">Progression globale</span>
                        <div className="w-16 h-16 rounded-full border-4 border-[#047857] border-t-transparent flex items-center justify-center mx-auto text-sm font-bold text-[#0F172A]">
                          72%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 6: Lecteur de cours / leçon */}
              {activeScreen === 'lesson-reader' && (
                <div className="mx-auto w-full max-w-5xl space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => setActiveScreen('course-detail')} className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A]">
                      <ArrowLeft className="h-4 w-4" /> Retour au cours
                    </button>
                    <span className="rounded bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#047857]">{courseContent?.chapters?.find((chapter: any) => (chapter.lessons || []).some((lesson: any) => Number(lesson.id) === selectedLessonId))?.title || currentCourse.title}</span>
                  </div>
                  {courseContentLoading ? (
                    <p className="text-sm text-[#64748B]">Chargement de la leçon…</p>
                  ) : currentLesson ? (
                    <article className="space-y-5 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
                      <div className="border-b border-[#F1F5F9] pb-4">
                        <h1 className="text-xl font-bold text-[#0F172A]">{currentLesson.title}</h1>
                        <p className="mt-2 text-xs text-[#64748B]">{currentLesson.duration_minutes ? `Durée estimée : ${currentLesson.duration_minutes} min` : 'Leçon du cours'} · {currentCourse.title}</p>
                      </div>
                      <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[#334155]">
                        {currentLesson.content || currentLesson.content_html || currentLesson.description || 'Le contenu de cette leçon n’a pas encore été renseigné par l’enseignant.'}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F1F5F9] pt-4">
                        <button type="button" onClick={() => markLessonComplete(selectedLessonId, Number(currentLesson.is_completed) !== 1)} className="rounded-lg bg-[#047857] px-4 py-2 text-xs font-semibold text-white hover:bg-[#065F46]">
                          {Number(currentLesson.is_completed) === 1 ? 'Annuler la validation' : 'Marquer comme terminée'}
                        </button>
                        <button type="button" onClick={() => setActiveScreen('quiz')} className="flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                          Accéder aux quiz <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-5 text-sm text-[#64748B]">Cette leçon n’est pas disponible. Revenez au cours et sélectionnez une leçon publiée.</div>
                  )}
                </div>
              )}

              {/* SCREEN 7: Quiz – Élève */}
              {activeScreen === 'quiz' && (
                <div className="space-y-6 w-full max-w-3xl mx-auto">
                  {/* Quiz Header matching mockup screen 7 */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold text-xs">
                        <Award className="w-5 h-5 text-[#047857]" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#0F172A]">Quiz – Variables et types</h2>
                        <p className="text-[11px] text-[#64748B]">Développement Web • 10 questions • 20 min</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded">
                      Question 3 / 10
                    </span>
                  </div>

                  {/* Question Card */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#64748B]">Question 3 / 10</span>
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">17:42 restant</span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#0F172A]">
                      Quelle est la bonne syntaxe pour déclarer une variable modifiable en JavaScript ?
                    </h3>

                    {/* Radio Options A, B, C, D */}
                    <div className="space-y-2.5">
                      {[
                        { key: 'a', text: 'let nom = "Jean";' },
                        { key: 'b', text: 'var nom = "Jean";' },
                        { key: 'c', text: 'const nom = "Jean";' },
                        { key: 'd', text: 'nom = "Jean";' }
                      ].map((opt) => (
                        <div
                          key={opt.key}
                          onClick={() => setSelectedQuizOption(opt.key)}
                          className={`p-3.5 rounded-lg border flex items-center gap-3 cursor-pointer transition ${
                            selectedQuizOption === opt.key
                              ? 'border-[#047857] bg-[#ECFDF5]/60 ring-1 ring-[#047857]'
                              : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedQuizOption === opt.key ? 'border-[#047857]' : 'border-[#CBD5E1]'
                          }`}>
                            {selectedQuizOption === opt.key && (
                              <div className="w-2 h-2 rounded-full bg-[#047857]" />
                            )}
                          </div>
                          <span className="font-mono text-xs text-[#0F172A]">{opt.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions : Précédent & Suivant */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
                      <button
                        onClick={() => setSelectedQuizOption('c')}
                        className="px-4 py-2 border border-[#CBD5E1] text-[#475569] hover:bg-slate-50 text-xs font-semibold rounded-lg transition"
                      >
                        Précédent
                      </button>

                      <button
                        onClick={() => {
                          setQuizScore(9); // 9 / 10
                        }}
                        className="px-5 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg transition"
                      >
                        Suivant →
                      </button>
                    </div>

                    {quizScore !== null && (
                      <div className="mt-4 p-4 rounded-lg bg-[#ECFDF5] border border-[#047857]/30 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#047857]">Résultat calculé côté serveur (PHP) :</p>
                          <p className="text-sm font-semibold text-[#0F172A]">Score : 9 / 10 (90%) - Réussi !</p>
                        </div>
                        <button
                          onClick={() => setActiveScreen('grades')}
                          className="px-3 py-1.5 bg-[#047857] text-white text-xs font-semibold rounded-lg"
                        >
                          Voir mes notes ECTS
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SCREEN 8: Devoirs / Évaluations */}
              {activeScreen === 'assignments' && (
                <div className="space-y-6 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-[#0F172A]">Devoirs & Évaluations</h1>
                      <p className="text-xs text-[#64748B] mt-0.5">Dépôt des travaux et consultation des corrections avec barème sur 20</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div className="space-y-6 w-full">
                            <img
                              src={sub.studentAvatar}
                              alt={sub.studentName}
                              className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                            />
                            <div>
                              <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded">
                                {sub.courseTitle}
                              </span>
                              <h3 className="text-sm font-bold text-[#0F172A] mt-1">{sub.title}</h3>
                              <p className="text-xs text-[#64748B]">Rendu par {sub.studentName} • {sub.submittedAt}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2.5 py-1 rounded font-semibold ${
                              sub.status === 'corrige'
                                ? 'bg-[#ECFDF5] text-[#047857]'
                                : 'bg-[#FEF3C7] text-amber-700'
                            }`}>
                              {sub.status === 'corrige' ? 'Corrigé' : 'En attente de correction'}
                            </span>
                          </div>
                        </div>

                        {sub.status === 'corrige' ? (
                          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-xs flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-[#0F172A]">Note attribuée : <span className="text-emerald-700 font-bold">{sub.grade} / 20</span></p>
                              <p className="text-[#64748B] mt-0.5">Appréciation : "{sub.feedback}"</p>
                            </div>
                          </div>
                        ) : currentUser.role === 'teacher' || currentUser.role === 'admin' ? (
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => {
                                setGradingSubmission(sub);
                              }}
                              className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg transition"
                            >
                              Corriger & Noter sur 20
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-[#64748B]">
                            Votre devoir a bien été enregistré. L'enseignant attribue la note prochainement.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN 9: Relevé de notes ECTS */}
              {activeScreen === 'grades' && (
                <div className="space-y-6 w-full">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-xl font-bold text-[#0F172A]">Relevé de notes officiel (ECTS)</h1>
                      <p className="text-xs text-[#64748B] mt-0.5">Année académique 2026-2027 • Licence 3 Informatique</p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-3 shadow-xs flex items-center gap-4">
                      <div>
                        <span className="text-[11px] text-[#64748B] block">Moyenne Générale</span>
                        <span className="text-xl font-bold text-[#047857]">14.84 / 20</span>
                      </div>
                      <div className="border-l border-[#E2E8F0] pl-4">
                        <span className="text-[11px] text-[#64748B] block">Crédits ECTS acquis</span>
                        <span className="text-xl font-bold text-[#0F172A]">25 / 30</span>
                      </div>
                    </div>
                  </div>

                  {/* Grades Table with Horizontal Overflow for Mobile */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] uppercase tracking-wider text-[#64748B] font-semibold">
                        <tr>
                          <th className="p-3.5">Code & Matière</th>
                          <th className="p-3.5 text-center">CC (40%)</th>
                          <th className="p-3.5 text-center">Examen (60%)</th>
                          <th className="p-3.5 text-center">Note Finale /20</th>
                          <th className="p-3.5 text-center">Coef</th>
                          <th className="p-3.5 text-center">ECTS</th>
                          <th className="p-3.5 text-center">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9] text-xs">
                        {[
                          { code: 'INF-103', name: 'Développement Web', cc: '17.50', exam: '16.00', final: '16.60', coef: '2.0', ects: '5', status: 'Validé' },
                          { code: 'INF-104', name: 'Bases de données', cc: '14.00', exam: '15.50', final: '14.90', coef: '2.0', ects: '5', status: 'Validé' },
                          { code: 'INF-105', name: 'Réseaux informatiques', cc: '12.00', exam: '13.00', final: '12.60', coef: '1.5', ects: '4', status: 'Validé' },
                          { code: 'INF-101', name: 'Algorithmique & Structures', cc: '15.00', exam: '14.00', final: '14.40', coef: '2.5', ects: '6', status: 'Validé' },
                          { code: 'INF-102', name: 'Programmation C/C++', cc: '11.00', exam: '10.50', final: '10.70', coef: '2.0', ects: '5', status: 'Validé' },
                        ].map((g, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition">
                            <td className="p-3.5 font-medium text-[#0F172A]">
                              <span className="font-mono text-[11px] text-[#64748B] block">{g.code}</span>
                              {g.name}
                            </td>
                            <td className="p-3.5 text-center text-[#64748B]">{g.cc}</td>
                            <td className="p-3.5 text-center text-[#64748B]">{g.exam}</td>
                            <td className="p-3.5 text-center font-bold text-[#047857]">{g.final}</td>
                            <td className="p-3.5 text-center text-[#64748B]">{g.coef}</td>
                            <td className="p-3.5 text-center font-semibold text-[#0F172A]">{g.ects}</td>
                            <td className="p-3.5 text-center">
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF5] text-[#047857]">
                                {g.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SCREEN 10: Calendrier – Élève */}
              {activeScreen === 'calendar' && (
                <div className="mx-auto w-full max-w-4xl space-y-6">
                  <div><h1 className="text-xl font-bold text-[#0F172A]">Calendrier</h1><p className="mt-1 text-sm text-[#64748B]">Échéances et événements associés au compte.</p></div>
                  <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center">
                    <CalendarIcon className="mx-auto h-8 w-8 text-[#047857]" aria-hidden="true" />
                    <h2 className="mt-4 text-base font-semibold text-[#0F172A]">Aucun événement disponible</h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#64748B]">Les événements du calendrier ne sont pas chargés depuis le compte connecté dans cette interface.</p>
                  </div>
                </div>
              )}

              {/* SCREEN 11: Ressources */}
              {activeScreen === 'resources' && (
                <div className="space-y-6 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-[#0F172A]">Ressources</h1>
                      <p className="text-xs text-[#64748B] mt-0.5">Documents pédagogiques, guides et fiches techniques</p>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-2 border-b border-[#E2E8F0]">
                    <button className="px-4 py-2 border-b-2 border-[#047857] text-[#047857] font-semibold text-xs -mb-px">Tous</button>
                    <button className="px-4 py-2 text-[#64748B] hover:text-[#0F172A] font-medium text-xs">Cours</button>
                    <button className="px-4 py-2 text-[#64748B] hover:text-[#0F172A] font-medium text-xs">Documents</button>
                    <button className="px-4 py-2 text-[#64748B] hover:text-[#0F172A] font-medium text-xs">Vidéos</button>
                    <button className="px-4 py-2 text-[#64748B] hover:text-[#0F172A] font-medium text-xs">Liens</button>
                  </div>

                  {/* Resources Rows matching mockup */}
                  <div className="space-y-3">
                    {[
                      { title: 'Guide JavaScript (PDF)', size: '2.4 Mo', date: '12 oct. 2026', type: 'PDF', action: 'Télécharger' },
                      { title: 'Exemple de projet PHP', size: '1.8 Mo', date: '10 oct. 2026', type: 'ZIP', action: 'Télécharger' },
                      { title: 'Vidéos - Bases de données', size: 'Lien YouTube', date: '8 oct. 2026', type: 'VIDEO', action: 'Ouvrir' },
                      { title: 'Fiche récapitulative HTML/CSS', size: '824 Ko', date: '5 oct. 2026', type: 'PDF', action: 'Télécharger' },
                    ].map((res, i) => (
                      <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0">
                            <Folder className="w-5 h-5 text-[#047857]" />
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold text-[#0F172A]">{res.title}</h3>
                            <p className="text-[11px] text-[#64748B]">{res.size} • {res.date}</p>
                          </div>
                        </div>

                        <button className="px-4 py-1.5 border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50 text-xs font-semibold rounded-lg transition">
                          {res.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN 12: Forum */}
              {activeScreen === 'forum' && (
                <div className="space-y-6 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-[#0F172A]">Forum de discussion</h1>
                      <p className="text-xs text-[#64748B] mt-0.5">Échangez avec vos enseignants et pairs sur les modules de cours</p>
                    </div>
                    <button onClick={() => setActiveScreen('login')} className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg transition flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Poser une question
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded">
                          Développement Web
                        </span>
                        <span className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Résolu
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#0F172A]">
                        Différence entre Flexbox et Grid pour la sidebar du LMS ?
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Dans le TP de développement web, faut-il privilégier display: grid ou display: flex pour structurer la navigation latérale avec l'avatar fixé en bas ?
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-xs text-[#64748B]">
                        <div className="flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80"
                            alt="Andry Rakoto"
                            className="w-5 h-5 rounded-full object-cover border border-[#CBD5E1]"
                          />
                          <span className="font-medium text-[#0F172A]">Andry Rakoto • il y a 2 jours</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-[#047857] font-semibold"><ThumbsUp className="w-3.5 h-3.5" /> 8 votes</span>
                          <span>2 réponses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 13: Profil – Élève */}
              {activeScreen === 'profile' && (
                <div className="space-y-6 w-full max-w-4xl mx-auto">
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex items-center gap-5">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#047857] shadow-xs shrink-0"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-[#0F172A]">{currentUser.name}</h2>
                      <p className="text-xs text-[#64748B] capitalize">{currentUser.role === 'student' ? 'Étudiant' : currentUser.role === 'teacher' ? 'Enseignante' : 'Administrateur'}</p>
                      <p className="text-xs text-[#64748B]">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-semibold text-[#0F172A] border-b border-[#F1F5F9] pb-3">
                      Informations personnelles
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[#64748B] block mb-1">Nom complet</label>
                        <input
                          type="text"
                          defaultValue={currentUser.name}
                          className="w-full p-2.5 border border-[#CBD5E1] rounded-lg text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[#64748B] block mb-1">Email universitaire</label>
                        <input
                          type="email"
                          defaultValue={currentUser.email}
                          className="w-full p-2.5 border border-[#CBD5E1] rounded-lg text-sm bg-slate-50"
                          disabled
                        />
                      </div>

                      <div>
                        <label className="text-[#64748B] block mb-1">Téléphone</label>
                        <input
                          type="text"
                          defaultValue={currentUser.phone}
                          className="w-full p-2.5 border border-[#CBD5E1] rounded-lg text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button className="px-5 py-2 border border-[#047857] text-[#047857] hover:bg-[#ECFDF5] text-xs font-semibold rounded-lg transition">
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 14: Paramètres – Notifications */}
              {activeScreen === 'settings' && (
                <div className="space-y-6 w-full max-w-5xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Left settings tabs matching mockup */}
                    <nav className="space-y-1" aria-label="Rubriques des paramètres">
                      <button type="button" onClick={() => setActiveScreen('profile')} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:bg-slate-100">
                        Profil
                      </button>
                      <button type="button" disabled className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#64748B] opacity-60">
                        Sécurité
                      </button>
                      <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:bg-slate-100">
                        Notifications
                      </button>
                      <button type="button" aria-current="page" onClick={() => setActiveScreen('settings')} className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold bg-[#ECFDF5] text-[#064E3B]">
                        Apparence
                      </button>
                      <button type="button" disabled={currentUser.role !== 'student'} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#64748B] disabled:opacity-50">
                        Espace étudiant
                      </button>
                    </nav>

                    {/* Main Settings Form */}
                    <div className="md:col-span-3 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-5">
                      <div>
                        <h2 className="text-lg font-bold text-[#0F172A]">Thème et couleurs</h2>
                        <p className="text-sm text-[#64748B]">Choisissez une palette visuelle pour votre espace LMS. Le thème reste conservé dans ce navigateur.</p>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {THEME_OPTIONS.map((theme) => {
                          const isSelected = selectedThemeId === theme.id;
                          return (
                            <div
                              key={theme.id}
                              className={`relative overflow-hidden rounded-2xl border p-3 transition ${
                                isSelected ? 'border-[#D1FAE5] bg-[#F8FAFC] shadow-sm' : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-1 text-[10px] font-bold text-[#047857]">
                                  <Check className="w-3 h-3" /> Thème actif
                                </div>
                              )}

                              <div className="pt-7 space-y-3">
                                <div>
                                  <h3 className="text-sm font-bold text-[#0F172A]">{theme.name}</h3>
                                  <p className="text-[11px] text-[#64748B]">{theme.description}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {[theme.primary, theme.secondary, theme.accent, theme.complementary, theme.soft].map((color, index) => (
                                    <span
                                      key={`${theme.id}-${index}`}
                                      className="h-6 w-6 rounded-md border border-white shadow-sm"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  ))}
                                </div>

                                <div className="rounded-xl border border-[#E2E8F0] bg-white p-2.5">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: theme.primary }}>LMS</span>
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex gap-2">
                                      <div className="h-10 flex-1 rounded-lg" style={{ backgroundColor: theme.primary }} />
                                      <div className="h-10 w-10 rounded-lg border border-[#E2E8F0]" style={{ backgroundColor: theme.soft }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="h-7 rounded-md" style={{ backgroundColor: theme.secondary }} />
                                      <div className="h-7 rounded-md" style={{ backgroundColor: theme.complementary }} />
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setSelectedThemeId(theme.id)}
                                  className="w-full rounded-lg px-3 py-2 text-xs font-semibold transition"
                                  style={{
                                    backgroundColor: isSelected ? theme.primary : theme.soft,
                                    color: isSelected ? '#FFFFFF' : theme.primary,
                                    border: `1px solid ${isSelected ? theme.primary : theme.accent}`,
                                  }}
                                >
                                  {isSelected ? 'Thème appliqué' : 'Appliquer ce thème'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-[#F1F5F9] pt-4 space-y-3">
                        <h4 className="text-xs font-semibold text-[#0F172A]">Notifications par email</h4>
                        <div className="space-y-2 text-xs text-[#334155]">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={notificationPreferences.emailCourses} onChange={(event) => updateNotificationPreference('emailCourses', event.target.checked)} className="rounded text-[#047857]" /> Nouveaux cours
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={notificationPreferences.emailQuizzes} onChange={(event) => updateNotificationPreference('emailQuizzes', event.target.checked)} className="rounded text-[#047857]" /> Résultats de quiz
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={notificationPreferences.emailDeadlines} onChange={(event) => updateNotificationPreference('emailDeadlines', event.target.checked)} className="rounded text-[#047857]" /> Échéances
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={notificationPreferences.emailForum} onChange={(event) => updateNotificationPreference('emailForum', event.target.checked)} className="rounded text-[#047857]" /> Messages du forum
                          </label>
                        </div>
                      </div>

                      <div className="border-t border-[#F1F5F9] pt-4 space-y-3">
                        <h4 className="text-xs font-semibold text-[#0F172A]">Notifications dans l'application</h4>
                        <label className="flex items-center justify-between text-sm text-[#334155] cursor-pointer">
                          <span>Activer les notifications</span>
                          <input type="checkbox" checked={notificationPreferences.inApp} onChange={(event) => updateNotificationPreference('inApp', event.target.checked)} className="toggle text-[#047857]" />
                        </label>
                      </div>

                      <p className="border-t border-[#F1F5F9] pt-4 text-sm text-[#64748B]">La fréquence de réception n’est pas encore prise en charge par l’application.</p>

                      <div className="flex justify-end pt-3">
                        <button type="button" onClick={saveSettings} className="px-5 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-sm font-semibold rounded-lg transition">
                          Enregistrer les préférences
                        </button>
                      </div>
                      {settingsSaved && <p role="status" className="text-sm font-medium text-[#047857]">Préférences enregistrées dans ce navigateur.</p>}
                      {demoModeNotice}
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 15: Notifications */}
              {activeScreen === 'notifications' && (
                <div className="space-y-6 w-full max-w-4xl mx-auto">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-[#0F172A]">Centre de notifications</h1>
                    <button onClick={() => setNotificationCount(0)} className="text-xs text-[#047857] hover:underline font-semibold">
                      Tout marquer comme lu
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { title: 'Nouvelle note attribuée', desc: 'Votre TP 1 (Développement Web) a été corrigé avec la note de 17.5 / 20.', time: 'il y a 2h', unread: true },
                      { title: 'Échéance devoir proche', desc: 'Rendre l\'exercice SQL de modélisation demain avant 11:00.', time: 'il y a 4h', unread: true },
                      { title: 'Nouvelle réponse au forum', desc: 'Le Dr. Tahina Ramanantsoa a répondu à votre question sur CSS Grid.', time: 'il y a 1 jour', unread: false }
                    ].map((n, i) => (
                      <div key={i} className={`p-4 rounded-xl border bg-white shadow-xs ${n.unread ? 'border-[#047857]/40 bg-[#ECFDF5]/20' : 'border-[#E2E8F0]'}`}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#0F172A]">{n.title}</h4>
                          <span className="text-[11px] text-[#64748B]">{n.time}</span>
                        </div>
                        <p className="text-xs text-[#475569] mt-1">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN 16: Gestion des utilisateurs (Admin) */}
              {activeScreen === 'users-management' && (
                <div className="space-y-6 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-[#0F172A]">Gestion des utilisateurs</h1>
                      <p className="text-xs text-[#64748B] mt-0.5">Administration des comptes étudiants, enseignants et administrateurs</p>
                    </div>
                    <button onClick={() => openAdminUserModal()} className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg transition flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Nouvel utilisateur
                    </button>
                  </div>

                  <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs border-collapse min-w-150">
                        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] uppercase tracking-wider text-[#64748B] font-semibold">
                          <tr>
                            <th className="p-3.5">Nom & Email</th>
                            <th className="p-3.5">Rôle</th>
                            <th className="p-3.5">Téléphone</th>
                            <th className="p-3.5">Statut</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9] text-xs">
                          {registeredAccounts.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition">
                              <td className="p-3.5 flex items-center gap-2.5">
                                <img
                                  src={u.avatarUrl}
                                  alt={u.name}
                                  className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                                />
                                <div>
                                  <p className="font-semibold text-[#0F172A]">{u.name}</p>
                                  <p className="text-[11px] text-[#64748B]">{u.email}</p>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF5] text-[#047857] capitalize">
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-3.5 text-[#64748B] font-mono">{u.phone}</td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                                  Actif
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <button onClick={() => openAdminUserModal(u)} className="text-xs text-[#047857] hover:underline font-semibold">Modifier</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 17: Gestion des cours (Admin / Teacher) */}
              {activeScreen === 'courses-management' && (
                <div className="space-y-6 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-[#0F172A]">Gestion du catalogue des cours</h1>
                      <p className="text-xs text-[#64748B] mt-0.5">10 modules universitaires conformes au référentiel L3 Informatique</p>
                    </div>
                    <button className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg transition flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Créer un nouveau cours
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {coursesList.map((c) => (
                      <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnailUrl}
                            alt={c.title}
                            className="w-14 h-12 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
                          />
                          <div>
                            <span className="text-[10px] font-mono font-semibold text-[#047857] bg-[#ECFDF5] px-1.5 py-0.5 rounded">{c.code}</span>
                            <h4 className="text-xs font-bold text-[#0F172A] mt-1">{c.title}</h4>
                            <p className="text-[11px] text-[#64748B]">{c.chaptersCount} chapitres • {c.totalHours}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCourseId(c.id);
                            if (currentUser.role !== 'admin') {
                              setActiveScreen('course-detail');
                            }
                          }}
                          className="px-3 py-1.5 border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50 text-xs font-semibold rounded-lg shrink-0 self-end sm:self-auto"
                        >
                          Gérer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN 18: Composants UI (Styleguide officiel) */}
              {activeScreen === 'ui-components' && (
                <div className="space-y-8 w-full">
                  <div>
                    <h1 className="text-xl font-bold text-[#0F172A]">Composants UI</h1>
                    <p className="mt-1 text-sm text-[#64748B]">Référence visuelle Academic Green de l’application.</p>
                  </div>

                  {/* 1. Swatches de couleur */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Palette Émeraude Universitaire</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#064E3B] shadow-sm" />
                        <span className="text-[10px] font-mono text-slate-500 mt-1">#064E3B</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#047857] shadow-sm" />
                        <span className="text-[10px] font-mono text-slate-500 mt-1">#047857</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#059669] shadow-sm" />
                        <span className="text-[10px] font-mono text-slate-500 mt-1">#059669</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#10B981] shadow-sm" />
                        <span className="text-[10px] font-mono text-slate-500 mt-1">#10B981</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#ECFDF5] border border-emerald-200 shadow-sm" />
                        <span className="text-[10px] font-mono text-slate-500 mt-1">#ECFDF5</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Boutons */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Boutons</h3>
                    <div className="flex items-center gap-4 flex-wrap">
                      <button className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg shadow-xs transition">
                        Primaire
                      </button>
                      <button className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] text-xs font-semibold rounded-lg shadow-xs transition">
                        Secondaire
                      </button>
                      <button disabled className="px-4 py-2 bg-[#F1F5F9] border border-[#E2E8F0] text-[#94A3B8] text-xs font-semibold rounded-lg cursor-not-allowed">
                        Désactivé
                      </button>
                    </div>
                  </div>

                  {/* 3. Champs de saisie */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Champs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs">
                        <Search className="w-4 h-4 text-[#94A3B8]" />
                        <input type="text" placeholder="Recherche..." className="outline-none w-full bg-transparent" />
                      </div>
                      <select className="border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs bg-white outline-none">
                        <option>Sélectionner...</option>
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                    </div>
                  </div>

                  {/* 4. Statuts Badges */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Statuts</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#ECFDF5] text-[#047857]">
                        « En cours
                      </span>
                      <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#E0F2FE] text-[#0369A1]">
                        Terminé
                      </span>
                      <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#FEF3C7] text-amber-700">
                        À venir
                      </span>
                      <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#FEE2E2] text-rose-700">
                        En retard
                      </span>
                    </div>
                  </div>

                  {/* 5. Tableau standard */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-[#E2E8F0]">
                      <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Tableau</h3>
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs border-collapse min-w-125">
                        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] uppercase tracking-wider text-[#64748B] font-semibold">
                          <tr>
                            <th className="p-3.5">Cours</th>
                            <th className="p-3.5">Progression</th>
                            <th className="p-3.5">Statut</th>
                            <th className="p-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9] text-xs">
                          <tr className="hover:bg-slate-50">
                            <td className="p-3.5 font-semibold text-[#0F172A]">Développement Web</td>
                            <td className="p-3.5">
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden inline-block mr-2 align-middle">
                                <div className="h-full bg-[#047857]" style={{ width: '72%' }} />
                              </div>
                              72%
                            </td>
                            <td className="p-3.5"><span className="px-2 py-0.5 rounded text-[11px] bg-[#ECFDF5] text-[#047857]">En cours</span></td>
                            <td className="p-3.5 text-right text-slate-400 font-bold">•••</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="p-3.5 font-semibold text-[#0F172A]">Base de données</td>
                            <td className="p-3.5">
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden inline-block mr-2 align-middle">
                                <div className="h-full bg-[#047857]" style={{ width: '54%' }} />
                              </div>
                              54%
                            </td>
                            <td className="p-3.5"><span className="px-2 py-0.5 rounded text-[11px] bg-[#ECFDF5] text-[#047857]">En cours</span></td>
                            <td className="p-3.5 text-right text-slate-400 font-bold">•••</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer matching the reference image */}
            <footer className="h-12 px-6 border-t border-[#E2E8F0] bg-white flex items-center justify-between text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#047857] flex items-center justify-center text-white text-[9px] font-bold">
                  ✓
                </div>
                <span><strong>LMS Web</strong> | Apprendre aujourd'hui, réussir demain.</span>
              </div>
              <span className="text-[11px]">Design moderne • Simple • Efficace</span>
            </footer>
          </main>
        </div>
      )}

      {/* Teacher Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="font-bold text-sm text-[#0F172A]">Correction & Notation sur 20</h3>
              <button onClick={() => setGradingSubmission(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-semibold text-[#0F172A]">{gradingSubmission.title}</p>
              <p className="text-[#64748B]">Étudiant : {gradingSubmission.studentName}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Note attribuée (/20)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                className="w-full p-2 border border-[#CBD5E1] rounded-lg text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Feedback pédagogique</label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                className="w-full p-2 border border-[#CBD5E1] rounded-lg text-xs bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
              <button
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setSubmissions(submissions.map((s) => s.id === gradingSubmission.id ? { ...s, grade: parseFloat(gradeInput), feedback: feedbackInput, status: 'corrige' } : s));
                  setGradingSubmission(null);
                }}
                className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white text-xs font-semibold rounded-lg transition"
              >
                Valider la note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XAMPP & Architecture Modal */}
      {showXamppModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#047857]" />
                <h3 className="font-bold text-sm text-[#0F172A]">Installation XAMPP & Architecture PHP / MySQL</h3>
              </div>
              <button onClick={() => setShowXamppModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#334155]">
              <div className="bg-[#ECFDF5] border border-emerald-200 rounded-lg p-3">
                <p className="font-bold text-[#064E3B] mb-1">Emplacement d'installation standard sous XAMPP :</p>
                <code className="bg-white px-2 py-1 rounded text-[#047857] font-mono block">C:\xampp\htdocs\lms\</code>
              </div>

              <div>
                <h4 className="font-bold text-[#0F172A] mb-2">1. Base de données MySQL :</h4>
                <p className="mb-2">Le fichier <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">database/schema.sql</code> contient l'instruction :</p>
                <pre className="bg-[#0F172A] text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
CREATE DATABASE IF NOT EXISTS `lms_db` CHARACTER SET utf8mb4;
USE `lms_db`;
                </pre>
                <p className="mt-2 text-slate-500">Exécutez ensuite <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">database/seed.sql</code> dans phpMyAdmin pour insérer les 10 cours informatiques (INF-101 à INF-110), les leçons, les quiz et les comptes de test.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0F172A] mb-2">2. Comptes de test prédéfinis (BCrypt hash) :</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="border border-slate-200 p-2 rounded bg-slate-50">
                    <p className="font-bold text-emerald-700">Étudiant</p>
                    <p className="font-mono text-[11px]">andry.rakoto@exemple.com</p>
                    <p className="text-[10px] text-slate-500">password123</p>
                  </div>
                  <div className="border border-slate-200 p-2 rounded bg-slate-50">
                    <p className="font-bold text-emerald-700">Enseignante</p>
                    <p className="font-mono text-[11px]">tahina.ramanantsoa@exemple.com</p>
                    <p className="text-[10px] text-slate-500">password123</p>
                  </div>
                  <div className="border border-slate-200 p-2 rounded bg-slate-50">
                    <p className="font-bold text-emerald-700">Administrateur</p>
                    <p className="font-mono text-[11px]">tiana.rasoanaivo@exemple.com</p>
                    <p className="text-[10px] text-slate-500">password123</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#0F172A] mb-2">3. Endpoints API PHP avec PDO :</h4>
                <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-600">
                  <li><code>/api/auth/login.php</code> (Vérification password_verify)</li>
                  <li><code>/api/courses/list.php</code> (Liste des 10 cours avec progression)</li>
                  <li><code>/api/quizzes/submit.php</code> (Correction sécurisée côté serveur)</li>
                  <li><code>/api/assignments/grade.php</code> (Notation sur 20 et feedback enseignant)</li>
                  <li><code>/api/grades/my_grades.php</code> (Calcul de la moyenne et crédits ECTS)</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#F1F5F9]">
              <button
                onClick={() => setShowXamppModal(false)}
                className="px-4 py-2 bg-[#047857] text-white text-xs font-semibold rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdminUserModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdminUserModal(false)}>
          <form
            onSubmit={saveAdminUser}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h2 className="text-base font-bold text-[#0F172A]">
                {editingAdminUserId === null ? 'Nouvel utilisateur' : 'Modifier l’utilisateur'}
              </h2>
              <button type="button" onClick={() => setShowAdminUserModal(false)} className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100" aria-label="Fermer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-[#475569]">
                Prénom
                <input required value={adminUserDraft.firstname} onChange={(event) => setAdminUserDraft({ ...adminUserDraft, firstname: event.target.value })} className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm outline-none focus:border-[#047857]" />
              </label>
              <label className="text-xs font-medium text-[#475569]">
                Nom
                <input required value={adminUserDraft.lastname} onChange={(event) => setAdminUserDraft({ ...adminUserDraft, lastname: event.target.value })} className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm outline-none focus:border-[#047857]" />
              </label>
            </div>
            <label className="block text-xs font-medium text-[#475569]">
              Adresse email
              <input required type="email" value={adminUserDraft.email} onChange={(event) => setAdminUserDraft({ ...adminUserDraft, email: event.target.value })} className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm outline-none focus:border-[#047857]" />
            </label>
            <label className="block text-xs font-medium text-[#475569]">
              Téléphone
              <input value={adminUserDraft.phone} onChange={(event) => setAdminUserDraft({ ...adminUserDraft, phone: event.target.value })} className="mt-1 w-full rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm outline-none focus:border-[#047857]" />
            </label>
            <label className="block text-xs font-medium text-[#475569]">
              Rôle
              <select value={adminUserDraft.role} onChange={(event) => setAdminUserDraft({ ...adminUserDraft, role: event.target.value as UserRole })} className="mt-1 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm outline-none focus:border-[#047857]">
                <option value="student">Étudiant</option>
                <option value="teacher">Enseignant</option>
              </select>
              <p className="mt-1 text-[10px] text-[#64748B]">Le rôle administrateur est réservé au compte principal de la plateforme.</p>
            </label>
            {adminUserFormError && <p role="alert" className="text-xs text-rose-600">{adminUserFormError}</p>}
            <div className="flex justify-end gap-2 border-t border-[#F1F5F9] pt-3">
              <button type="button" onClick={() => setShowAdminUserModal(false)} className="rounded-lg border border-[#CBD5E1] px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-slate-50">Annuler</button>
              <button type="submit" className="rounded-lg bg-[#047857] px-4 py-2 text-xs font-semibold text-white hover:bg-[#065F46]">{editingAdminUserId === null ? 'Créer l’utilisateur' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Ajouter un autre compte (Gmail style) */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">Ajouter un compte</h3>
                  <p className="text-[10px] text-[#64748B]">Connexion multi-comptes LMS</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Associez un autre profil universitaire pour basculer facilement d'un compte à un autre en un clic.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const found = registeredAccounts.find(
                  (a) => a.email.toLowerCase() === newAccountEmail.trim().toLowerCase()
                );
                if (found) {
                  selectAccount(found);
                  setShowAddAccountModal(false);
                  setNewAccountEmail('');
                } else if (newAccountEmail.trim()) {
                  const nameParts = newAccountEmail.split('@')[0].split('.');
                  const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Utilisateur';
                  const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'LMS';
                  const customUser: CurrentUser = {
                    id: Date.now(),
                    name: `${firstName} ${lastName}`,
                    firstname: firstName,
                    lastname: lastName,
                    email: newAccountEmail.trim(),
                    role: 'student',
                    avatarInitials: `${firstName.charAt(0)}${lastName.charAt(0)}`,
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
                    phone: '+261 34 00 000 00',
                    bio: 'Compte universitaire nouvellement connecté.'
                  };
                  setRegisteredAccounts([...registeredAccounts, customUser]);
                  selectAccount(customUser);
                  setShowAddAccountModal(false);
                  setNewAccountEmail('');
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Adresse email universitaire
                </label>
                <input
                  type="email"
                  required
                  placeholder="nom.prenom@exemple.com"
                  value={newAccountEmail}
                  onChange={(e) => setNewAccountEmail(e.target.value)}
                  className="w-full p-2.5 border border-[#CBD5E1] rounded-xl text-xs outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#ECFDF5]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  defaultValue="password123"
                  className="w-full p-2.5 border border-[#CBD5E1] rounded-xl text-xs outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#ECFDF5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#047857] hover:bg-[#065F46] text-white rounded-xl text-xs font-semibold transition shadow-xs"
                >
                  Connecter & basculer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
