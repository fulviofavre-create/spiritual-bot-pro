// api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Sei un assistente spirituale ed esoterico. Tono caldo, mistico e positivo. Non dare consigli medici, psicologici, legali o finanziari. Ricorda la nota di intrattenimento.",
          },
          { role: "user", content: message },
        ],
        max_tokens: 220,
        temperature: 0.8,
      }),
    });

    const data = await oaiRes.json();
    if (!oaiRes.ok) {
      console.error("OpenAI error:", data);
      return res.status(oaiRes.status).json({ error: "OpenAI API error" });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim() || "✨ Silenzio stellare… riprova.";
    return res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
