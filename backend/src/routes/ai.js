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

router.post('/meeting-prep', verifyToken, async (req, res) => {
  const { connection, userProfile } = req.body;
  if (!connection) return res.status(400).json({ error: 'connection required' });

  const name = connection.connectionName || `${connection.firstName} ${connection.lastName}`;
  const position = connection.connectionPosition || connection.position || 'their role';
  const company = connection.connectionCompany || connection.company || 'their company';
  const careers = userProfile?.desiredCareers?.join(', ') || 'not specified';
  const companies = userProfile?.targetCompanies?.join(', ') || 'not specified';

  const prompt = `You are helping a university student prepare for a 1:1 networking call.

Student profile:
- Major: ${userProfile?.major || 'not specified'}
- Target careers: ${careers}
- Target companies: ${companies}
- Desired locations: ${userProfile?.desiredLocations?.join(', ') || 'not specified'}

They are about to speak with:
- Name: ${name}
- Title: ${position}
- Company: ${company}

Generate specific, actionable meeting prep notes. Return ONLY a JSON object with these four keys:
- "talkingPoints": array of 3-4 substantive points about the person's industry, role, or company to show you've done research
- "questionsToAsk": array of 3-4 thoughtful questions tailored to their specific position and the student's career goals
- "commonGround": array of 2-3 natural connections between the student's goals and this person's work
- "icebreakers": array of 2 natural, specific conversation openers — not generic small talk

Be concrete and specific to this person. No generic advice that could apply to anyone.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 900,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text.trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    res.json({
      talkingPoints: parsed.talkingPoints || [],
      questionsToAsk: parsed.questionsToAsk || [],
      commonGround: parsed.commonGround || [],
      icebreakers: parsed.icebreakers || [],
    });
  } catch (err) {
    console.error('Meeting prep error:', err);
    res.status(500).json({ error: 'Failed to generate meeting prep' });
  }
});

export default router;
