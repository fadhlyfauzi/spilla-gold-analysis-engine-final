import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

class SpillaAssistantService {
  private getGenAI(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  public async chat(userMessage: string, history: ChatMessage[] = []): Promise<{ reply: string; showVerificationForm?: boolean }> {
    const systemInstruction = `Anda adalah AI Assistant resmi untuk "SPILLA GOLD - MASTER COPY".
Tugas Anda adalah memberikan informasi resmi seputar ekosistem Spilla Gold, menyertakan media/pautan resmi, serta mengarahkan pengguna ke alur CopyTrade (CT) terbaru.

---
BRAND IDENTIFICATION & MEDIA
- Nama Brand: SPILLA GOLD - MASTER COPY
- Slogan: Smart • Stable • Consistent
- Official Telegram Channel: https://t.me/xauusdreport
- Visual Branding: Logo Emas Spilla Gold dengan latar hitam / emas elegan.

---
PILIHAN MASTER COPYTRADE DI PAGE MASTER AI
Di platform kami tersedia pilihan Master CopyTrade berikut:

1. ♾️ SPILLA INFINITY (PREMIUM MASTER COPY TRADE)
   - Modal Minimum: $1,000
   - Bagi Hasil: 70% Investor : 30% Master
   - Akses: Lifetime (S&K)
   - Keunggulan: Kapasitas modal mulai $1,000, Sistem Copy Trade otomatis, Akses lifetime, Investor menggunakan akun trading sendiri, Transaksi Master diikuti secara otomatis, Dipantau via platform copy trade.
   - Link Follow: https://social.aimsxchange.com/portal/registration/subscription/82085/spilla123

2. 🥇 SPILLA SCOUT ($50, Bagi Hasil 70:30)
3. 🥈 SPILLA ELITE ($100, Bagi Hasil 70:30)
4. 🥉 SPILLA HUNTER ($250, Bagi Hasil 70:30)
5. ⚡ SPILLA STRIKER ($500+, Bagi Hasil 70:30)

DISCLAIMER:
Trading memiliki risiko. Profit tidak dijamin dan kerugian dapat terjadi. Hasil pada setiap akun dapat berbeda tergantung kondisi pasar, pengaturan copy trade, dan faktor lainnya.

---
ALUR AKSES LINK FOLLOWER / LINK CT
Sebelum pengguna masuk ke link follower / link CT (seperti link Spilla Infinity), alurnya adalah:
1. Pengguna wajib masuk ke halaman/form Login Akun Trader terlebih dahulu.
2. Pengguna menginput:
   - Username / Nama
   - Nomor Akun Trader (MT5/MT4)
   - Password Akun Trader
   - Server Broker
3. Hasil login tersimpan secara otomatis ke Database Admin pada Dashboard Admin (pada tab khusus data login akun trader).
4. Setelah submit/login selesai, sistem secara otomatis mengarahkan (redirect) pengguna ke Link Follower / Link CT Spilla Infinity.

---
TAHAP INTERAKSI CHATBOT ASSISTANT
- Jika pengguna bertanya tentang informasi, berikan bantuan/penjelasan singkat dan arahkan ke link Telegram resmi: https://t.me/xauusdreport
- Jika pengguna meminta link CopyTrade / Spilla Infinity, jelaskan pilihan Spilla Infinity dan infokan bahwa mereka harus melewati halaman Login Akun Trader terlebih dahulu sebelum di-redirect ke link tersebut.
- Tone & Style: Profesional, ramah, jujur, sopan, dan transparan. DILARANG memberikan janji fixed profit.`;

    const aiClient = this.getGenAI();

    // Fallback if GEMINI_API_KEY is not configured or fails
    if (!aiClient) {
      return this.getFallbackReply(userMessage);
    }

    try {
      // Format chat history for Gemini SDK
      const contents = history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      }));

      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const replyText = response.text || 'Maaf, sistem AI Spilla Gold sedang memproses. Silakan coba beberapa saat lagi.';
      const showVerificationForm =
        userMessage.toLowerCase().includes('copytrade') ||
        userMessage.toLowerCase().includes('ikutan') ||
        userMessage.toLowerCase().includes('daftar') ||
        userMessage.toLowerCase().includes('join') ||
        userMessage.toLowerCase().includes('login');

      return {
        reply: replyText,
        showVerificationForm,
      };
    } catch (err: any) {
      console.error('Error calling Gemini API for Spilla Assistant:', err?.message || err);
      return this.getFallbackReply(userMessage);
    }
  }

  private getFallbackReply(userMessage: string): { reply: string; showVerificationForm?: boolean } {
    const lower = userMessage.toLowerCase();

    if (lower.includes('infinity') || lower.includes('spilla infinity') || lower.includes('copytrade') || lower.includes('ikutan') || lower.includes('daftar') || lower.includes('join') || lower.includes('cara')) {
      return {
        reply: `Halo! Terima kasih atas ketertarikan Anda bergabung dengan **SPILLA GOLD - MASTER COPY** (Smart • Stable • Consistent) 🚀\n\n♾️ **SPILLA INFINITY - PREMIUM MASTER COPY TRADE**\nDetail Master:\n• Modal Minimum: $1,000\n• Bagi Hasil: 70% Investor : 30% Master\n• Akses: Lifetime (S&K)\n• Keunggulan: Otomatisasi Copy Trade, Investor menggunakan akun sendiri, Transaksi diikuti otomatis & real-time.\n• Link Direct Follow: https://social.aimsxchange.com/portal/registration/subscription/82085/spilla123\n\n📌 **ALUR AKSES COPYTRADE:**\n1️⃣ Masuk ke form **Login Akun Trader**.\n2️⃣ Input Username/Nama, Nomor Akun Trader, Password Akun Trader, dan Server Broker.\n3️⃣ Setelah data tersimpan, sistem akan secara otomatis mengarahkan (redirect) Anda ke **Link Follower CopyTrade**.\n\nSambil menunggu, pantau laporan trading harian di Channel Telegram Resmi kami:\n👉 https://t.me/xauusdreport`,
        showVerificationForm: true,
      };
    }

    if (lower.includes('telegram') || lower.includes('channel') || lower.includes('report') || lower.includes('laporan')) {
      return {
        reply: `Dapatkan update laporan transaksi harian, analisis teknikal, dan sinyal presisi XAUUSD secara real-time melalui Channel Telegram Resmi SPILLA GOLD:\n\n👉 **Official Telegram Channel**: https://t.me/xauusdreport\n\nBergabung sekarang untuk mendapatkan wawasan langsung dari tim kuantitatif Spilla Gold! ⚡`,
      };
    }

    return {
      reply: `Halo! Selamat datang di **SPILLA GOLD - MASTER COPY** (Smart • Stable • Consistent) ⚡\n\nSaya adalah AI Assistant resmi Spilla Gold. Saya dapat membantu Anda tentang:\n• Pilihan Master CopyTrade (Termasuk **SPILLA INFINITY** $1,000+).\n• Informasi strategi trading XAUUSD (Emas).\n• Alur Login Akun Trader sebelum redirect ke Link Follower CT.\n• Laporan harian di Official Telegram Channel: https://t.me/xauusdreport\n\nAda yang bisa saya bantu hari ini?`,
    };
  }
}

export const spillaAssistantService = new SpillaAssistantService();
