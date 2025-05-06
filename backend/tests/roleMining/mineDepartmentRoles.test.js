import { jest } from '@jest/globals';

// This tells Jest to use the __mocks__/db.js version
jest.unstable_mockModule('../../models/db.js', () => import('../__mocks__/db.js'));

// Now import your module AFTER mocking
const db = (await import('../../models/db.js')).default;

import Formatter from '../../services/roleMining/mineDepartmentRoles.js';

describe('Role Mining Filtered Fetching Tests', () => {
  beforeEach(() => {
    db.query.mockReset(); // mockClear ???
  });

  describe('fetchDepUsers', () => {
    it('should fetch users within a specified department', async () => {
      const filter = { depIds: [1, 2, 3] };
      const expectedQuery = 'SELECT * FROM Users WHERE u.DepartmentId IN (?, ?, ?)';
      db.query.mockResolvedValueOnce([[{ id: 1 }, { id: 2 }, { id: 3 }]]);
      const result = await Fetcher.fetchDepUsers(filter);
      expect(db.query).toHaveBeenCalledWith(expectedQuery, [1, 2, 3]);
      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  describe('fetchDepPA', () => {
    it('returns filtered PA entries when FuncRoleIds are provided', async () => {
      const funcRoleIds = [1, 2];
      const mockResults = [[
        { funcRoleId: 1, appRoleId: 101 },
        { funcRoleId: 2, appRoleId: 102 }
      ]];

      db.query.mockResolvedValueOnce(mockResults);

      const result = await Fetcher.fetchDepPA(funcRoleIds);

      expect(db.query).toHaveBeenCalledWith(
expect.stringContaining('WHERE FuncRoleId IN (?, ?)'),
        funcRoleIds
      );
      expect(result).toEqual(mockResults[0]);
    });

    it('returns an empty array when no parameters(appRoleIds OR FuncRoleIds) are given', async () => {
      const result = await Fetcher.fetchDepPA([]);
      expect(result).toEqual([]);
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  describe('fetchDepRoles', () => {
    it('returns only roles matching the provided funcRoleIds', async () => {
      const funcRoleIds = [1, 2];
      const mockData = [[
        { funcRoleId: 1, funcRoleName: 'Analyst' },
        { funcRoleId: 2, funcRoleName: 'Manager' }
      ]];

      db.query.mockResolvedValueOnce(mockData);

      const result = await Fetcher.fetchDepRoles(funcRoleIds);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE FuncRoleId IN (?, ?)'),
        funcRoleIds
      );
      expect(result).toEqual(mockData[0]);
    });
  });

  describe('fetchDepUA', () => {

    it('returns an empty array when no parameters(userIds) are given', async () => {
      const result = await Fetcher.fetchDepUA([]);
      expect(result).toEqual([]);
      expect(db.query).not.toHaveBeenCalled();
    });
  });
  describe('fetchDepPRMS', () => {

    it('returns an empty array when no parameters(appRoleIds) are given', async () => {
      const result = await Fetcher.fetchDepPRMS([]);
      expect(result).toEqual([]);
      expect(db.query).not.toHaveBeenCalled();
    });
  });
  describe('fetchDepUserPRMSHist', () => {

    it('returns an empty array when no parameters(userIds) are given', async () => {
      const result = await Fetcher.fetchDepUserPRMSHist([]);
      expect(result).toEqual([]);
      expect(db.query).not.toHaveBeenCalled();
    });
  });
});

describe("Role Mining Formatting tests", () => {
  describe("groupAppRolesByUser", () => {
    const usersFuncApps = [];
    const userAppRoles = [];
    const mockResults = [];

    const result = Formatter.groupAppRolesByUser(userAppRoles, usersFuncApps);
    expect(result).toBeInstanceOf()
  });

  describe("generateMatrix", () => {
  });
});

