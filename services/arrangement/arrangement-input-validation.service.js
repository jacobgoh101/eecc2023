const { arrangementInputSchema } = require("../../schema/validation.schema");
const uniq = require("lodash/uniq");

class ArrangementInputValidationService {
  /**
   * Parse and validate input string.
   *
   * @param {string} input
   * @returns {Promise<{baseDeliveryCost: number, noOfPackages: number, packages: {pkgId: string, pkgWeight: number, distance: number, offerCode: string}[], noOfVehicles: number, maxSpeed: number, maxCarriableWeight: number}|false>}
   */
  static async parseAndValidateInput(input) {
    if (!input?.trim()) {
      console.error("Input file is empty");
      return false;
    }
    const inputStrings = input
      .trim()
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const header = inputStrings.shift();
    const footer = inputStrings.pop();
    const packageLines = inputStrings;

    // validate header and package lines
    if (!header || !footer || !packageLines.length) {
      this.logGeneralInvalidFormatError();
      return false;
    }
    const [baseDeliveryCost, noOfPackages] = header.split(" ").map(Number);
    const [noOfVehicles, maxSpeed, maxCarriableWeight] = footer
      .split(" ")
      .map(Number);

    // validate noOfPackages
    if (noOfPackages !== packageLines.length) {
      console.error(
        "Invalid input: noOfPackages does not match the number of package lines"
      );
      return false;
    }

    const validationResult = arrangementInputSchema.validate({
      baseDeliveryCost,
      noOfPackages,
      packageLines: packageLines.join("\n"),
      noOfVehicles,
      maxSpeed,
      maxCarriableWeight,
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
      packages,
      noOfVehicles,
      maxSpeed,
      maxCarriableWeight,
    };
  }

  static logGeneralInvalidFormatError() {
    console.error(
      `Invalid input file format. The input file should be a text file in the format of:
                base_delivery_cost no_of_packges
                pkg_id1 pkg_weight1_in_kg distance1_in_km offer_code1
                ....
                no_of_vehicles max_speed max_carriable_weight   
            `
    );
  }
}

module.exports = { ArrangementInputValidationService };
