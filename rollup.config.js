import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import image from '@timdp/rollup-plugin-image'

export default {
  input: 'src/main.js',

  output: {
    file: 'starfish.js',
    format: 'iife',
    name: 'starfish'
  },

  plugins: [
    resolve(),
    commonjs(),
    image()
  ]
}
