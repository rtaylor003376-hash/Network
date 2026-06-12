async function apiFetch(path, body, firebaseIdToken) {
  const res = await fetch(`http://localhost:3001${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${firebaseIdToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI request failed');
  }
  return res.json();
}

export const ClaudeAiService = {
  async chat({ messages, userProfile, firebaseIdToken }) {
    return apiFetch('/api/ai/chat', { messages, userProfile }, firebaseIdToken);
  },

  async draftEmail({ connection, userProfile, instructions, firebaseIdToken }) {
    return apiFetch('/api/ai/draft-email', { connection, userProfile, instructions }, firebaseIdToken);
  },
};
