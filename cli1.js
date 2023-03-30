#!/usr/bin/env node
'use strict';
const meow = require('meow');
const fs = require('fs');
const { totalDeliveryCostExtimationService } = require('./services/challenge1.service');

const cli = meow(`
    Usage
      $ eecc1 <input>

    Options
      --input, -i  Input file to process  [required]
        The input file should be a text file in the format of:
            
            baseDeliveryCost no_of_packges
            pkgId1 pkgWeight1_in_kg distance1_in_km offerCode1
            ...

    Examples
      $ eecc1 --input=foo.txt
      pkgId1 discount1 total_cost1
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
    const parsed = await totalDeliveryCostExtimationService.parseAndValidateInput(input);
    if (!parsed) process.exit();
    const {
        baseDeliveryCost, noOfPackages, packages
    } = parsed;
    let result = '';
    for (const { pkgId, pkgWeight, distance, offerCode } of packages) {
        const { discount, totalCost } = await totalDeliveryCostExtimationService.calculateDeliveryCost(
            baseDeliveryCost, pkgWeight, distance, offerCode
        )
        result += `${pkgId} ${discount} ${totalCost}\n`
    }
    console.log(result.trim());
})()