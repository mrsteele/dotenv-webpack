/* global jest, describe, test, expect, beforeEach */

// Tests suite
const path = require('path')

// The star of the show
const Src = require('../src')
const Dist = require('../dist')

const envEmpty = path.resolve(__dirname, './envs/.empty')
const envEmptyExample = path.resolve(__dirname, './envs/.empty.example')
const envSimple = path.resolve(__dirname, './envs/.simple')
const envSimpleExample = path.resolve(__dirname, './envs/.simple.example')
const envOneEmpty = path.resolve(__dirname, './envs/.oneempty')
const envOneEmptyExample = path.resolve(__dirname, './envs/.oneempty.example')
const envMissingOne = path.resolve(__dirname, './envs/.missingone')
const envMissingOneExample = path.resolve(__dirname, './envs/.missingone.example')
const envSystemvars = path.resolve(__dirname, './envs/.systemvars')
const envSystemvarsExample = path.resolve(__dirname, './envs/.systemvars.example')
const envExpanded = path.resolve(__dirname, './envs/.expanded')
const envDefaults = path.resolve(__dirname, './envs/.defaults')

const buildExpectation = (obj) => Object.keys(obj).reduce((all, key) => {
  all[`process.env.${key}`] = JSON.stringify(obj[key])
  return all
}, {})

const envDefJson = buildExpectation({ TEST: 'hi' })
const envEmptyJson = buildExpectation({})
const envSimpleJson = buildExpectation({ TEST: 'testing' })
const envOneEmptyJson = buildExpectation({ TEST: '', TEST2: 'Hello' })
const envMissingOneJson = buildExpectation({ TEST2: 'Hello' })
const envDefaultsJson = buildExpectation({ TEST: 'hi', TEST2: 'hidefault' })
const envDefaultsJson2 = buildExpectation({ TEST: 'hi', TEST2: 'youcanseethis' })

/*
NODE_ENV=test
BASIC=basic
BASIC_EXPAND=$BASIC
MACHINE=machine_env
MACHINE_EXPAND=$MACHINE
UNDEFINED_EXPAND=$UNDEFINED_ENV_KEY
ESCAPED_EXPAND=\$ESCAPED
MONGOLAB_DATABASE=heroku_db
MONGOLAB_USER=username
MONGOLAB_PASSWORD=password
MONGOLAB_DOMAIN=abcd1234.mongolab.com
MONGOLAB_PORT=12345
MONGOLAB_URI=mongodb://${MONGOLAB_USER}:${MONGOLAB_PASSWORD}@${MONGOLAB_DOMAIN}:${MONGOLAB_PORT}/${MONGOLAB_DATABASE}

MONGOLAB_USER_RECURSIVELY=${MONGOLAB_USER}:${MONGOLAB_PASSWORD}
MONGOLAB_URI_RECURSIVELY=mongodb://${MONGOLAB_USER_RECURSIVELY}@${MONGOLAB_DOMAIN}:${MONGOLAB_PORT}/${MONGOLAB_DATABASE}

WITHOUT_CURLY_BRACES_URI=mongodb://$MONGOLAB_USER:$MONGOLAB_PASSWORD@$MONGOLAB_DOMAIN:$MONGOLAB_PORT/$MONGOLAB_DATABASE
WITHOUT_CURLY_BRACES_USER_RECURSIVELY=$MONGOLAB_USER:$MONGOLAB_PASSWORD
WITHOUT_CURLY_BRACES_URI_RECURSIVELY=mongodb://$MONGOLAB_USER_RECURSIVELY@$MONGOLAB_DOMAIN:$MONGOLAB_PORT/$MONGOLAB_DATABASE
*/
const envExpandedNotJson = buildExpectation({
  NODE_ENV: 'test',
  BASIC: 'basic',
  BASIC_EXPAND: '$BASIC',
  MACHINE: 'machine_env',
  MACHINE_EXPAND: '$MACHINE',
  UNDEFINED_EXPAND: '$UNDEFINED_ENV_KEY',
  // eslint-disable-next-line
  ESCAPED_EXPAND: '\\$ESCAPED',
  MONGOLAB_DATABASE: 'heroku_db',
  MONGOLAB_USER: 'username',
  MONGOLAB_PASSWORD: 'password',
  MONGOLAB_DOMAIN: 'abcd1234.mongolab.com',
  MONGOLAB_PORT: '12345',
  // eslint-disable-next-line
  MONGOLAB_URI: 'mongodb://${MONGOLAB_USER}:${MONGOLAB_PASSWORD}@${MONGOLAB_DOMAIN}:${MONGOLAB_PORT}/${MONGOLAB_DATABASE}',
  // eslint-disable-next-line
  MONGOLAB_USER_RECURSIVELY: '${MONGOLAB_USER}:${MONGOLAB_PASSWORD}',
  // eslint-disable-next-line
  MONGOLAB_URI_RECURSIVELY: 'mongodb://${MONGOLAB_USER_RECURSIVELY}@${MONGOLAB_DOMAIN}:${MONGOLAB_PORT}/${MONGOLAB_DATABASE}',
  WITHOUT_CURLY_BRACES_URI: 'mongodb://$MONGOLAB_USER:$MONGOLAB_PASSWORD@$MONGOLAB_DOMAIN:$MONGOLAB_PORT/$MONGOLAB_DATABASE',
  WITHOUT_CURLY_BRACES_USER_RECURSIVELY: '$MONGOLAB_USER:$MONGOLAB_PASSWORD',
  WITHOUT_CURLY_BRACES_URI_RECURSIVELY: 'mongodb://$MONGOLAB_USER_RECURSIVELY@$MONGOLAB_DOMAIN:$MONGOLAB_PORT/$MONGOLAB_DATABASE'
})
const envExpandedJson = buildExpectation({
  NODE_ENV: 'test',
  BASIC: 'basic',
  BASIC_EXPAND: 'basic',
  MACHINE: 'machine_env',
  MACHINE_EXPAND: 'machine_env',
  UNDEFINED_EXPAND: '',
  // eslint-disable-next-line
  ESCAPED_EXPAND: '\$ESCAPED',
  MONGOLAB_DATABASE: 'heroku_db',
  MONGOLAB_USER: 'username',
  MONGOLAB_PASSWORD: 'password',
  MONGOLAB_DOMAIN: 'abcd1234.mongolab.com',
  MONGOLAB_PORT: '12345',
  MONGOLAB_URI: 'mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db',
  MONGOLAB_USER_RECURSIVELY: 'username:password',
  MONGOLAB_URI_RECURSIVELY: 'mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db',
  WITHOUT_CURLY_BRACES_URI: 'mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db',
  WITHOUT_CURLY_BRACES_USER_RECURSIVELY: 'username:password',
  WITHOUT_CURLY_BRACES_URI_RECURSIVELY: 'mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db'
})

// const consoleSpy = jest.spyOn(console, 'warn')
global.console.warn = jest.fn()

function runTests (Obj, name) {
  function envTest (config) {
    return new Obj(config).definitions
  }

  /** @test {Dotenv} **/
  describe(name, () => {
    beforeEach(() => {
      global.console.warn.mockClear()
    })

    describe('Defaults', () => {
      test('Should be an function.', () => {
        expect(typeof Obj).toEqual('function')
      })

      // @todo - This one isn't a great test, but it wasn't really working for me.
      test('Should return a instance of DefinePlugin.', () => {
        expect(typeof envTest()).toEqual('object')
      })

      test('Should include environment variables that exist in .env file.', () => {
        expect(envTest()).toEqual(envDefJson)
      })

      test('Should not expand variables by default', () => {
        expect(envTest({ path: envExpanded })).toEqual(envExpandedNotJson)
      })

      test('Should expand variables when configured', () => {
        expect(envTest({ path: envExpanded, expand: true })).toEqual(envExpandedJson)
      })
    })

    describe('Simple configuration', () => {
      test('Should load enviornment variables when they exist in the .env file.', () => {
        expect(envTest({ path: envSimple })).toEqual(envSimpleJson)
      })

      test('Should be an empty object when no environment variables exist in .env file.', () => {
        expect(envTest({ path: false })).toEqual(envEmptyJson)
      })

      test('Should recognize safe-mode', () => {
        expect(envTest({ safe: true })).toEqual(envDefJson)
      })

      test('Should fail when not passing safe-mode', () => {
        try {
          envTest({ path: envEmpty, safe: true })
          throw new Error('Should not get here')
        } catch (err) {
          expect(err.message).toEqual('Missing environment variable: TEST')
        }
      })
    })

    describe('Safe configuration', () => {
      test('Should load successfully if variables defined', () => {
        expect(envTest({ path: envEmpty, safe: envEmptyExample })).toEqual(envEmptyJson)
        expect(envTest({ path: envSimple, safe: envSimpleExample })).toEqual(envSimpleJson)
      })

      test('Should fail if env does not match sample.', () => {
        try {
          envTest({ path: envEmpty, safe: envSimpleExample })
          throw new Error('Should not get here')
        } catch (err) {
          expect(err.message).toEqual('Missing environment variable: TEST')
        }
      })
    })

    describe('Defaults configuration', () => {
      test('should support default configurations', () => {
        expect(envTest({ defaults: true })).toEqual(envDefaultsJson)
      })

      test('should support string configurations', () => {
        expect(envTest({ defaults: envDefaults })).toEqual(envDefaultsJson2)
      })

      test('Should display warning when default cannot be loaded', () => {
        const envDefaultName = '.does.not.exist'
        expect(envTest({ defaults: envDefaultName })).toEqual(envDefJson)
        expect(global.console.warn).toHaveBeenCalledWith(`Failed to load ${envDefaultName}.`)
      })
    })

    describe('System variables', () => {
      test('Should allow system env variables', () => {
        const test = envTest({ path: envSimple, systemvars: true })
        const key = Object.keys(envSimpleJson)[0]
        const value = envSimpleJson[key]
        expect(test[key]).toEqual(value)
        expect(Object.keys(test).length > Object.keys(envSimpleJson).length).toEqual(true)
      })

      test('should pass if the systemvar satisfies the requirement', () => {
        const PATH = envTest({ safe: envSystemvarsExample, systemvars: true })['process.env.PATH']
        expect(typeof PATH).toEqual('string')
        expect(PATH.indexOf('/') !== -1).toEqual(true)
      })

      test('should not allow local variables to override systemvars', () => {
        expect(envTest({ path: envSystemvars, systemvars: true })['process.env.PATH2'] !== '""').toEqual(true)
      })
    })

    describe('Empty variables', () => {
      test('Should load fine (not-safe)', () => {
        expect(envTest({ path: envOneEmpty })).toEqual(envOneEmptyJson)
      })

      test('Should fail on safe mode', () => {
        try {
          envTest({ path: envOneEmpty, safe: envOneEmptyExample })
          throw new Error('Should not get here')
        } catch (err) {
          expect(err.message).toEqual('Missing environment variable: TEST')
        }
      })

      test('Should succeed in safe mode if allowEmptyValues is true', () => {
        expect(envTest({ path: envOneEmpty, safe: envOneEmptyExample, allowEmptyValues: true })).toEqual(envOneEmptyJson)
      })
    })

    describe('Missing a variable', () => {
      test('Should load fine (not-safe)', () => {
        expect(envTest({ path: envMissingOne })).toEqual(envMissingOneJson)
      })

      test('Should fail on safe mode (if allowEmptyValues is false)', () => {
        try {
          envTest({ path: envMissingOne, safe: envMissingOneExample })
          throw new Error('Should not get here')
        } catch (err) {
          expect(err.message).toEqual('Missing environment variable: TEST')
        }
      })
    })

    describe('Deprecated configuration', () => {
      test('Should use safe when safe and sample set', () => {
        expect(envTest({ path: envSimple, safe: true, sample: envSimpleExample })).toEqual(envSimpleJson)
      })

      test('Should display deprecation warning by default', () => {
        expect(envTest({ path: envSimple, safe: true, sample: envSimpleExample })).toEqual(envSimpleJson)
        expect(global.console.warn).toHaveBeenCalled()
      })

      test('Should not display deprecation warning when silent mode enabled', () => {
        expect(envTest({ path: envSimple, safe: true, sample: envSimpleExample, silent: true })).toEqual(envSimpleJson)
        expect(global.console.warn).toHaveBeenCalledTimes(0)
      })

      test('Should fail naturally when using deprecated values', () => {
        try {
          envTest({ path: envMissingOne, safe: true, sample: envMissingOneExample })
          throw new Error('Should not get here')
        } catch (err) {
          expect(err.message).toEqual('Missing environment variable: TEST')
        }
      })

      test('Should not fail naturally when using deprecated values improperly', () => {
        expect(envTest({ path: envMissingOne, sample: envMissingOneExample })).toEqual(envMissingOneJson)
      })
    })

    describe('Silent mode', () => {
      test('Should display warning by default', () => {
        envTest({ path: false })
        expect(global.console.warn).toHaveBeenCalled()
      })

      test('Should not display warning when silent mode enabled', () => {
        envTest({ path: false, silent: true })
        expect(global.console.warn).toHaveBeenCalledTimes(0)
      })
    })
  })
}

describe('Tests', () => {
  runTests(Src.default, 'Source')
  runTests(Dist.default, 'Dist')
})
