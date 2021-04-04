function log(...v) {
  console.log(new Date(), ...v);
}

module.exports = {
  log,
};
