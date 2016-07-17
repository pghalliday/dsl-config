const chai = require('chai');
const expect = chai.expect;
chai.should();

const DSLConfig = require('../../src/DSLConfig');

describe('DSLConfig', () => {
  beforeEach(() => {
    this.dslConfig = new DSLConfig();
  });

  describe('#value', () => {
    beforeEach(() => {
      this.dslConfig.value('hello');
    });

    it('should default the value to undefined', () => {
      const config = this.dslConfig.configure(() => {
        // do nothing
      });
      expect(config.hello).to.be.undefined;
    });

    it('should add a value method', () => {
      const config = this.dslConfig.configure(dsl => {
        dsl.hello('boo');
      });
      config.hello.should.eql('boo');
    });
  });

  describe('#valueList', () => {
    beforeEach(() => {
      this.dslConfig.valueList('hello');
    });

    it('should default the list to an empty array', () => {
      const config = this.dslConfig.configure(() => {
        // do nothing
      });
      config.hello.should.eql([]);
    });

    it('should add a valueList method', () => {
      const config = this.dslConfig.configure(dsl => {
        dsl.hello('boo');
        dsl.hello('banana');
      });
      config.hello.should.eql(['boo', 'banana']);
    });
  });

  describe('#object', () => {
    beforeEach(() => {
      const dslHello = this.dslConfig.object('hello');
      dslHello.value('boo');
    });

    it('should default the object to undefined', () => {
      const config = this.dslConfig.configure(() => {
        // do nothing
      });
      expect(config.hello).to.be.undefined;
    });

    describe('with a synchronous callback', () => {
      it('should add an object method', () => {
        const config = this.dslConfig.configure(dsl => {
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

  describe('#objectList', () => {
    beforeEach(() => {
      const dslHello = this.dslConfig.objectList('hello');
      dslHello.value('boo');
    });

    it('should default the object list to an empty array', () => {
      const config = this.dslConfig.configure(() => {
        // do nothing
      });
      config.hello.should.eql([]);
    });

    describe('with a synchronous callback', () => {
      it('should add an objectList method', () => {
        const config = this.dslConfig.configure(dsl => {
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
});
