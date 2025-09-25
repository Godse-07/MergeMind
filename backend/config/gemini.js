const { GoogleGenerativeAI } = require("@google/generative-ai");

function getGeminiModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

module.exports = getGeminiModel;
