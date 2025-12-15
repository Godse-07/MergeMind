const fetch = global.fetch;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function runAI(prompt) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/devstral-2512:free",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a senior software engineer. Respond ONLY with valid JSON. No markdown. No explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter error: ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

module.exports = { runAI };
