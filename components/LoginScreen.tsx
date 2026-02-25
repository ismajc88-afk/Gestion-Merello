
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, AppConfig } from '../types';
import { Lock, X, ShieldCheck, Wallet, Truck, Users, BellRing, CheckCircle2, Home, Beer, Calculator, ShieldAlert } from 'lucide-react';
import { verifyPin } from '../utils/security';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

interface LoginScreenProps {
  config: AppConfig;
  onLogin: (role: UserRole) => void;
  onInitAudio: () => void;
  isSubscribed?: boolean;
  onToggleNotifications?: () => void;
  hasPushSupport?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  config, onLogin, onInitAudio,
  isSubscribed = false, onToggleNotifications, hasPushSupport = false
}) => {
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemaining(remaining);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handlePinInput = useCallback(async (digit: string) => {
    if (isLockedOut) return;
    onInitAudio();
    const newPin = pinEntry + digit;
    setPinEntry(newPin);

    if (newPin.length >= 4 && pendingRole) {
      const storedPin = config.pins[pendingRole];
      const isValid = await verifyPin(newPin, storedPin);

      if (isValid) {
        setFailedAttempts(0);
        onLogin(pendingRole);
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        setPinError(true);

        if (newAttempts >= MAX_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_SECONDS * 1000);
          setLockoutRemaining(LOCKOUT_SECONDS);
        }

        setTimeout(() => { setPinEntry(''); setPinError(false); }, 500);
      }
    }
  }, [pinEntry, pendingRole, config.pins, failedAttempts, isLockedOut, onInitAudio, onLogin]);

  const handleRoleSelect = (role: UserRole) => {
    onInitAudio();
    const pinRequired = config.pins[role];
    if (pinRequired) {
      setPendingRole(role);
      setPinEntry('');
    } else {
      onLogin(role);
    }
  };

  // Definición de perfiles con diseños únicos y modernos
  const profiles = [
    {
      id: 'ADMIN',
      label: 'Administrador',
      icon: ShieldCheck,
      gradient: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600',
      glow: 'shadow-[0_0_40px_rgba(99,102,241,0.5)]',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      border: 'border-2 border-white/20',
      animation: 'hover:scale-105 active:scale-95'
    },
    {
      id: 'CAJERO',
      label: 'Cajero',
      icon: Calculator,
      gradient: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]',
      iconBg: 'bg-white/25',
      border: 'border-2 border-emerald-300/30',
      animation: 'hover:scale-105 active:scale-95'
    },
    {
      id: 'CAMARERO',
      label: 'Camarero',
      icon: Beer,
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
      iconBg: 'bg-white/20',
      border: 'border-2 border-blue-300/30',
      animation: 'hover:scale-105 active:scale-95'
    },
    {
      id: 'KIOSKO_CASAL',
      label: 'Barra Fallera',
      icon: Home,
      gradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600',
      glow: 'shadow-[0_0_30px_rgba(249,115,22,0.4)]',
      iconBg: 'bg-white/25',
      border: 'border-2 border-orange-300/30',
      animation: 'hover:scale-105 active:scale-95'
    },
    {
      id: 'TESORERIA',
      label: 'Tesorería',
      icon: Wallet,
      gradient: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
      glow: 'shadow-[0_0_25px_rgba(51,65,85,0.5)]',
      iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
      border: 'border-2 border-amber-400/40',
      animation: 'hover:scale-105 active:scale-95'
    },
    {
      id: 'LOGISTICA',
      label: 'Logística',
      icon: Truck,
      gradient: 'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600',
      glow: 'shadow-[0_0_30px_rgba(124,58,237,0.4)]',
      iconBg: 'bg-white/20',
      border: 'border-2 border-violet-300/30',
      animation: 'hover:scale-105 active:scale-95'
    },
    {
      id: 'FALLERO',
      label: 'Censo',
      icon: Users,
      gradient: 'bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600',
      glow: 'shadow-[0_0_30px_rgba(244,63,94,0.4)]',
      iconBg: 'bg-white/25',
      border: 'border-2 border-rose-300/30',
      animation: 'hover:scale-105 active:scale-95'
    },
  ];

  return (
    <div className="fixed inset-0 h-[100dvh] bg-[#050505] z-[500] flex flex-col items-center justify-center p-6 text-white overflow-hidden italic safe-pb" onClick={onInitAudio}>
      {pendingRole && (
        <div className="fixed inset-0 h-[100dvh] z-[600] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
          <div className="mb-8 md:mb-12 text-center">
            <Lock size={48} className={`mx-auto mb-4 ${pinError ? 'text-rose-500 animate-bounce' : isLockedOut ? 'text-rose-500' : 'text-indigo-500'}`} />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Acceso {pendingRole === 'KIOSKO_CASAL' ? 'Barra Fallera' : pendingRole}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
              {isLockedOut ? `Bloqueado por ${lockoutRemaining}s` : 'Introduce el PIN de Seguridad'}
            </p>
            {failedAttempts > 0 && !isLockedOut && (
              <p className="text-rose-400 text-[10px] font-black uppercase tracking-wider mt-2">
                ⚠️ {failedAttempts}/{MAX_ATTEMPTS} intentos fallidos
              </p>
            )}
          </div>
          {isLockedOut && (
            <div className="mb-6 flex flex-col items-center gap-3 animate-pulse">
              <ShieldAlert size={40} className="text-rose-500" />
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-6 py-3 text-center">
                <p className="text-rose-400 text-sm font-black uppercase">Acceso Bloqueado</p>
                <p className="text-3xl font-black text-rose-300 tabular-nums mt-1">{lockoutRemaining}s</p>
              </div>
            </div>
          )}
          <div className="flex gap-4 mb-10 md:mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 transition-all duration-300 ${pinEntry.length > i ? 'bg-indigo-500 border-indigo-400' : 'border-slate-800'}`}></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-xs pb-10 safe-pb">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'X'].map((val) => (
              <button
                key={val}
                onClick={() => val === 'C' ? setPinEntry('') : val === 'X' ? setPendingRole(null) : handlePinInput(val)}
                className={`h-20 md:h-24 rounded-[28px] font-black text-2xl md:text-3xl flex items-center justify-center transition-all border shadow-lg active:scale-90 ${val === 'X' || val === 'C' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white/10 text-white border-white/5 hover:bg-white/20'}`}
              >
                {val === 'X' ? <X size={28} /> : val}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 shrink-0 flex items-center justify-center">
        <img
          src="/escudo-merello.png"
          alt="Escudo Falla Eduardo Merello"
          className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
        />
      </div>

      <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-[0.8] mb-8 text-center">
        {config.eventName.split(' ')[0]}<br /><span className="text-blue-600">PLANNER {config.year}</span>
      </h1>

      {/* BOTÓN SUSCRIPCIÓN NTFY Y ALERTAS NATIVAS */}
      <div className="w-full max-w-sm mb-8 flex flex-col items-center gap-3">
        {hasPushSupport && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleNotifications?.(); }}
            disabled={isSubscribed}
            className={`w-full px-6 py-4 rounded-3xl flex items-center gap-4 transition-all border-2 shadow-xl group relative overflow-hidden ${isSubscribed
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400 cursor-default'
              : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500 active:scale-95 animate-pulse'
              }`}
          >
            <div className={`p-2 rounded-xl shrink-0 transition-colors ${isSubscribed ? 'bg-emerald-500 text-slate-950' : 'bg-white text-blue-600'}`}>
              {isSubscribed ? <CheckCircle2 size={20} /> : <BellRing size={20} className="animate-wiggle" />}
            </div>
            <div className="text-left flex-1 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">
                {isSubscribed ? 'NAVEGADOR CONECTADO' : 'ACTIVAR ALERTAS WEB'}
              </p>
              <p className="text-[9px] font-medium opacity-80 leading-tight">
                {isSubscribed ? 'Recibirás avisos en este dispositivo.' : 'Toca para permitir notificaciones.'}
              </p>
            </div>
          </button>
        )}

        {/* APP NTFY - ALTERNATIVA MOVILES */}
        <a
          href={`ntfy://${config.ntfyTopic || 'merello-planner-2026-global-alerts'}?display=Merello+Planner`}
          className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-emerald-400 py-3 px-6 rounded-3xl flex items-center justify-center gap-3 transition-colors shadow-lg active:scale-95 w-full group"
        >
          <BellRing size={20} className="group-hover:animate-wiggle" />
          <div className="text-left leading-tight">
            <span className="block text-xs font-black uppercase tracking-widest text-zinc-100">Suscribirse en App Ntfy</span>
            <span className="block text-[9px] font-bold text-emerald-500/80">Recomendado para Móviles (Android/iOS)</span>
          </div>
        </a>
        <p className="text-[9px] text-zinc-500 text-center px-2 font-bold leading-tight">
          iOS: Abre <span className="text-emerald-400 font-mono tracking-wider break-all">{config.ntfyTopic || 'merello-planner-2026-global-alerts'}</span> en la app.
        </p>
      </div>

      <div className="flex-1 w-full max-w-5xl overflow-y-auto custom-scrollbar pb-4 px-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 relative z-10 mb-8">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleRoleSelect(profile.id as UserRole)}
              className={`${profile.gradient} ${profile.glow} ${profile.border} ${profile.animation} 
                                  relative overflow-hidden p-6 md:p-8 rounded-[32px] flex flex-col items-center justify-center gap-4 
                                  transition-all duration-300 aspect-square md:aspect-auto md:h-44 group
                                  before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/20 before:to-transparent before:rounded-[32px]`}
            >
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px]"></div>

              {/* Icono con fondo especial */}
              <div className={`${profile.iconBg} p-5 md:p-6 rounded-[24px] group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-xl`}>
                <profile.icon size={36} className="text-white md:w-10 md:h-10 drop-shadow-lg" strokeWidth={2.5} />
              </div>

              {/* Etiqueta con mejor legibilidad */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <span className="text-xs md:text-sm font-black uppercase tracking-wider text-white text-center leading-tight drop-shadow-lg">
                  {profile.label}
                </span>
                <div className="w-8 h-0.5 bg-white/40 rounded-full group-hover:w-12 transition-all duration-300"></div>
              </div>

              {/* Partículas decorativas */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
              <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-white/20 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
            </button>
          ))}
        </div>


      </div>

      {/* VERSION INDICATOR */}
      <div className="mt-4 text-[9px] font-mono text-slate-600 uppercase tracking-widest opacity-50 shrink-0">
        v3.0.1 (STOCK ONLY FIX)
      </div>

      <style>{`
            @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
            .animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
         `}</style>
    </div>
  );
};
