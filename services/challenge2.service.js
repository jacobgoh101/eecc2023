const { arrangementInputSchame } = require('../schema/challenge1.schema');
const { OfferService } = require('./offers.service');
const uniq = require('lodash/uniq');
const maxBy = require('lodash/maxBy');
const floor = require('lodash/floor');
const { CostExtimationService } = require('./challenge1.service');

class ArrangementService {
    /**
     * 
     * @param {*} input 
     * @returns {Promise<{baseDeliveryCost: number, noOfPackages: number, packages: {pkgId: string, pkgWeight: number, distance: number, offerCode: string}[], noOfVehicles: number, maxSpeed: number, maxCarriableWeight: number}|false>}
     */
    static async parseAndValidateInput(input) {
        if (!input?.trim()) {
            console.error('Input file is empty');
            return false;
        }
        const inputStrings = input.trim().split('\n').map(s => s.trim()).filter(Boolean);
        const header = inputStrings.shift();
        const footer = inputStrings.pop();
        const packageLines = inputStrings;

        // validate header and package lines
        if (!header || !footer || !packageLines.length) {
            this.logGeneralInvalidFormatError();
            return false;
        }
        const [baseDeliveryCost, noOfPackages] = header.split(' ').map(Number);
        const [noOfVehicles, maxSpeed, maxCarriableWeight] = footer.split(' ').map(Number);

        // validate noOfPackages
        if (noOfPackages !== packageLines.length) {
            console.error('Invalid input: noOfPackages does not match the number of package lines');
            return false;
        }

        const validationResult = arrangementInputSchame.validate({
            baseDeliveryCost,
            noOfPackages,
            packageLines: packageLines.join('\n'),
            noOfVehicles,
            maxSpeed,
            maxCarriableWeight
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
            baseDeliveryCost,
            noOfPackages,
            packages,
            noOfVehicles,
            maxSpeed,
            maxCarriableWeight
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
        )
    }

    static async processDelivery(
        { baseDeliveryCost, packages, maxCarriableWeight, maxSpeed, vehicles, timeNow }
    ) {
        const pendingPackages = packages.filter(p => typeof p.deliveryTime === 'undefined');
        if (!pendingPackages.length) {
            return packages;
        }
        const availableVehicle = vehicles.find(v => v.availableAfter <= timeNow);
        if (!availableVehicle) {
            throw new Error('No vehicle available at this time');
        }
        const { indexes: pckIndexesToBeShippedNow } = this.maxSum(
            pendingPackages.map(p => p.pkgWeight), maxCarriableWeight
        )
        const pckToBeShippedNow = pendingPackages.filter((p, i) => pckIndexesToBeShippedNow.includes(i));
        for (let index = 0; index < pckToBeShippedNow.length; index++) {
            const p = pckToBeShippedNow[index];
            const deliveryTime = floor((p.distance / maxSpeed) + timeNow, 2);
            const { totalCost, discount } = await CostExtimationService.calculateDeliveryCost(
                baseDeliveryCost,
                p.pkgWeight,
                p.distance,
                p.offerCode
            );
            p.deliveryTime = deliveryTime;
            p.totalCost = totalCost;
            p.discount = discount;
        }
        const deliveryTimeArray = pckToBeShippedNow.map(p => p.distance / maxSpeed).map(n => floor(n, 2));
        const maxDeliveryTime = Math.max(...deliveryTimeArray);
        const vehicleAvailableAfter = timeNow + maxDeliveryTime * 2;
        availableVehicle.availableAfter = vehicleAvailableAfter;
        const hasAvailableVehicle = vehicles.some(v => v.availableAfter <= timeNow);
        if (hasAvailableVehicle) {
            return this.processDelivery({ baseDeliveryCost, packages, maxCarriableWeight, maxSpeed, vehicles, timeNow });
        }
        const nextDeliveryTime = Math.min(...vehicles.map(v => v.availableAfter));
        return this.processDelivery({ baseDeliveryCost, packages, maxCarriableWeight, maxSpeed, vehicles, timeNow: nextDeliveryTime });
    }

    /**
     * Finds the maximum sum, that is smaller or equal than sumLimit, of a contiguous subarray within the given array, using Kadane Algo
     * @param {*} arr 
     * @param {*} sumLimit 
     * @param {*} startsFrom 
     * @returns { sum: number, indexes: number[] }
     */
    static maxSumStartsFrom(arr, sumLimit, startsFrom = 0) {
        let maxSum = 0;
        let maxSumIndexes = [];
        let currentSum = 0;
        let currentSumIndexes = [];
        for (let i = startsFrom; i < arr.length; i++) {
            if (currentSum + arr[i] > sumLimit) {
                continue;
            }
            currentSum += arr[i];
            currentSumIndexes.push(i);
            if (currentSum > maxSum) {
                maxSum = currentSum;
                maxSumIndexes = currentSumIndexes;
            }
        }
        return { sum: maxSum, indexes: maxSumIndexes };
    }

    /**
     * 
     * @param {*} arr 
     * @param {*} sumLimit 
     * @returns { sum: number, indexes: number[] } the maximum sum, that is smaller or equal than sumLimit, of a subarray within the given array
     */
    static maxSum(arr, sumLimit) {
        const maxSums = [];
        for (let i = 0; i < arr.length; i++) {
            maxSums.push(this.maxSumStartsFrom(arr, sumLimit, i));
        }
        return maxBy(maxSums, (maxSum) => maxSum.sum);
    }
}

module.exports = { ArrangementService };
