const fs = require("fs/promises");

class OfferService {
  static async getOffers() {
    const file = await fs.readFile(
      __dirname + "/../../data/offers.json",
      "utf8"
    );
    return JSON.parse(file);
  }

  static async getOffer(offerCode) {
    const offers = await this.getOffers();
    return offers[offerCode];
  }

  static async getDiscount(offerCode, totalDeliveryCost, weight, distance) {
    const offer = await this.getOffer(offerCode);
    const canApplyOffer = this.canApplyOffer(offer, weight, distance);
    if (canApplyOffer) {
      return offer.discount * totalDeliveryCost;
    }
    return 0;
  }

  static canApplyOffer(offer, weight, distance) {
    return (
      !!offer &&
      this.isDiscountableWeight(offer, weight) &&
      this.isDiscountableDistance(offer, distance)
    );
  }

  static isDiscountableWeight(offer, weight) {
    return (
      weight <= offer.conditions.weight.max &&
      weight >= offer.conditions.weight.min
    );
  }

  static isDiscountableDistance(offer, distance) {
    return (
      distance <= offer.conditions.distance.max &&
      distance >= offer.conditions.distance.min
    );
  }
}

module.exports = { OfferService };
