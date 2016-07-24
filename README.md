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
.value('value1')
.value('value2');

// give defaults to values
dslConfig
.value('value3', 'default3')
.value('value4', 'default4');

// and lists of values
dslConfig
.list('list1')
.list('list2');

// and mappings of key/value pairs
dslConfig
.mapping('mapping1')
.mapping('mapping2');

// mappings and lists can use distinct property
// and method names in case you worry about grammar
dslConfig
.list('items', 'item')
.mapping('settings', 'setting');

// you can define a DSL for a value, list or mapping
const subDSLConfig = new DSLConfig();
subDSLConfig
.value('value1')
.value('value2');
dslConfig.value('value5', subDSLConfig);

// you can default values with DSLs
const subDSLConfigWithDefaults = new DSLConfig();
subDSLConfigWithDefaults
.value('value1', 'default1')
.value('value2', 'default2');
dslConfig.value('value6', true, subDSLConfigWithDefaults);

// you can reuse DSLs
dslConfig.list('list3', subDSLConfig);

// you can clone and extend or override DSLs
const cloneDSLConfig = new DSLConfig(subDSLConfig);

// override value2 to convert it to a list
cloneDSLConfig.list('value2');

// extend with value3
cloneDSLConfig.value('value3');

dslConfig.value('value7', cloneDSLConfig);

// You can also specify anonymous key/value mappings intended
// to be used as sub mappings for other mappings
//
// NB. the supplied name will be used for the DSL method
// but the mapping keys will be used in the resulting
// config object. As such anonymous mappings should be
// used alone in DSLConfig instances (ie. as the only
// method under a value, list or mapping) to avoid overwriting
// other named values, lists or mappings. This is done so that
// mappings can contain mappings without having to have
// extra keys at every level
dslConfig
.value(
  'mappings',
  new DSLConfig()
  .submapping('mapping')
)
.mapping(
  'mapping2',
  new DSLConfig()
  .submapping('submapping')
  )
);

// In the same vein you can also add anonymous
// sub list methods so that a list can
// contain a sub list without having to create a
// named key for it.
//
// NB. this will convert the parent config to
// an array instead of an object so it won't
// be possible to use it as anything other than
// a list
dslConfig
.list(
  'list4',
  new DSLConfig()
  .sublist('sublist')
);
```

The above would generate a DSL to create a configuration object with the following possible structure

```javascript
{
  value1: 'value',
  value2: 'value',
  value3: 'default3',
  value4: 'default4',
  list1: [
    'value',
    'value'
  ],
  list2: [
    'value',
    'value'
  ],
  mapping1: {
    'key1': 'value',
    'key2': 'value'
  },
  mapping2: {
    'key1': 'value',
    'key2': 'value'
  },
  items: [
    'value'
    'value'
  ],
  settings: [
    'key1': 'value',
    'key2': 'value'
  ],
  value5: {
    value1: 'value',
    value2: 'value'
  },
  value6: {
    value1: 'default1',
    value2: 'default2'
  },
  list3: [{
    value1: 'value',
    value2: 'value'
  }, {
    value1: 'value',
    value2: 'value'
  }],
  value7: {
    value1: 'value',
    value2: [
      'value',
      'value'
    ],
    value3: 'value'
  },
  mappings: {
    'key1': 'value',
    'key2': 'value'
  },
  mapping3: {
    'key1': {
      'subkey1': 'value',
      'subkey2': 'value'
    },
    'key2': {
      'subkey1': 'value',
      'subkey2': 'value'
    }
  },
  list4: [
    ['value', 'value'],
    ['value', 'value']
  ]
}
```

Then to synchronously create the configuration above

```javascript
const config = dslConfig.configure(dsl => {
  dsl
  .value1('value')
  .value2('value')
  .list1('value')
  .list1('value')
  .list2('value')
  .list2('value')
  .mapping1('key1', 'value')
  .mapping1('key2', 'value')
  .mapping2('key1', 'value')
  .mapping2('key2', 'value')
  .item('value')
  .item('value')
  .setting('key1', 'value')
  .setting('key2', 'value')
  .value5(value3 => {
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
  .value7(value4 => {
    value4
    .value1('value')
    .value2('value')
    .value2('value')
    .value3('value');
  })
  .mappings(mappings => {
    mappings
    .mapping('key1', 'value')
    .mapping('key2', 'value');
  })
  .mapping3('key1', mapping3 => {
    mapping3
    .submapping('subkey1', 'value')
    .submapping('subkey2', 'value');
  })
  .mapping3('key2', mapping3 => {
    mapping3
    .submapping('subkey1', 'value')
    .submapping('subkey2', 'value');
  })
  .list4(list4 => {
    list4
    .sublist('value')
    .sublist('value');
  })
  .list4(list4 => {
    list4
    .sublist('value')
    .sublist('value');
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

As you may not know whether the supplied configuration callback is going to be asynchronous or not it is advisable to call `#configure` in the following way

```javascript
Promise.resolve(dslConfig.configure(callback))
.then(config => {
  // do something with config
});
```

Even if synchronous, the preceding method will return a promise (it may already be resolved though)
