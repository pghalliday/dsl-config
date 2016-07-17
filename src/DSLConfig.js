const _ = require('lodash');

class DSLConfig {
  constructor(dslConfig) {
    if (_.isUndefined(dslConfig)) {
      this.dsl = {
        __config: {}
      };
    } else {
      this.dsl = _.clone(dslConfig.dsl);
      this.dsl.__config = {};
    }
  }

  configure(callback) {
    callback(this.dsl);
    return this.dsl.__config;
  }

  value(name) {
    this.dsl[name] = function(value) {
      this.__config[name] = value;
    };
  }

  valueList(name) {
    this.dsl.__config[name] = [];
    this.dsl[name] = function(value) {
      this.__config[name].push(value);
    };
  }

  object(name) {
    const dslConfig = new DSLConfig();
    this.dsl[name] = function(callback) {
      const clone = new DSLConfig(dslConfig);
      this.__config[name] = clone.dsl.__config;
      callback(clone.dsl);
    };
    return dslConfig;
  }

  objectList(name) {
    const dslConfig = new DSLConfig();
    this.dsl.__config[name] = [];
    this.dsl[name] = function(callback) {
      const clone = new DSLConfig(dslConfig);
      this.__config[name].push(clone.dsl.__config);
      callback(clone.dsl);
    };
    return dslConfig;
  }
}

module.exports = DSLConfig;
