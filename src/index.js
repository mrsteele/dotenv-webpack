import dotenv from 'dotenv-safe'
import fs from 'fs'
import { DefinePlugin } from 'webpack'

class Dotenv {
  constructor (options) {
    options = options || {}
    if (!options.path) options.path = './.env'

    dotenv.config(options)
    this.env = {}

    try {
      this.env = dotenv.parse(fs.readFileSync(options.path))
    } catch (err) {}
  }

  apply (compiler) {
    const plugin = Object.keys(this.example).reduce((definitions, key) => {
      const value = process.env[key] || this.env[key]
      definitions[`process.env.${key}`] = JSON.stringify(value)
      return definitions
    }, {})

    compiler.apply(new DefinePlugin(plugin))
  }
}

export default Dotenv
