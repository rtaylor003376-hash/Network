// All scoring weights and keyword maps live here so they're tunable without touching logic.

export const WEIGHTS = {
  companyMatch: 0.45,
  careerMatch: 0.35,
  locationMatch: 0.15,
  freshness: 0.05,
};

// Maps each career label to position keywords that signal a match.
export const CAREER_KEYWORDS = {
  'Strategy Consulting': ['consultant', 'consulting', 'strategy', 'advisory', 'advisor', 'analyst'],
  'Software Engineering': ['software', 'engineer', 'developer', 'swe', 'full stack', 'fullstack', 'backend', 'frontend', 'engineering'],
  'Product Management': ['product manager', 'product owner', ' pm,', ' pm ', 'product lead'],
  'Investment Banking': ['investment banking', 'investment banker', 'banking analyst', 'ib analyst', 'financial analyst', 'banking division'],
  'Data Science': ['data scientist', 'data analyst', 'machine learning', 'ml engineer', 'analytics', 'data engineer'],
  'Marketing': ['marketing', 'brand', 'growth', 'digital marketing', 'content', 'demand generation'],
};
