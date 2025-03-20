import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Export HTTP methods directly, not as a default export
export async function POST(req) {
  try {
    const { text, targetLanguage } = await req.json();
    if (!text || !targetLanguage) {
      return new Response(JSON.stringify({ error: 'Text and targetLanguage are required' }), {
        status: 400,
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const languageName = targetLanguage === 'tamil' ? 'Tamil' : 'Swahili';
    const prompt = `Translate the following text to ${languageName}. Only provide the translation, no additional text:\n\n${text}`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text().trim();

    return new Response(JSON.stringify({ translatedText }), { status: 200 });
  } catch (error) {
    console.error('Gemini API error:', error);
    return new Response(JSON.stringify({ error: 'Translation failed' }), { status: 500 });
  }
}