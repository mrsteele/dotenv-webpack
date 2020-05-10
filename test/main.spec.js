/* global describe, it, beforeEach */

// Tests suite
import path from 'path'
import chai from 'chai'
import sinon from 'sinon'

// The star of the show
import Src from '../src'

chai.should()
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

const consoleSpy = sinon.spy(console, 'warn')

function runTests (Obj, name) {
  function envTest (config) {
    return new Obj(config).definitions
  }

  /** @test {Dotenv} **/
  describe(name, () => {
    beforeEach(() => {
      consoleSpy.resetHistory()
    })

    describe('Defaults', () => {
      it('Should be a function.', () => {
        Obj.should.be.a('function')
      })

      // @todo - This one isn't a great test, but it wasn't really working for me.
      it('Should return a instance of DefinePlugin.', () => {
        envTest().should.be.an('object')
      })

      it('Should include environment variables that exist in .env file.', () => {
        envTest().should.deep.equal(envDefJson)
      })

      it('Should not expand variables by default', () => {
        envTest({ path: envExpanded }).should.deep.equal(envExpandedNotJson)
      })

      it('Should expand variables when configured', () => {
        envTest({ path: envExpanded, expand: true }).should.deep.equal(envExpandedJson)
      })
    })

    describe('Simple configuration', () => {
      it('Should load enviornment variables when they exist in the .env file.', () => {
        envTest({ path: envSimple }).should.deep.equal(envSimpleJson)
      })

      it('Should be an empty object when no environment variables exist in .env file.', () => {
        envTest({ path: false }).should.deep.equal(envEmptyJson)
      })

      it('Should recognize safe-mode', () => {
        envTest({ safe: true }).should.deep.equal(envDefJson)
      })

      it('Should fail when not passing safe-mode', () => {
        function errorTest () {
          envTest({ path: envEmpty, safe: true })
        }

        errorTest.should.throw('Missing environment variable')
      })
    })

    describe('Safe configuration', () => {
      it('Should load successfully if variables defined', () => {
        envTest({ path: envEmpty, safe: envEmptyExample }).should.deep.equal(envEmptyJson)
        envTest({ path: envSimple, safe: envSimpleExample }).should.deep.equal(envSimpleJson)
      })

      it('Should fail if env does not match sample.', () => {
        function errorTest () {
          envTest({ path: envEmpty, safe: envSimpleExample })
        }

        errorTest.should.throw('Missing environment variable')
      })
    })

    describe('Defaults configuration', () => {
      it('should support default configurations', () => {
        envTest({ defaults: true }).should.deep.equal(envDefaultsJson)
      })

      it('should support string configurations', () => {
        envTest({ defaults: envDefaults }).should.deep.equal(envDefaultsJson2)
      })

      it('Should display warning when default cannot be loaded', () => {
        envTest({ defaults: '.does.not.exist' }).should.deep.equal(envDefJson)
        consoleSpy.calledOnce.should.equal(true)
      })
    })

    describe('System variables', () => {
      it('Should allow system env variables', () => {
        const test = envTest({ path: envSimple, systemvars: true })
        const key = Object.keys(envSimpleJson)[0]
        const value = envSimpleJson[key]
        test[key].should.equal(value)
        Object.keys(test).length.should.be.above(Object.keys(envSimpleJson).length)
      })

      it('should pass if the systemvar satisfies the requirement', () => {
        const PATH = envTest({ safe: envSystemvarsExample, systemvars: true })['process.env.PATH']
        PATH.should.be.a('string')
        PATH.should.contain('/')
      })

      it('should not allow local variables to override systemvars', () => {
        envTest({ path: envSystemvars, systemvars: true })['process.env.PATH'].should.not.equal('""')
      })
    })

    describe('Empty variables', () => {
      it('Should load fine (not-safe)', () => {
        envTest({ path: envOneEmpty }).should.deep.equal(envOneEmptyJson)
      })

      it('Should fail on safe mode', () => {
        function errorTest () {
          envTest({ path: envOneEmpty, safe: envOneEmptyExample })
        }

        errorTest.should.throw('Missing environment variable')
      })

      it('Should succeed in safe mode if allowEmptyValues is true', () => {
        envTest({ path: envOneEmpty, safe: envOneEmptyExample, allowEmptyValues: true }).should.deep.equal(envOneEmptyJson)
      })
    })

    describe('Missing a variable', () => {
      it('Should load fine (not-safe)', () => {
        envTest({ path: envMissingOne }).should.deep.equal(envMissingOneJson)
      })

      it('Should fail on safe mode (if allowEmptyValues is false)', () => {
        function errorTest () {
          envTest({ path: envMissingOne, safe: envMissingOneExample })
        }

        errorTest.should.throw('Missing environment variable')
      })
    })

    describe('Deprecated configuration', () => {
      it('Should use safe when safe and sample set', () => {
        envTest({ path: envSimple, safe: true, sample: envSimpleExample }).should.deep.equal(envSimpleJson)
      })

      it('Should display deprecation warning by default', () => {
        envTest({ path: envSimple, safe: true, sample: envSimpleExample }).should.deep.equal(envSimpleJson)
        consoleSpy.calledOnce.should.equal(true)
      })

      it('Should not display deprecation warning when silent mode enabled', () => {
        envTest({ path: envSimple, safe: true, sample: envSimpleExample, silent: true }).should.deep.equal(envSimpleJson)
        consoleSpy.called.should.equal(false)
      })

      it('Should fail naturally when using deprecated values', () => {
        function errorTest () {
          envTest({ path: envMissingOne, safe: true, sample: envMissingOneExample })
        }

        errorTest.should.throw('Missing environment variable')
      })

      it('Should not fail naturally when using deprecated values improperly', () => {
        envTest({ path: envMissingOne, sample: envMissingOneExample }).should.deep.equal(envMissingOneJson)
      })
    })

    describe('Silent mode', () => {
      it('Should display warning by default', () => {
        envTest({ path: false })
        consoleSpy.calledOnce.should.equal(true)
      })

      it('Should not display warning when silent mode enabled', () => {
        envTest({ path: false, silent: true })
        consoleSpy.called.should.equal(false)
      })
    })
  })
}

describe('Tests', () => {
  runTests(Src, 'Source')
})
