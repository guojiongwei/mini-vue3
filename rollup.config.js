import path from 'path'
import ts from 'rollup-plugin-typescript2' // 支持ts语法
import commonjs from '@rollup/plugin-commonjs' // 支持common.js规范
import json from '@rollup/plugin-json' // 支持处理json文件
import nodeResolve from '@rollup/plugin-node-resolve'

// 从环境遍历中取出打包目标环境和格式，以及是否需要source_map
const { TARGET, FORMATS, SOURCE_MAP } = process.env

/** 获取packages包的路径 */
const packagesDir = path.resolve(__dirname, 'packages')

/** 获取当前目标模块的路径 */
const packageDir = path.resolve(packagesDir, TARGET)

/** 获取当前目标模块的名称 */
const packageName = path.basename(packageDir)

/** 封装查找当前目标模块的子路径 */
const packageDirResolve = p => path.resolve(packageDir, p)

/** 获取package.json内容 */
const packageJson = require(packageDirResolve('package.json'))

/** 配置当前打包的格式 */
const formats = FORMATS ? [ FORMATS ] : packageJson.buildOptions.formats

/** 设置常用打包格式和输出文件路径 */
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

/** 创建打包配置 */
function createConfig(format, output) {
  // 设置sourceMap
  output.sourceMap = SOURCE_MAP
  output.exports = 'named'
  // 设置忽略打包的库
  let external = []
  // 如果是global打包，就单独设置下名称
  if(format === 'global') {
    output.name = packageJson.buildOptions.name
  } else {
    // 不是global就设置external的值为该包的依赖
    external = Object.keys(packageJson.dependencies)
  }
  return {
    // 入口文件
    input: packageDirResolve('src/index.ts'),
    // 出口文件
    output,
    // 忽略打包模块
    external,
    // 使用插件
    plugins: [
      json(),
      ts(),
      commonjs(),
      nodeResolve()
    ]
  }
}

// 导出打包规则
export default formats.map(format => createConfig(format, outputConfig[format]))
