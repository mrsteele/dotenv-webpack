import dotenv from 'dotenv'
import fs from 'fs'
import { DefinePlugin } from 'webpack'

class Dotenv {
  constructor (options) {
    options = Object.assign({
      path: './.env',
      safe: false,
      systemvars: false
    }, options)

    if (options.sample) {
      console.warn('dotend-webpack: "options.sample" is a deprecated property. Please update your configuration to use simple "options.safe".')
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
