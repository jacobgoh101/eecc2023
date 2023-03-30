#!/usr/bin/env node
'use strict';
const meow = require('meow');


const cli = meow(`
    Usage
      $ eecc1 <input>

    Options
      --input, -i  Input file to process  [required]
        The input file should be a text file in the format of:
            
            base_delivery_cost no_of_packges
            pkg_id1 pkg_weight1_in_kg distance1_in_km offer_code1
            ...

    Examples
      $ eecc1 --input=foo.txt
      pkg_id1 discount1 total_cost1
`, {
    flags: {
        input: {
            type: 'string',
            alias: 'i'
        }
    }
});

console.log(cli.flags.input);
