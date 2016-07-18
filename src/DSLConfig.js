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

  __configure(callback) {
    const self = this;
    if (isGeneratorFunction(callback)) {
      return co(function * () {
        yield callback(self.dsl);
      })
      .then(() => self.dsl);
    }
    return callback(self.dsl);
  }

  configure(callback) {
    const promise = this.__configure(callback);
    if (_.isUndefined(promise)) {
      return this.dsl.__config;
    }
    return promise.then(() => this.dsl.__config);
  }

  value(name, dslConfig) {
    if (_.isUndefined(dslConfig)) {
      this.dsl[name] = function(value) {
        this.__config[name] = value;
        return this;
      };
    } else {
      this.dsl[name] = function(callback) {
        const clone = new DSLConfig(dslConfig);
        this.__config[name] = clone.dsl.__config;
        const promise = clone.__configure(callback);
        if (_.isUndefined(promise)) {
          return this;
        }
        return promise.then(() => this);
      };
    }
    return this;
  }

  list(name, dslConfig) {
    this.dsl.__config[name] = [];
    if (_.isUndefined(dslConfig)) {
      this.dsl[name] = function(value) {
        this.__config[name].push(value);
        return this;
      };
    } else {
      this.dsl[name] = function(callback) {
        const clone = new DSLConfig(dslConfig);
        this.__config[name].push(clone.dsl.__config);
        const promise = clone.__configure(callback);
        if (_.isUndefined(promise)) {
          return this;
        }
        return promise.then(() => this);
      };
    }
    return this;
  }
}

module.exports = DSLConfig;
