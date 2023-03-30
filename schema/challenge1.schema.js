const Joi = require('joi');

const packageSchema = Joi.object({
    pkgId: Joi.string().required(),
    pkgWeight: Joi.number().positive().required(),
    distance: Joi.number().positive().required(),
    offerCode: Joi.string().required(),
});

const multiplePackageLinesValidator = (value, helpers) => {
    const lines = value.trim().split('\n');
    for (const line of lines) {
        const [pkgId, pkgWeight, distance, offerCode, ...rest] = line.split(' ').filter(Boolean);
        if (rest.length) {
            return helpers.error('any.invalid');
        }

        const validationResult = packageSchema.validate({
            pkgId: (pkgId),
            pkgWeight: Number(pkgWeight),
            distance: Number(distance),
            offerCode,
        });

        if (validationResult.error) {
            return helpers.error('any.invalid');
        }
    }

    return value;
};

const inputSchema = Joi.object({
    baseDeliveryCost: Joi.number().positive().required(),
    noOfPackages: Joi.number().integer().positive().required(),
    packageLines: Joi.string().custom(multiplePackageLinesValidator).required(),
});

module.exports = { inputSchema };
