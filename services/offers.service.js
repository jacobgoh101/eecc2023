const fs = require('fs/promises');


class OfferService {
    static async getOffers() {
        return JSON.parse(fs.readFile(__dirname + '/../data/offers.json', 'utf8'))
    }

    static async getOffer(offerCode) {
        const offers = await this.getOffers();
        return offers[offerCode];
    }
}

module.exports = { OfferService };
