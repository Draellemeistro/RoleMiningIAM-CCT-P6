import { jest } from '@jest/globals';

// This tells Jest to use the __mocks__/db.js version
jest.unstable_mockModule('../models/db.js', () => import('tests/__mocks__/db.js'));

// Now import your module AFTER mocking
const db = (await import('../models/db.js')).default;

import DepSvc from '../services/DepartmentService.js';

describe(" Department service logic tests", () => {

  describe("mapDetailstoDepartment", () => {
    it("should map details to department correctly", () => {
      // const filter = { depIds: [1, 2, 3] };
      // const expectedQuery = 'SELECT * FROM Users WHERE u.DepartmentId IN (?, ?, ?)';
      // db.query.mockResolvedValueOnce([[{ id: 1 }, { id: 2 }, { id: 3 }]]);
      // const result = await Fetcher.fetchDepUsers(filter);
      // expect(db.query).toHaveBeenCalledWith(expectedQuery, [1, 2, 3]);
      // expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

});

// ----------
