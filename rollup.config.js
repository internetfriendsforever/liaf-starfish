import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/starfish.js',

  output: {
    file: 'starfish.js',
    dir: 'dist',
    format: 'iife',
    name: 'starfish'
  },

  plugins: [
    babel({
      plugins: [
        '@babel/plugin-transform-template-literals',
        '@babel/plugin-transform-block-scoping',
        '@babel/plugin-transform-arrow-functions',
        '@babel/plugin-transform-parameters',
        '@babel/plugin-transform-destructuring'
      ]
    }),
    resolve(),
    commonjs()
  ]
}
