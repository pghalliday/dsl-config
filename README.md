# dsl-config

[![Build Status](https://travis-ci.org/pghalliday/dsl-config.svg?branch=master)](https://travis-ci.org/pghalliday/dsl-config)
[![Coverage Status](https://coveralls.io/repos/github/pghalliday/dsl-config/badge.svg?branch=master)](https://coveralls.io/github/pghalliday/dsl-config?branch=master)


Generate an asynchronous DSL to generate a configuration object

# Install

```
npm install dsl-config
```

# Usage

Define the DSL (note that methods are chainable but have been spaced out here to accomodate comments)

```javascript
const DSLConfig = require('dsl-config');

// create an instance
const dslConfig = new DSLConfig();

// define some values
dslConfig
.value('value1');
.value('value2');

// and lists of values
dslConfig
.list('list1');
.list('list2');

// you can define a DSL for a value or list
const subDSLConfig = new DSLConfig();
subDSLConfig
.value('value1');
.value('value2');
dslConfig.value('value3', subDSLConfig);

// you can reuse DSLs
dslConfig.list('list3', subDSLConfig);

// you can clone and extend or override DSLs
const cloneDSLConfig = new DSLConfig(subDSLConfig);

// override value2 to convert it to a list
cloneDSLConfig.list('value2');

// extend with value3
cloneDSLConfig.value('value3');

dslConfig.value('value4', cloneDSLConfig);
```

The above would generate a DSL to create a configuration object with the following possible structure

```javascript
{
  value1: 'value',
  value2: 'value',
  list1: [
    'value',
    'value'
  ],
  list2: [
    'value',
    'value'
  ],
  value3: {
    value1: 'value',
    value2: 'value'
  },
  list3: [{
    value1: 'value',
    value2: 'value'
  }, {
    value1: 'value',
    value2: 'value'
  }],
  value4: {
    value1: 'value',
    value2: [
      'value',
      'value'
    ],
    value3: 'value'
  }
}
```

Then to synchronously create a configuration

```javascript
const config = dslConfig.configure(dsl => {
  dsl
  .value1('value')
  .value2('value')
  .list1('value')
  .list1('value')
  .list2('value')
  .list2('value')
  .value3(value3 => {
    value3
    .value1('value')
    .value2('value');
  })
  .list3(list3 => {
    list3
    .value1('value')
    .value2('value');
  })
  .list3(list3 => {
    list3
    .value1('value')
    .value2('value');
  })
  .value4(value4 => {
    value4
    .value1('value')
    .value2('value')
    .value2('value')
    .value3('value');
  });
});
```

You can also use generators to asynchronously create a configuration (when asynchronous, `#configure` will actually return a `Promise`)

```javascript
dslConfig.configure(function * (dsl) {
  dsl = yield config.value3(function * (value3) {
    // etc...
  });
  // etc...
}).then(config => {
  // do something with config
});
```

Or the DSL callbacks can return promises

```javascript
dslConfig.configure(dsl => {
  return dsl.value3(value3 => {
    return Promise.resolve()
    .then(() => {
      // etc...
    });
  })
  .then(dsl => {
    // etc...
  });
}).then(config => {
  // do something with config
});
```

NB. Any fields not set using `#configure` will be left `undefined`
