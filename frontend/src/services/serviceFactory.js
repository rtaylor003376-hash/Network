// Single switch point. Set VITE_USE_MOCKS=true to run entirely offline.
// Swap to false (+ add real credentials) for Phase 2/3.

import { MockConnectionsImporter } from './connections/MockConnectionsImporter.js';
import { LinkedInCsvImporter } from './connections/LinkedInCsvImporter.js';
import { MockCalendarService } from './calendar/MockCalendarService.js';
import { GoogleCalendarService } from './calendar/GoogleCalendarService.js';
import { MockAiService } from './ai/MockAiService.js';
import { ClaudeAiService } from './ai/ClaudeAiService.js';

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

export const ConnectionsImporter = useMocks ? MockConnectionsImporter : LinkedInCsvImporter;
export const CalendarService = useMocks ? MockCalendarService : GoogleCalendarService;
export const AiService = useMocks ? MockAiService : ClaudeAiService;
