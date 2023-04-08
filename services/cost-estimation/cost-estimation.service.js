const { OfferService } = require("../offers/offers.service");

class CostExtimationService {
  static calculateTotalDeliveryCost(baseDeliveryCost, totalWeight, distance) {
    return baseDeliveryCost + totalWeight * 10 + distance * 5;
  }

  static async getDiscount(offer, totalDeliveryCost, totalWeight, distance) {
    if (
      offer &&
      totalWeight <= offer.weight.max &&
      totalWeight >= offer.weight.min &&
      distance <= offer.distance.max &&
      distance >= offer.distance.min
    ) {
      return offer.discount * totalDeliveryCost;
    }
    return 0;
  }

  static async calculateDeliveryCost(
    baseDeliveryCost,
    totalWeight,
    distance,
    offerCode
  ) {
    const offer = await OfferService.getOffer(offerCode);
    const totalDeliveryCost = this.calculateTotalDeliveryCost(
      baseDeliveryCost,
      totalWeight,
      distance
    );
    const discount = await this.getDiscount(
      offer,
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
