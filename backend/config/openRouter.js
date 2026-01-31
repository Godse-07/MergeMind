const fetch = global.fetch;

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function runAI(prompt) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a senior software engineer. Respond ONLY with valid JSON. No markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    usage: data.usage || null,
    model: "llama-3.1-8b-instant",
  };
}

module.exports = { runAI };
