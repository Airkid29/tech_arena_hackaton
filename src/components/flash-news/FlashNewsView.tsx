import React, { useState } from 'react';
import {
  Bell,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  MessageSquare,
  Mail,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  X,
  Share2,
  Sparkles,
} from 'lucide-react';
import { FlashArticle } from '../../types';

interface FlashNewsViewProps {
  articles: FlashArticle[];
  onBroadcastArticle: (articleId: string) => void;
  onCreateArticle: (newArticle: Omit<FlashArticle, 'id' | 'publishedAt' | 'readCount' | 'readRate'>) => void;
  isDark?: boolean;
}

export const FlashNewsView: React.FC<FlashNewsViewProps> = ({
  articles,
  onBroadcastArticle,
  onCreateArticle,
  isDark = true,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [broadcastedNotice, setBroadcastedNotice] = useState<string | null>(null);

  // New article form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Alerte Urgente' | 'Bonne Pratique' | 'Menace Émergente' | 'Conseil Outils'>('Alerte Urgente');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [channels, setChannels] = useState<('Email' | 'WhatsApp')[]>(['Email', 'WhatsApp']);

  const activeArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];

  const handleBroadcast = (id: string, articleTitle: string) => {
    onBroadcastArticle(id);
    setBroadcastedNotice(`Bulletin diffusé avec succès sur Email et WhatsApp à l'ensemble des 32 collaborateurs !`);
    setTimeout(() => setBroadcastedNotice(null), 5000);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onCreateArticle({
      title,
      category,
      summary: summary || title,
      content,
      author: 'Pôle Sécurité IT VIGILO',
      totalRecipients: 32,
      keyTakeaway: keyTakeaway || 'Toujours vérifier avant de cliquer ou de transférer des fonds.',
      channels,
    });

    setTitle('');
    setContent('');
    setSummary('');
    setKeyTakeaway('');
    setIsCreateModalOpen(false);
    setBroadcastedNotice('Nouvelle alerte rédigée et prête à être diffusée !');
    setTimeout(() => setBroadcastedNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Flash Infos & Veille Cyber</h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Sensibilisation continue
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mettez au parfum vos collaborateurs entre deux campagnes via des alertes courtes diffusées sur Email & WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Rédiger une alerte</span>
        </button>
      </div>

      {/* Broadcast Toast Notice */}
      {broadcastedNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{broadcastedNotice}</span>
          </div>
          <button
            onClick={() => setBroadcastedNotice(null)}
            className="text-xs font-semibold hover:underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Two columns: Articles list & Active article reading pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Articles List */}
        <div className="lg:col-span-5 space-y-3">
          {articles.map((art) => {
            const isSelected = activeArticle?.id === art.id;
            return (
              <div
                key={art.id}
                onClick={() => setSelectedArticleId(art.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-slate-900 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">{art.publishedAt}</span>
                    <span>·</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{art.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    {art.channels.includes('WhatsApp') && <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
                    {art.channels.includes('Email') && <Mail className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{art.readCount}/{art.totalRecipients} lecteurs ({art.readRate}%)</span>
                  </span>

                  <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5">
                    Consulter <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Article Details & Push actions */}
        {activeArticle && (
          <div className="lg:col-span-7 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  {activeArticle.category} · {activeArticle.publishedAt}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">Canaux activés :</span>
                  {activeArticle.channels.map((ch) => (
                    <span
                      key={ch}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {activeArticle.title}
              </h2>

              <p className="text-xs text-slate-500">
                Rédigé par <strong className="text-slate-700 dark:text-slate-300">{activeArticle.author}</strong> · Lecture estimée : 2 minutes
              </p>
            </div>

            {/* Key takeaway card */}
            <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 text-xs space-y-1">
              <strong className="block font-semibold">Le réflexe à retenir :</strong>
              <p>{activeArticle.keyTakeaway}</p>
            </div>

            {/* Article Content */}
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line space-y-3 font-sans">
              {activeArticle.content}
            </div>

            {/* Read Stats & Broadcast Action */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{activeArticle.readCount} collaborateurs ont validé la lecture sur 32</span>
                </div>
                <div className="w-48 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${activeArticle.readRate}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleBroadcast(activeArticle.id, activeArticle.title)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                title="Renvoyer une notification rappel aux collaborateurs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Diffuser aux collaborateurs</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Rédiger un nouveau Flash Info */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Rédiger un Flash Info de sensibilisation
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ce bulletin sera notifié aux collaborateurs par email et/ou WhatsApp
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Titre de l'alerte</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Attention aux faux emails de facture Orange reçus ce matin"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="Alerte Urgente">Alerte Urgente</option>
                    <option value="Bonne Pratique">Bonne Pratique</option>
                    <option value="Menace Émergente">Menace Émergente</option>
                    <option value="Conseil Outils">Conseil Outils</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Canaux de diffusion</label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channels.includes('Email')}
                        onChange={(e) => {
                          if (e.target.checked) setChannels((prev) => [...prev, 'Email']);
                          else setChannels((prev) => prev.filter((c) => c !== 'Email'));
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>Email</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channels.includes('WhatsApp')}
                        onChange={(e) => {
                          if (e.target.checked) setChannels((prev) => [...prev, 'WhatsApp']);
                          else setChannels((prev) => prev.filter((c) => c !== 'WhatsApp'));
                        }}
                        className="rounded text-emerald-600"
                      />
                      <span>WhatsApp Pro</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Contenu du message (court et percutant)</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Décrivez la menace, pourquoi elle est dangereuse, et ce que chaque employé doit faire..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Le réflexe à retenir (1 phrase)</label>
                <input
                  type="text"
                  placeholder="ex: Toujours téléphoner au fournisseur sur son numéro habituel avant de changer un RIB."
                  value={keyTakeaway}
                  onChange={(e) => setKeyTakeaway(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs cursor-pointer"
                >
                  Enregistrer et diffuser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
