const chai = require('chai');
chai.should();

const DSLConfig = require('../../src/DSLConfig');

describe('DSLConfig', () => {
  beforeEach(() => {
    this.dslConfig = new DSLConfig();
  });

  describe('#property', () => {
    it('should add a property method', () => {
      this.dslConfig.property('hello');
      this.dslConfig.dsl.hello('boo');
      this.dslConfig.config.hello.should.eql('boo');
    });
  });
});
