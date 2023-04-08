const floor = require("lodash/floor");
const { CostExtimationService } = require("../cost-estimation/cost-estimation.service");

class ArrangementService { 
  /**
   * Process the delivery of packages based on the provided input data.
   *
   * @param {Object} params
   * @param {number} params.baseDeliveryCost
   * @param {Object[]} params.packages
   * @param {number} params.maxCarriableWeight
   * @param {number} params.maxSpeed
   * @param {Object[]} params.vehicles
   * @param {number} params.timeNow
   * @returns {Promise<Object[]>}
   */
  static async processDelivery({
    baseDeliveryCost,
    packages,
    maxCarriableWeight,
    maxSpeed,
    vehicles,
    timeNow,
  }) {
    const pendingPackages = packages.filter(
      (p) => typeof p.deliveryTime === "undefined"
    );
    if (!pendingPackages.length) {
      return packages;
    }
    const availableVehicle = vehicles.find((v) => v.availableAfter <= timeNow);
    if (!availableVehicle) {
      throw new Error("No vehicle available at this time");
    }
    const { pkgIds: pckIdsToBeShippedNow } = this.pickPackagesToBeDelivered(
      pendingPackages,
      maxCarriableWeight
    );
    const pckToBeShippedNow = pendingPackages.filter((p, i) =>
      pckIdsToBeShippedNow.includes(p.pkgId)
    );
    for (let index = 0; index < pckToBeShippedNow.length; index++) {
      const p = pckToBeShippedNow[index];
      const deliveryTime = floor(p.distance / maxSpeed + timeNow, 2);
      const { totalCost, discount } =
        await CostExtimationService.calculateDeliveryCost(
          baseDeliveryCost,
          p.pkgWeight,
          p.distance,
          p.offerCode
        );
      p.deliveryTime = deliveryTime;
      p.totalCost = totalCost;
      p.discount = discount;
    }
    const deliveryTimeArray = pckToBeShippedNow
      .map((p) => p.distance / maxSpeed)
      .map((n) => floor(n, 2));
    const maxDeliveryTime = Math.max(...deliveryTimeArray);
    const vehicleAvailableAfter = timeNow + maxDeliveryTime * 2;
    availableVehicle.availableAfter = vehicleAvailableAfter;
    const hasAvailableVehicle = vehicles.some(
      (v) => v.availableAfter <= timeNow
    );
    if (hasAvailableVehicle) {
      return this.processDelivery({
        baseDeliveryCost,
        packages,
        maxCarriableWeight,
        maxSpeed,
        vehicles,
        timeNow,
      });
    }
    const nextDeliveryTime = Math.min(...vehicles.map((v) => v.availableAfter));
    return this.processDelivery({
      baseDeliveryCost,
      packages,
      maxCarriableWeight,
      maxSpeed,
      vehicles,
      timeNow: nextDeliveryTime,
    });
  }

  /**
   * Pick packages to be delivered based on the weight limit.
   *
   * @param {Object[]} arr
   * @param {number} sumLimit
   * @returns {{pkgIds: string[]}}
   */
  static pickPackagesToBeDelivered(arr, sumLimit) {
    let currentSum = 0,
      currentSumIndexes = [],
      currentSumElements = [],
      maxSum = 0,
      maxSumIndexes = [],
      maxSumElements = [],
      startsFrom = 0;
    while (startsFrom < arr.length) {
      currentSum = 0;
      currentSumIndexes = [];
      currentSumElements = [];
      for (let i = startsFrom; i < arr.length; i++) {
        if (currentSum + arr[i].pkgWeight > sumLimit) {
          continue;
        }
        currentSum += arr[i].pkgWeight;
        currentSumIndexes.push(i);
        currentSumElements.push(arr[i]);
        // Shipment should contain max packages vehicle can carry in a trip.
        if (maxSumElements.length < currentSumElements.length) {
          maxSum = currentSum;
          maxSumIndexes = currentSumIndexes.slice();
          maxSumElements = currentSumElements.slice();
          continue;
        }
        // We should prefer heavier packages when there are multiple shipments with the same no. of packages.
        if (
          maxSumElements.length === currentSumElements.length &&
          maxSum < currentSum
        ) {
          maxSum = currentSum;
          maxSumIndexes = currentSumIndexes.slice();
          maxSumElements = currentSumElements.slice();
          continue;
        }
        // If the weights are also the same, preference should be given to the shipment which can be delivered first.
        if (
          maxSumElements.length === currentSumElements.length &&
          maxSum === currentSum &&
          Math.max(...maxSumElements.map((d) => d.distance)) >
            Math.max(...currentSumElements.map((d) => d.distance))
        ) {
          maxSum = currentSum;
          maxSumIndexes = currentSumIndexes.slice();
          maxSumElements = currentSumElements.slice();
          continue;
        }
      }
      startsFrom++;
    }
    return {
      pkgIds: maxSumElements.map((p) => p.pkgId),
    };
  }
}

module.exports = { ArrangementService };
