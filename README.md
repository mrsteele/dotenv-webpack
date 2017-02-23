# dotenv-webpack

A simple webpack plugin to support dotenv.

### Status

[![npm](https://img.shields.io/npm/v/dotenv-webpack.svg?maxAge=0&style=flat)](https://www.npmjs.com/package/dotenv-webpack)
[![Travis](https://travis-ci.org/mrsteele/dotenv-webpack.svg?branch=master)](https://travis-ci.org/mrsteele/dotenv-webpack)
[![Coverage Status](https://coveralls.io/repos/github/mrsteele/dotenv-webpack/badge.svg?branch=master)](https://coveralls.io/github/mrsteele/dotenv-webpack?branch=master)
[![Dependency Status](https://david-dm.org/mrsteele/dotenv-webpack.svg)](https://david-dm.org/mrsteele/dotenv-webpack)
[![devDependency Status](https://david-dm.org/mrsteele/dotenv-webpack/dev-status.svg)](https://david-dm.org/mrsteele/dotenv-webpack?type=dev)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/l/dotenv-webpack.svg?maxAge=0&style=flat)](https://raw.githubusercontent.com/mrsteele/dotenv-webpack/master/LICENSE)
[![pull requests](https://img.shields.io/badge/pull%20requests-accepting-brightgreen.svg?style=flat)](https://github.com/mrsteele/dotenv-webpack/fork)

### Installation

Include the package locally in your repository.

`npm install dotenv-webpack --save`

### Usage

The plugin can be installed with little-to-no configuration needed. Once installed, you can access the variables as expected within your code using `process.env`.

For example: `.env`
```
MY_VARIABLE=something_cool
```

`console.log(process.env.MY_VARIABLE);`

The example bellow shows the defaults, as well as a description of each parameter.

```javascript
// webpack.config.js
const Dotenv = require('dotenv-webpack');

module.exports = {
  ...
  plugins: [
    new Dotenv({
      path: './.my.env', // if not simply .env
      safe: true // lets load the .env.example file as well
    })
  ]
  ...
};
```

### Properties

Use the following properties to configure your instance.

* **path** (`'./.env'`) - The path to your environment variables.
* **safe** (`false`) - If false ignore safe-mode, if true load `'./.env.example'`, if a string load that file as the sample.
* **systemvars** (`false`) - Set to true if you would rather load all system variables as well (useful for CI purposes).

### LICENSE

MIT
