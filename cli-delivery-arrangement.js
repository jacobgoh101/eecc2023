#!/usr/bin/env node
'use strict';
const meow = require('meow');
const fs = require('fs');
const { ArrangementService } = require('./services/arrangement.service');

const cli = meow(`
    Usage
      $ eecc-delivery-arrangement <input>

    Options
      --input, -i  Input file to process  [required]
        The input file should be a text file in the format of:
            
            base_delivery_cost no_of_packges
            pkg_id1 pkg_weight1_in_kg distance1_in_km offer_code1
            ....
            no_of_vehicles max_speed max_carriable_weight

    Examples
      $ eecc-delivery-arrangement --input=foo.txt
      pkg_id1 discount1 total_cost1 estimated_delivery_time1_in_hours
      ...
`, {
    flags: {
        input: {
            type: 'string',
            alias: 'i'
        }
    }
});

if (!cli.flags.input) {
    cli.showHelp();
    process.exit();
}

function readInputFile() {
    try {
        const input = fs.readFileSync(cli.flags.input, 'utf8')
        return input;
    } catch (err) {
        console.error(err);
        process.exit();
    }
}

const input = readInputFile();


(async () => {
    // validate input file
    const parsed = await ArrangementService.parseAndValidateInput(input);
    if (!parsed) process.exit();
    let {
        baseDeliveryCost, noOfPackages, packages, maxCarriableWeight, maxSpeed, noOfVehicles
    } = parsed;
    packages = await ArrangementService.processDelivery({
        baseDeliveryCost,
        packages,
        maxCarriableWeight,
        maxSpeed,
        vehicles: Array(noOfVehicles).fill(null).map((__, i) => ({ id: i, availableAfter: 0 })),
        timeNow: 0
    });
    let result = '';
    for (const { pkgId, pkgWeight, distance, offerCode, discount, totalCost, deliveryTime } of packages) {
        result += `${pkgId} ${discount} ${totalCost} ${deliveryTime}\n`
    }
    console.log(result.trim());
})()
