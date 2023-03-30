const { arrangementInputSchame } = require('../schema/validation.schema');
const uniq = require('lodash/uniq');
const maxBy = require('lodash/maxBy');
const floor = require('lodash/floor');
const { CostExtimationService } = require('./cost-estimation.service');

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
        const { pkgIds: pckIdsToBeShippedNow } = this.maxWeightSum(
            pendingPackages, maxCarriableWeight
        )
        const pckToBeShippedNow = pendingPackages.filter((p, i) => pckIdsToBeShippedNow.includes(p.pkgId));
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
     * Finds the maximum weight sum, that is smaller or equal than sumLimit, of a contiguous subarray within the given array, using Kadane Algo
     * @param {*} arr 
     * @param {*} sumLimit 
     * @param {*} startsFrom 
     * @returns { sum: number, pkgIds: number[] }
     */
    static maxWeightSumStartsFrom(arr, sumLimit, startsFrom = 0) {
        let maxSum = 0;
        let maxSumPkgIds = [];
        let currentSum = 0;
        let currentSumPkgIds = [];
        for (let i = startsFrom; i < arr.length; i++) {
            if (currentSum + arr[i].pkgWeight > sumLimit) {
                continue;
            }
            currentSum += arr[i].pkgWeight;
            currentSumPkgIds.push(arr[i].pkgId);
            if (currentSum > maxSum) {
                maxSum = currentSum;
                maxSumPkgIds = currentSumPkgIds;
            }
        }
        return { sum: maxSum, pkgIds: maxSumPkgIds };
    }

    /**
     * 
     * @param {*} arr 
     * @param {*} sumLimit 
     * @returns { sum: number, pkgIds: number[] } the maximum sum, that is smaller or equal than sumLimit, of a subarray within the given array
     */
    static maxWeightSum(arr, sumLimit) {
        // sort arr by pkgWeight, desc, because heavier packages should be shipped first
        // sort arr by distance, asc, because packages with shorter distance should be shipped first
        arr = arr.sort((a, b) => {
            if (a.pkgWeight === b.pkgWeight) {
                return a.distance - b.distance;
            }
            return b.pkgWeight - a.pkgWeight;
        });

        const maxSums = [];
        for (let i = 0; i < arr.length; i++) {
            maxSums.push(this.maxWeightSumStartsFrom(arr, sumLimit, i));
        }
        return maxBy(maxSums, (maxSum) => maxSum.sum);
    }
}

module.exports = { ArrangementService };
