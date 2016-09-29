import dotenv from 'dotenv'
import fs from 'fs'
import { DefinePlugin } from 'webpack'

/**
 * The dotenv-webpack plugin.
 * @param {Object} options - The parameters.
 * @param {String} [path=./.env] - The location of the environment variable.
 * @param {Bool|String} [safe=false] - If false ignore safe-mode, if true load `'./.env.example'`, if a string load that file as the sample.
 * @param {Bool} [systemvars=false] - If true, load system environment variables.
 * @returns {webpack.DefinePlugin}
 */
class Dotenv {
  constructor (options) {
    options = Object.assign({
      path: './.env',
      safe: false,
      systemvars: false
    }, options)

    // Catch older packages, but hold their hand (just for a bit)
    if (options.sample) {
      if (options.safe) {
        options.safe = options.sample
      }
      console.warn('dotend-webpack: "options.sample" is a deprecated property. Please update your configuration to use "options.safe" instead.')
    }

    let vars = (options.systemvars) ? Object.assign({}, process.env) : {}
    const env = this.loadFile(options.path)

    let blueprint = env
    if (options.safe) {
      let file = './.env.example'
      if (options.safe !== true) {
        file = options.safe
      }
      blueprint = this.loadFile(file)
    }

    Object.keys(blueprint).map(key => {
      const value = env[key] || env[key]
      if (!value && options.safe) {
        throw new Error(`Missing environment variable: ${key}`)
      } else {
        vars[key] = value
      }
    })

    return new DefinePlugin({
      'process.env': JSON.stringify(vars)
    })
  }

  /**
   * Load and parses a file.
   * @param {String} file - The file to load.
   * @returns {Object}
   */
  loadFile (file) {
    try {
      return dotenv.parse(fs.readFileSync(file))
    } catch (err) {
      console.warn(`Failed to load ${file}.`)
      return {}
    }
  }
}

export default Dotenv
