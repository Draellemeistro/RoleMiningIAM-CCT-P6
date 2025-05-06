// Your test file (must be ESM-compatible, so use top-level await)
import { jest } from '@jest/globals';

// This tells Jest to use the __mocks__/db.js version
jest.unstable_mockModule('../../models/db.js', () => import('../../tests/__mocks__/db.js'));
// Now import your module AFTER mocking
const db = (await import('../../models/db.js')).default;

import Miner from '../../services/roleMining/fastMiner.js';

test('mock works', () => {
  db.query.mockResolvedValue([{ id: 1 }]);
});

describe('fastMiner Helper Function Tests', () => {
  describe("translateRole", () => {
    it('returns a list of strings containing the permission names and ids', async () => {
      const roleArray = [];
      const appRoles = [];
      const mockResults = ["aaa", "bbb", "ccc"];

      const result = Miner.translateRole(roleArray, appRoles);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE FuncRoleId IN (?, ?)'),
        funcRoleIds
      );
      expect(result).toBeInstanceOf(Array);
      expect(result).toContain(any(String));
      expect(result.length).toBeGreaterThan(0);
      expect(result).toEqual(mockResults);
    });

    it('returns an empty array when no parameters(appRoleIds OR FuncRoleIds) are given', async () => {
      const roleArray = [];
      const appRoles = [];
      const result = Miner.translateRole(roleArray, appRoles);

      expect(result).toEqual([]);
    });
  });

  describe("arraysEqual", () => {
    it('returns true for equal arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      expect(Miner.arraysEqual(arr1, arr2)).toBe(true);
    });
    it('returns false for different arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];
      expect(Miner.arraysEqual(arr1, arr2)).toBe(false);
    });
    it('returns false for arrays of different lengths', () => {
      const arr1 = [1, 2];
      const arr2 = [1, 2, 3];
      expect(Miner.arraysEqual(arr1, arr2)).toBe(false);
    });
    it("returns false for arrays with different order", () => {
      const arr1 = [1, 2, 3];
      const arr2 = [3, 2, 1];
      expect(Miner.arraysEqual(arr1, arr2)).toBe(false);
    });
  });

  describe("sumArray", () => {
    it('returns the sum of the array elements', () => {
      const arr = [1, 2, 3];
      const result = Miner.sumArray(arr);
      expect(result).toBe(6);
    });
  });

  describe("sumMatrix", () => {
    it('returns the sum of all elements in the matrix', () => {
      const matrix = [
      [1, 2],
      [3, 4]
      ];
      const result = Miner.sumMatrix(matrix);
      expect(result).toBe(10);
    });
  });
});

describe('fastMiner Logic Tests', () => {
  describe("fastMinerFromMatrix", () => {
    it("returns a list of candidate roles", () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const appRoles = {
        1: 'Role1',
        2: 'Role2',
        3: 'Role3',
        4: 'Role4',
        5: 'Role5',
        6: 'Role6'
      };
      const components = {
        matrix: matrix,
        appRoles: appRoles
      };
      const result = Miner.fastMinerFromMatrix(components);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContainEqual(expect.any(Array));

    });

  });
  describe("basicRMP", () => {
    const UPMatrix = [];
    const CandRolsMatrix = [];
    const MaxRoles = 100;
    const mockResults = {
      optRoles: [],
      entitlementCount: 0
    };

    const result = Miner.basicRMP(UPMatrix, CandRolsMatrix, MaxRoles);
    expect(result).toEqual(mockResults);
    expect(result).toHaveProperty('optRoles');
    expect(result).toHaveProperty('entitlementCount');
    expect(result.optRoles).toBeInstanceOf(Array);
    expect(result.entitlementCount).toBeGreaterThan(0);
    expect(result.optRoles.length).toBeLessThanOrEqual(MaxRoles);
    expect(result.entitlementCount).toEqual(mockResults.entitlementCount);

  });

  describe("examplefunc", () => {
    it("returns a list of candidate roles and entitlement count", () => {
    });
  });
});
