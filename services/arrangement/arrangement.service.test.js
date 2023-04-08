const { ArrangementService } = require("./arrangement.service");

describe("ArrangementService", () => {
  describe("knapSack", () => {
    test("should return the correct maximum profit and selected items", () => {
      const capacity = 50;
      const weights = [10, 20, 30];
      const values = [60, 100, 120];

      const result = ArrangementService.knapSack(capacity, weights, values);

      expect(result.max).toBe(220);
      expect(result.selectedItemIndexes).toEqual([2, 1]);
    });

    test("should return a maximum profit of 0 and an empty array when no items are given", () => {
      const capacity = 50;
      const weights = [];
      const values = [];

      const result = ArrangementService.knapSack(capacity, weights, values);

      expect(result.max).toBe(0);
      expect(result.selectedItemIndexes).toEqual([]);
    });

    test("should throw an error when input is invalid", () => {
      const capacity = -5;
      const weights = [10, 20, 30];
      const values = [60, 100, 120];

      expect(() =>
        ArrangementService.knapSack(capacity, weights, values)
      ).toThrow("Invalid input");
    });

    test("should throw an error when the length of weights and values arrays are different", () => {
      const capacity = 50;
      const weights = [10, 20, 30];
      const values = [60, 100];

      expect(() =>
        ArrangementService.knapSack(capacity, weights, values)
      ).toThrow("Invalid input");
    });
  });

  describe("getPackagePriorityScore", () => {
    test("should return 1 when pkgWeight and distance are both 0", () => {
      const pkg = {
        pkgWeight: 0,
        distance: 0,
      };

      const result = ArrangementService.getPackagePriorityScore(pkg);

      expect(result).toBe(1);
    });

    test("should return a higher priority score for a heavier package", () => {
      const pkg1 = {
        pkgWeight: 200,
        distance: 50,
      };
      const pkg2 = {
        pkgWeight: 300,
        distance: 50,
      };

      const result1 = ArrangementService.getPackagePriorityScore(pkg1);
      const result2 = ArrangementService.getPackagePriorityScore(pkg2);

      expect(result2).toBeGreaterThan(result1);
    });

    test("should return a higher priority score for a package with a smaller distance", () => {
      const pkg1 = {
        pkgWeight: 200,
        distance: 50,
      };
      const pkg2 = {
        pkgWeight: 200,
        distance: 100,
      };

      const result1 = ArrangementService.getPackagePriorityScore(pkg1);
      const result2 = ArrangementService.getPackagePriorityScore(pkg2);

      expect(result1).toBeGreaterThan(result2);
    });

    test("should return a higher priority score for a heavier package, regardless of distance", () => {
      const pkg1 = {
        pkgWeight: 100,
        distance: 1,
      };
      const pkg2 = {
        pkgWeight: 99,
        distance: 1000,
      };

      const result1 = ArrangementService.getPackagePriorityScore(pkg1);
      const result2 = ArrangementService.getPackagePriorityScore(pkg2);

      expect(result1).toBeGreaterThan(result2);
    });
  });

  describe("pickPackagesToBeDelivered", () => {
    test("returns an empty array when there are no packages", () => {
      const result = ArrangementService.pickPackagesToBeDelivered([], 10);
      expect(result.pkgIds).toEqual([]);
    });

    test("picks the correct packages to be delivered within the weight limit", () => {
      const packages = [
        { pkgId: "A", pkgWeight: 5, distance: 100 },
        { pkgId: "B", pkgWeight: 3, distance: 200 },
        { pkgId: "C", pkgWeight: 2, distance: 50 },
        { pkgId: "D", pkgWeight: 8, distance: 150 },
      ];
      const weightLimit = 10;
      const result = ArrangementService.pickPackagesToBeDelivered(
        packages,
        weightLimit
      );
      expect(result.pkgIds.sort()).toEqual(["A", "B", "C"].sort());
    });

    test("picks all packages if their weight is within the limit", () => {
      const packages = [
        { pkgId: "A", pkgWeight: 5, distance: 100 },
        { pkgId: "B", pkgWeight: 3, distance: 200 },
        { pkgId: "C", pkgWeight: 2, distance: 50 },
      ];
      const weightLimit = 10;
      const result = ArrangementService.pickPackagesToBeDelivered(
        packages,
        weightLimit
      );
      expect(result.pkgIds.sort()).toEqual(["A", "B", "C"].sort());
    });

    test("returns an empty array when no packages fit within the weight limit", () => {
      const packages = [
        { pkgId: "A", pkgWeight: 5, distance: 100 },
        { pkgId: "B", pkgWeight: 3, distance: 200 },
        { pkgId: "C", pkgWeight: 2, distance: 50 },
      ];
      const weightLimit = 1;
      const result = ArrangementService.pickPackagesToBeDelivered(
        packages,
        weightLimit
      );
      expect(result.pkgIds).toEqual([]);
    });
  });
});
