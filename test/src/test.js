const chai = require('chai');
chai.should();

const test = require('../../src/test');

describe('test', () => {
  it('should pass', () => {
    test().should.eql('hello');
  });
});
