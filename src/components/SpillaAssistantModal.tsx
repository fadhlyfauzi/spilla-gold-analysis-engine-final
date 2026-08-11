import React, { useState, useEffect, useRef } from 'react';
import spillaLogo from '../assets/images/spilla_gold_logo_1786418245382.jpg';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Lock,
  Server,
  User,
  Hash,
  ArrowRight,
  Bot,
  RefreshCw,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  showVerificationForm?: boolean;
}

interface SpillaAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerificationForm?: () => void;
}

export const SpillaAssistantModal: React.FC<SpillaAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenVerificationForm,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: `Halo! Selamat datang di **SPILLA GOLD - MASTER COPY** (Smart • Stable • Consistent) 🚀\n\nSaya adalah AI Assistant resmi Spilla Gold. Saya siap membantu Anda tentang:\n• Strategi trading **XAUUSD (Emas)** berbasis AI & Risk Management.\n• Penggunaan **Akun Demo & Real (Standard / Cent)**.\n• Cara bergabung dengan **Master CopyTrade**.\n• Laporan trading harian di Channel Telegram Resmi: https://t.me/xauusdreport\n\nAda yang ingin Anda tanyakan?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTraderModal, setShowTraderModal] = useState(false);

  // Trader Form State
  const [traderForm, setTraderForm] = useState({
    fullName: '',
    mt5Account: '',
    investorPassword: '',
    brokerServer: 'AIMS-Live',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      // Build history for backend API
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || 'Maaf, terjadi kendala koneksi ke AI Engine. Silakan coba beberapa saat lagi.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showVerificationForm: data.showVerificationForm,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `Halo! Terima kasih atas pertanyaannya.\n\nUntuk bergabung dengan **Spilla Gold Master Copy**, silakan isi form **Verifikasi Akun Trader** terlebih dahulu agar langsung terhubung ke Link CopyTrade Follower!\n\nOfficial Telegram: https://t.me/xauusdreport`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showVerificationForm: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTraderFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      // Redirect to Master CopyTrade Follower link
      window.open('https://social.aimsxchange.com/portal/registration/subscription/82071/spilla123', '_blank');
      setShowTraderModal(false);
      setFormSubmitted(false);
    }, 1200);
  };

  const renderFormattedText = (txt: string) => {
    // Basic formatting for bold, links, bullet points
    const lines = txt.split('\n');
    return lines.map((line, idx) => {
      let content = line;

      // Replace Telegram links with interactive clickable badges
      if (content.includes('https://t.me/xauusdreport')) {
        return (
          <p key={idx} className="my-1.5">
            <a
              href="https://t.me/xauusdreport"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E5B842]/20 hover:bg-[#E5B842]/30 text-[#E5B842] border border-[#E5B842]/40 rounded-lg text-xs font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Channel Telegram Resmi (@xauusdreport)</span>
            </a>
          </p>
        );
      }

      // Format bold text
      const parts = content.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="min-h-[1.2rem] leading-relaxed my-0.5">
          {parts.map((p, i) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={i} className="text-amber-300 font-black">{p.slice(2, -2)}</strong>;
            }
            return p;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Modal Backdrop & Chat Window */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="bg-[#0F121A] border-2 border-[#E5B842]/40 rounded-2xl w-full max-w-2xl h-[90vh] max-h-[700px] shadow-2xl flex flex-col overflow-hidden relative font-sans">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#151924] via-[#0F121A] to-[#151924] p-4 border-b border-gray-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={spillaLogo}
                alt="SPILLA GOLD Logo"
                className="w-10 h-10 rounded-xl object-cover border border-[#E5B842]/50 shadow-md shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white tracking-wider uppercase">
                    SPILLA GOLD - MASTER COPY
                  </h3>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AI ASSISTANT
                  </span>
                </div>
                <p className="text-[11px] text-[#E5B842] font-semibold">
                  Smart • Stable • Consistent
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Telegram Banner */}
          <div className="bg-[#151924] px-4 py-2 border-b border-gray-800/80 flex items-center justify-between text-xs">
            <span className="text-gray-300 font-medium flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Channel: </span>
              <a
                href="https://t.me/xauusdreport"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E5B842] font-bold hover:underline flex items-center gap-1"
              >
                t.me/xauusdreport
                <ExternalLink className="w-3 h-3" />
              </a>
            </span>

            <button
              onClick={() => setShowTraderModal(true)}
              className="px-2.5 py-1 rounded-lg bg-[#E5B842] hover:bg-amber-400 text-black font-extrabold text-[10px] tracking-wider uppercase transition-all shadow-md cursor-pointer flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              <span>Verifikasi Akun CopyTrade</span>
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0E14] text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl shadow-md space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-[#E5B842] text-black font-medium rounded-tr-none'
                      : 'bg-[#151924] text-gray-200 border border-gray-800 rounded-tl-none'
                  }`}
                >
                  <div className="text-xs">{renderFormattedText(m.text)}</div>

                  {m.showVerificationForm && m.sender === 'bot' && (
                    <div className="pt-2 border-t border-gray-700/60 mt-2">
                      <button
                        onClick={() => setShowTraderModal(true)}
                        className="w-full py-2 px-3 rounded-xl bg-[#E5B842] hover:bg-amber-400 text-black font-black text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>VERIFIKASI AKUN TRADER SEKARANG</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span
                    className={`text-[9px] block text-right font-mono mt-1 ${
                      m.sender === 'user' ? 'text-black/60' : 'text-gray-500'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-amber-300 font-medium animate-pulse bg-[#151924] p-3 rounded-2xl border border-gray-800 w-max">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E5B842]" />
                <span>SPILLA AI sedang mengetik balasan...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="bg-[#151924] px-3 py-2 border-t border-gray-800/80 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none shrink-0">
            <button
              onClick={() => handleSendMessage('Gimana cara ikutan CopyTrade?')}
              className="px-2.5 py-1 rounded-full bg-gray-800/80 hover:bg-gray-700 text-amber-300 border border-amber-500/30 whitespace-nowrap transition-all cursor-pointer"
            >
              🚀 Cara Ikutan CopyTrade
            </button>
            <button
              onClick={() => handleSendMessage('Apa strategi trading Spilla Gold?')}
              className="px-2.5 py-1 rounded-full bg-gray-800/80 hover:bg-gray-700 text-emerald-300 border border-emerald-500/30 whitespace-nowrap transition-all cursor-pointer"
            >
              📈 Strategi XAUUSD AI
            </button>
            <button
              onClick={() => handleSendMessage('Bisa pakai Akun Demo atau Cent?')}
              className="px-2.5 py-1 rounded-full bg-gray-800/80 hover:bg-gray-700 text-cyan-300 border border-cyan-500/30 whitespace-nowrap transition-all cursor-pointer"
            >
              💡 Demo & Cent Account
            </button>
            <button
              onClick={() => handleSendMessage('Minta link Telegram resmi')}
              className="px-2.5 py-1 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white border border-gray-600 whitespace-nowrap transition-all cursor-pointer"
            >
              📢 Telegram Channel
            </button>
          </div>

          {/* Chat Input Field */}
          <div className="p-3 bg-[#0F121A] border-t border-gray-800 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ketik pertanyaan seputar Spilla Gold, CopyTrade, MT5..."
              className="flex-1 bg-[#151924] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E5B842] transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-xl bg-[#E5B842] hover:bg-amber-400 text-black font-bold disabled:opacity-40 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trader Verification Modal Form */}
      {showTraderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-sans">
          <div className="bg-[#0F121A] border-2 border-[#E5B842] rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowTraderModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 text-center border-b border-gray-800 pb-4">
              <span className="text-[10px] font-black text-[#E5B842] uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#E5B842]/10 border border-[#E5B842]/30 inline-block mb-1">
                VERIFIKASI AKUN TRADER
              </span>
              <h3 className="text-xl font-black text-white">SPILLA GOLD - MASTER COPY</h3>
              <p className="text-xs text-gray-400">
                Lengkapi data akun MT5 Anda untuk melanjutkan ke Link CopyTrade Follower.
              </p>
            </div>

            <form onSubmit={handleTraderFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#E5B842]" />
                  <span>1. Nama Lengkap / Username:</span>
                </label>
                <input
                  type="text"
                  required
                  value={traderForm.fullName}
                  onChange={(e) => setTraderForm({ ...traderForm, fullName: e.target.value })}
                  placeholder="Contoh: Trader Quant"
                  className="w-full bg-[#151924] border border-gray-800 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E5B842]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#E5B842]" />
                  <span>2. Nomor Akun Trader (MT5):</span>
                </label>
                <input
                  type="text"
                  required
                  value={traderForm.mt5Account}
                  onChange={(e) => setTraderForm({ ...traderForm, mt5Account: e.target.value })}
                  placeholder="Contoh: 88102349"
                  className="w-full bg-[#151924] border border-gray-800 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E5B842]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#E5B842]" />
                  <span>3. Password Investor / Akun Trader:</span>
                </label>
                <input
                  type="password"
                  required
                  value={traderForm.investorPassword}
                  onChange={(e) => setTraderForm({ ...traderForm, investorPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#151924] border border-gray-800 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E5B842]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#E5B842]" />
                  <span>4. Server Broker:</span>
                </label>
                <input
                  type="text"
                  required
                  value={traderForm.brokerServer}
                  onChange={(e) => setTraderForm({ ...traderForm, brokerServer: e.target.value })}
                  placeholder="Contoh: AIMS-Live / AIMS-Demo"
                  className="w-full bg-[#151924] border border-gray-800 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E5B842]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formSubmitted}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#E5B842] hover:bg-amber-400 text-black font-black text-xs transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                >
                  {formSubmitted ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Memverifikasi & Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <span>LANJUTKAN KE LINK COPYTRADE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-gray-500">
                🔒 Data verifikasi terenkripsi aman dan diproses langsung oleh sistem SPILLA GOLD.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
