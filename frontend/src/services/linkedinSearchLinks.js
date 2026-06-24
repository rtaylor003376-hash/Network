import {
  ANYWHERE_LOCATION,
  CAREER_SEARCH_TERMS,
  LINKEDIN_LOCATION_GEO_URNS,
} from '../data/targetOptions.js';

const LINKEDIN_PEOPLE_SEARCH_URL = 'https://www.linkedin.com/search/results/people/';
const UVA_LINKEDIN_SCHOOL_ID = '4298';

function normalizeLocations(locations = []) {
  return locations.filter((location) => location && location !== ANYWHERE_LOCATION);
}

export function getCareerSearchTerm(career) {
  return CAREER_SEARCH_TERMS[career] || career;
}

export function getMissingGeoUrnLocations(locations = []) {
  return normalizeLocations(locations).filter((location) => !LINKEDIN_LOCATION_GEO_URNS[location]);
}

export function getAppliedGeoUrnLocations(locations = []) {
  return normalizeLocations(locations).filter((location) => LINKEDIN_LOCATION_GEO_URNS[location]);
}

export function buildLinkedInPeopleSearchUrl(career, locations = [], options = {}) {
  const params = new URLSearchParams({
    keywords: getCareerSearchTerm(career),
    origin: 'FACETED_SEARCH',
  });

  const geoUrns = normalizeLocations(locations)
    .map((location) => LINKEDIN_LOCATION_GEO_URNS[location])
    .filter(Boolean);

  if (geoUrns.length > 0) {
    params.set('geoUrn', JSON.stringify(geoUrns));
  }

  if (options.uvaAlumniOnly) {
    params.set('schoolFilter', JSON.stringify([UVA_LINKEDIN_SCHOOL_ID]));
  }

  return `${LINKEDIN_PEOPLE_SEARCH_URL}?${params.toString()}`;
}

export function buildGrowSearchLinks({
  desiredCareers = [],
  desiredLocations = [],
  uvaAlumniByCareer = {},
} = {}) {
  const locations = normalizeLocations(desiredLocations);
  const appliedLocations = getAppliedGeoUrnLocations(desiredLocations);

  return desiredCareers.map((career) => ({
    career,
    searchTerm: getCareerSearchTerm(career),
    locations,
    appliedLocations,
    uvaAlumniOnly: Boolean(uvaAlumniByCareer[career]),
    url: buildLinkedInPeopleSearchUrl(career, desiredLocations, {
      uvaAlumniOnly: Boolean(uvaAlumniByCareer[career]),
    }),
  }));
}
