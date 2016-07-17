const co = require('co');
const chai = require('chai');
const expect = chai.expect;
chai.should();

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
    beforeEach(() => {
      dslConfig.value('hello');
    });

    describe('with a synchronous callback', () => {
      it('should return a config object', () => {
        return co(function * () {
          const config = yield dslConfig.configure(dsl => {
            dsl.hello('boo');
          });
          config.hello.should.eql('boo');
        });
      });
    });

    describe('with a generator callback', () => {
      it('should return a config object', () => {
        return co(function * () {
          const config = yield dslConfig.configure(function * (dsl) {
            yield nextTick();
            dsl.hello('boo');
          });
          config.hello.should.eql('boo');
        });
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should return a config object', () => {
        return co(function * () {
          const config = yield dslConfig.configure(dsl => {
            return Promise.resolve()
            .then(nextTick)
            .then(() => {
              dsl.hello('boo');
            });
          });
          config.hello.should.eql('boo');
        });
      });
    });
  });

  describe('#value', () => {
    beforeEach(() => {
      dslConfig.value('hello');
    });

    it('should default the value to undefined', () => {
      return co(function * () {
        const config = yield dslConfig.configure(() => {
          // do nothing
        });
        expect(config.hello).to.be.undefined;
      });
    });

    it('should add a value method', () => {
      return co(function * () {
        const config = yield dslConfig.configure(dsl => {
          dsl.hello('boo');
        });
        config.hello.should.eql('boo');
      });
    });
  });

  describe('#valueList', () => {
    beforeEach(() => {
      dslConfig.valueList('hello');
    });

    it('should default the list to an empty array', () => {
      return co(function * () {
        const config = yield dslConfig.configure(() => {
          // do nothing
        });
        config.hello.should.eql([]);
      });
    });

    it('should add a valueList method', () => {
      return co(function * () {
        const config = yield dslConfig.configure(dsl => {
          dsl.hello('boo');
          dsl.hello('banana');
        });
        config.hello.should.eql(['boo', 'banana']);
      });
    });
  });

  describe('#object', () => {
    beforeEach(() => {
      const dslHello = dslConfig.object('hello');
      dslHello.value('boo');
    });

    it('should default the object to undefined', () => {
      return co(function * () {
        const config = yield dslConfig.configure(() => {
          // do nothing
        });
        expect(config.hello).to.be.undefined;
      });
    });

    describe('with a synchronous callback', () => {
      it('should add an object method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(dsl => {
            dsl.hello(hello => {
              hello.boo('banana');
            });
          });
          config.hello.should.eql({
            boo: 'banana'
          });
        });
      });
    });

    describe('with a generator callback', () => {
      it('should add an object method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(function * (dsl) {
            yield dsl.hello(function * (hello) {
              yield nextTick();
              hello.boo('banana');
            });
          });
          config.hello.should.eql({
            boo: 'banana'
          });
        });
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should add an object method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(dsl => {
            return Promise.resolve()
            .then(() => {
              return dsl.hello(hello => {
                return Promise.resolve()
                .then(nextTick)
                .then(() => {
                  hello.boo('banana');
                });
              });
            });
          });
          config.hello.should.eql({
            boo: 'banana'
          });
        });
      });
    });
  });

  describe('#objectList', () => {
    beforeEach(() => {
      const dslHello = dslConfig.objectList('hello');
      dslHello.value('boo');
    });

    it('should default the object list to an empty array', () => {
      return co(function * () {
        const config = yield dslConfig.configure(() => {
          // do nothing
        });
        config.hello.should.eql([]);
      });
    });

    describe('with a synchronous callback', () => {
      it('should add an objectList method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(dsl => {
            dsl.hello(hello => {
              hello.boo('banana');
            });
            dsl.hello(hello => {
              hello.boo('apple');
            });
          });
          config.hello.should.eql([{
            boo: 'banana'
          }, {
            boo: 'apple'
          }]);
        });
      });
    });

    describe('with a generator callback', () => {
      it('should add an objectList method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(function * (dsl) {
            yield dsl.hello(function * (hello) {
              yield nextTick();
              hello.boo('banana');
            });
            yield dsl.hello(function * (hello) {
              yield nextTick();
              hello.boo('apple');
            });
          });
          config.hello.should.eql([{
            boo: 'banana'
          }, {
            boo: 'apple'
          }]);
        });
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should add an objectList method', () => {
        return co(function * () {
          const config = yield dslConfig.configure(dsl => {
            return Promise.resolve()
            .then(() => {
              return dsl.hello(hello => {
                return Promise.resolve()
                .then(nextTick)
                .then(() => {
                  hello.boo('banana');
                });
              });
            })
            .then(() => {
              return dsl.hello(hello => {
                return Promise.resolve()
                .then(nextTick)
                .then(() => {
                  hello.boo('apple');
                });
              });
            });
          });
          config.hello.should.eql([{
            boo: 'banana'
          }, {
            boo: 'apple'
          }]);
        });
      });
    });
  });
});
