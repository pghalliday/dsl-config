module.exports = {
  env: {
    mocha: true
  },
  plugins: [
    'mocha',
    'chai-expect'
  ],
  rules: {
    'no-unused-expressions': 0,
    'chai-expect/missing-assertion': 2,
    'chai-expect/terminating-properties': 2,
    'max-nested-callbacks': 0
  }
};
