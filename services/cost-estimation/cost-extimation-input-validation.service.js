const { costEstimationInputSchema } = require("../../schema/validation.schema");
const uniq = require("lodash/uniq");

class CostEstimationInputValidationService {
  /**
   * Parse input string.
   *
   * @param {string} input
   * @returns {Promise<{baseDeliveryCost: number, noOfPackages: number, packages: {pkgId: string, pkgWeight: number, distance: number, offerCode: string}[]}|false>}
   */
  static async parseInput(input) {
    let [header, ...packageLines] = input
      .trim()
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    header = header ?? "";

    const [baseDeliveryCost, noOfPackages] = header.split(" ").map(Number);

    const packages = packageLines.map((line) => {
      let [pkgId, pkgWeight, distance, offerCode] = line
        .split(" ")
        .filter(Boolean);
      pkgWeight = +pkgWeight;
      distance = +distance;
      return { pkgId, pkgWeight, distance, offerCode };
    });

    return {
      baseDeliveryCost,
      noOfPackages,
      packages,
    };
  }

  /**
   * Validate parsed input.
   *
   * @param {object} parsedInput
   * @returns {boolean}
   */
  static validateInput(parsedInput) {
    const { noOfPackages, packages } = parsedInput;

    // validate noOfPackages
    if (noOfPackages !== packages.length) {
      console.error(
        "Invalid input: noOfPackages does not match the number of package lines"
      );
      return false;
    }

    const validationResult = costEstimationInputSchema.validate(parsedInput);

    if (validationResult.error) {
      console.error("Invalid input:" + validationResult.error.message);
      return false;
    }

    let pkgIds = packages.map((p) => p.pkgId);
    if (uniq(pkgIds).length !== pkgIds.length) {
      console.error("Invalid input: pkgId must be unique");
      return false;
    }

    return true;
  }

  /**
   * Parse and validate input string.
   *
   * @param {string} input
   * @returns {Promise<{baseDeliveryCost: number, noOfPackages: number, packages: {pkgId: string, pkgWeight: number, distance: number, offerCode: string}[]}|false>}
   */
  static async parseAndValidateInput(input) {
    if (!input?.trim()) {
      console.error("Input file is empty");
      return false;
    }

    const parsedInput = await this.parseInput(input);

    if (!this.validateInput(parsedInput)) {
      this.logGeneralInvalidFormatError();
      return false;
    }

    return parsedInput;
  }

  static logGeneralInvalidFormatError() {
    console.error(
      `Invalid input file format. The input file should be a text file in the format of:
                baseDeliveryCost no_of_packges
                pkgId1 pkgWeight1_in_kg distance1_in_km offerCode1
                ...
            `
    );
  }
}

module.exports = { CostEstimationInputValidationService };
