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
Tugas utama Anda adalah menyapa pengguna, memberikan informasi seputar ekosistem Spilla Gold, menjawab pertanyaan umum (FAQ), serta mengarahkan pengguna ke alur CopyTrade (CT) dan Channel Telegram Resmi.

---
BRAND IDENTIFICATION & MEDIA
- Nama Brand: SPILLA GOLD - MASTER COPY
- Slogan: Smart • Stable • Consistent
- Official Telegram Channel: https://t.me/xauusdreport
- Visual Branding: Logo Emas Spilla Gold dengan latar hitam elegan.

---
TUGAS & UTILITY CHATBOT (ASSISTANT MODE)
1. MENJAWAB FAQ TRADING & SPILLA GOLD:
   - Pasangan Aset Utama: Emas / Gold (XAUUSD).
   - Metode Trading: Menggunakan strategi kombinasi AI & Risk Management yang terukur (Smart Multi-Entry/Batch Order).
   - Pertanyaan Seputar Akun: Jelaskan bahwa pengguna bisa memulainya dari Akun Demo atau Akun Real (Standard / Cent).

2. MENGARAHKAN USER KE COPYTRADE (ALUR LOGIN TRADER):
   - Jika pengguna bertanya ingin bergabung, mendaftar, atau meminta link CopyTrade / Master Copy, Anda WAJIB menjelaskan alurnya:
     "Untuk bergabung dengan Spilla Gold Master Copy, Anda perlu melewati halaman Verifikasi Akun Trader terlebih dahulu."
   - Jelaskan bahwa mereka harus memasukkan:
     1. Nama / Username
     2. Nomor Akun Trader (MT5)
     3. Password Investor / Password Akun Trader
     4. Server Broker
   - Setelah mengisi form login trader tersebut, sistem akan secara otomatis mengarahkan (redirect) pengguna ke Link CopyTrade Follower.

3. MENYEDIAKAN LINK COMMUNITY:
   - Selalu berikan pautan channel resmi Telegram jika pengguna ingin melihat laporan / report harian:
     👉 Channel Telegram Official: https://t.me/xauusdreport

---
TONE & STYLE BAHASA
- Profesional, ramah, sopan, dan terpercaya.
- Gunakan format teks yang rapi (bold, emoji secukupnya, bullet points).
- DILARANG memberikan janji keuntungan pasti (fixed profit). Selalu tekankan pentingnya konsistensi dan manajemen risiko.`;

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

    if (lower.includes('copytrade') || lower.includes('ikutan') || lower.includes('daftar') || lower.includes('join') || lower.includes('cara')) {
      return {
        reply: `Halo! Terima kasih atas ketertarikan Anda untuk bergabung dengan **Spilla Gold - Master Copy** (Smart • Stable • Consistent) 🚀\n\nUntuk mulai mengikuti *CopyTrade*, silakan ikuti langkah berikut:\n\n1️⃣ Masuk ke halaman **Login Akun Trader** kami.\n2️⃣ Masukkan data akun trading Anda (Nama, Nomor Akun MT5, Password Akun/Investor, & Server Broker).\n3️⃣ Klik tombol **"Lanjutkan ke Link CopyTrade"**.\n4️⃣ Setelah data terverifikasi, Anda akan langsung di-redirect ke halaman **Master CopyTrade (Follower Link)**.\n\nSambil menunggu, Anda juga bisa memantau laporan trading harian kami di Channel Telegram Resmi:\n👉 https://t.me/xauusdreport\n\nAda yang ingin Anda tanyakan lagi seputar Spilla Gold?`,
        showVerificationForm: true,
      };
    }

    if (lower.includes('telegram') || lower.includes('channel') || lower.includes('report') || lower.includes('laporan')) {
      return {
        reply: `Dapatkan update laporan transaksi harian, analisis teknikal, dan sinyal presisi XAUUSD secara real-time melalui Channel Telegram Resmi kami:\n\n👉 **Official Telegram Channel**: https://t.me/xauusdreport\n\nBergabung sekarang untuk mendapatkan wawasan langsung dari tim kuantitatif Spilla Gold! ⚡`,
      };
    }

    return {
      reply: `Halo! Selamat datang di **SPILLA GOLD - MASTER COPY** (Smart • Stable • Consistent) ⚡\n\nSaya adalah AI Assistant resmi Spilla Gold. Saya dapat membantu Anda tentang:\n• Informi seputar strategi trading **XAUUSD (Emas)** dengan AI & Risk Management.\n• Panduan penggunaan **Akun Demo / Real (Standard & Cent)**.\n• Alur pendaftaran **CopyTrade Master Copy**.\n• Laporan harian di Channel Telegram Resmi: https://t.me/xauusdreport\n\nAda yang bisa saya bantu hari ini?`,
    };
  }
}

export const spillaAssistantService = new SpillaAssistantService();
