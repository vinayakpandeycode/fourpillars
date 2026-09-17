export default async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed"
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {
    const body = await req.json();

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    const conversation =
      Array.isArray(body.conversation)
        ? body.conversation
            .filter(
              (item) =>
                item &&
                (item.role === "user" ||
                  item.role === "assistant") &&
                typeof item.content === "string"
            )
            .slice(-10)
            .map((item) => ({
              role: item.role,
              content: item.content.slice(0, 3000)
            }))
        : [];

    if (!question) {
      return new Response(
        JSON.stringify({
          error: "Question is required"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error(
        "OPENROUTER_API_KEY is missing"
      );

      return new Response(
        JSON.stringify({
          error: "AI service is not configured"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const companyKnowledge = `
FOUR PILLARS BUSINESS SERVICES

Tagline:
Connecting Markets. Creating Opportunities. Scaling Businesses.

Company:
Four Pillars Business Services is a Dubai-based cross-border consulting
and business development firm helping companies, investors, institutions
and entrepreneurs identify opportunities, enter new markets and build
sustainable international growth.

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

Approach:
- Strategy
- Market Access
- Network
- Execution

Location:
Dubai, UAE

Email:
info@fourpillars.co

Phone:
+91 88285 86487

Consultation:
Visitors can schedule a consultation through the website
or contact info@fourpillars.co.

Do not invent prices, clients, partnerships, projects,
offices, guarantees or investment returns.
Do not provide legal, tax or financial advice.
`;

    const systemPrompt = `
You are the official AI assistant for Four Pillars Business Services.

Help website visitors understand:
- the company
- services
- sectors
- markets
- international expansion
- consultation process

Use ONLY the official company information below.

Rules:
1. Never invent company information.
2. Never invent prices or clients.
3. Never guarantee business results.
4. Never guarantee investment returns.
5. Do not provide legal, tax or financial advice.
6. If information is unavailable, direct the visitor to
   info@fourpillars.co.
7. Be professional and concise.
8. Answer in the same language as the visitor when practical.

OFFICIAL COMPANY INFORMATION:

${companyKnowledge}
`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...conversation,
      {
        role: "user",
        content: question
      }
    ];

    const openRouterResponse =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",

            "HTTP-Referer":
              "https://fourpillarswebsite.netlify.app",

            "X-Title":
              "Four Pillars Business Services"
          },

          body: JSON.stringify({
            model:
              process.env.OPENROUTER_MODEL ||
              "openrouter/free",

            messages,

            temperature: 0.3,

            max_tokens: 500
          })
        }
      );

    const data =
      await openRouterResponse.json();

    if (!openRouterResponse.ok) {
      console.error(
        "OpenRouter Error:",
        data
      );

      return new Response(
        JSON.stringify({
          error:
            data?.error?.message ||
            "OpenRouter service error"
        }),
        {
          status: 502,
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );
    }

    const answer =
      data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return new Response(
        JSON.stringify({
          error:
            "AI returned an empty response"
        }),
        {
          status: 502,
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        answer
      }),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );

  } catch (error) {

    console.error(
      "Chat Function Error:",
      error
    );

    return new Response(
      JSON.stringify({
        error:
          "Internal server error"
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );
  }
};
