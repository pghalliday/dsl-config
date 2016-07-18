const co = require('co');
const _ = require('lodash');
const isGeneratorFunction = require('../vendor/isGeneratorFunction');

function isPromise(obj) {
  return Promise.resolve(obj) === obj;
}

function configureDsl(dsl, callback) {
  if (isGeneratorFunction(callback)) {
    return co(function * () {
      yield callback(dsl);
    });
  }
  return callback(dsl);
}

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
    const promise = configureDsl(this.dsl, callback);
    if (isPromise(promise)) {
      return promise.then(() => this.dsl.__config);
    }
    return this.dsl.__config;
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
        const promise = configureDsl(clone.dsl, callback);
        if (isPromise(promise)) {
          return promise.then(() => this);
        }
        return this;
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
        const promise = configureDsl(clone.dsl, callback);
        if (isPromise(promise)) {
          return promise.then(() => this);
        }
        return this;
      };
    }
    return this;
  }
}

module.exports = DSLConfig;
