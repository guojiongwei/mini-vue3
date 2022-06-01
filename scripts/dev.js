const minimist = require('minimist')
const execa = require('execa')

const args = minimist(process.argv.slice(2))

console.log(args)

const target = args._.length ? args._[0] : 'reactivity'
const formats = args.f || 'global'
const sourceMap = args.s || false

execa('rollup', [
  '-wc',
  '--environment',
  [
    `TARGET:${target}`,
    `FORMATS:${formats}`,
    sourceMap ? `SOURCE_MAP: true` : ``
  ].filter(Boolean).join(',')
], {
  stdio: "inherit", // 该子进程的日志输出在该子进程中展示
})