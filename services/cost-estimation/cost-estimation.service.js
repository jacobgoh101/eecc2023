const { OfferService } = require("../offers/offers.service");

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
      discount: Number(discount.toFixed(2)),
      totalCost: Number((totalDeliveryCost - discount).toFixed(2)),
    };
  }
}

module.exports = { CostExtimationService: CostExtimationService };
