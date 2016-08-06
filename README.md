# dotenv-webpack

A simple webpack plugin to support dotenv.

### Status

[![npm](https://img.shields.io/npm/v/dotenv-webpack.svg?maxAge=0&style=flat)](https://www.npmjs.com/package/dotenv-webpack)
[![Travis](https://travis-ci.org/mrsteele/dotenv-webpack.svg?branch=master)](https://travis-ci.org/mrsteele/dotenv-webpack)
[![Coverage Status](https://coveralls.io/repos/github/mrsteele/dotenv-webpack/badge.svg?branch=master)](https://coveralls.io/github/mrsteele/dotenv-webpack?branch=master)
[![Dependency Status](https://david-dm.org/mrsteele/dotenv-webpack.svg)](https://david-dm.org/mrsteele/dotenv-webpack)
[![devDependency Status](https://david-dm.org/mrsteele/dotenv-webpack/dev-status.svg)](https://david-dm.org/mrsteele/dotenv-webpack#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/l/dotenv-webpack.svg?maxAge=0&style=flat)](https://raw.githubusercontent.com/mrsteele/dotenv-webpack/master/LICENSE)
[![pull requests](https://img.shields.io/badge/pull%20requests-accepting-brightgreen.svg?style=flat)](https://github.com/mrsteele/dotenv-webpack/fork)

### Installation

Include the package locally in your repository.

`npm install dotenv-webpack --save`

### Basic Usage

The plugin can be installed with little-to-no configuration needed.

```javascript
// webpack.config.js
const Dotenv = require('dotenv-webpack');

module.exports = {
  ...
  plugins: [
    new Dotenv({
      path: './.env', // can be ommitted as this is the default
      safe: false, // make true to use dotenv-safe and require variables
      sample: './.env.example', // if safe=true, use this to define the safe env
      systemvars: false // if true, also loads system env variables
    })
  ]
  ...
};
```

### LICENSE

MIT
