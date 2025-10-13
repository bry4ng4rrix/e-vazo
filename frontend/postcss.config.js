export default {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    'tailwindcss': {},
    'postcss-nesting': {},
    'postcss-preset-env': {
      features: { 'nesting-rules': true },
    },
    'autoprefixer': {},
  },
}
