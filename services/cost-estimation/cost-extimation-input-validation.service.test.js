const {
  CostEstimationInputValidationService,
} = require("./cost-extimation-input-validation.service");

describe("CostEstimationInputValidationService", () => {
  describe("parseInput", () => {
    it("should parse input string", async () => {
      const input = `100 3
      P1 10 2
      P2 20 3
      P3 30 4`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      expect(parsedInput).toMatchObject({
        baseDeliveryCost: 100,
        noOfPackages: 3,
        packages: [
          { pkgId: "P1", pkgWeight: 10, distance: 2, offerCode: undefined },
          { pkgId: "P2", pkgWeight: 20, distance: 3, offerCode: undefined },
          { pkgId: "P3", pkgWeight: 30, distance: 4, offerCode: undefined },
        ],
      });
    });

    it("should parse input string with offer code", async () => {
      const input = `100 3
      P1 10 2 O1
      P2 20 3 O2
      P3 30 4 O3`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      expect(parsedInput).toMatchObject({
        baseDeliveryCost: 100,
        noOfPackages: 3,
        packages: [
          { pkgId: "P1", pkgWeight: 10, distance: 2, offerCode: "O1" },
          { pkgId: "P2", pkgWeight: 20, distance: 3, offerCode: "O2" },
          { pkgId: "P3", pkgWeight: 30, distance: 4, offerCode: "O3" },
        ],
      });
    });

    it("should allow extra spaces", async () => {
      const input = `   100 3
      P1 10 2 O1
      P2 20 3 O2
      P3 30 4 O3

      `;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      expect(parsedInput).toMatchObject({
        baseDeliveryCost: 100,
        noOfPackages: 3,
        packages: [
          { pkgId: "P1", pkgWeight: 10, distance: 2, offerCode: "O1" },
          { pkgId: "P2", pkgWeight: 20, distance: 3, offerCode: "O2" },
          { pkgId: "P3", pkgWeight: 30, distance: 4, offerCode: "O3" },
        ],
      });
    });

    it("should handle empty input", async () => {
      const input = "";
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      expect(parsedInput).toMatchObject({
        baseDeliveryCost: 0,
        noOfPackages: undefined,
        packages: [],
      });
    });
  });

  describe("validateInput", () => {
    it("should validate input", async () => {
      const input = `100 3
      P1 10 2 O1
      P2 20 3 O2
      P3 30 4 O3`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      const isValid = await CostEstimationInputValidationService.validateInput(
        parsedInput
      );
      expect(isValid).toBe(true);
    });

    it("should return false if offer code is not provided", async () => {
      console.error = jest.fn();
      const input = `100 3
      P1 10 2
      P2 20 3
      P3 30 4`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      const isValid = await CostEstimationInputValidationService.validateInput(
        parsedInput
      );
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|offerCode/)
      );
    });

    it("should return false if noOfPackages is not provided", async () => {
      console.error = jest.fn();
      const input = `100
      P1 10 2 O1
      P2 20 3 O2
      P3 30 4 O3`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      const isValid = await CostEstimationInputValidationService.validateInput(
        parsedInput
      );
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfPackages/)
      );
    });

    it("should return false if baseDeliveryCost is not provided", async () => {
      console.error = jest.fn();
      const input = `3
      P1 10 2 O1
      P2 20 3 O2
      P3 30 4 O3`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      const isValid = await CostEstimationInputValidationService.validateInput(
        parsedInput
      );
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|baseDeliveryCost/)
      );
    });

    it("should return false if noOfPackages is not a positive number", async () => {
      console.error = jest.fn();
      const input = `100 -3
      P1 10 2 O1
      P2 20 3 O2
      P3 30 4 O3`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      const isValid = await CostEstimationInputValidationService.validateInput(
        parsedInput
      );
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfPackages/)
      );
    });

    it("should return false if noOfVehicles is not a positive number", async () => {
      console.error = jest.fn();
      const input = `-100 3
      P1 10 2 O1
      P2 20 3 O2
      P3 30 4 O3`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      const isValid = await CostEstimationInputValidationService.validateInput(
        parsedInput
      );
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfVehicles/)
      );
    });

    it("should return false if baseDeliveryCost is not a positive number", async () => {
      console.error = jest.fn();
      const input = `-100 3
      P1 10 2 O1
      P2 20 3 O2
      P3 30 4 O3`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      const isValid = await CostEstimationInputValidationService.validateInput(
        parsedInput
      );
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|baseDeliveryCost/)
      );
    });

    it("should return false if noOfPackages is not an integer", async () => {
      console.error = jest.fn();
      const input = `100 3.5
      P1 10 2 O1
      P2 20 3 O2
      P3 30 4 O3`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      const isValid = await CostEstimationInputValidationService.validateInput(
        parsedInput
      );
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfPackages/)
      );
    });

    it("should return false if noOfPackages does not match the number of packages provided", async () => {
      console.error = jest.fn();
      const input = `100 3
      P1 10 2 O1
      P2 20 3 O2`;
      const parsedInput = await CostEstimationInputValidationService.parseInput(
        input
      );
      const isValid = await CostEstimationInputValidationService.validateInput(
        parsedInput
      );
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfPackages/)
      );
    });
  });

  describe("parseAndValidateInput", () => {
    it("should return false if input is invalid", async () => {});

    it("should return parsed input if input is valid", async () => {});
  });

  describe("logGeneralInvalidFormatError", () => {
    it("should log error message", () => {
      console.error = jest.fn();
      CostEstimationInputValidationService.logGeneralInvalidFormatError();
      expect(console.error).toBeCalledWith(
        expect.stringMatching(
          /Invalid input file format. The input file should be a text file in the format of:/
        )
      );
    });
  });
});
