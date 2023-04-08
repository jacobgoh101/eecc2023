const { costEstimationInputSchema } = require("../../schema/validation.schema");
const uniq = require("lodash/uniq");

class CostExtimationInputValidationService {
  /**
   *
   * @param {*} input
   * @returns {Promise<{baseDeliveryCost: number, noOfPackages: number, packages: {pkgId: string, pkgWeight: number, distance: number, offerCode: string}[]}|false>}
   */
  static async parseAndValidateInput(input) {
    if (!input?.trim()) {
      console.error("Input file is empty");
      return false;
    }
    let [header, ...packageLines] = input
      .trim()
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    // validate header and package lines
    if (!header || !packageLines.length) {
      this.logGeneralInvalidFormatError();
      return false;
    }
    const [baseDeliveryCost, noOfPackages] = header.split(" ").map(Number);

    // validate noOfPackages
    if (noOfPackages !== packageLines.length) {
      console.error(
        "Invalid input: noOfPackages does not match the number of package lines"
      );
      return false;
    }

    const validationResult = costEstimationInputSchema.validate({
      baseDeliveryCost,
      noOfPackages,
      packageLines: packageLines.join("\n"),
    });

    if (validationResult.error) {
      console.error("Invalid input:", validationResult.error.message);
      return false;
    }

    // parse packageLines input
    const packages = packageLines.map((line) => {
      let [pkgId, pkgWeight, distance, offerCode] = line
        .split(" ")
        .filter(Boolean);
      pkgWeight = +pkgWeight;
      distance = +distance;
      return { pkgId, pkgWeight, distance, offerCode };
    });

    // validate unique pkgId
    let pkgIds = packages.map((p) => p.pkgId);
    if (uniq(pkgIds).length !== pkgIds.length) {
      console.error("Invalid input: pkgId must be unique");
      return false;
    }

    return {
      baseDeliveryCost,
      noOfPackages,
      packages: packages,
    };
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

module.exports = { CostExtimationInputValidationService };
