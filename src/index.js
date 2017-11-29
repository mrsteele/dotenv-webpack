import dotenv from 'dotenv'
import fs from 'fs'
import { DefinePlugin } from 'webpack'

class Dotenv {
  /**
   * The dotenv-webpack plugin.
   * @param {Object} options - The parameters.
   * @param {String} [options.path=./.env] - The location of the environment variable.
   * @param {Bool|String} [options.safe=false] - If false ignore safe-mode, if true load `'./.env.example'`, if a string load that file as the sample.
   * @param {Bool} [options.systemvars=false] - If true, load system environment variables.
   * @param {Bool} [options.silent=false] - If true, suppress warnings, if false, display warnings.
   * @returns {webpack.DefinePlugin}
   */
  constructor (options) {
    options = Object.assign({
      path: './.env',
      safe: false,
      systemvars: false,
      silent: false
    }, options)

    // Catch older packages, but hold their hand (just for a bit)
    if (options.sample) {
      if (options.safe) {
        options.safe = options.sample
      }
      this.warn('dotenv-webpack: "options.sample" is a deprecated property. Please update your configuration to use "options.safe" instead.', options.silent)
    }

    let vars = {}
    if (options.systemvars) {
      Object.keys(process.env).map(key => {
        vars[key] = process.env[key]
      })
    }

    const env = this.loadFile(options.path, options.silent)

    let blueprint = env
    if (options.safe) {
      let file = './.env.example'
      if (options.safe !== true) {
        file = options.safe
      }
      blueprint = this.loadFile(file, options.silent)
    }

    Object.keys(blueprint).map(key => {
      const value = vars.hasOwnProperty(key) ? vars[key] : env[key]
      if (!value && options.safe) {
        throw new Error(`Missing environment variable: ${key}`)
      } else {
        vars[key] = value
      }
    })

    const formatData = Object.keys(vars).reduce((obj, key) => {
      let value = vars[key]
      // Do not double-stringify booleans
      if (value === 'true') {
        value = true
      } else if (value === 'false') {
        value = false
      }
      obj[`process.env.${key}`] = JSON.stringify(value)
      return obj
    }, {})

    return new DefinePlugin(formatData)
  }

  /**
   * Load and parses a file.
   * @param {String} file - The file to load.
   * @param {Bool} silent - If true, suppress warnings, if false, display warnings.
   * @returns {Object}
   */
  loadFile (file, silent) {
    try {
      return dotenv.parse(fs.readFileSync(file))
    } catch (err) {
      this.warn(`Failed to load ${file}.`, silent)
      return {}
    }
  }

  /**
   * Displays a console message if 'silent' is falsey
   * @param {String} msg - The message.
   * @param {Bool} silent - If true, display the message, if false, suppress the message.
   */
  warn (msg, silent) {
    !silent && console.warn(msg)
  }
}

export default Dotenv
