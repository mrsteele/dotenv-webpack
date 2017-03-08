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

### Description

`dotenv-webpack` wraps `dotenv` and `Webpack.DefinePlugin`. As such, it overwrites existing any existing `DefinePlugin` configurations. Also, like `DefinePlugin`, it does a text replace in the resulting bundle for any instances of `process.env`.

Also, be aware that all information in your `.env` file will be included in the resulting bundle. Please do not share any secret information in your client bundle. Instead, make a separate `.client.env` file.

### Usage

The plugin can be installed with little-to-no configuration needed. Once installed, you can access the variables within your code using `process.env` as you would with `dotenv`.

The example bellow shows the defaults, as well as a description of each parameter.

###### Create a .env file

```
// .env
DB_HOST=127.0.0.1
DB_PASS=foobar
S3_API=mysecretkey

```
###### Add it to your Webpack config file
```javascript
// webpack.config.js
const Dotenv = require('dotenv-webpack');

module.exports = {
  ...
  plugins: [
    new Dotenv({
      path: './.env // Path to .env file. Use a separate file for client configuration
      safe: true // lets load the .env.example file as well
    })
  ]
  ...
};
```

###### Use in your code

```
// bundle.js
console.log(process.env.DB_HOST);
// '127.0.0.1'
```

###### Recommended
Add `.env` to your `.gitignore` file


### Properties

Use the following properties to configure your instance.

* **path** (`'./.env'`) - The path to your environment variables.
* **safe** (`false`) - If false ignore safe-mode, if true load `'./.env.example'`, if a string load that file as the sample.
* **systemvars** (`false`) - Set to true if you would rather load all system variables as well (useful for CI purposes).

### LICENSE

MIT
