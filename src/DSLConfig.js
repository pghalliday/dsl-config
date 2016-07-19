'use strict';

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
    this.dsl = {};
    if (_.isUndefined(dslConfig)) {
      this.config = {};
    } else {
      // if the supplied DSL config is an array then create
      // an array
      this.config = dslConfig.config instanceof Array ? [] : {};
      // bind the DSL methods to work with the correct
      // config context
      _.forOwn(dslConfig.dsl, (value, key) => {
        this.dsl[key] = value.bind(this);
      });
    }
  }

  configure(callback) {
    // first bind the DSL methods to work with the correct
    // config context as they have not been bound yet
    // in case they needed to be cloned (a function can
    // only be bound once)
    _.forOwn(this.dsl, (value, key) => {
      this.dsl[key] = value.bind(this);
    });
    const promise = configureDsl(this.dsl, callback);
    if (isPromise(promise)) {
      return promise.then(() => this.config);
    }
    return this.config;
  }

  value(name, dslConfig) {
    if (_.isUndefined(dslConfig)) {
      // will be bound later so that the config field
      // can be accessed, this is done so that we don't
      // have to pollute the DSL name space with a reference
      // to the config
      this.dsl[name] = function(value) {
        this.config[name] = value;
        return this.dsl;
      };
    } else {
      // will be bound later so that the config field
      // can be accessed, this is done so that we don't
      // have to pollute the DSL name space with a reference
      // to the config
      this.dsl[name] = function(callback) {
        const clone = new DSLConfig(dslConfig);
        this.config[name] = clone.config;
        const promise = configureDsl(clone.dsl, callback);
        if (isPromise(promise)) {
          return promise.then(() => this.dsl);
        }
        return this.dsl;
      };
    }
    return this;
  }

  list(name, dslConfig) {
    this.config[name] = [];
    if (_.isUndefined(dslConfig)) {
      // will be bound later so that the config field
      // can be accessed, this is done so that we don't
      // have to pollute the DSL name space with a reference
      // to the config
      this.dsl[name] = function(value) {
        this.config[name].push(value);
        return this.dsl;
      };
    } else {
      // will be bound later so that the config field
      // can be accessed, this is done so that we don't
      // have to pollute the DSL name space with a reference
      // to the config
      this.dsl[name] = function(callback) {
        const clone = new DSLConfig(dslConfig);
        this.config[name].push(clone.config);
        const promise = configureDsl(clone.dsl, callback);
        if (isPromise(promise)) {
          return promise.then(() => this.dsl);
        }
        return this.dsl;
      };
    }
    return this;
  }

  sublist(name, dslConfig) {
    this.config = [];
    if (_.isUndefined(dslConfig)) {
      // will be bound later so that the config field
      // can be accessed, this is done so that we don't
      // have to pollute the DSL name space with a reference
      // to the config
      this.dsl[name] = function(value) {
        this.config.push(value);
        return this.dsl;
      };
    } else {
      // will be bound later so that the config field
      // can be accessed, this is done so that we don't
      // have to pollute the DSL name space with a reference
      // to the config
      this.dsl[name] = function(callback) {
        const clone = new DSLConfig(dslConfig);
        this.config.push(clone.config);
        const promise = configureDsl(clone.dsl, callback);
        if (isPromise(promise)) {
          return promise.then(() => this.dsl);
        }
        return this.dsl;
      };
    }
    return this;
  }

  mapping(name, dslConfig) {
    this.config[name] = {};
    if (_.isUndefined(dslConfig)) {
      // will be bound later so that the config field
      // can be accessed, this is done so that we don't
      // have to pollute the DSL name space with a reference
      // to the config
      this.dsl[name] = function(key, value) {
        this.config[name][key] = value;
        return this.dsl;
      };
    } else {
      // will be bound later so that the config field
      // can be accessed, this is done so that we don't
      // have to pollute the DSL name space with a reference
      // to the config
      this.dsl[name] = function(key, callback) {
        const clone = new DSLConfig(dslConfig);
        this.config[name][key] = clone.config;
        const promise = configureDsl(clone.dsl, callback);
        if (isPromise(promise)) {
          return promise.then(() => this.dsl);
        }
        return this.dsl;
      };
    }
    return this;
  }

  submapping(name, dslConfig) {
    if (_.isUndefined(dslConfig)) {
      // will be bound later so that the config field
      // can be accessed, this is done so that we don't
      // have to pollute the DSL name space with a reference
      // to the config
      this.dsl[name] = function(key, value) {
        this.config[key] = value;
        return this.dsl;
      };
    } else {
      // will be bound later so that the config field
      // can be accessed, this is done so that we don't
      // have to pollute the DSL name space with a reference
      // to the config
      this.dsl[name] = function(key, callback) {
        const clone = new DSLConfig(dslConfig);
        this.config[key] = clone.config;
        const promise = configureDsl(clone.dsl, callback);
        if (isPromise(promise)) {
          return promise.then(() => this.dsl);
        }
        return this.dsl;
      };
    }
    return this;
  }
}

module.exports = DSLConfig;
