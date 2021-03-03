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

const versions = [
  ['Source', Src.default],
  ['Dist', Dist.default]
]

describe.each(versions)('%s', (_, DotenvPlugin) => {
  describe('process.env stubbing', () => {
    const expectToBeStubbed = (result) => {
      expect(result).toMatch('const test = "testing"')
      expect(result).toMatch('const test2 = "MISSING_ENV_VAR".TEST2')
      expect(result).toMatch('const nodeEnv = "development"')
      expect(result).toMatch('const mongolabUser = "MISSING_ENV_VAR".MONGOLAB_USER')
    }

    const expectNotToBeStubbed = (result) => {
      expect(result).toMatch('const test = "testing"')
      expect(result).toMatch('const test2 = process.env.TEST2')
      expect(result).toMatch('const nodeEnv = "development"')
      expect(result).toMatch('const mongolabUser = process.env.MONGOLAB_USER')
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

    beforeEach(() => {
      rmdirSync(resolve(__dirname, 'output'), { recursive: true })
    })

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
