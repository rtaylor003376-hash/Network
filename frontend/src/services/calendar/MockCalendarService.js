// Mock calendar — returns a realistic-looking fake event instantly.
export const MockCalendarService = {
  async createMeeting({ connection, scheduledAt, durationMins, userAccessToken }) {
    await new Promise((r) => setTimeout(r, 700));
    const eventId = `mock_event_${Date.now()}`;
    const meetCode = Math.random().toString(36).slice(2, 11);
    return {
      calendarEventId: eventId,
      meetLink: `https://meet.google.com/${meetCode.slice(0, 3)}-${meetCode.slice(3, 7)}-${meetCode.slice(7)}`,
      inviteStatus: 'sent',
      scheduledAt,
      durationMins,
    };
  },
};
