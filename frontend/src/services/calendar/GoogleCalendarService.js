export const GoogleCalendarService = {
  async createMeeting({ connection, scheduledAt, durationMins, userAccessToken, firebaseIdToken }) {
    const response = await fetch('http://localhost:3001/api/calendar/create-meeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${firebaseIdToken}`,
        'x-google-access-token': userAccessToken,
      },
      body: JSON.stringify({
        attendeeEmail: connection.email,
        attendeeName: `${connection.firstName} ${connection.lastName}`,
        scheduledAt,
        durationMins,
        summary: `Networking call with ${connection.firstName} ${connection.lastName}`,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create calendar event');
    }

    return response.json();
  },
};
