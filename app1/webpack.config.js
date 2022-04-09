// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack')

const DynamicPublicPathPlugin = require('../plugins/dynamic-public-path-plugin')
const PreloadRemoteDependenciesPlugin = require('../plugins/preload-remote-dependencies-plugin')
const buildRemote = require('../plugins/remote-entry-builder')

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "style-loader";

const clientPublicPath = '/static'
const serverPublicPath = '/server'

const federatedModuleConfig = {
  entry: "./noop.tsx",
  devtool: false,
  output: {
    publicPath: clientPublicPath,
    path: path.resolve(__dirname, "dist/static/app1"),
  },
  plugins: [
    new WebpackManifestPlugin(),
    new DynamicPublicPathPlugin({
      iife: `(() => "http://localhost:3001${clientPublicPath}/app1/")`,
      entry: '""'
    }),
    new webpack.container.ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      remotes: {
        app2: `app2@http://localhost:3002${clientPublicPath}/app2/remoteEntry.js`
      },
      exposes: {
        './RemoteComponent': './src/components/RemoteComponent.tsx',
        './Marketing': './src/components/marketing/index.tsx'
      },
      shared: {
        react: {
          requiredVersion: false,
          singleton: true,
        },
      },
    }),
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript' }
            }
          }
        },
        exclude: ["/node_modules/"],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, "css-loader", "sass-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  }
}
const clientConfig = {
  entry: "./src/index.ts",
  devtool: false,
  output: {
    publicPath: clientPublicPath,
    path: path.resolve(__dirname, "dist/static"),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        /**
         * need to disable default vendor chunks because it will be loaded twice.
         * 'eager' shared 'react' will be bundled in main chunk,
         * and loads dynamically imported 'vendor_react' chunk
         */
        defaultVendors: false,
        default: false
      }
    }
  },
  plugins: [
    /*
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
    */
    new WebpackManifestPlugin(),
    new DynamicPublicPathPlugin({
      iife: `(() => "http://localhost:3001${clientPublicPath}/")`,
      entry: '""'
    }),
    new webpack.container.ModuleFederationPlugin({
      remotes: {
        app2: `app2@http://localhost:3002${clientPublicPath}/app2/remoteEntry.js`
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: false,
        },
      },
    }),
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript' }
            }
          }
        },
        exclude: ["/node_modules/"],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, "css-loader", "sass-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};

const serverFederatedModuleConfig = {
  entry: "./noop.tsx",
  devtool: false,
  target: 'node',
  output: {
    chunkFormat: false, // disable default chunk format
    publicPath: `${serverPublicPath}/app1`,
    path: path.resolve(__dirname, "dist/server/app1"),
  },
  plugins: [
    new WebpackManifestPlugin(),
    new DynamicPublicPathPlugin({
      iife: `(() => "http://localhost:3001${serverPublicPath}/app1/")`,
      entry: '""'
    }),
    new webpack.container.ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      library: {
        type: 'commonjs2'
      },
      remotes: {
        app2: buildRemote(
          'app2',
          `http://localhost:3002${serverPublicPath}/app2/remoteEntry.js`
        )
      },
      exposes: {
        './RemoteComponent': './src/components/RemoteComponent.tsx',
        './Marketing': './src/components/marketing/index.tsx'
      },
      shared: {
        react: {
          import: false,
          requiredVersion: false,
          singleton: true,
        }
      },
    }),
    // limit remoteEntry cunk to be 1, because this is for server
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 2
    }),
    // needs to preload remote dependencies now remoteEntry is bundled into 1 chunk
    new PreloadRemoteDependenciesPlugin()
  
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript' }
            }
          }
        },
        exclude: ["/node_modules/"],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, "css-loader", "sass-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  }
}

const serverConfig = {
  entry: "./server.ts",
  devtool: false,
  target: 'node',
  output: {
    publicPath: serverPublicPath,
    path: path.resolve(__dirname, "dist/server"),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        /**
         * need to disable default vendor chunks because it will be loaded twice.
         * 'eager' shared 'react' will be bundled in main chunk,
         * and loads dynamically imported 'vendor_react' chunk
         */
        defaultVendors: false,
        default: false
      }
    }
  },
  plugins: [
    new WebpackManifestPlugin(),
    new DynamicPublicPathPlugin({
      iife: `(() => "http://localhost:3001${serverPublicPath}/")`,
      entry: '""'
    }),
    new webpack.container.ModuleFederationPlugin({
      remotes: {
        app2: buildRemote(
          'app2',
          `http://localhost:3002${serverPublicPath}/app2/remoteEntry.js`
        )
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: false,
        }
      },
    }),
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript' },
              target: 'es2021'
            }
          }
        },
        exclude: ["/node_modules/"],
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  externals: {
    express: 'require("express")',
    'node-fetch': 'require("node-fetch")',
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
}

module.exports = () => {
  let mode = 'development'
  if (isProduction) {
    mode = 'production'
    clientConfig.plugins.push(new MiniCssExtractPlugin());
  }
  clientConfig.mode = mode;
  serverConfig.mode = mode;
  federatedModuleConfig.mode = mode;
  serverFederatedModuleConfig.mode = mode;
  return [
    federatedModuleConfig,
    clientConfig,
    serverFederatedModuleConfig,
    serverConfig
  ];
};
