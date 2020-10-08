module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: [],
  theme: {
    extend: {
      height: {
        '42': '42px',
      },
      width: {
        '100': '100px',
      },
      minHeight: {
        '4': '4px',
        '8': '8px',
        '16': '16px',
        '32': '32px',
        '64': '64px',
        'screen': '100vh',
      },
      minWidth: {
        '4': '4px',
        '8': '8px',
        '16': '16px',
        '32': '32px',
        '64': '64px',
        'screen': '100vw',
      },
      colors: {
        'primary': '#410FF8',
      },
      gridTemplateColumns: {
        'editor': '1fr 319px', // color picker width + 48
      },
      gridTemplateRows: {
        'editor': '1fr 20%',
      }
    },
  },
  variants: {},
  plugins: [],
}
