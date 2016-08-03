import { parse } from 'dotenv'
import fs from 'fs'
import { DefinePlugin } from 'webpack'

class Dotenv {
  constructor (options) {
    options = options || {}
    if (!options.path) options.path = './.env'

    this.env = {}
    try {
      this.env = parse(fs.readFileSync(options.path))
    } catch (err) {}
  }

  apply (compiler) {
    const plugin = Object.keys(this.env).reduce((definitions, key) => {
      const value = process.env[key] || this.env[key]
      definitions[`process.env.${key}`] = JSON.stringify(value)
      return definitions
    }, {})

    compiler.apply(new DefinePlugin(plugin))
  }
}

export default Dotenv
