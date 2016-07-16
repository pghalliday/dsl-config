class DSLConfig {
  constructor() {
    this.dsl = {};
    this.config = {};
  }

  property(name) {
    const self = this;
    self.dsl[name] = function(value) {
      self.config[name] = value;
    };
  }
}

module.exports = DSLConfig;
