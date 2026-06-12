// Pure ranking function — no I/O, no side effects, fully testable.
// rankConnections(connections, userPrefs) → scored + sorted array of eligible connections.

import { WEIGHTS, CAREER_KEYWORDS } from './rankingWeights.js';

function scoreCompanyMatch(connection, targetCompanies) {
  if (!targetCompanies?.length) return 0;
  const company = (connection.company || '').toLowerCase().trim();
  for (const target of targetCompanies) {
    const t = target.toLowerCase().trim();
    if (!t) continue;
    if (company === t) return 1;
    if (company.includes(t) || t.includes(company)) return 0.5;
  }
  return 0;
}

function scoreCareerMatch(connection, desiredCareers) {
  if (!desiredCareers?.length) return 0;
  const position = (connection.position || '').toLowerCase();
  for (const career of desiredCareers) {
    const keywords = CAREER_KEYWORDS[career] || [career.toLowerCase()];
    for (const kw of keywords) {
      if (position.includes(kw)) return 1;
    }
  }
  return 0;
}

function scoreLocationMatch(connection, desiredLocations) {
  if (!desiredLocations?.length) return 0;
  if (desiredLocations.some((l) => l.toLowerCase().includes('anywhere'))) return 0.5;
  const loc = (connection.location || '').toLowerCase();
  for (const dl of desiredLocations) {
    if (loc.includes(dl.toLowerCase())) return 1;
  }
  return 0;
}

function scoreFreshness(connection) {
  if (!connection.shownOn && !connection.lastInteractionAt) return 1;
  return 0;
}

function buildMatchReason(connection, userPrefs, companyScore, careerScore) {
  const parts = [];
  if (careerScore > 0) {
    const matched = (userPrefs.desiredCareers || []).find((career) => {
      const keywords = CAREER_KEYWORDS[career] || [career.toLowerCase()];
      return keywords.some((kw) => (connection.position || '').toLowerCase().includes(kw));
    });
    if (matched) parts.push(matched);
  } else if (connection.position) {
    parts.push(connection.position);
  }
  if (companyScore > 0 && connection.company) {
    parts.push(connection.company);
  }
  return parts.join(' @ ') || `${connection.position || 'Unknown role'} @ ${connection.company || 'Unknown company'}`;
}

export function rankConnections(connections, userPrefs) {
  const now = new Date();

  const eligible = connections.filter(
    (c) =>
      c.status !== 'scheduled' &&
      c.status !== 'met' &&
      !c.dismissed &&
      (!c.snoozedUntil || new Date(c.snoozedUntil) <= now)
  );

  return eligible
    .map((conn) => {
      const companyScore = scoreCompanyMatch(conn, userPrefs.targetCompanies);
      const careerScore = scoreCareerMatch(conn, userPrefs.desiredCareers);
      const locationScore = scoreLocationMatch(conn, userPrefs.desiredLocations);
      const freshnessScore = scoreFreshness(conn);

      const matchScore =
        companyScore * WEIGHTS.companyMatch +
        careerScore * WEIGHTS.careerMatch +
        locationScore * WEIGHTS.locationMatch +
        freshnessScore * WEIGHTS.freshness;

      return {
        ...conn,
        matchScore,
        matchReason: buildMatchReason(conn, userPrefs, companyScore, careerScore),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// Build today's queue: top N eligible, de-prioritizing already-shown-today.
export function buildDailyQueue(connections, userPrefs) {
  const todayStr = new Date().toISOString().split('T')[0];
  const ranked = rankConnections(connections, userPrefs);

  // Partition into not-shown-today and shown-today, keep already-shown at end.
  const fresh = ranked.filter((c) => c.shownOn !== todayStr);
  const alreadyShown = ranked.filter((c) => c.shownOn === todayStr);

  const ordered = [...fresh, ...alreadyShown];
  const n = userPrefs.dailyQueueSize || 3;
  return ordered.slice(0, n);
}
