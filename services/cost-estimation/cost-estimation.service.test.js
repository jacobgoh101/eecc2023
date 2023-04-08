const { CostExtimationService } = require("./cost-estimation.service");

describe("CostExtimationService", () => {
  describe("calculateTotalDeliveryCost", () => {
    it("should calculate the total delivery cost correctly", () => {
      const baseDeliveryCost = 10;
      const totalWeight = 5;
      const distance = 100;
      const expectedTotalDeliveryCost =
        baseDeliveryCost + totalWeight * 10 + distance * 5;

      const totalDeliveryCost =
        CostExtimationService.calculateTotalDeliveryCost(
          baseDeliveryCost,
          totalWeight,
          distance
        );

      expect(totalDeliveryCost).toEqual(expectedTotalDeliveryCost);
    });
  });
});
