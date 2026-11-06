import React, { useState } from 'react';
import {
  GraduationCap,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { CurrentUser, UserRole } from '../App';

interface SignupPageProps {
  embedded?: boolean;
  initialRole?: UserRole;
  onRegisterSuccess: (newUser: CurrentUser) => void;
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  embedded = false,
  initialRole = 'student',
  onRegisterSuccess,
  onNavigateToLogin,
  onNavigateToLanding,
}) => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('INE-2026-L3-' + Math.floor(100 + Math.random() * 900));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Licence 3 Informatique');
  const [phone, setPhone] = useState('+261 34 00 000 00');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstname.trim() || !lastname.trim()) {
      setError('Veuillez renseigner votre nom et votre prénom.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez renseigner une adresse email universitaire valide.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation et le règlement universitaire.');
      return;
    }

    setSuccess(true);

    const initials = `${firstname.charAt(0).toUpperCase()}${lastname.charAt(0).toUpperCase()}`;
    const newUser: CurrentUser = {
      id: Date.now(),
      name: `${firstname.trim()} ${lastname.trim()}`,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim().toLowerCase(),
      role,
      avatarInitials: initials,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      phone: phone.trim(),
      bio: `${role === 'teacher' ? 'Enseignant' : role === 'admin' ? 'Administrateur' : 'Étudiant'} inscrit en ${department}. Compte universitaire actif.`,
    };

    setTimeout(() => {
      onRegisterSuccess(newUser);
    }, 800);
  };

  const formContent = (
          <form onSubmit={handleSubmit}>
            <button
              type="button"
              onClick={embedded ? onNavigateToLogin : onNavigateToLanding}
              className="modern-return-link"
            >
              <ArrowLeft className="w-4 h-4" />
              {embedded ? 'Retour à la connexion' : "Retour à l'accueil"}
            </button>

            <h1>Créer un compte</h1>
            <div className="social-icons">
              <span className="icon"><GraduationCap className="h-4 w-4" aria-hidden="true" /></span>
              <span className="icon"><BookOpen className="h-4 w-4" aria-hidden="true" /></span>
              <span className="icon"><ShieldCheck className="h-4 w-4" aria-hidden="true" /></span>
            </div>
            <span>ou utilisez vos informations académiques</span>

            {error && (
              <div role="alert" className="modern-auth-error">{error}</div>
            )}

            {success && (
              <div role="status" className="modern-auth-success">Compte enregistré ! Connexion automatique...</div>
            )}

            <div className="signup-grid">
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                placeholder="Prénom"
                aria-label="Prénom"
                required
              />
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Nom"
                aria-label="Nom"
                required
              />
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email universitaire"
              aria-label="Email universitaire"
              required
            />

            <div className="signup-grid">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Numéro étudiant"
                aria-label="Numéro étudiant"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Téléphone"
                aria-label="Téléphone"
              />
            </div>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              aria-label="Filière"
            >
              <option value="Licence 3 Informatique">Licence 3 Informatique</option>
              <option value="Master 1 Génie Logiciel">Master 1 Génie Logiciel</option>
              <option value="Licence 2 Mathématiques &amp; Informatique">Licence 2 Math-Info</option>
              <option value="Département de Gestion">Département de Gestion</option>
            </select>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              aria-label="Rôle d'accès"
            >
              <option value="student">Étudiant</option>
              <option value="teacher">Enseignant</option>
              <option value="admin">Administrateur</option>
            </select>

            <div className="password-field">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                aria-label="Mot de passe"
                required
              />
              <button type="button" className="password-toggle-small" onClick={() => setPasswordVisible((v) => !v)} aria-label={passwordVisible ? 'Masquer' : 'Afficher'}>
                {passwordVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>

            <div className="password-field">
              <input
                type={confirmPasswordVisible ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                aria-label="Confirmer le mot de passe"
                required
              />
              <button type="button" className="password-toggle-small" onClick={() => setConfirmPasswordVisible((v) => !v)} aria-label={confirmPasswordVisible ? 'Masquer' : 'Afficher'}>
                {confirmPasswordVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>

            <label className="modern-checkbox">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
              <span>J’accepte le règlement LMS</span>
            </label>

            <button type="submit">Finaliser l’inscription</button>
            {!embedded && (
              <p className="modern-auth-register-prompt">
                Vous avez déjà un compte ?{' '}
                <button type="button" className="modern-auth-register-link" onClick={onNavigateToLogin}>
                  Se connecter
                </button>
              </p>
            )}
          </form>
  );

  if (embedded) {
    return <div className="form-container sign-up signup-panel-embedded">{formContent}</div>;
  }

  return (
    <main className="modern-auth-shell modern-auth-signup-shell">
      <div className="modern-auth-container active" id="lms-signup-container">
        <div className="form-container sign-in sign-up-panel-modern">{formContent}</div>
      </div>
    </main>
  );
};
