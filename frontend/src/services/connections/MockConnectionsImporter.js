import { mockConnections } from '../../data/mockConnections.js';

// Mock implementation — returns seed data immediately, no file I/O.
export const MockConnectionsImporter = {
  async import() {
    // Simulate a brief parse delay for realistic UX.
    await new Promise((r) => setTimeout(r, 600));
    return {
      connections: mockConnections,
      total: mockConnections.length,
      duplicates: 0,
    };
  },

  // Parse a File object (CSV). In mock mode we ignore the file and return seeds.
  async parseFile(_file) {
    await new Promise((r) => setTimeout(r, 800));
    return {
      connections: mockConnections,
      total: mockConnections.length,
      duplicates: 0,
    };
  },
};
