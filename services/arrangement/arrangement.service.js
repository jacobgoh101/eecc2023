const floor = require("lodash/floor");
const {
  CostExtimationService,
} = require("../cost-estimation/cost-estimation.service");

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
   * @param {Object[]} packages
   * @param {number} sumLimit
   * @returns {{pkgIds: string[]}}
   */
  static pickPackagesToBeDelivered(packages, sumLimit) {
    const packageWeightArray = packages.map((p) => p.pkgWeight);
    const packagePriorityScoreArray = packages.map((pkg) =>
      this.getPackagePriorityScore(pkg)
    );
    const { selectedItemIndexes } = this.knapSack(
      sumLimit,
      packageWeightArray,
      packagePriorityScoreArray,
      packages.length
    );
    return { pkgIds: selectedItemIndexes.map((i) => packages[i].pkgId) };
  }

  /**
   * Calculate the priority score of a package.
   * @param {Object} pkg
   * @returns {number}
   */
  static getPackagePriorityScore(pkg) {
    return (
      // the 1st priority is to deliver the maximum number of packages per trip trip, each package is given a priority score of 1
      1 +
      // the 2nd priority is to deliver the package with the highest weight, each unit of weight is given a priority score of 1/10^4
      // the priority score is divided by 10^4 to to make the weight less important than the number of packages
      // assuming the maximum weight of a package is 1000 kg for a courier service, the maximum priority score of the weight is 1000 / 10^4 = 0.1
      pkg.pkgWeight / Math.pow(10, 4) +
      // the 3rd priority is to deliver the package with the smallest distance, each unit of distance is given a standard priority score 1/10^8
      // the priority score is divided by 10^8 to to make the distance less important than the number of packages and the weight
      // assuming the maximum distance of a package is 1000 km for a courier service, the minimum priority score of the distance is -1000 / 10^8 = -0.00001
      -pkg.distance / Math.pow(10, 8)
    );
  }

  /**
   * Standard knapsack problem solution using dynamic programming.
   * @param {number} capacity - The maximum capacity of the knapsack
   * @param {number[]} W - The weights of the items
   * @param {number[]} V - The values of the items
   * @returns {{selectedItemIndexes: number[], max: number}} - The indexes of the selected items and the maximum value
   * Reference: https://github.com/williamfiset/Algorithms/blob/master/src/main/java/com/williamfiset/algorithms/dp/Knapsack_01.java
   */
  static knapSack(capacity, W, V) {
    if (W === null || V === null || W.length !== V.length || capacity < 0) {
      throw new Error("Invalid input");
    }

    const N = W.length;

    // Initialize a table where individual rows represent items
    // and columns represent the weight of the knapsack
    const DP = Array.from({ length: N + 1 }, () => Array(capacity + 1).fill(0));

    for (let i = 1; i <= N; i++) {
      // Get the value and weight of the item
      const w = W[i - 1],
        v = V[i - 1];

      for (let sz = 1; sz <= capacity; sz++) {
        // Consider not picking this element
        DP[i][sz] = DP[i - 1][sz];

        // Consider including the current element and
        // see if this would be more profitable
        if (sz >= w && DP[i - 1][sz - w] + v > DP[i][sz]) {
          DP[i][sz] = DP[i - 1][sz - w] + v;
        }
      }
    }

    let sz = capacity;
    const selectedItemIndexes = [];

    // Using the information inside the table we can backtrack and determine
    // which items were selected during the dynamic programming phase. The idea
    // is that if DP[i][sz] !== DP[i-1][sz] then the item was selected
    for (let i = N; i > 0; i--) {
      if (DP[i][sz] !== DP[i - 1][sz]) {
        const itemIndex = i - 1;
        selectedItemIndexes.push(itemIndex);
        sz -= W[itemIndex];
      }
    }

    // Return the maximum profit
    return { max: DP[N][capacity], selectedItemIndexes };
  }
}

module.exports = { ArrangementService };
