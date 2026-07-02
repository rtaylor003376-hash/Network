import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();
const GMAIL_MESSAGES_API = 'https://www.googleapis.com/gmail/v1/users/me/messages';

router.post('/check-replies', verifyToken, async (req, res) => {
  const googleAccessToken = req.headers['x-google-access-token'];
  if (!googleAccessToken) {
    return res.status(400).json({ error: 'Missing Google access token' });
  }

  const { connections } = req.body;
  if (!Array.isArray(connections) || !connections.length) {
    return res.json({ replies: [] });
  }

  const replies = [];

  try {
    for (const conn of connections) {
      if (!conn.email || !conn.since) continue;

      // Search Gmail for any email FROM this person after the date we emailed them.
      const sinceSeconds = Math.floor(new Date(conn.since).getTime() / 1000);
      const query = `from:${conn.email} after:${sinceSeconds}`;

      const gmailRes = await fetch(
        `${GMAIL_MESSAGES_API}?q=${encodeURIComponent(query)}&maxResults=1`,
        { headers: { Authorization: `Bearer ${googleAccessToken}` } }
      );

      if (!gmailRes.ok) continue;

      const data = await gmailRes.json();
      if (data.messages?.length > 0) {
        replies.push({
          connectionId: conn.id,
          connectionName: conn.name,
          email: conn.email,
        });
      }
    }

    res.json({ replies });
  } catch (err) {
    console.error('Gmail check-replies error:', err);
    res.status(500).json({ error: 'Failed to check Gmail replies' });
  }
});

export default router;
