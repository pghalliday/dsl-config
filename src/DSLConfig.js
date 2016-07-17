const co = require('co');
const _ = require('lodash');
const isGeneratorFunction = require('../vendor/isGeneratorFunction');

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

  * configure(callback) {
    if (isGeneratorFunction(callback)) {
      yield callback(this.dsl);
      return this.dsl.__config;
    }
    return Promise.resolve()
    .then(() => {
      return callback(this.dsl);
    })
    .then(() => {
      return this.dsl.__config;
    });
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
      const self = this;
      return co(function * () {
        const clone = new DSLConfig(dslConfig);
        self.__config[name] = clone.dsl.__config;
        yield callback(clone.dsl);
      });
    };
    return dslConfig;
  }

  objectList(name) {
    const dslConfig = new DSLConfig();
    this.dsl.__config[name] = [];
    this.dsl[name] = function(callback) {
      const self = this;
      return co(function * () {
        const clone = new DSLConfig(dslConfig);
        self.__config[name].push(clone.dsl.__config);
        yield callback(clone.dsl);
      });
    };
    return dslConfig;
  }
}

module.exports = DSLConfig;
