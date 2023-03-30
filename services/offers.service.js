const fs = require('fs/promises');


class OfferService {
    static async getOffers() {
        const file = await fs.readFile(__dirname + '/../data/offers.json', 'utf8');
        return JSON.parse(file)
    }

    static async getOffer(offerCode) {
        const offers = await this.getOffers();
        return offers[offerCode];
    }
}

module.exports = { OfferService };
