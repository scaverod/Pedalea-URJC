const path = require('path');

// Export a function to access argv.mode so we can tweak devtool/optimization per env
module.exports = (env, argv) => {
  const isDev = (argv && argv.mode) === 'development';

  return {
    mode: argv.mode || 'development',
    entry: './public/src/index.js',
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'bundle.js',
      chunkFilename: 'chunk.[contenthash].js',
      publicPath: '/',
    },
    devtool: isDev ? 'source-map' : false,
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    optimization: {
      // Only split async chunks (from dynamic import), keep single main bundle name stable
      splitChunks: { chunks: 'async' },
      runtimeChunk: false,
    },
    performance: {
      hints: false,
    },
  };
};