
const { costEstimationInputSchame } = require('../schema/validation.schema');
const { OfferService } = require('./offers.service');
const uniq = require('lodash/uniq');

class CostExtimationService {
    /**
     * 
     * @param {*} input 
     * @returns {Promise<{baseDeliveryCost: number, noOfPackages: number, packages: {pkgId: string, pkgWeight: number, distance: number, offerCode: string}[]}|false>}
     */
    static async parseAndValidateInput(input) {
        if (!input?.trim()) {
            console.error('Input file is empty');
            return false;
        }
        let [header, ...packageLines] = input.trim().split('\n').map(s => s.trim()).filter(Boolean);

        // validate header and package lines
        if (!header || !packageLines.length) {
            this.logGeneralInvalidFormatError();
            return false;
        }
        const [baseDeliveryCost, noOfPackages] = header.split(' ').map(Number);

        // validate noOfPackages
        if (noOfPackages !== packageLines.length) {
            console.error('Invalid input: noOfPackages does not match the number of package lines');
            return false;
        }

        const validationResult = costEstimationInputSchame.validate({
            baseDeliveryCost,
            noOfPackages,
            packageLines: packageLines.join('\n'),
        });

        if (validationResult.error) {
            console.error('Invalid input:', validationResult.error.message);
            return false;
        }

        // parse packageLines input
        const packages = packageLines.map((line) => {
            let [pkgId, pkgWeight, distance, offerCode] = line.split(' ').filter(Boolean);
            pkgWeight = +pkgWeight;
            distance = +distance;
            return { pkgId, pkgWeight, distance, offerCode };
        });

        // validate unique pkgId
        let pkgIds = packages.map(p => p.pkgId);
        if (uniq(pkgIds).length !== pkgIds.length) {
            console.error('Invalid input: pkgId must be unique');
            return false;
        }

        return {
            baseDeliveryCost, noOfPackages, packages: packages
        };
    }

    static logGeneralInvalidFormatError() {
        console.error(
            `Invalid input file format. The input file should be a text file in the format of:
                baseDeliveryCost no_of_packges
                pkgId1 pkgWeight1_in_kg distance1_in_km offerCode1
                ...
            `
        )
    }

    /**
     * 
     * @param {*} baseDeliveryCost 
     * @param {*} totalWeight 
     * @param {*} distance 
     * @param {*} offerCode 
     * @returns {Promise<{discount: number, totalCost: number}>}
     */
    static async calculateDeliveryCost(baseDeliveryCost, totalWeight, distance, offerCode) {
        const offer = await OfferService.getOffer(offerCode);

        //Base Delivery Cost + (Package Total Weight * 10) + (Distance to Destination * 5) = Total Delivery Cost
        const totalDeliveryCost = baseDeliveryCost + (totalWeight * 10) + (distance * 5);

        let discount = 0
        if (offer && totalWeight <= offer.weight.max && totalWeight >= offer.weight.min && distance <= offer.distance.max && distance >= offer.distance.min) {
            discount = offer.discount * totalDeliveryCost
        }

        return {
            discount: Number(discount.toFixed(2)), totalCost: Number((totalDeliveryCost - discount).toFixed(2))
        }

    }
}

module.exports = { CostExtimationService: CostExtimationService };