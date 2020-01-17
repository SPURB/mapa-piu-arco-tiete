require('dotenv').config() // env
require('babel-register')({ presets: [ 'env' ] })// Transpile all code following this line with babel and use 'env' (aka ES6) preset.

// Import the rest of our application.
module.exports = require('./tasks/setupEnv.js')
module.exports = require('./tasks/projetos.js')
module.exports = require('./tasks/mapas.js')
module.exports = require('./tasks/simples.js') //create simples.json and bases.json
module.exports = require('./tasks/cores.js')