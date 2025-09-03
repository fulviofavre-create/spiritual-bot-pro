// api/health.js
export default function handler(req, res) {
  res.status(200).json({
    openai_key_present: !!process.env.OPENAI_API_KEY,
    hint: !!process.env.OPENAI_API_KEY
      ? "OK: chiave presente"
      : "Manca OPENAI_API_KEY in Vercel → Project → Settings → Environment (aggiungila e redeploy)"
  });
}
