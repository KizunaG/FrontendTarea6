import { useEffect, useRef, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/services/auth';

export default function Splash() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const role = (user?.rol ?? '').toString().toLowerCase();
  const roleNice = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Usuario';
  const username = user?.username ?? '—';

  const fullText = `Bienvenido ${roleNice} ${username}`;
  const [displayText, setDisplayText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const iRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const navTimeoutRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);

  // Efecto de tipeo
  useEffect(() => {
    if (typingDone || displayText === fullText) return;

    intervalRef.current = window.setInterval(() => {
      iRef.current += 1;
      const next = fullText.slice(0, iRef.current);
      setDisplayText(next);

      if (next === fullText) {
        setTypingDone(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 45);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fullText, typingDone, displayText]);

  // Fade con overlay de gradiente
  useEffect(() => {
    if (!typingDone) return;

    fadeTimeoutRef.current = window.setTimeout(() => {
      setLeaving(true);
      navTimeoutRef.current = window.setTimeout(() => {
        navigate('/', { replace: true });
      }, 600);
    }, 600);

    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, [typingDone, navigate]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center overflow-hidden">
      {/* “brillos” de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-indigo-800/30 ring-1 ring-inset ring-indigo-500/30">
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-indigo-300">
            <path
              fill="currentColor"
              d="M4 6a2 2 0 0 1 2-2h6l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM14 4v4h4"
            />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-300">
            GESTOR DE EXPEDIENTES E INDICIOS
          </span>
        </h1>

        <p className="mt-3 text-base sm:text-lg text-slate-200 font-medium">
          <span className="align-middle">{displayText}</span>
          {!typingDone && (
            <span className="ml-1 inline-block w-3 h-5 align-middle bg-slate-200 animate-pulse" />
          )}
        </p>
      </div>

{/* Overlay para el fade-out con gradiente súper oscuro */}
{leaving && (
  <div className="absolute inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 animate-fadeOverlay"></div>
)}

{/* Animación del overlay */}
<style>{`
  @keyframes fadeOverlay {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fadeOverlay {
    animation: fadeOverlay 0.6s ease forwards;
  }
`}</style>

    </div>
  );
}
