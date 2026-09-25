import React, { useState } from 'react';
import {
  ShieldCheck,
  Phone,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  Mic,
  Send,
  Lock,
  ExternalLink,
  CheckCheck,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  Sparkles,
  Play,
  Pause,
  MessageCircle,
  Sun,
  Moon,
  FileText,
  Image,
  Camera,
  User,
  BarChart2,
  Check,
} from 'lucide-react';
import { Scenario, WhatsAppMessage } from '../../types';

interface WhatsAppSimulatorProps {
  scenario?: Scenario | null;
  onClickedTrap: () => void;
  onReportedPhish: () => void;
  isDark?: boolean;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  scenario,
  onClickedTrap,
  onReportedPhish,
  isDark: initialIsDark = true,
}) => {
  // Allow toggling WhatsApp theme between official Dark (#111B21) and Light (#EFEAE2)
  const [waTheme, setWaTheme] = useState<'dark' | 'light'>(initialIsDark ? 'dark' : 'light');
  const isWaDark = waTheme === 'dark';

  // Active chat conversation switcher
  const [activeChatId, setActiveChatId] = useState<'ceo' | 'it' | 'quishing'>('ceo');

  // Contact configurations
  const contacts = {
    ceo: {
      name: scenario?.whatsappDetails?.senderTitle || 'Marc V. (PDG - Direction Générale)',
      phone: scenario?.whatsappDetails?.senderPhoneNumber || '+33 6 88 12 94 02',
      initials: scenario?.whatsappDetails?.avatarText || 'MV',
      avatarBg: '#075E54', // Official Sapin Teal
      subtitle: 'en ligne',
      unreadCount: 1,
      lastTime: '10:44',
      lastMessage: 'Ne m\'appelle pas, je ne peux pas...',
      isUnknown: true,
    },
    it: {
      name: 'Astreinte DSI & Sécurité IT',
      phone: '+33 7 56 42 19 80',
      initials: 'IT',
      avatarBg: '#128C7E', // Official Sapin Teal secondary
      subtitle: 'en ligne',
      unreadCount: 1,
      lastTime: '09:23',
      lastMessage: '⚠️ Alerte intrusion anormale M365...',
      isUnknown: true,
    },
    quishing: {
      name: 'WhatsApp Business Sécurité',
      phone: '+33 6 19 02 88 41',
      initials: 'WB',
      avatarBg: '#008069',
      subtitle: 'vu aujourd\'hui à 08:30',
      unreadCount: 0,
      lastTime: '08:30',
      lastMessage: 'Synchronisation d\'appareil Pro...',
      isUnknown: true,
    },
  };

  const activeContact = contacts[activeChatId];

  // Ceo Lure Messages
  const initialCeoMessages: WhatsAppMessage[] = [
    {
      id: 'wa-1',
      sender: 'attacker',
      text: 'Bonjour, c\'est Marc. Je suis actuellement en réunion d\'affaires fermée sous clause de confidentialité (NDA) avec nos auditeurs et la banque.',
      timestamp: '10:41',
      status: 'read',
    },
    {
      id: 'wa-2',
      sender: 'attacker',
      text: 'J\'ai un besoin critique et immédiat : notre prestataire d\'hébergement menace de couper nos serveurs à 12h00 si l\'acompte n\'est pas confirmé par virement.',
      timestamp: '10:42',
      status: 'read',
    },
    {
      id: 'wa-3',
      sender: 'attacker',
      text: 'Peux-tu te connecter tout de suite sur le portail d\'approbation rapide et valider le bon de commande ? C\'est strictement confidentiel, ne préviens personne d\'autre pour l\'instant :',
      timestamp: '10:43',
      status: 'read',
      hasLink: true,
      linkUrl: 'https://validation-tresorerie-groupe.net/auth?token=sec-98124',
      linkText: 'Portail Validation Trésorerie · validation-tresorerie-groupe.net',
    },
    {
      id: 'wa-4',
      sender: 'attacker',
      text: 'Ne m\'appelle pas sur ce numéro, je ne peux pas décrocher en réunion devant les auditeurs. Confirme-moi par message ici dès que tu as validé.',
      timestamp: '10:44',
      status: 'read',
    },
  ];

  // IT Lure Messages
  const initialItMessages: WhatsAppMessage[] = [
    {
      id: 'wa-it-1',
      sender: 'attacker',
      text: '⚠️ [DSI GROUPE · Astreinte 24/7] Bonjour, une tentative d\'intrusion anormale a été détectée sur votre session Microsoft 365 à 09h18.',
      timestamp: '09:22',
      status: 'read',
    },
    {
      id: 'wa-it-2',
      sender: 'attacker',
      text: 'Pour bloquer l\'attaquant et éviter la suspension immédiate de votre messagerie, vous devez valider votre second facteur sur notre portail d\'astreinte sous 15 minutes :',
      timestamp: '09:23',
      status: 'read',
      hasLink: true,
      linkUrl: 'https://portail-m365-helpdesk.cloud/renew-token',
      linkText: 'Portail d\'astreinte MFA · portail-m365-helpdesk.cloud',
    },
  ];

  // Quishing Lure Messages
  const initialQuishingMessages: WhatsAppMessage[] = [
    {
      id: 'wa-q-1',
      sender: 'attacker',
      text: '🔒 [WhatsApp Sécurité Entreprise] Dans le cadre du déploiement de la double authentification hybride, veuillez synchroniser votre terminal pro en validant le portail ci-dessous :',
      timestamp: '08:30',
      status: 'read',
      hasLink: true,
      linkUrl: 'https://whatsapp-web-sso.cloud/device-link',
      linkText: 'Synchronisation Appareil Pro · whatsapp-web-sso.cloud',
    },
  ];

  const [chatConversations, setChatConversations] = useState<{
    ceo: WhatsAppMessage[];
    it: WhatsAppMessage[];
    quishing: WhatsAppMessage[];
  }>({
    ceo: scenario?.whatsappDetails?.messages || initialCeoMessages,
    it: initialItMessages,
    quishing: initialQuishingMessages,
  });

  const messages = chatConversations[activeChatId];

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCounterCallModal, setShowCounterCallModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sending message simulation
  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    const userMsg: WhatsAppMessage = {
      id: `user-${Date.now()}`,
      sender: 'collaborator',
      text: content,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    setChatConversations((prev) => ({
      ...prev,
      [activeChatId]: [...prev[activeChatId], userMsg],
    }));

    if (!textToSend) setInputText('');

    // Simulate attacker typing & psychological pressure reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Dépêche-toi s\'il te plaît, le directeur financier attend ma confirmation pour débloquer les serveurs !';
      if (content.toLowerCase().includes('fixe') || content.toLowerCase().includes('appelle') || content.toLowerCase().includes('téléphone')) {
        replyText = 'Je t\'ai dit que je suis enfermé en négociation avec les auditeurs, je ne peux pas prendre d\'appel ! Fais la validation sur le portail rapidement.';
      } else if (content.toLowerCase().includes('procédure') || content.toLowerCase().includes('comptable') || content.toLowerCase().includes('rib')) {
        replyText = 'C\'est une dérogation exceptionnelle que j\'assume personnellement. Clique sur le lien et je signe l\'ordre en revenant.';
      } else if (content.toLowerCase().includes('lien') || content.toLowerCase().includes('valide')) {
        replyText = 'Parfait, clique immédiatement sur le lien au-dessus et dis-moi dès que la page confirme la validation.';
      }

      const botMsg: WhatsAppMessage = {
        id: `att-reply-${Date.now()}`,
        sender: 'attacker',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };

      setChatConversations((prev) => ({
        ...prev,
        [activeChatId]: [...prev[activeChatId], botMsg],
      }));
    }, 1400);
  };

  // Official Colors Palette strictly matching user specifications:
  // * Le Vert Clair (Vibrant) – #25D366 (Main brand signature, logo, unread badges, primary buttons, online dot)
  // * Le Vert Sapin (Teal) – #075E54 et #128C7E (Structural contrast, headers, avatars)
  // * Le Fond Noir (Mode Sombre) – #111B21 (Global chat background)
  // * Bulles Envoyées (Mode Sombre) – #005C4B (Official discreet dark green)
  // * Bulles Reçues (Mode Sombre) – #2A3942 (Official dark blue-gray)
  //
  // Mode Clair WhatsApp:
  // * Header – #008069 / #075E54
  // * Fond – #EFEAE2 (Beige WhatsApp)
  // * Bulles Envoyées – #D9FDD3 (Light green)
  // * Bulles Reçues – #FFFFFF (White)
  const colors = isWaDark
    ? {
        mainBg: '#111B21',
        sidebarBg: '#111B21',
        headerBg: '#202C33',
        headerBorder: '#222D34',
        searchBarBg: '#202C33',
        searchInputBg: '#111B21',
        chatBorder: '#222D34',
        chatHover: '#202C33',
        chatActive: '#2A3942',
        receivedBubble: '#2A3942',
        sentBubble: '#005C4B',
        textPrimary: '#E9EDEF',
        textSecondary: '#8696A0',
        inputBarBg: '#202C33',
        inputFieldBg: '#2A3942',
        encryptionPillBg: '#182229',
        encryptionPillBorder: '#222E35',
        encryptionText: '#FFD279',
        dateChipBg: '#182229',
        cardBg: '#182229',
        cardBorder: '#222D34',
      }
    : {
        mainBg: '#EFEAE2',
        sidebarBg: '#FFFFFF',
        headerBg: '#075E54', // Official Sapin Teal for classic WhatsApp header
        headerBorder: '#064F46',
        searchBarBg: '#F0F2F5',
        searchInputBg: '#FFFFFF',
        chatBorder: '#E9EDEF',
        chatHover: '#F5F6F6',
        chatActive: '#EBEFEB',
        receivedBubble: '#FFFFFF',
        sentBubble: '#D9FDD3',
        textPrimary: '#111B21',
        textSecondary: '#667781',
        inputBarBg: '#F0F2F5',
        inputFieldBg: '#FFFFFF',
        encryptionPillBg: '#FFEECD',
        encryptionPillBorder: '#F5DFB5',
        encryptionText: '#54656F',
        dateChipBg: '#FFFFFF',
        cardBg: '#F0F2F5',
        cardBorder: '#D1D7DB',
      };

  return (
    <div
      className="flex-1 flex flex-col h-full select-none overflow-hidden font-sans"
      style={{ backgroundColor: colors.mainBg, color: colors.textPrimary }}
    >
      {/* 1. WHATSAPP WEB TOPBAR / MODE CONTROLS */}
      <div
        className="px-4 py-2 border-b flex items-center justify-between text-xs z-10 shrink-0"
        style={{
          backgroundColor: isWaDark ? '#1F2C34' : '#008069',
          borderColor: isWaDark ? '#222D34' : '#075E54',
          color: '#FFFFFF',
        }}
      >
        <div className="flex items-center gap-2">
          {/* Authentic WhatsApp Bubble Logo */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shadow-xs"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.25 7.15C9.07 7.15 8.78 7.22 8.53 7.48C8.28 7.75 7.57 8.41 7.57 9.76C7.57 11.11 8.55 12.41 8.69 12.6C8.83 12.78 10.6 15.53 13.34 16.71C14 17 14.52 17.17 14.92 17.3C15.6 17.5 16.22 17.48 16.71 17.41C17.26 17.33 18.4 16.72 18.64 16.05C18.88 15.37 18.88 14.8 18.81 14.67C18.74 14.55 18.56 14.48 18.28 14.34C18.01 14.2 16.69 13.55 16.44 13.46C16.19 13.37 16.01 13.32 15.83 13.6C15.65 13.87 15.13 14.48 14.97 14.67C14.81 14.85 14.65 14.87 14.38 14.74C14.1 14.6 13.23 14.31 12.19 13.39C11.38 12.67 10.84 11.78 10.68 11.51C10.52 11.23 10.66 11.08 10.8 10.94C10.93 10.81 11.09 10.6 11.23 10.43C11.37 10.26 11.41 10.14 11.51 9.94C11.6 9.74 11.55 9.57 11.48 9.43C11.41 9.29 10.86 7.95 10.64 7.4C10.42 6.87 10.2 6.94 10.03 6.93C9.88 6.93 9.7 6.93 9.52 6.93L9.25 7.15Z" />
            </svg>
          </div>
          <span className="font-semibold tracking-wide">WhatsApp Web</span>
          <span className="text-[11px] opacity-80 hidden sm:inline">· Simulation Cyber VIGILO</span>
        </div>

        {/* WhatsApp Theme Switcher (Dark Mode / Light Mode) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg p-0.5 border border-white/20 bg-black/20 text-[11px]">
            <button
              onClick={() => setWaTheme('dark')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                isWaDark ? 'bg-white/20 text-white font-bold' : 'text-white/70 hover:text-white'
              }`}
              title="Mode Sombre officiel WhatsApp (#111B21, #005C4B, #2A3942)"
            >
              <Moon className="w-3 h-3" />
              <span>Sombre</span>
            </button>
            <button
              onClick={() => setWaTheme('light')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                !isWaDark ? 'bg-white/30 text-white font-bold shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Mode Clair classique WhatsApp (#075E54, #EFEAE2, #D9FDD3)"
            >
              <Sun className="w-3 h-3" />
              <span>Clair</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WHATSAPP SPLIT LAYOUT (SIDEBAR + CHAT AREA) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: CHAT LIST SIDEBAR */}
        <div
          className="w-72 sm:w-80 md:w-88 border-r flex flex-col shrink-0 overflow-hidden transition-colors"
          style={{
            backgroundColor: colors.sidebarBg,
            borderColor: colors.headerBorder,
          }}
        >
          {/* User profile bar */}
          <div
            className="px-4 py-3 flex items-center justify-between border-b shrink-0"
            style={{
              backgroundColor: isWaDark ? colors.headerBg : '#F0F2F5',
              borderColor: colors.headerBorder,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-xs"
                style={{ backgroundColor: '#128C7E' }}
              >
                PRO
              </div>
              <div className="leading-tight">
                <span className="font-semibold text-xs block truncate" style={{ color: colors.textPrimary }}>
                  Session Collaborateur
                </span>
                <span className="text-[10px]" style={{ color: colors.textSecondary }}>
                  Compte d'entreprise
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
              <button
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Statut"
              >
                <span className="w-4 h-4 rounded-full border-2 border-current block" />
              </button>
              <button
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Nouvelle discussion"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div
            className="p-2 border-b shrink-0"
            style={{
              backgroundColor: isWaDark ? colors.mainBg : '#FFFFFF',
              borderColor: colors.headerBorder,
            }}
          >
            <div
              className="rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs"
              style={{
                backgroundColor: colors.searchBarBg,
                color: colors.textSecondary,
              }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: colors.textSecondary }} />
              <input
                type="text"
                placeholder="Rechercher ou démarrer une discussion"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs focus:outline-none w-full"
                style={{ color: colors.textPrimary }}
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: colors.headerBorder }}>
            {/* Conversation 1: CEO Lure (Active) */}
            <div
              onClick={() => setActiveChatId('ceo')}
              className="p-3 flex items-center gap-3 cursor-pointer transition-colors relative"
              style={{
                backgroundColor: activeChatId === 'ceo' ? colors.chatActive : 'transparent',
              }}
            >
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs"
                  style={{ backgroundColor: contacts.ceo.avatarBg }}
                >
                  {contacts.ceo.initials}
                </div>
                {/* Official WhatsApp vibrant green online dot: #25D366 */}
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: '#25D366',
                    borderColor: isWaDark ? '#111B21' : '#FFFFFF',
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="font-semibold truncate" style={{ color: colors.textPrimary }}>
                    {contacts.ceo.name}
                  </span>
                  <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                    {contacts.ceo.lastTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <p className="truncate flex items-center gap-1" style={{ color: colors.textSecondary }}>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] shrink-0" />
                    <span>{contacts.ceo.lastMessage}</span>
                  </p>
                  {/* Official WhatsApp vibrant green unread badge: #25D366 */}
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold text-[#111B21] flex items-center justify-center shrink-0 ml-1 shadow-xs"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    {contacts.ceo.unreadCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation 2: DSI Astreinte IT */}
            <div
              onClick={() => setActiveChatId('it')}
              className="p-3 flex items-center gap-3 cursor-pointer transition-colors relative"
              style={{
                backgroundColor: activeChatId === 'it' ? colors.chatActive : 'transparent',
              }}
            >
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs"
                  style={{ backgroundColor: contacts.it.avatarBg }}
                >
                  {contacts.it.initials}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: '#25D366',
                    borderColor: isWaDark ? '#111B21' : '#FFFFFF',
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="font-semibold truncate" style={{ color: colors.textPrimary }}>
                    {contacts.it.name}
                  </span>
                  <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                    {contacts.it.lastTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <p className="truncate" style={{ color: colors.textSecondary }}>
                    {contacts.it.lastMessage}
                  </p>
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold text-[#111B21] flex items-center justify-center shrink-0 ml-1"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    1
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation 3: Quishing QR Code */}
            <div
              onClick={() => setActiveChatId('quishing')}
              className="p-3 flex items-center gap-3 cursor-pointer transition-colors"
              style={{
                backgroundColor: activeChatId === 'quishing' ? colors.chatActive : 'transparent',
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                style={{ backgroundColor: contacts.quishing.avatarBg }}
              >
                {contacts.quishing.initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="font-semibold truncate" style={{ color: colors.textPrimary }}>
                    {contacts.quishing.name}
                  </span>
                  <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                    {contacts.quishing.lastTime}
                  </span>
                </div>
                <p className="text-[11px] truncate" style={{ color: colors.textSecondary }}>
                  {contacts.quishing.lastMessage}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CHAT WINDOW */}
        <div
          className="flex-1 flex flex-col overflow-hidden relative"
          style={{ backgroundColor: colors.mainBg }}
        >
          {/* A. CONVERSATION HEADER */}
          <div
            className="px-4 py-2.5 flex items-center justify-between border-b shrink-0 z-10 transition-colors shadow-xs"
            style={{
              backgroundColor: isWaDark ? colors.headerBg : '#F0F2F5',
              borderColor: colors.headerBorder,
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs"
                  style={{ backgroundColor: activeContact.avatarBg }}
                >
                  {activeContact.initials}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                  style={{
                    backgroundColor: '#25D366',
                    borderColor: isWaDark ? colors.headerBg : '#FFFFFF',
                  }}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-xs sm:text-sm truncate" style={{ color: colors.textPrimary }}>
                    {activeContact.name}
                  </h3>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.2 rounded border shrink-0"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    Numéro Inconnu
                  </span>
                </div>
                <p className="text-[11px] flex items-center gap-1.5 truncate" style={{ color: colors.textSecondary }}>
                  <span>{activeContact.phone}</span>
                  <span>·</span>
                  <span style={{ color: '#25D366' }} className="font-medium">
                    {activeContact.subtitle}
                  </span>
                </p>
              </div>
            </div>

            {/* VIGILO Reflex Buttons in Header */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Counter-call button (The Golden Rule against Whishing) */}
              <button
                onClick={() => setShowCounterCallModal(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-xs"
                style={{
                  backgroundColor: isWaDark ? '#2A3942' : '#FFFFFF',
                  borderColor: isWaDark ? '#3B4A54' : '#D1D7DB',
                  color: isWaDark ? '#E9EDEF' : '#111B21',
                }}
                title="Tester le réflexe du contre-appel indépendant sur numéro officiel"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#53BDEB]" />
                <span className="hidden md:inline">Tester le contre-appel</span>
              </button>

              {/* VIGILO Report Button: Official Vibrant Green #25D366 */}
              <button
                onClick={onReportedPhish}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md cursor-pointer hover:opacity-95"
                style={{
                  backgroundColor: '#25D366', // Official Vibrant Green signature
                  color: '#111B21',
                }}
                title="Signaler ce message suspect comme tentative de Whishing / Fraude à VIGILO"
              >
                <ShieldCheck className="w-4 h-4 text-[#111B21]" />
                <span>Signaler à VIGILO</span>
              </button>

              <div
                className="hidden lg:flex items-center gap-1 pl-2 border-l"
                style={{
                  borderColor: isWaDark ? '#2A3942' : '#D1D7DB',
                  color: colors.textSecondary,
                }}
              >
                <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* B. CHAT MESSAGES BODY WITH AUTHENTIC WHATSAPP BACKGROUND */}
          <div
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 relative transition-colors"
            style={{
              backgroundColor: colors.mainBg,
              // Authentic WhatsApp subtle doodle wallpaper
              backgroundImage: isWaDark
                ? `radial-gradient(#1e2c34 1px, transparent 1px)`
                : `radial-gradient(#d1d7db 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          >
            {/* Authentic WhatsApp Encryption Banner */}
            <div
              className="max-w-md mx-auto my-2 p-2.5 rounded-lg border shadow-xs flex items-start gap-2 text-center text-[11px] leading-relaxed select-text"
              style={{
                backgroundColor: colors.encryptionPillBg,
                borderColor: colors.encryptionPillBorder,
                color: colors.encryptionText,
              }}
            >
              <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Les messages et les appels sont chiffrés de bout en bout. Aucun tiers en dehors de cette discussion, pas même WhatsApp, ne peut les lire ni les écouter. Cliquez pour en savoir plus.
              </span>
            </div>

            {/* Date separator pill */}
            <div className="flex justify-center my-2">
              <span
                className="px-3 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider shadow-xs"
                style={{
                  backgroundColor: colors.dateChipBg,
                  color: colors.textSecondary,
                }}
              >
                Aujourd'hui
              </span>
            </div>

            {/* Official Unknown Contact Safety Card */}
            <div
              className="max-w-lg mx-auto p-3 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-xs"
              style={{
                backgroundColor: isWaDark ? '#1F2C34' : '#FFFFFF',
                borderColor: colors.headerBorder,
              }}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                  <strong className="text-amber-500">Alerte sécurité :</strong> Cet expéditeur ne figure pas dans vos contacts.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onReportedPhish}
                  className="px-2.5 py-1 rounded text-[11px] font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  Bloquer
                </button>
              </div>
            </div>

            {/* Message Stream with Official WhatsApp Bubbles */}
            <div className="space-y-3 max-w-xl mx-auto pt-2">
              {messages.map((msg) => {
                const isAttacker = msg.sender === 'attacker';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAttacker ? 'items-start' : 'items-end'}`}
                  >
                    {/* Message bubble with authentic WhatsApp pointy tail */}
                    <div
                      className={`relative max-w-[88%] sm:max-w-[80%] rounded-xl p-3 shadow-xs text-xs leading-relaxed select-text ${
                        isAttacker ? 'rounded-tl-xs' : 'rounded-tr-xs'
                      }`}
                      style={{
                        // Exact WhatsApp Official Colors:
                        // Sombre: Reçu #2A3942 | Envoyé #005C4B
                        // Clair: Reçu #FFFFFF | Envoyé #D9FDD3
                        backgroundColor: isAttacker ? colors.receivedBubble : colors.sentBubble,
                        color: isAttacker
                          ? isWaDark ? '#E9EDEF' : '#111B21'
                          : isWaDark ? '#E9EDEF' : '#111B21',
                      }}
                    >
                      {/* Triangle speech notch */}
                      <span
                        className="absolute top-0 w-0 h-0 border-solid"
                        style={
                          isAttacker
                            ? {
                                left: '-7px',
                                borderWidth: '0 8px 8px 0',
                                borderColor: `transparent ${colors.receivedBubble} transparent transparent`,
                              }
                            : {
                                right: '-7px',
                                borderWidth: '8px 8px 0 0',
                                borderColor: `${colors.sentBubble} transparent transparent transparent`,
                              }
                        }
                      />

                      {/* Attacker Sender info */}
                      {isAttacker && (
                        <div
                          className="text-[11px] font-bold mb-1 flex items-center gap-1.5"
                          style={{ color: '#25D366' }} // Official WhatsApp green signature
                        >
                          <span>{activeContact.name}</span>
                          <span
                            className="text-[10px] font-normal"
                            style={{ color: colors.textSecondary }}
                          >
                            ({activeContact.phone})
                          </span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Phishing Trap Link Card: WhatsApp rich preview format */}
                      {msg.hasLink && (
                        <div
                          onClick={onClickedTrap}
                          className="mt-2.5 p-2.5 rounded-lg border cursor-pointer transition-all group flex flex-col gap-1.5 shadow-inner"
                          style={{
                            backgroundColor: isWaDark ? '#111B21' : '#FFFFFF',
                            borderColor: colors.chatBorder,
                          }}
                          title="Cliquer pour simuler le comportement du collaborateur"
                        >
                          <div
                            className="flex items-center gap-1.5 font-bold text-[11px]"
                            style={{ color: '#25D366' }}
                          >
                            <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            <span>Portail d'Accès Sécurisé VIGILO</span>
                          </div>

                          <div
                            className="text-xs font-semibold group-hover:underline transition-colors"
                            style={{ color: colors.textPrimary }}
                          >
                            {msg.linkText || 'Cliquer ici pour valider l\'ordre de virement sous 2h'}
                          </div>

                          <div className="text-[10px] font-mono truncate" style={{ color: '#53BDEB' }}>
                            {msg.linkUrl}
                          </div>

                          <div
                            className="pt-1 border-t flex items-center justify-between text-[10px] font-semibold"
                            style={{ borderColor: colors.chatBorder }}
                          >
                            <span className="text-amber-500">Demande d'action sous 2h</span>
                            <span
                              className="flex items-center gap-0.5 font-bold"
                              style={{ color: '#25D366' }}
                            >
                              Ouvrir le portail <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Timestamp & read status receipts */}
                      <div
                        className="flex items-center justify-end gap-1 mt-1 text-[10px]"
                        style={{ color: colors.textSecondary }}
                      >
                        <span>{msg.timestamp}</span>
                        {!isAttacker && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" /> // Official blue double checks
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Simulated Voice Message Lure */}
              {activeChatId === 'ceo' && (
                <div className="flex flex-col items-start">
                  <div
                    className="relative max-w-[88%] sm:max-w-[75%] rounded-xl rounded-tl-xs p-3 text-xs space-y-2 shadow-xs"
                    style={{
                      backgroundColor: colors.receivedBubble,
                      color: colors.textPrimary,
                    }}
                  >
                    <span
                      className="absolute top-0 w-0 h-0 border-solid"
                      style={{
                        left: '-7px',
                        borderWidth: '0 8px 8px 0',
                        borderColor: `transparent ${colors.receivedBubble} transparent transparent`,
                      }}
                    />

                    <div className="flex items-center gap-3">
                      {/* Play button with Official Green: #25D366 */}
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs hover:scale-105 transition-transform"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-4 h-4 text-[#111B21]" />
                        ) : (
                          <Play className="w-4 h-4 fill-[#111B21] text-[#111B21]" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        {/* Audio wave visualization */}
                        <div className="flex items-center gap-0.5 h-5">
                          {[10, 18, 8, 22, 14, 26, 12, 20, 9, 24, 16, 12, 18, 8, 14, 22, 10].map(
                            (h, idx) => (
                              <span
                                key={idx}
                                className="w-1 rounded-full transition-colors"
                                style={{
                                  height: `${h}px`,
                                  backgroundColor: isPlayingAudio && idx < 8 ? '#25D366' : colors.textSecondary,
                                }}
                              />
                            )
                          )}
                        </div>
                        <div
                          className="flex items-center justify-between text-[10px]"
                          style={{ color: colors.textSecondary }}
                        >
                          <span>{isPlayingAudio ? '0:07 / 0:18' : '0:18'}</span>
                          <span className="font-semibold" style={{ color: '#25D366' }}>
                            Note vocale urgente du PDG
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-end text-[10px]"
                      style={{ color: colors.textSecondary }}
                    >
                      <span>10:45</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div
                  className="flex items-center gap-2 text-xs italic px-2 animate-pulse"
                  style={{ color: colors.textSecondary }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#25D366' }}
                  />
                  <span>{activeContact.name} est en train d'écrire...</span>
                </div>
              )}
            </div>

            {/* Quick Testing Bar for Administrators / Evaluators */}
            <div
              className="max-w-xl mx-auto mt-6 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              }}
            >
              <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                <strong>VIGILO Test :</strong> Cliquez sur le lien pour simuler un collaborateur piégé et déclencher la formation WhatsApp Whishing, ou sur <em>Signaler</em> pour tester le réflexe de défense.
              </span>
              <button
                onClick={onClickedTrap}
                className="px-3 py-1.5 rounded-lg text-red-500 border border-red-500/40 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 hover:bg-red-500/10"
              >
                Simuler le piège (Clic)
              </button>
            </div>
          </div>

          {/* C. QUICK SUGGESTED ANSWERS */}
          <div
            className="px-4 py-2 border-t flex items-center gap-2 overflow-x-auto shrink-0 z-10"
            style={{
              backgroundColor: isWaDark ? colors.headerBg : '#F0F2F5',
              borderColor: colors.headerBorder,
            }}
          >
            <span
              className="text-[10px] uppercase font-mono shrink-0 font-bold"
              style={{ color: colors.textSecondary }}
            >
              Réponses types :
            </span>
            {[
              '📞 Je t\'appelle d\'abord sur ton fixe officiel',
              '🔒 Respect de la procédure comptable habituelle',
              '⚠️ D\'accord, je clique sur le lien pour valider',
            ].map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(reply)}
                className="px-2.5 py-1 rounded-full border text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-xs hover:border-[#25D366]"
                style={{
                  backgroundColor: isWaDark ? '#111B21' : '#FFFFFF',
                  borderColor: colors.headerBorder,
                  color: colors.textPrimary,
                }}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* D. AUTHENTIC WHATSAPP INPUT BAR */}
          <div
            className="p-3 border-t flex items-center gap-2.5 shrink-0 z-10 transition-colors"
            style={{
              backgroundColor: isWaDark ? colors.inputBarBg : '#F0F2F5',
              borderColor: colors.headerBorder,
            }}
          >
            {/* Smile / Emoji */}
            <button
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
              style={{ color: colors.textSecondary }}
              title="Émojis"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Paperclip / Attachments */}
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                style={{ color: colors.textSecondary }}
                title="Joindre"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Attachment Popover menu */}
              {showAttachMenu && (
                <div
                  className="absolute bottom-12 left-0 p-2 rounded-xl shadow-xl border flex flex-col gap-2 z-30 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    backgroundColor: isWaDark ? '#202C33' : '#FFFFFF',
                    borderColor: colors.headerBorder,
                  }}
                >
                  {[
                    { label: 'Document', icon: FileText, color: '#7F66FF' },
                    { label: 'Photos et vidéos', icon: Image, color: '#007BFC' },
                    { label: 'Caméra', icon: Camera, color: '#FF2E74' },
                    { label: 'Contact', icon: User, color: '#009DE2' },
                    { label: 'Sondage', icon: BarChart2, color: '#FFBC38' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        onClick={() => setShowAttachMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 text-xs transition-colors"
                        style={{ color: colors.textPrimary }}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: item.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex-1 flex items-center"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Écrivez un message sur WhatsApp..."
                className="w-full px-4 py-2 rounded-lg text-xs focus:outline-none transition-colors"
                style={{
                  backgroundColor: colors.inputFieldBg,
                  color: colors.textPrimary,
                }}
              />
            </form>

            {/* Mic or Send button: Official Vibrant Green #25D366 */}
            {inputText.trim() ? (
              <button
                onClick={() => handleSendMessage()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: '#25D366' }} // Official signature green
                title="Envoyer"
              >
                <Send className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                style={{ color: colors.textSecondary }}
                title="Message vocal"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. MODAL DE CONTRE-APPEL (LA RÈGLE D'OR WHATSAPP) */}
      {showCounterCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: isWaDark ? '#111B21' : '#FFFFFF',
              borderColor: isWaDark ? '#2A3942' : '#D1D7DB',
              color: colors.textPrimary,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                style={{ backgroundColor: '#075E54' }}
              >
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-semibold" style={{ color: '#25D366' }}>
                  Réflexe VIGILO · Règle d'or
                </span>
                <h3 className="text-base font-bold" style={{ color: colors.textPrimary }}>
                  Le Contre-Appel Indépendant
                </h3>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border text-xs space-y-2 leading-relaxed"
              style={{
                backgroundColor: isWaDark ? '#182229' : '#F0F2F5',
                borderColor: isWaDark ? '#222D34' : '#E2E8F0',
              }}
            >
              <p className="font-semibold text-emerald-500">
                Vous composez le numéro fixe officiel de Marc figurant dans l'annuaire d'entreprise :
              </p>
              <p className="italic border-l-2 pl-3 py-1" style={{ borderColor: '#25D366' }}>
                « Allô ? Marc à l'appareil. Un virement d'urgence sur WhatsApp ? C'est absolument faux, je n'ai envoyé aucun message ! C'est une tentative de fraude au président ! »
              </p>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
              <strong>Bilan :</strong> En passant par un canal séparé (le poste fixe interne), vous venez de neutraliser l'attaque en moins de 30 secondes sans rien compromettre !
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCounterCallModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer border"
                style={{
                  borderColor: colors.headerBorder,
                  color: colors.textSecondary,
                }}
              >
                Retour au chat
              </button>
              <button
                onClick={() => {
                  setShowCounterCallModal(false);
                  onReportedPhish();
                }}
                className="px-4 py-2 rounded-lg font-bold text-xs text-[#111B21] shadow-md cursor-pointer hover:opacity-95"
                style={{ backgroundColor: '#25D366' }}
              >
                Signaler la tentative à VIGILO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
