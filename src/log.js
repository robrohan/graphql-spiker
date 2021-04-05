function log(...v) {
  console.log(new Date().getTime(), ...v);
}

module.exports = {
  log,
};
