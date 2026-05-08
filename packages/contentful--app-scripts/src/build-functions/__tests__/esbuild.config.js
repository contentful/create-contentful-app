module.exports = {
  entryPoints: {
    'my-func': './fixtures/function.ts',
  },
  bundle: false,
  outdir: 'dist',
  format: 'cjs',
  target: 'es2024',
  minify: false,
  define: {
    global: 'globalThis',
  },
  logLevel: 'info',
};
