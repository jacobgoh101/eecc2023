const Joi = require('joi');

const packageSchema = Joi.object({
    pkg_id: Joi.string().required(),
    pkg_weight: Joi.number().positive().required(),
    distance: Joi.number().positive().required(),
    offer_code: Joi.string().required(),
});

const multiplePackageLinesValidator = (value, helpers) => {
    const lines = value.trim().split('\n');
    for (const line of lines) {
        const [pkg_id, pkg_weight, distance, offer_code, ...rest] = line.split(' ').filter(Boolean);
        if (rest.length) {
            return helpers.error('any.invalid');
        }

        const validationResult = packageSchema.validate({
            pkg_id: (pkg_id),
            pkg_weight: Number(pkg_weight),
            distance: Number(distance),
            offer_code,
        });

        if (validationResult.error) {
            return helpers.error('any.invalid');
        }
    }

    return value;
};

const inputSchema = Joi.object({
    base_delivery_cost: Joi.number().positive().required(),
    no_of_packages: Joi.number().integer().positive().required(),
    package_lines: Joi.string().custom(multiplePackageLinesValidator).required(),
});

module.exports = { inputSchema };
