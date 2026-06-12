// Phase 2 — Real LinkedIn CSV importer.
// LinkedIn's Connections.csv has a few preamble/"Notes:" lines before the real header row.
// We scan forward until we find the header, then let PapaParse do the rest.

import Papa from 'papaparse';

const EXPECTED_HEADER_FIELDS = ['First Name', 'Last Name', 'URL', 'Email Address', 'Company', 'Position', 'Connected On'];

function findHeaderLine(text) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (EXPECTED_HEADER_FIELDS.every((f) => lines[i].includes(f))) {
      return lines.slice(i).join('\n');
    }
  }
  throw new Error('Could not find header row. Make sure you uploaded a LinkedIn Connections.csv export.');
}

function normalizeRow(row) {
  return {
    firstName: row['First Name']?.trim() || '',
    lastName: row['Last Name']?.trim() || '',
    email: row['Email Address']?.trim() || '',
    company: row['Company']?.trim() || '',
    position: row['Position']?.trim() || '',
    location: '',
    linkedinUrl: row['URL']?.trim() || '',
    connectedOn: row['Connected On']?.trim() || '',
    source: 'linkedin_csv',
    status: 'new',
    matchScore: 0,
    dismissed: false,
  };
}

export const LinkedInCsvImporter = {
  async parseFile(file, existingConnections = []) {
    const text = await file.text();
    const csvText = findHeaderLine(text);

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const existingUrls = new Set(existingConnections.map((c) => c.linkedinUrl).filter(Boolean));
          const parsed = results.data.map(normalizeRow).filter((c) => c.firstName || c.company);
          const fresh = parsed.filter((c) => !c.linkedinUrl || !existingUrls.has(c.linkedinUrl));
          resolve({
            connections: fresh,
            total: parsed.length,
            duplicates: parsed.length - fresh.length,
          });
        },
        error: reject,
      });
    });
  },
};
