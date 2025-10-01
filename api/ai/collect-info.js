import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * API Route: Collect Missing Information (Chatbot)
 * POST /api/ai/collect-info
 *
 * AI chatbot to conversationally collect missing candidate information
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { missingFields, userMessage, conversationHistory } = req.body;

  if (!missingFields || missingFields.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No missing fields specified'
    });
  }

  if (!userMessage) {
    return res.status(400).json({
      success: false,
      error: 'Missing userMessage'
    });
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  try {
    // Build conversation context
    const history = conversationHistory || [];
    const conversationContext = history
      .map((msg) => `${msg.role === 'user' ? 'Candidate' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Create system prompt for collecting information
    const systemPrompt = `You are a friendly AI assistant helping to collect missing information from a job candidate before their technical interview.

Missing Information Needed:
${missingFields.map(field => `- ${field.charAt(0).toUpperCase() + field.slice(1)}`).join('\n')}

Guidelines:
1. Be conversational, friendly, and professional
2. Ask for ONE piece of information at a time
3. If the candidate provides the information in their response, acknowledge it and ask for the next missing field
4. If they provide something invalid (e.g., invalid email), politely ask them to provide it in the correct format
5. Keep responses brief (1-2 sentences max)
6. Use natural language, not robotic

${conversationContext ? `Previous Conversation:\n${conversationContext}\n` : ''}

Candidate's Latest Message: ${userMessage}

Your task: Analyze the candidate's message and respond appropriately. If they've provided valid information, acknowledge it. If information is still missing, ask for the next field conversationally.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text().trim();

    // Try to extract any provided information from user message
    const extractedInfo = {};

    // Extract email
    if (missingFields.includes('email')) {
      const emailMatch = userMessage.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      if (emailMatch) {
        extractedInfo.email = emailMatch[0];
      }
    }

    // Extract phone
    if (missingFields.includes('phone')) {
      const phoneMatch = userMessage.match(/[\+\d][\d\s\-\(\)]{9,19}/);
      if (phoneMatch) {
        extractedInfo.phone = phoneMatch[0].trim();
      }
    }

    // Extract name (if it's a reasonable length and doesn't look like an email/phone)
    if (missingFields.includes('name')) {
      const words = userMessage.split(/\s+/);
      const potentialName = words
        .filter(w => w.length > 1 && !/[@\d\+\-\(\)]/.test(w))
        .slice(0, 3)
        .join(' ');

      if (potentialName.length >= 2 && potentialName.length <= 50) {
        // Only extract if it looks like a name (starts with capital, no special chars)
        if (/^[A-Z][a-zA-Z\s\-\']+$/.test(potentialName)) {
          extractedInfo.name = potentialName;
        }
      }
    }

    // Update missing fields list
    const remainingFields = missingFields.filter(
      field => !extractedInfo[field]
    );

    return res.status(200).json({
      success: true,
      aiResponse,
      extractedInfo,
      remainingFields,
      isComplete: remainingFields.length === 0
    });
  } catch (error) {
    console.error('Collect info error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: error.message
    });
  }
}