const co = require('co');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
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
      dslConfig.value('hello');
    });

    it('should default the value to undefined', () => {
      const config = dslConfig.configure(() => {
        // do nothing
      });
      expect(config.hello).to.be.undefined;
    });

    it('should add a value method', () => {
      const config = dslConfig.configure(dsl => {
        dsl.hello('boo');
      });
      config.hello.should.eql('boo');
    });
  });

  describe('#valueList', () => {
    beforeEach(() => {
      dslConfig.valueList('hello');
    });

    it('should default the list to an empty array', () => {
      const config = dslConfig.configure(() => {
        // do nothing
      });
      config.hello.should.eql([]);
    });

    it('should add a valueList method', () => {
      const config = dslConfig.configure(dsl => {
        dsl.hello('boo');
        dsl.hello('banana');
      });
      config.hello.should.eql(['boo', 'banana']);
    });
  });

  describe('#object', () => {
    beforeEach(() => {
      const dslHello = dslConfig.object('hello');
      dslHello.value('boo');
    });

    it('should default the object to undefined', () => {
      const config = dslConfig.configure(() => {
        // do nothing
      });
      expect(config.hello).to.be.undefined;
    });

    describe('with a synchronous callback', () => {
      it('should add an object method', () => {
        const config = dslConfig.configure(dsl => {
          dsl.hello(hello => {
            hello.boo('banana');
          });
        });
        config.hello.should.eql({
          boo: 'banana'
        });
      });

      it('should throw if the callback throws', () => {
        (() => {
          dslConfig.configure(dsl => {
            dsl.hello(() => {
              throw new Error('configure error');
            });
          });
        }).should.throw('configure error');
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

      it('should throw if the callback throws', () => {
        return co(function * () {
          yield dslConfig.configure(function * (dsl) {
            yield dsl.hello(function * () {
              yield nextTick();
              throw new Error('configure error');
            });
          });
        }).should.be.rejectedWith('configure error');
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should add an object method', () => {
        return dslConfig.configure(dsl => {
          return dsl.hello(hello => {
            return nextTick()
            .then(() => {
              hello.boo('banana');
            });
          });
        }).should.eventually.eql({
          hello: {
            boo: 'banana'
          }
        });
      });

      it('should throw if the callback throws', () => {
        return dslConfig.configure(dsl => {
          return dsl.hello(() => {
            return Promise.reject(new Error('configure error'));
          });
        }).should.be.rejectedWith('configure error');
      });
    });
  });

  describe('#objectList', () => {
    beforeEach(() => {
      const dslHello = dslConfig.objectList('hello');
      dslHello.value('boo');
    });

    it('should default the object list to an empty array', () => {
      const config = dslConfig.configure(() => {
        // do nothing
      });
      config.hello.should.eql([]);
    });

    describe('with a synchronous callback', () => {
      it('should add an objectList method', () => {
        const config = dslConfig.configure(dsl => {
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

      it('should throw if the callback throws', () => {
        (() => {
          dslConfig.configure(dsl => {
            dsl.hello(() => {
              throw new Error('configure error');
            });
          });
        }).should.throw('configure error');
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

      it('should throw if the callback throws', () => {
        return co(function * () {
          yield dslConfig.configure(function * (dsl) {
            yield dsl.hello(function * () {
              yield nextTick();
              throw new Error('configure error');
            });
          });
        }).should.be.rejectedWith('configure error');
      });
    });

    describe('with a callback that returns a promise', () => {
      it('should add an objectList method', () => {
        return dslConfig.configure(dsl => {
          return dsl.hello(hello => {
            return nextTick()
            .then(() => {
              hello.boo('banana');
            });
          })
          .then(() => {
            return dsl.hello(hello => {
              return nextTick()
              .then(() => {
                hello.boo('apple');
              });
            });
          });
        }).should.eventually.eql({
          hello: [{
            boo: 'banana'
          }, {
            boo: 'apple'
          }]
        });
      });

      it('should throw if the callback throws', () => {
        return dslConfig.configure(dsl => {
          return dsl.hello(() => {
            return Promise.reject(new Error('configure error'));
          });
        }).should.be.rejectedWith('configure error');
      });
    });
  });
});
