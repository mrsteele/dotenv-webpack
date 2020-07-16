'use strict'

let plugin
try {
  plugin = require('./src')
} catch (err) {
  console.log(err)
  process.exit(1)
}

module.exports = plugin
