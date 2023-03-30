# EECC2023 Courier Service CLI App

This is a command line interface (CLI) app for a courier service, built using Node.js.

## Prerequisites

- Node.js v16.16.0 or above
- npm 8.11.0 or above

## Getting Started

```bash
git clone https://github.com/jacobgoh101/eecc2023
cd eecc2023
npm install
npm install -g .
```

Now you can use the installed commands `eecc-cost-estimation` and `eecc-delivery-arrangement`.

### `eecc-delivery-arrangement`

```bash
$ eecc-delivery-arrangement --help

  A sample command line application for a courier service

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
```

### `eecc-cost-estimation`

```bash
$ eecc-cost-estimation --help

  A sample command line application for a courier service

  Usage
    $ eecc-cost-estimation <input>

  Options
    --input, -i  Input file to process  [required]
      The input file should be a text file in the format of:

          baseDeliveryCost no_of_packges
          pkgId1 pkgWeight1_in_kg distance1_in_km offerCode1
          ...

  Examples
    $ eecc-cost-estimation --input=foo.txt
    pkgId1 discount1 total_cost1
```

## Sample Results

To get the sample results based on the requirements, run the following commands:

```bash
$ eecc-cost-estimation --input=samples/challenge1/input1.txt
PKG1 0 175
PKG2 0 275
PKG3 35 665
$ eecc-delivery-arrangement --input=samples/challenge2/input1.txt
PKG1 0 750 3.98
PKG2 0 1475 1.78
PKG3 0 2350 1.42
PKG4 105 1395 0.85
PKG5 0 2125 4.19
```


https://user-images.githubusercontent.com/15951104/228869573-1c6d67cb-6597-4a67-bfe3-7215fdebab13.mp4

