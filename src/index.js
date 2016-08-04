import dotenv from 'dotenv-safe'
import fs from 'fs'
import { DefinePlugin } from 'webpack'

class Dotenv {
  constructor (options) {
    this.options = Object.assign({
      path: './.env',
      safe: false,
      sample: './env.example'
    }, options)

    this.blueprint = (this.safe) ? this.loadFile(this.options.sample) : this.loadFile(this.options.path)
    this.env = this.loadFile(this.options.path)
  }

  loadFile (file) {
    try {
      return dotenv.parse(fs.readFileSync(file))
    } catch (err) {
      return {}
    }
  }

  apply (compiler) {
    const plugin = Object.keys(this.blueprint).reduce((definitions, key) => {
      const value = process.env[key] || this.env[key]
      if (!value) {
        throw new Error(`Missing environment variable: ${key}`)
      }
      definitions[`process.env.${key}`] = JSON.stringify(value)
      return definitions
    }, {})

    compiler.apply(new DefinePlugin(plugin))
  }
}

export default Dotenv
