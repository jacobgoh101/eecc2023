function roundToPrecision(num, precision = 2) {
  return Number(num.toFixed(precision));
}

module.exports = { roundToPrecision };
