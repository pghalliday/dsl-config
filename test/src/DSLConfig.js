'use strict';

const co = require('co');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
chai.use(chaiAsPromised);

const DSLConfig = require('../../src/DSLConfig');

function nextTick() {
  return new Promise(resolve => {
    process.nextTick(resolve);
  });
}

describe('DSLConfig', () => {
  let dslConfig;

  beforeEach(() => {
    dslConfig = new DSLConfig();
  });

  describe('#configure', () => {
    describe('with a synchronous callback', () => {
      it('should throw if the callback throws', () => {
        (() => {
          dslConfig.configure(() => {
            throw new Error('configure error');
          });
        }).should.throw('configure error');
      });
    });

    describe('with a generator callback', () => {
      it('should throw if the callback throws', () => {
        return co(function * () {
          yield dslConfig.configure(() => {
            throw new Error('configure error');
          });
        }).should.be.rejectedWith('configure error');
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should throw if the callback throws', () => {
        return dslConfig.configure(() => {
          return Promise.reject(new Error('configure error'));
        }).should.be.rejectedWith('configure error');
      });
    });
  });

  describe('#value', () => {
    beforeEach(() => {
      dslConfig
      .value('value1')
      .value('value2');
    });

    it('should default the value to undefined', () => {
      dslConfig.configure(() => {
        return true;
      }).should.eql({});
    });

    it('should add a value method', () => {
      dslConfig.configure(config => {
        config
        .value1('value1')
        .value2('value2');
        return true;
      }).should.eql({
        value1: 'value1',
        value2: 'value2'
      });
    });
  });

  describe('#list', () => {
    beforeEach(() => {
      dslConfig
      .list('list1')
      .list('list2');
    });

    it('should default the list to an empty array', () => {
      dslConfig.configure(() => {
        return true;
      }).should.eql({
        list1: [],
        list2: []
      });
    });

    it('should add a list method', () => {
      dslConfig.configure(config => {
        config
        .list1('value1_1')
        .list1('value1_2')
        .list2('value2_1')
        .list2('value2_2');
        return true;
      }).should.eql({
        list1: [
          'value1_1',
          'value1_2'
        ],
        list2: [
          'value2_1',
          'value2_2'
        ]
      });
    });
  });

  describe('#sublist', () => {
    beforeEach(() => {
      dslConfig
      .sublist('sublist1')
      .sublist('sublist2');
    });

    it('should convert the parent object to an empty array', () => {
      dslConfig.configure(() => {
        return true;
      }).should.eql([]);
    });

    it('should add a sublist method', () => {
      dslConfig.configure(config => {
        config
        .sublist1('value1_1')
        .sublist1('value1_2')
        .sublist2('value2_1')
        .sublist2('value2_2');
        return true;
      }).should.eql([
        'value1_1',
        'value1_2',
        'value2_1',
        'value2_2'
      ]);
    });
  });

  describe('#mapping', () => {
    beforeEach(() => {
      dslConfig
      .mapping('mapping1')
      .mapping('mapping2');
    });

    it('should default the mapping to an empty object', () => {
      dslConfig.configure(() => {
        return true;
      }).should.eql({
        mapping1: {},
        mapping2: {}
      });
    });

    it('should add a mapping method', () => {
      dslConfig.configure(config => {
        config
        .mapping1('key1 1', 'value1_1')
        .mapping1('key1 2', 'value1_2')
        .mapping2('key2 1', 'value2_1')
        .mapping2('key2 2', 'value2_2');
        return true;
      }).should.eql({
        mapping1: {
          'key1 1': 'value1_1',
          'key1 2': 'value1_2'
        },
        mapping2: {
          'key2 1': 'value2_1',
          'key2 2': 'value2_2'
        }
      });
    });
  });

  describe('#submapping', () => {
    beforeEach(() => {
      dslConfig
      .submapping('submapping1')
      .submapping('submapping2');
    });

    it('should add a submapping method', () => {
      dslConfig.configure(config => {
        config
        .submapping1('key1 1', 'value1_1')
        .submapping1('key1 2', 'value1_2')
        .submapping2('key2 1', 'value2_1')
        .submapping2('key2 2', 'value2_2');
        return true;
      }).should.eql({
        'key1 1': 'value1_1',
        'key1 2': 'value1_2',
        'key2 1': 'value2_1',
        'key2 2': 'value2_2'
      });
    });
  });

  describe('#value with a DSLConfig', () => {
    beforeEach(() => {
      dslConfig
      .value(
        'sub1',
        new DSLConfig()
        .value('sub1value1')
        .value('sub1value2')
      )
      .value(
        'sub2',
        new DSLConfig()
        .value('sub2value1')
        .value('sub2value2')
      );
    });

    it('should default the value to undefined', () => {
      dslConfig.configure(() => {
        return true;
      }).should.eql({});
    });

    describe('with a synchronous callback', () => {
      it('should add a value method', () => {
        dslConfig.configure(config => {
          config
          .sub1(sub1 => {
            sub1
            .sub1value1('sub1value1')
            .sub1value2('sub1value2');
            return true;
          })
          .sub2(sub2 => {
            sub2
            .sub2value1('sub2value1')
            .sub2value2('sub2value2');
            return true;
          });
          return true;
        }).should.eql({
          sub1: {
            sub1value1: 'sub1value1',
            sub1value2: 'sub1value2'
          },
          sub2: {
            sub2value1: 'sub2value1',
            sub2value2: 'sub2value2'
          }
        });
      });

      it('should throw if the callback throws', () => {
        (() => {
          dslConfig.configure(config => {
            config.sub1(() => {
              throw new Error('configure error');
            });
          });
        }).should.throw('configure error');
      });
    });

    describe('with a generator callback', () => {
      it('should add a value method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(function * (config) {
            const config1 = yield config.sub1(function * (sub1) {
              yield nextTick();
              sub1
              .sub1value1('sub1value1')
              .sub1value2('sub1value2');
            });
            yield config1.sub2(function * (sub2) {
              yield nextTick();
              sub2
              .sub2value1('sub2value1')
              .sub2value2('sub2value2');
            });
          });
          config.should.eql({
            sub1: {
              sub1value1: 'sub1value1',
              sub1value2: 'sub1value2'
            },
            sub2: {
              sub2value1: 'sub2value1',
              sub2value2: 'sub2value2'
            }
          });
        });
      });

      it('should throw if the callback throws', () => {
        return co(function * () {
          yield dslConfig.configure(function * (config) {
            yield config.sub1(function * () {
              yield nextTick();
              throw new Error('configure error');
            });
          });
        }).should.be.rejectedWith('configure error');
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should add a value method', () => {
        return dslConfig.configure(config => {
          return config.sub1(sub1 => {
            return nextTick()
            .then(() => {
              sub1
              .sub1value1('sub1value1')
              .sub1value2('sub1value2');
            });
          })
          .then(config => {
            return config.sub2(sub2 => {
              return nextTick()
              .then(() => {
                sub2
                .sub2value1('sub2value1')
                .sub2value2('sub2value2');
              });
            });
          });
        }).should.eventually.eql({
          sub1: {
            sub1value1: 'sub1value1',
            sub1value2: 'sub1value2'
          },
          sub2: {
            sub2value1: 'sub2value1',
            sub2value2: 'sub2value2'
          }
        });
      });

      it('should throw if the callback throws', () => {
        return dslConfig.configure(config => {
          return config.sub1(() => {
            return Promise.reject(new Error('configure error'));
          });
        }).should.be.rejectedWith('configure error');
      });
    });
  });

  describe('#list with a DSLConfig', () => {
    beforeEach(() => {
      dslConfig
      .list(
        'sub1',
        new DSLConfig()
        .value('sub1value1')
        .value('sub1value2')
      )
      .list(
        'sub2',
        new DSLConfig()
        .value('sub2value1')
        .value('sub2value2')
      );
    });

    it('should default the list to an empty array', () => {
      dslConfig.configure(() => {
        return true;
      }).should.eql({
        sub1: [],
        sub2: []
      });
    });

    describe('with a synchronous callback', () => {
      it('should add a list method', () => {
        dslConfig.configure(config => {
          config
          .sub1(sub1 => {
            sub1
            .sub1value1('sub1_1value1')
            .sub1value2('sub1_1value2');
            return true;
          })
          .sub2(sub2 => {
            sub2
            .sub2value1('sub2_1value1')
            .sub2value2('sub2_1value2');
            return true;
          })
          .sub1(sub1 => {
            sub1
            .sub1value1('sub1_2value1')
            .sub1value2('sub1_2value2');
            return true;
          })
          .sub2(sub2 => {
            sub2
            .sub2value1('sub2_2value1')
            .sub2value2('sub2_2value2');
            return true;
          });
          return true;
        }).should.eql({
          sub1: [{
            sub1value1: 'sub1_1value1',
            sub1value2: 'sub1_1value2'
          }, {
            sub1value1: 'sub1_2value1',
            sub1value2: 'sub1_2value2'
          }],
          sub2: [{
            sub2value1: 'sub2_1value1',
            sub2value2: 'sub2_1value2'
          }, {
            sub2value1: 'sub2_2value1',
            sub2value2: 'sub2_2value2'
          }]
        });
      });

      it('should throw if the callback throws', () => {
        (() => {
          dslConfig.configure(config => {
            config.sub1(() => {
              throw new Error('configure error');
            });
          });
        }).should.throw('configure error');
      });
    });

    describe('with a generator callback', () => {
      it('should add a list method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(function * (config) {
            let config1 = yield config.sub1(function * (sub1) {
              yield nextTick();
              sub1
              .sub1value1('sub1_1value1')
              .sub1value2('sub1_1value2');
            });
            config1 = yield config1.sub2(function * (sub2) {
              yield nextTick();
              sub2
              .sub2value1('sub2_1value1')
              .sub2value2('sub2_1value2');
            });
            config1 = yield config1.sub1(function * (sub1) {
              yield nextTick();
              sub1
              .sub1value1('sub1_2value1')
              .sub1value2('sub1_2value2');
            });
            yield config1.sub2(function * (sub2) {
              yield nextTick();
              sub2
              .sub2value1('sub2_2value1')
              .sub2value2('sub2_2value2');
            });
          });
          config.should.eql({
            sub1: [{
              sub1value1: 'sub1_1value1',
              sub1value2: 'sub1_1value2'
            }, {
              sub1value1: 'sub1_2value1',
              sub1value2: 'sub1_2value2'
            }],
            sub2: [{
              sub2value1: 'sub2_1value1',
              sub2value2: 'sub2_1value2'
            }, {
              sub2value1: 'sub2_2value1',
              sub2value2: 'sub2_2value2'
            }]
          });
        });
      });

      it('should throw if the callback throws', () => {
        return co(function * () {
          yield dslConfig.configure(function * (config) {
            yield config.sub1(function * () {
              yield nextTick();
              throw new Error('configure error');
            });
          });
        }).should.be.rejectedWith('configure error');
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should add a list method', () => {
        return dslConfig.configure(config => {
          return config.sub1(sub1 => {
            return nextTick()
            .then(() => {
              sub1
              .sub1value1('sub1_1value1')
              .sub1value2('sub1_1value2');
            });
          })
          .then(config => {
            return config.sub2(sub2 => {
              return nextTick()
              .then(() => {
                sub2
                .sub2value1('sub2_1value1')
                .sub2value2('sub2_1value2');
              });
            });
          })
          .then(config => {
            return config.sub1(sub1 => {
              return nextTick()
              .then(() => {
                sub1
                .sub1value1('sub1_2value1')
                .sub1value2('sub1_2value2');
              });
            });
          })
          .then(config => {
            return config.sub2(sub2 => {
              return nextTick()
              .then(() => {
                sub2
                .sub2value1('sub2_2value1')
                .sub2value2('sub2_2value2');
              });
            });
          });
        }).should.eventually.eql({
          sub1: [{
            sub1value1: 'sub1_1value1',
            sub1value2: 'sub1_1value2'
          }, {
            sub1value1: 'sub1_2value1',
            sub1value2: 'sub1_2value2'
          }],
          sub2: [{
            sub2value1: 'sub2_1value1',
            sub2value2: 'sub2_1value2'
          }, {
            sub2value1: 'sub2_2value1',
            sub2value2: 'sub2_2value2'
          }]
        });
      });

      it('should throw if the callback throws', () => {
        return dslConfig.configure(config => {
          return config.sub1(() => {
            return Promise.reject(new Error('configure error'));
          });
        }).should.be.rejectedWith('configure error');
      });
    });
  });

  describe('#sublist with a DSLConfig', () => {
    beforeEach(() => {
      dslConfig
      .sublist(
        'sub1',
        new DSLConfig()
        .value('sub1value1')
        .value('sub1value2')
      )
      .sublist(
        'sub2',
        new DSLConfig()
        .value('sub2value1')
        .value('sub2value2')
      );
    });

    it('should convert the parent config to an empty array', () => {
      dslConfig.configure(() => {
        return true;
      }).should.eql([]);
    });

    describe('with a synchronous callback', () => {
      it('should add a sublist method', () => {
        dslConfig.configure(config => {
          config
          .sub1(sub1 => {
            sub1
            .sub1value1('sub1_1value1')
            .sub1value2('sub1_1value2');
            return true;
          })
          .sub2(sub2 => {
            sub2
            .sub2value1('sub2_1value1')
            .sub2value2('sub2_1value2');
            return true;
          })
          .sub1(sub1 => {
            sub1
            .sub1value1('sub1_2value1')
            .sub1value2('sub1_2value2');
            return true;
          })
          .sub2(sub2 => {
            sub2
            .sub2value1('sub2_2value1')
            .sub2value2('sub2_2value2');
            return true;
          });
          return true;
        }).should.eql([{
          sub1value1: 'sub1_1value1',
          sub1value2: 'sub1_1value2'
        }, {
          sub2value1: 'sub2_1value1',
          sub2value2: 'sub2_1value2'
        }, {
          sub1value1: 'sub1_2value1',
          sub1value2: 'sub1_2value2'
        }, {
          sub2value1: 'sub2_2value1',
          sub2value2: 'sub2_2value2'
        }]);
      });

      it('should throw if the callback throws', () => {
        (() => {
          dslConfig.configure(config => {
            config.sub1(() => {
              throw new Error('configure error');
            });
          });
        }).should.throw('configure error');
      });
    });

    describe('with a generator callback', () => {
      it('should add a list method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(function * (config) {
            let config1 = yield config.sub1(function * (sub1) {
              yield nextTick();
              sub1
              .sub1value1('sub1_1value1')
              .sub1value2('sub1_1value2');
            });
            config1 = yield config1.sub2(function * (sub2) {
              yield nextTick();
              sub2
              .sub2value1('sub2_1value1')
              .sub2value2('sub2_1value2');
            });
            config1 = yield config1.sub1(function * (sub1) {
              yield nextTick();
              sub1
              .sub1value1('sub1_2value1')
              .sub1value2('sub1_2value2');
            });
            yield config1.sub2(function * (sub2) {
              yield nextTick();
              sub2
              .sub2value1('sub2_2value1')
              .sub2value2('sub2_2value2');
            });
          });
          config.should.eql([{
            sub1value1: 'sub1_1value1',
            sub1value2: 'sub1_1value2'
          }, {
            sub2value1: 'sub2_1value1',
            sub2value2: 'sub2_1value2'
          }, {
            sub1value1: 'sub1_2value1',
            sub1value2: 'sub1_2value2'
          }, {
            sub2value1: 'sub2_2value1',
            sub2value2: 'sub2_2value2'
          }]);
        });
      });

      it('should throw if the callback throws', () => {
        return co(function * () {
          yield dslConfig.configure(function * (config) {
            yield config.sub1(function * () {
              yield nextTick();
              throw new Error('configure error');
            });
          });
        }).should.be.rejectedWith('configure error');
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should add a list method', () => {
        return dslConfig.configure(config => {
          return config.sub1(sub1 => {
            return nextTick()
            .then(() => {
              sub1
              .sub1value1('sub1_1value1')
              .sub1value2('sub1_1value2');
            });
          })
          .then(config => {
            return config.sub2(sub2 => {
              return nextTick()
              .then(() => {
                sub2
                .sub2value1('sub2_1value1')
                .sub2value2('sub2_1value2');
              });
            });
          })
          .then(config => {
            return config.sub1(sub1 => {
              return nextTick()
              .then(() => {
                sub1
                .sub1value1('sub1_2value1')
                .sub1value2('sub1_2value2');
              });
            });
          })
          .then(config => {
            return config.sub2(sub2 => {
              return nextTick()
              .then(() => {
                sub2
                .sub2value1('sub2_2value1')
                .sub2value2('sub2_2value2');
              });
            });
          });
        }).should.eventually.eql([{
          sub1value1: 'sub1_1value1',
          sub1value2: 'sub1_1value2'
        }, {
          sub2value1: 'sub2_1value1',
          sub2value2: 'sub2_1value2'
        }, {
          sub1value1: 'sub1_2value1',
          sub1value2: 'sub1_2value2'
        }, {
          sub2value1: 'sub2_2value1',
          sub2value2: 'sub2_2value2'
        }]);
      });

      it('should throw if the callback throws', () => {
        return dslConfig.configure(config => {
          return config.sub1(() => {
            return Promise.reject(new Error('configure error'));
          });
        }).should.be.rejectedWith('configure error');
      });
    });
  });

  describe('#mapping with a DSLConfig', () => {
    beforeEach(() => {
      dslConfig
      .mapping(
        'sub1',
        new DSLConfig()
        .value('sub1value1')
        .value('sub1value2')
      )
      .mapping(
        'sub2',
        new DSLConfig()
        .value('sub2value1')
        .value('sub2value2')
      );
    });

    describe('with a synchronous callback', () => {
      it('should add a mapping method', () => {
        dslConfig.configure(config => {
          config
          .sub1('sub1 1', sub1 => {
            sub1
            .sub1value1('sub1_1value1')
            .sub1value2('sub1_1value2');
            return true;
          })
          .sub2('sub2 1', sub2 => {
            sub2
            .sub2value1('sub2_1value1')
            .sub2value2('sub2_1value2');
            return true;
          })
          .sub1('sub1 2', sub1 => {
            sub1
            .sub1value1('sub1_2value1')
            .sub1value2('sub1_2value2');
            return true;
          })
          .sub2('sub2 2', sub2 => {
            sub2
            .sub2value1('sub2_2value1')
            .sub2value2('sub2_2value2');
            return true;
          });
          return true;
        }).should.eql({
          sub1: {
            'sub1 1': {
              sub1value1: 'sub1_1value1',
              sub1value2: 'sub1_1value2'
            },
            'sub1 2': {
              sub1value1: 'sub1_2value1',
              sub1value2: 'sub1_2value2'
            }
          },
          sub2: {
            'sub2 1': {
              sub2value1: 'sub2_1value1',
              sub2value2: 'sub2_1value2'
            },
            'sub2 2': {
              sub2value1: 'sub2_2value1',
              sub2value2: 'sub2_2value2'
            }
          }
        });
      });

      it('should throw if the callback throws', () => {
        (() => {
          dslConfig.configure(config => {
            config.sub1('sub1 1', () => {
              throw new Error('configure error');
            });
          });
        }).should.throw('configure error');
      });
    });

    describe('with a generator callback', () => {
      it('should add a mapping method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(function * (config) {
            let config1 = yield config.sub1('sub1 1', function * (sub1) {
              yield nextTick();
              sub1
              .sub1value1('sub1_1value1')
              .sub1value2('sub1_1value2');
            });
            config1 = yield config1.sub2('sub2 1', function * (sub2) {
              yield nextTick();
              sub2
              .sub2value1('sub2_1value1')
              .sub2value2('sub2_1value2');
            });
            config1 = yield config1.sub1('sub1 2', function * (sub1) {
              yield nextTick();
              sub1
              .sub1value1('sub1_2value1')
              .sub1value2('sub1_2value2');
            });
            yield config1.sub2('sub2 2', function * (sub2) {
              yield nextTick();
              sub2
              .sub2value1('sub2_2value1')
              .sub2value2('sub2_2value2');
            });
          });
          config.should.eql({
            sub1: {
              'sub1 1': {
                sub1value1: 'sub1_1value1',
                sub1value2: 'sub1_1value2'
              },
              'sub1 2': {
                sub1value1: 'sub1_2value1',
                sub1value2: 'sub1_2value2'
              }
            },
            sub2: {
              'sub2 1': {
                sub2value1: 'sub2_1value1',
                sub2value2: 'sub2_1value2'
              },
              'sub2 2': {
                sub2value1: 'sub2_2value1',
                sub2value2: 'sub2_2value2'
              }
            }
          });
        });
      });

      it('should throw if the callback throws', () => {
        return co(function * () {
          yield dslConfig.configure(function * (config) {
            yield config.sub1('sub1 1', function * () {
              yield nextTick();
              throw new Error('configure error');
            });
          });
        }).should.be.rejectedWith('configure error');
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should add a mapping method', () => {
        return dslConfig.configure(config => {
          return config.sub1('sub1 1', sub1 => {
            return nextTick()
            .then(() => {
              sub1
              .sub1value1('sub1_1value1')
              .sub1value2('sub1_1value2');
            });
          })
          .then(config => {
            return config.sub2('sub2 1', sub2 => {
              return nextTick()
              .then(() => {
                sub2
                .sub2value1('sub2_1value1')
                .sub2value2('sub2_1value2');
              });
            });
          })
          .then(config => {
            return config.sub1('sub1 2', sub1 => {
              return nextTick()
              .then(() => {
                sub1
                .sub1value1('sub1_2value1')
                .sub1value2('sub1_2value2');
              });
            });
          })
          .then(config => {
            return config.sub2('sub2 2', sub2 => {
              return nextTick()
              .then(() => {
                sub2
                .sub2value1('sub2_2value1')
                .sub2value2('sub2_2value2');
              });
            });
          });
        }).should.eventually.eql({
          sub1: {
            'sub1 1': {
              sub1value1: 'sub1_1value1',
              sub1value2: 'sub1_1value2'
            },
            'sub1 2': {
              sub1value1: 'sub1_2value1',
              sub1value2: 'sub1_2value2'
            }
          },
          sub2: {
            'sub2 1': {
              sub2value1: 'sub2_1value1',
              sub2value2: 'sub2_1value2'
            },
            'sub2 2': {
              sub2value1: 'sub2_2value1',
              sub2value2: 'sub2_2value2'
            }
          }
        });
      });

      it('should throw if the callback throws', () => {
        return dslConfig.configure(config => {
          return config.sub1('sub1 1', () => {
            return Promise.reject(new Error('configure error'));
          });
        }).should.be.rejectedWith('configure error');
      });
    });
  });

  describe('#submapping with a DSLConfig', () => {
    beforeEach(() => {
      dslConfig
      .submapping(
        'sub1',
        new DSLConfig()
        .value('sub1value1')
        .value('sub1value2')
      )
      .submapping(
        'sub2',
        new DSLConfig()
        .value('sub2value1')
        .value('sub2value2')
      );
    });

    describe('with a synchronous callback', () => {
      it('should add a submapping method', () => {
        dslConfig.configure(config => {
          config
          .sub1('sub1 1', sub1 => {
            sub1
            .sub1value1('sub1_1value1')
            .sub1value2('sub1_1value2');
            return true;
          })
          .sub2('sub2 1', sub2 => {
            sub2
            .sub2value1('sub2_1value1')
            .sub2value2('sub2_1value2');
            return true;
          })
          .sub1('sub1 2', sub1 => {
            sub1
            .sub1value1('sub1_2value1')
            .sub1value2('sub1_2value2');
            return true;
          })
          .sub2('sub2 2', sub2 => {
            sub2
            .sub2value1('sub2_2value1')
            .sub2value2('sub2_2value2');
            return true;
          });
          return true;
        }).should.eql({
          'sub1 1': {
            sub1value1: 'sub1_1value1',
            sub1value2: 'sub1_1value2'
          },
          'sub1 2': {
            sub1value1: 'sub1_2value1',
            sub1value2: 'sub1_2value2'
          },
          'sub2 1': {
            sub2value1: 'sub2_1value1',
            sub2value2: 'sub2_1value2'
          },
          'sub2 2': {
            sub2value1: 'sub2_2value1',
            sub2value2: 'sub2_2value2'
          }
        });
      });

      it('should throw if the callback throws', () => {
        (() => {
          dslConfig.configure(config => {
            config.sub1('sub1 1', () => {
              throw new Error('configure error');
            });
          });
        }).should.throw('configure error');
      });
    });

    describe('with a generator callback', () => {
      it('should add a submapping method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(function * (config) {
            let config1 = yield config.sub1('sub1 1', function * (sub1) {
              yield nextTick();
              sub1
              .sub1value1('sub1_1value1')
              .sub1value2('sub1_1value2');
            });
            config1 = yield config1.sub2('sub2 1', function * (sub2) {
              yield nextTick();
              sub2
              .sub2value1('sub2_1value1')
              .sub2value2('sub2_1value2');
            });
            config1 = yield config1.sub1('sub1 2', function * (sub1) {
              yield nextTick();
              sub1
              .sub1value1('sub1_2value1')
              .sub1value2('sub1_2value2');
            });
            yield config1.sub2('sub2 2', function * (sub2) {
              yield nextTick();
              sub2
              .sub2value1('sub2_2value1')
              .sub2value2('sub2_2value2');
            });
          });
          config.should.eql({
            'sub1 1': {
              sub1value1: 'sub1_1value1',
              sub1value2: 'sub1_1value2'
            },
            'sub1 2': {
              sub1value1: 'sub1_2value1',
              sub1value2: 'sub1_2value2'
            },
            'sub2 1': {
              sub2value1: 'sub2_1value1',
              sub2value2: 'sub2_1value2'
            },
            'sub2 2': {
              sub2value1: 'sub2_2value1',
              sub2value2: 'sub2_2value2'
            }
          });
        });
      });

      it('should throw if the callback throws', () => {
        return co(function * () {
          yield dslConfig.configure(function * (config) {
            yield config.sub1('sub1 1', function * () {
              yield nextTick();
              throw new Error('configure error');
            });
          });
        }).should.be.rejectedWith('configure error');
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should add a submapping method', () => {
        return dslConfig.configure(config => {
          return config.sub1('sub1 1', sub1 => {
            return nextTick()
            .then(() => {
              sub1
              .sub1value1('sub1_1value1')
              .sub1value2('sub1_1value2');
            });
          })
          .then(config => {
            return config.sub2('sub2 1', sub2 => {
              return nextTick()
              .then(() => {
                sub2
                .sub2value1('sub2_1value1')
                .sub2value2('sub2_1value2');
              });
            });
          })
          .then(config => {
            return config.sub1('sub1 2', sub1 => {
              return nextTick()
              .then(() => {
                sub1
                .sub1value1('sub1_2value1')
                .sub1value2('sub1_2value2');
              });
            });
          })
          .then(config => {
            return config.sub2('sub2 2', sub2 => {
              return nextTick()
              .then(() => {
                sub2
                .sub2value1('sub2_2value1')
                .sub2value2('sub2_2value2');
              });
            });
          });
        }).should.eventually.eql({
          'sub1 1': {
            sub1value1: 'sub1_1value1',
            sub1value2: 'sub1_1value2'
          },
          'sub1 2': {
            sub1value1: 'sub1_2value1',
            sub1value2: 'sub1_2value2'
          },
          'sub2 1': {
            sub2value1: 'sub2_1value1',
            sub2value2: 'sub2_1value2'
          },
          'sub2 2': {
            sub2value1: 'sub2_2value1',
            sub2value2: 'sub2_2value2'
          }
        });
      });

      it('should throw if the callback throws', () => {
        return dslConfig.configure(config => {
          return config.sub1('sub1 1', () => {
            return Promise.reject(new Error('configure error'));
          });
        }).should.be.rejectedWith('configure error');
      });
    });
  });
});
