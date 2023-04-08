const Joi = require("joi");

const packageSchema = Joi.object({
  pkgId: Joi.string().required(),
  pkgWeight: Joi.number().positive().required(),
  distance: Joi.number().positive().required(),
  offerCode: Joi.string().required(),
});

const costEstimationInputSchema = Joi.object({
  baseDeliveryCost: Joi.number().positive().required(),
  noOfPackages: Joi.number().integer().positive().required(),
  packages: Joi.array().items(packageSchema).min(1).required(),
});

const arrangementInputSchema = costEstimationInputSchema.keys({
  noOfVehicles: Joi.number().integer().positive().required(),
  maxSpeed: Joi.number().positive().required(),
  maxCarriableWeight: Joi.number().positive().required(),
});

module.exports = { costEstimationInputSchema, arrangementInputSchema };
