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
import { vigiloFlashService } from '../../services/api';

interface FlashNewsViewProps {
  articles: FlashArticle[];
  onCreateArticle: (newArticle: Omit<FlashArticle, 'id' | 'publishedAt' | 'readCount' | 'readRate' | 'totalRecipients'>) => void;
  isDark?: boolean;
}

export const FlashNewsView: React.FC<FlashNewsViewProps> = ({
  articles,
  onCreateArticle,
  isDark = true,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  // New article form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Alerte Urgente' | 'Bonne Pratique' | 'Menace Émergente' | 'Conseil Outils'>('Alerte Urgente');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [channels, setChannels] = useState<('Email' | 'WhatsApp')[]>(['Email']);
  const [autoBroadcast, setAutoBroadcast] = useState(true);

  const activeArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];

  const handleBroadcast = async (art?: FlashArticle) => {
    const target = art || activeArticle;
    if (!target) return;
    setIsBroadcasting(true);
    setBroadcastSuccess(null);
    setBroadcastError(null);
    try {
      const res = await vigiloFlashService.broadcastAlert({
        articleId: target.id,
        title: target.title,
        category: target.category,
        summary: target.summary,
        content: target.content,
        keyTakeaway: target.keyTakeaway,
        channels: target.channels,
      });
      setBroadcastSuccess(res.message || `Alerte Flash diffusée avec succès à ${res.sentCount} collaborateurs !`);
      setTimeout(() => setBroadcastSuccess(null), 6000);
    } catch (err) {
      setBroadcastError(err instanceof Error ? err.message : 'Échec de la diffusion email');
      setTimeout(() => setBroadcastError(null), 6000);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newArticleData = {
      title,
      category,
      summary: summary || title,
      content,
      author: 'Pôle Sécurité IT VIGILO',
      keyTakeaway: keyTakeaway || 'Toujours vérifier avant de cliquer ou de transférer des fonds.',
      channels,
    };

    onCreateArticle(newArticleData);

    if (autoBroadcast && channels.includes('Email')) {
      setIsBroadcasting(true);
      try {
        const res = await vigiloFlashService.broadcastAlert(newArticleData);
        setBroadcastSuccess(res.message || `Alerte créée et diffusée par email à ${res.sentCount} collaborateur(s) !`);
      } catch (err) {
        setBroadcastError(err instanceof Error ? err.message : 'Alerte créée, mais la diffusion email a échoué');
      } finally {
        setIsBroadcasting(false);
      }
    } else {
      setBroadcastSuccess('Alerte enregistrée dans votre session.');
    }

    setTitle('');
    setContent('');
    setSummary('');
    setKeyTakeaway('');
    setIsCreateModalOpen(false);
    setTimeout(() => {
      setBroadcastSuccess(null);
      setBroadcastError(null);
    }, 6000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Flash Infos & Alertes Sécurité</h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-red-500/10 text-red-500 border border-red-500/20">
              Diffusion Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rédigez et diffusez en un clic des alertes d'urgence ou bulletins réflexes par email à vos collaborateurs.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Rédiger une alerte Flash</span>
        </button>
      </div>

      {/* Broadcast Success Notice */}
      {broadcastSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">{broadcastSuccess}</span>
          </div>
          <button
            onClick={() => setBroadcastSuccess(null)}
            className="text-xs font-semibold hover:underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Broadcast Error Notice */}
      {broadcastError && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-semibold">{broadcastError}</span>
          </div>
          <button
            onClick={() => setBroadcastError(null)}
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
                    <span>{art.totalRecipients > 0
                      ? `${art.readCount}/${art.totalRecipients} lecteurs (${art.readRate}%)`
                      : 'Aucune diffusion mesurée'}</span>
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
                  <span>{activeArticle.totalRecipients > 0
                    ? `${activeArticle.readCount} collaborateurs ont validé la lecture sur ${activeArticle.totalRecipients}`
                    : 'Aucun suivi de lecture disponible'}</span>
                </div>
                <div className="w-48 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${activeArticle.readRate}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleBroadcast()}
                disabled={isBroadcasting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isBroadcasting
                    ? 'bg-emerald-700/60 cursor-wait'
                    : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
                } text-white font-medium text-xs shadow-sm transition-all self-start sm:self-auto`}
                title="Diffuser cette alerte par email à tous les collaborateurs de l'entreprise"
              >
                <Send className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-spin' : ''}`} />
                <span>{isBroadcasting ? 'Diffusion en cours…' : 'Diffuser l’alerte aux collaborateurs (Email)'}</span>
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
                  Ce bulletin restera dans cette session. Il ne sera pas envoyé.
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

              <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-semibold block text-slate-900 dark:text-white">Diffusion immédiate par email</span>
                  <span className="text-slate-500">Envoyer ce flash info à tous les collaborateurs via SMTP dès l'enregistrement</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoBroadcast}
                  onChange={(e) => setAutoBroadcast(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 cursor-pointer"
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
                  disabled={isBroadcasting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isBroadcasting ? 'bg-red-700/60 cursor-wait' : 'bg-red-600 hover:bg-red-500 cursor-pointer'
                  } text-white font-medium text-xs`}
                >
                  <Send className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-spin' : ''}`} />
                  <span>{isBroadcasting ? 'Diffusion en cours…' : 'Enregistrer et diffuser'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
