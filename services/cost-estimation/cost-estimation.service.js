const { OfferService } = require("../offers/offers.service");
const { roundToPrecision } = require("../../utils/number.utils");

class CostExtimationService {
  static calculateTotalDeliveryCost(baseDeliveryCost, totalWeight, distance) {
    return baseDeliveryCost + totalWeight * 10 + distance * 5;
  }

  static async calculateDeliveryCost(
    baseDeliveryCost,
    totalWeight,
    distance,
    offerCode
  ) {
    const totalDeliveryCost = this.calculateTotalDeliveryCost(
      baseDeliveryCost,
      totalWeight,
      distance
    );
    const discount = await OfferService.getDiscount(
      offerCode,
      totalDeliveryCost,
      totalWeight,
      distance
    );

    return {
      discount: roundToPrecision(discount),
      totalCost: roundToPrecision(totalDeliveryCost - discount),
    };
  }
}

module.exports = { CostExtimationService: CostExtimationService };
