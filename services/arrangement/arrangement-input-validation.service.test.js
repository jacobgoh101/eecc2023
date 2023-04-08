const {
  ArrangementInputValidationService,
} = require("./arrangement-input-validation.service");

describe("ArrangementInputValidationService", () => {
  describe("parseInput", () => {
    it("should parse input string", async () => {
      const input = `100 3
        P1 50 100
        P2 75 200
        P3 100 300
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      expect(parsedInput).toMatchObject({
        baseDeliveryCost: 100,
        noOfPackages: 3,
        packages: [
          { pkgId: "P1", pkgWeight: 50, distance: 100, offerCode: undefined },
          { pkgId: "P2", pkgWeight: 75, distance: 200, offerCode: undefined },
          { pkgId: "P3", pkgWeight: 100, distance: 300, offerCode: undefined },
        ],
        noOfVehicles: 2,
        maxSpeed: 10,
        maxCarriableWeight: 200,
      });
    });

    it("should parse input string with offer code", async () => {
      const input = `100 3
        P1 50 100 O1
        P2 75 200 O2
        P3 100 300 O3
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      expect(parsedInput).toMatchObject({
        baseDeliveryCost: 100,
        noOfPackages: 3,
        packages: [
          { pkgId: "P1", pkgWeight: 50, distance: 100, offerCode: "O1" },
          { pkgId: "P2", pkgWeight: 75, distance: 200, offerCode: "O2" },
          { pkgId: "P3", pkgWeight: 100, distance: 300, offerCode: "O3" },
        ],
        noOfVehicles: 2,
        maxSpeed: 10,
        maxCarriableWeight: 200,
      });
    });

    it("should allow extra spaces", async () => {
      const input = `
      100 3
         P1 50 100     
        P2 75 200  
         P3 100 300
        2 10 200
        `;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      expect(parsedInput).toMatchObject({
        baseDeliveryCost: 100,
        noOfPackages: 3,
        packages: [
          { pkgId: "P1", pkgWeight: 50, distance: 100, offerCode: undefined },
          { pkgId: "P2", pkgWeight: 75, distance: 200, offerCode: undefined },
          { pkgId: "P3", pkgWeight: 100, distance: 300, offerCode: undefined },
        ],
        noOfVehicles: 2,
        maxSpeed: 10,
        maxCarriableWeight: 200,
      });
    });

    it("should handle empty input", async () => {
      const input = "";
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      expect(parsedInput).toMatchObject({
        baseDeliveryCost: 0,
        maxCarriableWeight: undefined,
        maxSpeed: undefined,
        noOfPackages: undefined,
        noOfVehicles: 0,
        packages: [],
      });
    });
  });

  describe("validateInput", () => {
    it("should validate input", async () => {
      const input = `100 3
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(true);
    });

    it("should return false if offer code is not provided", async () => {
      console.error = jest.fn();
      const input = `100 3
        P1 50 100
        P2 75 200
        P3 100 300
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|offerCode/)
      );
    });

    it("should return false if noOfPackages is not provided", async () => {
      console.error = jest.fn();
      const input = `100
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfPackages/)
      );
    });

    it("should return false if noOfVehicles is not provided", async () => {
      console.error = jest.fn();
      const input = `100 3
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfVehicles/)
      );
    });

    it("should return false if maxSpeed is not provided", async () => {
      console.error = jest.fn();
      const input = `100 3
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|maxSpeed/)
      );
    });

    it("should return false if maxCarriableWeight is not provided", async () => {
      console.error = jest.fn();
      const input = `100 3
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|maxCarriableWeight/)
      );
    });

    it("should return false if baseDeliveryCost is not provided", async () => {
      console.error = jest.fn();
      const input = `3
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|baseDeliveryCost/)
      );
    });

    it("should return false if noOfPackages is not a positive number", async () => {
      console.error = jest.fn();
      const input = `100 -1
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfPackages/)
      );
    });

    it("should return false if noOfVehicles is not a positive number", async () => {
      console.error = jest.fn();
      const input = `100 0
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfVehicles/)
      );
    });

    it("should return false if maxSpeed is not a positive number", async () => {
      console.error = jest.fn();
      const input = `100 3
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 -1 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|maxSpeed/)
      );
    });

    it("should return false if maxCarriableWeight is not a positive number", async () => {
      console.error = jest.fn();
      const input = `100 3
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10 -1`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|maxCarriableWeight/)
      );
    });

    it("should return false if baseDeliveryCost is not a positive number", async () => {
      console.error = jest.fn();
      const input = `100 3
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10 -1`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|baseDeliveryCost/)
      );
    });

    it("should return false if noOfPackages is not an integer", async () => {
      console.error = jest.fn();
      const input = `100 3.5
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfPackages/)
      );
    });

    it("should return false if noOfVehicles is not an integer", async () => {
      console.error = jest.fn();
      const input = `100 3.5
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfVehicles/)
      );
    });

    it("should return false if baseDeliveryCost is not an integer", async () => {
      console.error = jest.fn();
      const input = `100 3
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10
        200.5`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|baseDeliveryCost/)
      );
    });

    it("should return false if noOfPackages does not match the number of packages provided", async () => {
      console.error = jest.fn();
      const input = `100 3
        P1 50 100 offer1
        P2 75 200 offer2
        2 10 200`;
      const parsedInput = await ArrangementInputValidationService.parseInput(
        input
      );
      const isValid =
        ArrangementInputValidationService.validateInput(parsedInput);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input|noOfPackages/)
      );
    });
  });

  describe("parseAndValidateInput", () => {
    it("should return false if input is invalid", async () => {
      console.error = jest.fn();
      const input = `P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3`;
      const isValid =
        await ArrangementInputValidationService.parseAndValidateInput(input);
      expect(isValid).toBe(false);
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/Invalid input/)
      );
    });

    it("should return parsed input if input is valid", async () => {
      const input = `100 3
        P1 50 100 offer1
        P2 75 200 offer2
        P3 100 300 offer3
        2 10 200`;
      const parsedInput =
        await ArrangementInputValidationService.parseAndValidateInput(input);
      expect(parsedInput).toMatchObject({
        baseDeliveryCost: 100,
        noOfPackages: 3,
        packages: [
          { pkgId: "P1", pkgWeight: 50, distance: 100, offerCode: "offer1" },
          { pkgId: "P2", pkgWeight: 75, distance: 200, offerCode: "offer2" },
          { pkgId: "P3", pkgWeight: 100, distance: 300, offerCode: "offer3" },
        ],
        noOfVehicles: 2,
        maxSpeed: 10,
        maxCarriableWeight: 200,
      });
    });
  });

  describe("logGeneralInvalidFormatError", () => {
    it("should log error message", () => {
      console.error = jest.fn();
      ArrangementInputValidationService.logGeneralInvalidFormatError();
      expect(console.error).toBeCalledWith(
        expect.stringMatching(
          /Invalid input file format. The input file should be a text file in the format of:/
        )
      );
    });
  });
});
