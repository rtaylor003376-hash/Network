import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

router.post('/create-meeting', verifyToken, async (req, res) => {
  const googleAccessToken = req.headers['x-google-access-token'];
  if (!googleAccessToken) {
    return res.status(400).json({ error: 'Missing Google access token' });
  }

  const { attendeeEmail, attendeeName, scheduledAt, durationMins, summary } = req.body;
  if (!scheduledAt || !durationMins || !summary) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const startTime = new Date(scheduledAt).toISOString();
  const endTime = new Date(new Date(scheduledAt).getTime() + durationMins * 60_000).toISOString();

  const event = {
    summary,
    start: { dateTime: startTime },
    end: { dateTime: endTime },
    conferenceData: {
      createRequest: {
        requestId: `${req.uid}-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    ...(attendeeEmail && {
      attendees: [{ email: attendeeEmail, displayName: attendeeName }],
    }),
  };

  try {
    const url = `${CALENDAR_API}?conferenceDataVersion=1${attendeeEmail ? '&sendUpdates=all' : ''}`;
    const calRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!calRes.ok) {
      const err = await calRes.json().catch(() => ({}));
      return res.status(calRes.status).json({ error: err.error?.message || 'Google Calendar API error' });
    }

    const data = await calRes.json();
    const meetLink =
      data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri || '';

    res.json({
      calendarEventId: data.id,
      meetLink,
      inviteStatus: attendeeEmail ? 'sent' : 'no_email',
    });
  } catch (err) {
    console.error('Calendar API error:', err);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

export default router;
