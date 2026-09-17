export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { question, conversation = [] } = req.body || {};

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("OPENROUTER_API_KEY missing");

      return res.status(500).json({
        error: "AI service is not configured"
      });
    }

    const companyKnowledge = `
You are the official AI assistant for Four Pillars Business Services.

Company:
Four Pillars Business Services is a Dubai-based cross-border consulting
and business development firm helping companies, investors, institutions
and entrepreneurs identify opportunities, enter new markets and build
sustainable international growth.

Tagline:
Connecting Markets. Creating Opportunities. Scaling Businesses.

Markets:
- GCC
- South Asia
- Africa
- Australia

Sectors:
- Education
- Real Estate
- Hospitality
- Food & Consumer Products

Services:
1. Strategic Consulting
2. Cross-Border Market Entry
3. Strategic Partnerships
4. Business Expansion & Scaling
5. Opportunity & Investment Advisory
6. Network & Market Access

Four Pillars:
- Strategy
- Market Access
- Network
- Execution

Contact:
Email: info@fourpillars.co
Phone: +91 88285 86487
Location: Dubai, UAE

Consultation:
Visitors can schedule a consultation through the website
or contact info@fourpillars.co.

Rules:
- Never invent company information.
- Never invent prices, clients, projects or partnerships.
- Never guarantee investment returns or business results.
- Do not provide legal, tax or financial advice.
- If information is unavailable, direct the visitor to info@fourpillars.co.
- Keep answers concise and professional.
- Answer in the visitor's language when practical.
`;

    const messages = [
      {
        role: "system",
        content: companyKnowledge
      },
      ...(Array.isArray(conversation)
        ? conversation.slice(-10)
        : []),
      {
        role: "user",
        content: question
      }
    ];

    const result = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://fourpillars.co",
          "X-Title": "Four Pillars Business Services"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages,
          temperature: 0.3,
          max_tokens: 500
        })
      }
    );

    const data = await result.json();

    if (!result.ok) {
      console.error("OpenRouter error:", data);

      return res.status(502).json({
        error:
          data?.error?.message ||
          "OpenRouter request failed"
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(502).json({
        error: "AI returned an empty response"
      });
    }

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error("Chat API error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}