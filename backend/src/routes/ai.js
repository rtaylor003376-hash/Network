import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5-20251001';

function buildSystemPrompt(userProfile) {
  const careers = userProfile?.desiredCareers?.join(', ') || 'not specified';
  const companies = userProfile?.targetCompanies?.join(', ') || 'not specified';
  const locations = userProfile?.desiredLocations?.join(', ') || 'not specified';
  return `You are a professional networking coach helping a university student systematically build their career network.

Student profile:
- Target careers: ${careers}
- Target companies: ${companies}
- Desired locations: ${locations}

Be concise, specific, and practical. Give actionable advice. Use plain text with newlines for formatting — no markdown headers or bullet symbols, just natural paragraphs or numbered lists with plain dashes.`;
}

router.post('/chat', verifyToken, async (req, res) => {
  const { messages, userProfile } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: buildSystemPrompt(userProfile),
      messages: messages.map(({ role, content }) => ({ role, content })),
    });
    res.json({ role: 'assistant', content: response.content[0].text });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

router.post('/draft-email', verifyToken, async (req, res) => {
  const { connection, userProfile, instructions } = req.body;
  if (!connection) return res.status(400).json({ error: 'connection required' });

  const prompt = `Draft a networking outreach email from a ${userProfile?.major || 'university'} student to ${connection.firstName} ${connection.lastName}, who is ${connection.position}${connection.company ? ` at ${connection.company}` : ''}.

Student's target careers: ${userProfile?.desiredCareers?.join(', ') || 'not specified'}
${instructions ? `Additional focus: ${instructions}` : ''}

Return ONLY a JSON object with exactly two keys — "subject" (the email subject line) and "body" (the full email body, plain text, 3-4 short paragraphs, no placeholders). Do not include any other text outside the JSON.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text.trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    res.json({ subject: parsed.subject || '', body: parsed.body || '' });
  } catch (err) {
    console.error('AI draft error:', err);
    res.status(500).json({ error: 'Failed to generate email draft' });
  }
});

export default router;
