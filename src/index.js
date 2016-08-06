import dotenv from 'dotenv-safe'
import fs from 'fs'
import { DefinePlugin } from 'webpack'

class Dotenv {
  constructor (options) {
    options = Object.assign({
      path: './.env',
      safe: false,
      sample: './.env.example',
      systemvars: true
    }, options)

    let vars = (options.systemvars) ? Object.assign({}, process.env) : {}
    const blueprint = (options.safe) ? this.loadFile(options.sample) : this.loadFile(options.path)
    const env = this.loadFile(options.path)

    Object.keys(blueprint).map(key => {
      const value = env[key] || env[key]
      if (!value) {
        throw new Error(`Missing environment variable: ${key}`)
      } else {
        vars[key] = value
      }
    })

    return new DefinePlugin({
      'process.env': JSON.stringify(vars)
    })
  }

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
