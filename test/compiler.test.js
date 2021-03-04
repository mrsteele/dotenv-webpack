/* global jest, describe, test, expect, beforeEach */

const { resolve } = require('path')
const webpack = require('webpack')
const { readFileSync, rmdirSync } = require('fs')

const Src = require('../src')
const Dist = require('../dist')

const envEmpty = resolve(__dirname, './envs/.empty')
const envEmptyExample = resolve(__dirname, './envs/.empty.example')
const envSimple = resolve(__dirname, './envs/.simple')
const envSimpleExample = resolve(__dirname, './envs/.simple.example')
const envOneEmpty = resolve(__dirname, './envs/.oneempty')
const envOneEmptyExample = resolve(__dirname, './envs/.oneempty.example')
const envMissingOne = resolve(__dirname, './envs/.missingone')
const envMissingOneExample = resolve(__dirname, './envs/.missingone.example')
const envSystemvars = resolve(__dirname, './envs/.systemvars')
const envSystemvarsExample = resolve(__dirname, './envs/.systemvars.example')
const envExpanded = resolve(__dirname, './envs/.expanded')
const envDefaults = resolve(__dirname, './envs/.defaults')

const getConfig = (target, plugin) => ({
  mode: 'development',
  devtool: false,
  target,
  entry: resolve(__dirname, './fixtures/index'),
  output: {
    path: resolve(__dirname, `./output/${target}`)
  },
  plugins: [plugin]
})

const compile = (config, callback) => {
  webpack(config, (err, stats) => {
    expect(err).toBeNull()
    expect(stats.compilation.errors).toHaveLength(0)

    const result = readFileSync(
      resolve(__dirname, `./output/${config.target}/main.js`),
      { encoding: 'utf-8' }
    )

    callback(result)
  })
}

const expectResultsToContainReplacements = (result, env) => {
  Object.entries(env).forEach(([key, value]) => {
    expect(result).toMatch(`const ${key} = "${value}"`)
  })
}

const versions = [
  ['Source', Src.default],
  ['Dist', Dist.default]
]

beforeEach(() => {
  rmdirSync(resolve(__dirname, 'output'), { recursive: true })
})

describe.each(versions)('%s', (_, DotenvPlugin) => {
  test('Should be an function.', () => {
    expect(typeof DotenvPlugin).toEqual('function')
  })

  test('Should return a instance of Dotenv.', () => {
    expect((new DotenvPlugin()).constructor.name).toEqual('Dotenv')
  })

  describe('Defaults', () => {
    test('Should include environment variables that exist in .env file.', (done) => {
      const config = getConfig('web', new DotenvPlugin())

      compile(config, (result) => {
        expectResultsToContainReplacements(result, { TEST: 'hi' })

        done()
      })
    })

    test('Should not expand variables by default', (done) => {
      const config = getConfig('web', new DotenvPlugin({ path: envExpanded }))

      compile(config, (result) => {
        expectResultsToContainReplacements(result, {
          NODE_ENV: 'test',
          BASIC: 'basic',
          BASIC_EXPAND: '$BASIC',
          MACHINE: 'machine_env',
          MACHINE_EXPAND: '$MACHINE',
          UNDEFINED_EXPAND: '$UNDEFINED_ENV_KEY',
          // eslint-disable-next-line
          ESCAPED_EXPAND: '\\\\$ESCAPED',
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

        done()
      })
    })

    test('Should expand variables when configured', (done) => {
      const config = getConfig(
        'web',
        new DotenvPlugin({ path: envExpanded, expand: true })
      )

      compile(config, (result) => {
        expectResultsToContainReplacements(result, {
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

        done()
      })
    })
  })

  describe('process.env stubbing', () => {
    const expectToBeStubbed = (result) => {
      expect(result).toMatch('const TEST = "testing"')
      expect(result).toMatch('const TEST2 = "MISSING_ENV_VAR".TEST2')
      expect(result).toMatch('const NODE_ENV = "development"')
      expect(result).toMatch('const MONGOLAB_USER = "MISSING_ENV_VAR".MONGOLAB_USER')
    }

    const expectNotToBeStubbed = (result) => {
      expect(result).toMatch('const TEST = "testing"')
      expect(result).toMatch('const TEST2 = process.env.TEST2')
      expect(result).toMatch('const NODE_ENV = "development"')
      expect(result).toMatch('const MONGOLAB_USER = process.env.MONGOLAB_USER')
    }

    const plugin = new DotenvPlugin({ path: envSimple })
    const cases = [
      ['web', getConfig('web', plugin), true],
      ['es5', getConfig('es5', plugin), true],
      ['es2020', getConfig('es2020', plugin), true],
      ['electron-renderer', getConfig('electron-renderer', plugin), true],
      ['electron9-renderer', getConfig('electron9-renderer', plugin), true],
      ['electron-preload', getConfig('electron-preload', plugin), true],
      ['node', getConfig('node', plugin), false],
      ['node14', getConfig('node14', plugin), false],
      ['electron-main', getConfig('electron-main', plugin), false],
      ['electron9-main', getConfig('electron9-main', plugin), false]
    ]

    test.each(cases)('%s', (target, config, shouldStub, done) => {
      webpack(config, (err, stats) => {
        expect(err).toBeNull()
        expect(stats.compilation.errors).toHaveLength(0)

        const result = readFileSync(
          resolve(__dirname, `./output/${target}/main.js`),
          { encoding: 'utf-8' }
        )

        if (shouldStub) {
          expectToBeStubbed(result)
        } else {
          expectNotToBeStubbed(result)
        }

        done()
      })
    })
  })
})
