
const { inputSchema } = require('../schema/challenge1.schema');

class totalDeliveryCostExtimationService {
    static async parseAndValidateInput(input) {
        if (!input?.trim()) {
            console.error('Input file is empty');
            return false;
        }
        let [header, ...packageLines] = input.trim().split('\n').map(s => s.trim()).filter(Boolean);
        packageLines = packageLines.map(s => s.trim()).filter(Boolean);

        // validate header and package lines
        if (!header || !packageLines.length) {
            this.logGeneralInvalidFormatError();
            return false;
        }
        const [base_delivery_cost, no_of_packages] = header.split(' ').map(Number);

        // validate no_of_packages
        if (no_of_packages !== packageLines.length) {
            console.error('Invalid input: no_of_packages does not match the number of package lines');
            return false;
        }

        const validationResult = inputSchema.validate({
            base_delivery_cost,
            no_of_packages,
            package_lines: packageLines.join('\n'),
        });

        if (validationResult.error) {
            console.error('Invalid input:', validationResult.error.message);
            return false;
        }

        // parse packageLines input
        const packages = packageLines.map((line) => {
            const [pkg_id, pkg_weight, distance, offer_code] = line.split(' ').filter(Boolean);
            return { pkg_id, pkg_weight, distance, offer_code };
        });

        return {
            base_delivery_cost, no_of_packages, packages: packages
        };
    }

    static logGeneralInvalidFormatError() {
        console.log(
            `Invalid input file format. The input file should be a text file in the format of:
                base_delivery_cost no_of_packges
                pkg_id1 pkg_weight1_in_kg distance1_in_km offer_code1
                ...
            `
        )
    }
}

module.exports = { totalDeliveryCostExtimationService };
