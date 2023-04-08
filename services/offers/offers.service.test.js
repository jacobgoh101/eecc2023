const { OfferService } = require("./offers.service");

const mockedOffers = {
  OFFER1: {
    discount: 0.1,
    conditions: {
      weight: {
        min: 0,
        max: 10,
      },
      distance: {
        min: 0,
        max: 100,
      },
    },
  },
  OFFER2: {
    discount: 0.2,
    conditions: {
      weight: {
        min: 0,
        max: 20,
      },
      distance: {
        min: 0,
        max: 200,
      },
    },
  },
};

// mock getOffers function
jest.spyOn(OfferService, "getOffers").mockImplementation(() => {
  return mockedOffers;
});

describe("OfferService", () => {
  describe("getOffer", () => {
    it("should return offer", async () => {
      const offer = await OfferService.getOffer("OFFER1");
      expect(offer).toMatchObject(mockedOffers.OFFER1);
    });

    it("should return undefined if offer does not exist", async () => {
      const offer = await OfferService.getOffer("OFFER3");
      expect(offer).toBeUndefined();
    });
  });

  describe("isDiscountableWeight", () => {
    it("should return true if weight is in range", () => {
      const result = OfferService.isDiscountableWeight(mockedOffers.OFFER1, 5);
      expect(result).toBe(true);
    });

    it("should return false if weight is not in range", () => {
      const result = OfferService.isDiscountableWeight(mockedOffers.OFFER1, 15);
      expect(result).toBe(false);
    });
  });

  describe("isDiscountableDistance", () => {
    it("should return true if distance is in range", () => {
      const result = OfferService.isDiscountableDistance(
        mockedOffers.OFFER1,
        50
      );
      expect(result).toBe(true);
    });

    it("should return false if distance is not in range", () => {
      const result = OfferService.isDiscountableDistance(
        mockedOffers.OFFER1,
        150
      );
      expect(result).toBe(false);
    });
  });

  describe("canApplyOffer", () => {
    it("should return true if offer exists and weight and distance are in range", () => {
      const result = OfferService.canApplyOffer(mockedOffers.OFFER1, 5, 50);
      expect(result).toBe(true);
    });

    it("should return false if offer does not exist", () => {
      const result = OfferService.canApplyOffer(undefined, 5, 50);
      expect(result).toBe(false);
    });

    it("should return false if weight is not in range", () => {
      const result = OfferService.canApplyOffer(mockedOffers.OFFER1, 15, 50);
      expect(result).toBe(false);
    });

    it("should return false if distance is not in range", () => {
      const result = OfferService.canApplyOffer(mockedOffers.OFFER1, 5, 150);
      expect(result).toBe(false);
    });
  });

  describe("getDiscount", () => {
    it("should return discount if offer exists and weight and distance are in range", async () => {
      const result = await OfferService.getDiscount("OFFER1", 100, 5, 50);
      expect(result).toBe(10);
    });

    it("should return 0 if offer does not exist", async () => {
      const result = await OfferService.getDiscount("OFFER3", 100, 5, 50);
      expect(result).toBe(0);
    });

    it("should return 0 if weight is not in range", async () => {
      const result = await OfferService.getDiscount("OFFER1", 100, 15, 50);
      expect(result).toBe(0);
    });

    it("should return 0 if distance is not in range", async () => {
      const result = await OfferService.getDiscount("OFFER1", 100, 5, 150);
      expect(result).toBe(0);
    });
  });
});
