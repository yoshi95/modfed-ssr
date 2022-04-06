// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DynamicPublicPathPlugin = require('../plugins/dynamic-public-path-plugin')
const webpack = require('webpack')

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

const buildRemote = (name, url) => `promise new Promise((resolve, reject) => {
  const fetch = require('fetch');
  const vm = require('vm');
  fetch('${url}')
    .then(res => res.text())
    .then(code => {
      const context = {};
      const script = new vm.Script(
        code, 
        { filename: 'remote-entry-${name}.js' }
      )
      script.runInContext(context);
      resolve(context['${name}'])
    })
    .catch(err => reject(err))
})`
const serverFederatedModuleConfig = {
  entry: "./noop.tsx",
  devtool: false,
  target: 'async-node',
  output: {
    chunkFormat: 'commonjs',
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
          requiredVersion: false,
          singleton: true,
        },
        'react-dom/server': {
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
    /*
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
        },
        'react-dom/server': {
          singleton: true,
          eager: true,
          requiredVersion: false,
        },
      },
    }),
    */
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
    // react: 'require("react")',
    // 'react-dom/server': 'require("react-dom/server")'
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      'app2/useApp2ConsoleMessage': path.resolve(__dirname, './noop.tsx'),
    }
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
  return [
    federatedModuleConfig,
    clientConfig,
    serverConfig
  ];
};
