import dotenv from 'dotenv-defaults'
import fs from 'fs'
import { DefinePlugin } from 'webpack'

// Mostly taken from here: https://github.com/motdotla/dotenv-expand/blob/master/lib/main.js#L4
const interpolate = (env, vars) => {
  const matches = env.match(/\$([a-zA-Z0-9_]+)|\${([a-zA-Z0-9_]+)}/g) || []

  matches.forEach((match) => {
    const key = match.replace(/\$|{|}/g, '')
    let variable = vars[key] || ''
    variable = interpolate(variable, vars)
    env = env.replace(match, variable)
  })

  return env
}

class Dotenv {
  /**
   * The dotenv-webpack plugin.
   * @param {Object} options - The parameters.
   * @param {String} [options.path=./.env] - The location of the environment variable.
   * @param {Boolean|String} [options.safe=false] - If false ignore safe-mode, if true load `'./.env.example'`, if a string load that file as the sample.
   * @param {Boolean} [options.systemvars=false] - If true, load system environment variables.
   * @param {Boolean} [options.silent=false] - If true, suppress warnings, if false, display warnings.
   * @returns {webpack.DefinePlugin}
   */
  constructor (config = {}) {
    this.config = Object.assign({}, {
      path: './.env'
    }, config)

    this.checkDeprecation()

    return new DefinePlugin(this.formatData(this.gatherVariables()))
  }

  checkDeprecation () {
    const { sample, safe, silent } = this.config
    // Catch older packages, but hold their hand (just for a bit)
    if (sample) {
      if (safe) {
        this.config.safe = sample
      }
      this.warn('dotenv-webpack: "options.sample" is a deprecated property. Please update your configuration to use "options.safe" instead.', silent)
    }
  }

  gatherVariables () {
    const { safe, allowEmptyValues } = this.config
    const vars = this.initializeVars()

    const { env, blueprint } = this.getEnvs()

    Object.keys(blueprint).map(key => {
      const value = Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : env[key]

      const isMissing = typeof value === 'undefined' || value === null ||
        (!allowEmptyValues && value === '')

      if (safe && isMissing) {
        throw new Error(`Missing environment variable: ${key}`)
      } else {
        vars[key] = value
      }
    })

    // add the leftovers
    if (safe) {
      Object.assign(vars, env)
    }

    return vars
  }

  initializeVars () {
    return (this.config.systemvars) ? Object.assign({}, process.env) : {}
  }

  getEnvs () {
    const { path, silent, safe } = this.config

    const env = dotenv.parse(this.loadFile({
      file: path,
      silent
    }), this.getDefaults())

    let blueprint = env
    if (safe) {
      let file = './.env.example'
      if (safe !== true) {
        file = safe
      }
      blueprint = dotenv.parse(this.loadFile({
        file,
        silent
      }))
    }

    return {
      env,
      blueprint
    }
  }

  getDefaults () {
    const { silent, defaults } = this.config

    if (defaults) {
      return this.loadFile({
        file: defaults === true ? './.env.defaults' : defaults,
        silent
      })
    }

    return ''
  }

  formatData (vars = {}) {
    const { expand } = this.config
    return Object.keys(vars).reduce((obj, key) => {
      const v = vars[key]
      const vKey = `process.env.${key}`
      let vValue
      if (expand) {
        if (v.substring(0, 2) === '\\$') {
          vValue = v.substring(1)
        } else if (v.indexOf('\\$') > 0) {
          vValue = v.replace(/\\\$/g, '$')
        } else {
          vValue = interpolate(v, vars)
        }
      } else {
        vValue = v
      }

      obj[vKey] = JSON.stringify(vValue)

      return obj
    }, {})
  }

  /**
   * Load a file.
   * @param {String} config.file - The file to load.
   * @param {Boolean} config.silent - If true, suppress warnings, if false, display warnings.
   * @returns {Object}
   */
  loadFile ({ file, silent }) {
    try {
      return fs.readFileSync(file, 'utf8')
    } catch (err) {
      this.warn(`Failed to load ${file}.`, silent)
      return {}
    }
  }

  /**
   * Displays a console message if 'silent' is falsey
   * @param {String} msg - The message.
   * @param {Boolean} silent - If true, display the message, if false, suppress the message.
   */
  warn (msg, silent) {
    !silent && console.warn(msg)
  }
}

export default Dotenv
