import path from 'path'
import ts from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'

const { TARGET, FORMATS, SOURCE_MAP } = process.env

const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, TARGET)
const packageName = path.basename(packageDir)

const packageDirResolve = p => path.resolve(packageDir, p)

const packageJson = require(packageDirResolve('package.json'))

const formats = FORMATS ? [ FORMATS ] : packageJson.buildOptions.formats

const outputConfig = {
  'esm-bundler': {
    file: packageDirResolve(`dist/${packageName}.esm-bundler.js`),
    format: 'es'
  },
  'cjs': {
    file: packageDirResolve(`dist/${packageName}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: packageDirResolve(`dist/${packageName}.global.js`),
    format: 'iife'
  },
}


// console.log(outputConfig)

function createConfig(format, output) {
  output.sourceMap = SOURCE_MAP
  output.exports = 'named'
  let external = []
  if(format === 'global') {
    output.name = packageJson.buildOptions.name
  } else {
    external = Object.keys(packageJson.dependencies)
  }
  return {
    input: packageDirResolve('src/index.ts'),
    output,
    external,
    plugins: [
      json(),
      ts(),
      commonjs(),
      nodeResolve()
    ]
  }
}

export default formats.map(format => createConfig(format, outputConfig[format]))
