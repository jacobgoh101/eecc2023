const { OfferService } = require("../offers/offers.service");

class CostExtimationService {
  /**
   *
   * @param {*} baseDeliveryCost
   * @param {*} totalWeight
   * @param {*} distance
   * @param {*} offerCode
   * @returns {Promise<{discount: number, totalCost: number}>}
   */
  static async calculateDeliveryCost(
    baseDeliveryCost,
    totalWeight,
    distance,
    offerCode
  ) {
    const offer = await OfferService.getOffer(offerCode);

    //Base Delivery Cost + (Package Total Weight * 10) + (Distance to Destination * 5) = Total Delivery Cost
    const totalDeliveryCost =
      baseDeliveryCost + totalWeight * 10 + distance * 5;

    let discount = 0;
    if (
      offer &&
      totalWeight <= offer.weight.max &&
      totalWeight >= offer.weight.min &&
      distance <= offer.distance.max &&
      distance >= offer.distance.min
    ) {
      discount = offer.discount * totalDeliveryCost;
    }

    return {
      discount: Number(discount.toFixed(2)),
      totalCost: Number((totalDeliveryCost - discount).toFixed(2)),
    };
  }
}

module.exports = { CostExtimationService: CostExtimationService };
