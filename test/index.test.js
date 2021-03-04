/* global jest, describe, test, expect, afterEach, beforeAll, beforeEach */

const { resolve } = require('path')
const { createHash } = require('crypto')
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

const emptyResult = {}
const defaultEnvResult = { TEST: 'hi' }
const simpleResult = { TEST: 'testing' }
const defaultsResult = { TEST: 'hi', TEST2: 'hidefault' }
const defaultsResult2 = { TEST: 'hi', TEST2: 'youcanseethis' }
const oneEmptyResult = { TEST: '', TEST2: 'Hello' }
const missingOneResult = { TEST2: 'Hello' }

const hash = (str) => createHash('md5').update(str).digest('hex').slice(0, 8)

const getConfig = (target, plugin) => ({
  mode: 'development',
  devtool: false,
  target,
  entry: resolve(__dirname, './fixtures/index'),
  output: {
    path: resolve(__dirname, `./output/${hash(expect.getState().currentTestName)}`)
  },
  plugins: [plugin]
})

const compile = (config, callback) => {
  webpack(config, (err, stats) => {
    expect(err).toBeNull()
    expect(stats.compilation.errors).toHaveLength(0)

    const result = readFileSync(
      resolve(__dirname, config.output.path, 'main.js'),
      { encoding: 'utf-8' }
    )

    callback(result)
  })
}

const expectResultsToContainReplacements = (plugin, env, done) => {
  const config = getConfig('web', plugin)

  compile(config, (result) => {
    Object.entries(env).forEach(([key, value]) => {
      expect(result).toMatch(`const ${key} = "${value}"`)
    })

    done?.()
  })
}

const versions = [
  ['Source', Src.default],
  ['Dist', Dist.default]
]

beforeAll(() => {
  global.console.warn = jest.fn()
})

beforeEach(() => {
  jest.resetAllMocks()

  const outputDir = resolve(__dirname, `output/${hash(expect.getState().currentTestName)}`)
  try {
    rmdirSync(outputDir, { recursive: true })
  } catch (err) {
    // rmdir might error if the target doesn't exist, but we don't care about that.
    if (!err.message.includes('ENOENT')) {
      throw err
    }
  }
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
      expectResultsToContainReplacements(new DotenvPlugin(), defaultEnvResult, done)
    })

    test('Should not expand variables by default', (done) => {
      const expected = {
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
      }

      expectResultsToContainReplacements(
        new DotenvPlugin({ path: envExpanded }),
        expected,
        done
      )
    })

    test('Should expand variables when configured', (done) => {
      const expected = {
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
      }

      expectResultsToContainReplacements(
        new DotenvPlugin({ path: envExpanded, expand: true }),
        expected,
        done
      )
    })
  })

  describe('Simple configuration', () => {
    test('Should load enviornment variables when they exist in the .env file.', (done) => {
      expectResultsToContainReplacements(
        new DotenvPlugin({ path: envSimple }),
        simpleResult,
        done
      )
    })

    test('Should be an empty object when no environment variables exist in .env file.', (done) => {
      expectResultsToContainReplacements(
        new DotenvPlugin({ path: false }),
        emptyResult,
        done
      )
    })

    test('Should recognize safe-mode', (done) => {
      expectResultsToContainReplacements(
        new DotenvPlugin({ safe: true }),
        defaultEnvResult,
        done
      )
    })

    test('Should fail when not passing safe-mode', (done) => {
      const config = getConfig('web', new DotenvPlugin({ path: envEmpty, safe: true }))

      webpack(config, (err) => {
        expect(err.message).toBe('Missing environment variable: TEST')

        done()
      })
    })
  })

  describe('Safe configuration', () => {
    test('Should load successfully if variables defined', (done) => {
      expectResultsToContainReplacements(
        new DotenvPlugin({ path: envEmpty, safe: envEmptyExample }),
        emptyResult,
        () => {
          expectResultsToContainReplacements(
            new DotenvPlugin({ path: envSimple, safe: envSimpleExample }),
            simpleResult,
            done
          )
        }
      )
    })

    test('Should fail if env does not match sample.', (done) => {
      const config = getConfig(
        'web',
        new DotenvPlugin({ path: envEmpty, safe: envSimpleExample })
      )

      webpack(config, (err) => {
        expect(err.message).toBe('Missing environment variable: TEST')

        done()
      })
    })
  })

  describe('Defaults configuration', () => {
    test('should support default configurations', (done) => {
      expectResultsToContainReplacements(
        new DotenvPlugin({ defaults: true }),
        defaultsResult,
        done
      )
    })

    test('should support string configurations', (done) => {
      expectResultsToContainReplacements(
        new DotenvPlugin({ defaults: envDefaults }),
        defaultsResult2,
        done
      )
    })

    test('Should display warning when default cannot be loaded', (done) => {
      const envDefaultName = '.does.not.exist'
      expectResultsToContainReplacements(
        new DotenvPlugin({ defaults: envDefaultName }),
        defaultEnvResult,
        done
      )

      expect(global.console.warn).toHaveBeenCalledWith(`Failed to load ${envDefaultName}.`)
    })
  })

  describe('System variables', () => {
    const originalPath = process.env.PATH
    beforeEach(() => {
      process.env.PATH = '/usr/local/bin:/usr/local/sbin:'
    })
    afterEach(() => {
      process.env.PATH = originalPath
    })

    test('Should allow system env variables', (done) => {
      const config = getConfig(
        'web',
        new DotenvPlugin({ path: envSimple, systemvars: true })
      )

      compile(config, (result) => {
        expect(result).toMatch('const TEST = "testing"')
        expect(result).toMatch('const PATH = "/usr/local/bin:/usr/local/sbin:')

        done()
      })
    })

    test('should pass if the systemvar satisfies the requirement', (done) => {
      const config = getConfig(
        'web',
        new DotenvPlugin({ safe: envSystemvarsExample, systemvars: true })
      )

      compile(config, (result) => {
        expect(result).toMatch('const TEST = "hi"')
        expect(result).toMatch(/const PATH = ".*[\\/].*"/)

        done()
      })
    })

    test('should not allow local variables to override systemvars', (done) => {
      const config = getConfig(
        'web',
        new DotenvPlugin({ path: envSystemvars, systemvars: true })
      )

      compile(config, (result) => {
        expect(result).toMatch('const TEST = "MISSING_ENV_VAR".TEST')
        expect(result).not.toMatch('const PATH = ""')

        done()
      })
    })

    test('Should give the highest priority for the system variables', (done) => {
      process.env.TEST = 'production'

      const config = getConfig(
        'web',
        new DotenvPlugin({ safe: true, systemvars: true, defaults: true })
      )

      compile(config, (result) => {
        expect(result).toMatch('const TEST = "production"')
        expect(result).toMatch('const TEST2 = "hidefault"')

        done()
      })

      delete process.env.TEST
    })
  })

  describe('Empty variables', () => {
    test('Should load fine (not-safe)', (done) => {
      expectResultsToContainReplacements(
        new DotenvPlugin({ path: envOneEmpty }),
        oneEmptyResult,
        done
      )
    })

    test('Should fail on safe mode', (done) => {
      const config = getConfig(
        'web',
        new DotenvPlugin({ path: envOneEmpty, safe: envOneEmptyExample })
      )

      webpack(config, (err) => {
        expect(err.message).toBe('Missing environment variable: TEST')

        done()
      })
    })

    test('Should succeed in safe mode if allowEmptyValues is true', (done) => {
      expectResultsToContainReplacements(
        new DotenvPlugin({ path: envOneEmpty, safe: envOneEmptyExample, allowEmptyValues: true }),
        oneEmptyResult,
        done
      )
    })
  })

  describe('Missing a variable', () => {
    test('Should load fine (not-safe)', (done) => {
      expectResultsToContainReplacements(
        new DotenvPlugin({ path: envMissingOne }),
        missingOneResult,
        done
      )
    })

    test('Should fail on safe mode (if allowEmptyValues is false)', (done) => {
      const config = getConfig(
        'web',
        new DotenvPlugin({ path: envMissingOne, safe: envMissingOneExample })
      )

      webpack(config, (err) => {
        expect(err.message).toBe('Missing environment variable: TEST')

        done()
      })
    })
  })

  describe('Silent mode', () => {
    test('Should display warning by default', (done) => {
      compile(getConfig('web', new DotenvPlugin({ path: false })), () => {
        expect(global.console.warn).toHaveBeenCalled()

        done()
      })
    })

    test('Should not display warning when silent mode enabled', (done) => {
      compile(
        getConfig('web', new DotenvPlugin({ path: false, silent: true })),
        () => {
          expect(global.console.warn).toHaveBeenCalledTimes(0)

          done()
        }
      )
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
      ['web', true],
      ['es5', true],
      ['es2020', true],
      ['electron-renderer', true],
      ['electron9-renderer', true],
      ['electron-preload', true],
      ['node', false],
      ['node14', false],
      ['electron-main', false],
      ['electron9-main', false]
    ]

    test.each(cases)('%s', (target, shouldStub, done) => {
      compile(
        getConfig(target, plugin),
        (result) => {
          if (shouldStub) {
            expectToBeStubbed(result)
          } else {
            expectNotToBeStubbed(result)
          }

          done()
        }
      )
    })
  })
})
