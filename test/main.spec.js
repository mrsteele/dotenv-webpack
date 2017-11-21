/* global describe, it */

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
const envMissingOne = path.resolve(__dirname, './envs/.missingone')
const envMissingOneExample = path.resolve(__dirname, './envs/.missingone.example')
const envSystemvars = path.resolve(__dirname, './envs/.systemvars')
const envSystemvarsExample = path.resolve(__dirname, './envs/.systemvars.example')
const envExport = path.resolve(__dirname, './envs/.export')

const envDefJson = {'process.env.TEST': '"hi"'}
const envEmptyJson = {}
const envSimpleJson = {'process.env.TEST': '"testing"'}
const envMissingOneJson = {'process.env.TEST': '""', 'process.env.TEST2': '"Hello"'}
const envExportJson = {'process.env.TEST': '"testing"'}

const consoleSpy = sinon.spy(console, 'warn')

function runTests (Obj, name) {
  function envTest (config) {
    return new Obj(config).definitions
  }

  /** @test {Dotenv} **/
  describe(name, () => {
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
    })

    describe('Simple configuration', () => {
      it('Should load environment variables when they exist in the .env file.', () => {
        envTest({path: envSimple}).should.deep.equal(envSimpleJson)
      })

      it('Should be an empty object when no environment variables exist in .env file.', () => {
        envTest({path: false}).should.deep.equal(envEmptyJson)
      })

      it('Should recognize safe-mode', () => {
        envTest({safe: true}).should.deep.equal(envDefJson)
      })

      it('Should fail when not passing safe-mode', () => {
        function errorTest () {
          envTest({path: envEmpty, safe: true})
        }

        errorTest.should.throw('Missing environment variable')
      })
    })

    describe('Safe configuration', () => {
      it('Should load successfully if variables defined', () => {
        envTest({path: envEmpty, safe: envEmptyExample}).should.deep.equal(envEmptyJson)
        envTest({path: envSimple, safe: envSimpleExample}).should.deep.equal(envSimpleJson)
      })

      it('Should fail if env does not match sample.', () => {
        function errorTest () {
          envTest({path: envEmpty, safe: envSimpleExample})
        }

        errorTest.should.throw('Missing environment variable')
      })
    })

    describe('System variables', () => {
      it('Should allow system env variables', () => {
        const test = envTest({path: envSimple, systemvars: true})
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
        envTest({path: envSystemvars, systemvars: true})['process.env.PATH'].should.not.equal('""')
      })
    })

    describe('Missing a variable', () => {
      it('Should load fine (not-safe)', () => {
        envTest({path: envMissingOne}).should.deep.equal(envMissingOneJson)
      })

      it('Should fail on safe mode', () => {
        function errorTest () {
          envTest({path: envMissingOne, safe: envMissingOneExample})
        }

        errorTest.should.throw('Missing environment variable')
      })
    })

    describe('Deprecated configuration', () => {
      it('Should use safe when safe and sample set', () => {
        envTest({path: envSimple, safe: true, sample: envSimpleExample}).should.deep.equal(envSimpleJson)
      })

      it('Should display deprecation warning by default', () => {
        consoleSpy.reset()
        envTest({path: envSimple, safe: true, sample: envSimpleExample}).should.deep.equal(envSimpleJson)
        consoleSpy.calledOnce.should.equal(true)
      })

      it('Should not display deprecation warning when silent mode enabled', () => {
        consoleSpy.reset()
        envTest({path: envSimple, safe: true, sample: envSimpleExample, silent: true}).should.deep.equal(envSimpleJson)
        consoleSpy.called.should.equal(false)
      })

      it('Should fail naturally when using deprecated values', () => {
        function errorTest () {
          envTest({path: envMissingOne, safe: true, sample: envMissingOneExample})
        }

        errorTest.should.throw('Missing environment variable')
      })

      it('Should not fail naturally when using deprecated values improperly', () => {
        envTest({path: envMissingOne, sample: envMissingOneExample}).should.deep.equal(envMissingOneJson)
      })
    })

    describe('Silent mode', () => {
      it('Should display warning by default', () => {
        consoleSpy.reset()
        envTest({path: false})
        consoleSpy.calledOnce.should.equal(true)
      })

      it('Should not display warning when silent mode enabled', () => {
        consoleSpy.reset()
        envTest({path: false, silent: true})
        consoleSpy.called.should.equal(false)
      })
    })

    describe('Exports', () => {
      it('Should load environment variables when they are exported in the .env file.', () => {
        envTest({path: envExport}).should.deep.equal(envExportJson)
      })
    })
  })
}

describe('Tests', () => {
  runTests(Src, 'Source')
})
