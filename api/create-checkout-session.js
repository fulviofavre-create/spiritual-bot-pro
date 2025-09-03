// api/create-checkout-session.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });
  }

  const { plan } = req.body || {};
  const plans = {
    email: { name: "Lettura scritta via email", amount: 2900 },   // CHF 29.00
    mini:  { name: "Sessione 30 minuti", amount: 3900 },          // CHF 39.00
    full:  { name: "Sessione 60 minuti", amount: 6900 }           // CHF 69.00
  };

  const chosen = plans[plan] || plans.email;

  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        mode: "payment",
        success_url: `${req.headers.origin || ""}/success.html`,
        cancel_url: `${req.headers.origin || ""}/cancel.html`,
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "chf",
        "line_items[0][price_data][unit_amount]": String(chosen.amount),
        "line_items[0][price_data][product_data][name]": chosen.name
      })
    });

    const data = await stripeRes.json();
    if (!stripeRes.ok) {
      console.error("Stripe error:", data);
      return res.status(500).json({ error: "Stripe API error" });
    }

    return res.status(200).json({ url: data.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
