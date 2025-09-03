// api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed (usa POST)" });
  }
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Missing message" });
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY (aggiungila in Vercel Settings → Environment)" });
  }
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Sei un assistente spirituale ed esoterico. Tono caldo, mistico, positivo. Non dare consigli medici/legali/psicologici." },
          { role: "user", content: message }
        ],
        temperature: 0.8,
        max_tokens: 220
      })
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.error?.message || "OpenAI error" });
    }
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(200).json({ reply: "⚠️ Nessuna risposta dal modello. Verifica billing su platform.openai.com e riprova." });
    }
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Unknown server error" });
  }
}
