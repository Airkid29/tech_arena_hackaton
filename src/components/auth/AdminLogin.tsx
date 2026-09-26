import React, { useState } from "react";
import { ShieldCheck, Lock, ArrowRight, User } from "lucide-react";

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin" || password === "hackaton2026") {
      onLogin();
    } else {
      setError("Mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4 relative overflow-hidden">
      {/* Vercel-like grid background */}
      <div className="absolute inset-0 vigilo-grid-pattern opacity-40 pointer-events-none" />
      {/* Subtle orange glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] vigilo-orange-glow pointer-events-none" />

      <div className="relative w-full max-w-[420px] vigilo-card p-10 z-10">
        <button
          onClick={onBack}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8 flex items-center gap-2 cursor-pointer"
        >
          ← Retour au site public
        </button>

        <div className="flex flex-col mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#f2620a]/10 border border-[#f2620a]/20 flex items-center justify-center mb-5">
            <ShieldCheck className="w-6 h-6 text-[#f2620a]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight vigilo-glow-text mb-2">Espace Administration</h1>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            Connectez-vous pour configurer les campagnes de simulation et piloter l&apos;IA Rodium.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /> Identifiant
            </label>
            <input
              type="text"
              defaultValue="admin@vigilo.com"
              disabled
              className="w-full bg-[var(--muted)] border border-[var(--card-border)] text-[var(--muted-foreground)] text-sm rounded-lg px-4 py-3 cursor-not-allowed font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /> Mot de passe
            </label>
            <input
              type="password"
              placeholder="Entrez &apos;admin&apos; pour le hackathon"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#f2620a] transition-all"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-xs font-medium text-red-700 dark:text-red-400 text-center bg-red-100 dark:bg-red-950/20 py-2.5 rounded-lg border border-red-300 dark:border-red-900/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full vigilo-btn-orange py-3 px-4 flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg"
          >
            Se connecter <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--card-border)] text-center">
          <p className="text-[10px] text-[var(--muted-foreground)] font-mono tracking-wider">
            VIGILO CYBER RISK PLATFORM v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

