const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const CHAT_RESPONSES = [
  {
    match: (msg) => /draft|write|email|message|outreach/i.test(msg),
    reply: `To draft a personalized email, click the Email button on any connection card in your queue, then hit "Draft with AI" inside the compose window. I'll tailor it to that specific person and company.\n\nOr just tell me who you're writing to and what you want to say — I can draft it here too.`,
  },
  {
    match: (msg) => /follow.?up/i.test(msg),
    reply: `Wait 4–7 days after a call, then keep it short:\n\n"Hi [Name], just wanted to say thanks again — your point about [specific thing] really stuck with me. I'll keep you posted on how things develop."\n\nThe key is referencing something specific from the call. Generic follow-ups get ignored.`,
  },
  {
    match: (msg) => /what (to|should I) ask|questions/i.test(msg),
    reply: `Strong networking call questions:\n\n1. "What does a typical week actually look like for you?" — gets real detail, not a job description\n2. "What do you wish you'd known earlier?" — invites honesty\n3. "How did you make the move from [X] to [Y]?" — specific to their path\n4. "Who else should I be talking to?" — always close with this\n\nAvoid anything easily Googleable. Show you've done your research.`,
  },
  {
    match: (msg) => /cold|first message|reach out|introduce/i.test(msg),
    reply: `Three things that make cold outreach work:\n\n1. Why them specifically — not "you work in consulting" but "your work on Deloitte's S&O team caught my eye."\n2. Under 100 words — get to the ask in sentence two.\n3. Small ask — "20 minutes at your convenience" beats "pick your brain."\n\nResponse rates jump when the email feels written for them specifically, not copy-pasted.`,
  },
  {
    match: (msg) => /linkedin|connect|profile/i.test(msg),
    reply: `A few LinkedIn connection request tips:\n\n- Always add a note (300 char limit) — even "I came across your profile and would love to connect" beats blank\n- Mention one specific thing from their profile or work\n- Don't pitch in the request — connect first, message second\n\nOnce connected, wait a day or two then send a proper message.`,
  },
  {
    match: () => true,
    reply: `I'm your networking coach. Here's what I can help with:\n\n- Cold outreach strategy\n- What to ask on a networking call\n- How to follow up after a call\n- Drafting emails (use the Email button on any card)\n\nWhat are you working on?`,
  },
];

function getMockChatReply(message) {
  const match = CHAT_RESPONSES.find((r) => r.match(message));
  return match ? match.reply : CHAT_RESPONSES[CHAT_RESPONSES.length - 1].reply;
}

export const MockAiService = {
  async chat({ messages }) {
    await delay(900);
    const lastMsg = messages[messages.length - 1]?.content || '';
    return { role: 'assistant', content: getMockChatReply(lastMsg) };
  },

  async meetingPrep({ connection }) {
    await delay(1400);
    const name = connection.connectionName || `${connection.firstName} ${connection.lastName}`;
    const position = connection.connectionPosition || connection.position || 'their role';
    const company = connection.connectionCompany || connection.company || 'their company';
    return {
      talkingPoints: [
        `${name}'s work as ${position} at ${company} sits at the intersection of strategy and day-to-day execution — worth asking how they split their time between the two.`,
        `${company} has been making moves in the space lately. Research one recent product launch or news item beforehand so you can ask an informed question, not a generic one.`,
        `The jump from college to a role like ${position} involves specific skill gaps. They've navigated it — ask what they wish they'd built earlier.`,
        `Ask about the internal culture and how decisions get made. You'll learn more about a company in 5 minutes of honest conversation than from any Glassdoor review.`,
      ],
      questionsToAsk: [
        `What does a typical week actually look like for you as ${position}? I want to understand the real job, not just the title.`,
        `What's the biggest thing you wish you'd known before joining ${company}?`,
        `How did you make the move into this role — was there a specific decision or experience that opened the door?`,
        `Who else in your network do you think I should be talking to?`,
      ],
      commonGround: [
        `You're both drawn to ${company}'s space — you as a target company, them as someone who chose to work there.`,
        `They've recently gone through the student-to-professional transition you're preparing for. Their timeline is close enough to be directly relevant.`,
      ],
      icebreakers: [
        `Reference something specific from their LinkedIn — a project, a post, or a milestone at ${company}. It signals you did your homework and immediately differentiates you.`,
        `Ask how they're finding the pace of things at ${company} right now — most people give an honest, unguarded answer to this one.`,
      ],
    };
  },

  async draftEmail({ connection, userProfile, instructions }) {
    await delay(1200);
    const career = userProfile?.desiredCareers?.[0] || 'a career opportunity';
    const subject = `Quick intro — ${userProfile?.major || 'student'} interested in ${connection.company}`;
    const body = `Hi ${connection.firstName},

I came across your profile and was genuinely impressed by your work as ${connection.position} at ${connection.company}. As a student actively exploring ${career}, I'd love to hear about your experience and any advice you might have for someone early in this path.

${instructions ? `I'm particularly hoping to learn about ${instructions}.\n\n` : ''}Would you be open to a 20-minute call at your convenience? Happy to work around your schedule.

Thank you so much for your time,
[Your name]`;
    return { subject, body };
  },
};
