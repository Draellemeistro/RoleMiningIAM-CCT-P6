// Your test file (must be ESM-compatible, so use top-level await)
import { jest } from '@jest/globals';

// This tells Jest to use the __mocks__/db.js version
jest.unstable_mockModule('../../models/db.js', () => import('../../tests/__mocks__/db.js'));

// Now import your module AFTER mocking
const db = (await import('../../models/db.js')).default;

test('mock works', () => {
  db.query.mockResolvedValue([{ id: 1 }]);
});
