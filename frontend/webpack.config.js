const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const Webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
	name: 'production',
	mode: 'production',
	entry: {
		app: [
			'babel-polyfill',
			path.resolve(__dirname, 'src/client/index.jsx')
		]
	},
	output: {
		path: path.resolve(__dirname, 'public'),
		publicPath: './',
		filename: 'js/[name].[hash].min.js',
		chunkFilename: '[name].js'
	},
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: true,
				uglifyOptions: {
					compress: {
						inline: false,
						warnings: false,
						drop_console: true,
						dead_code: true
					},
				}
			}),
			new OptimizeCssAssetsPlugin({})
		],
		splitChunks: {
			cacheGroups: {
				vue: {
					test: /[\\/]node_modules[\\/](vue|vue-loader|vue-router|vuex)[\\/]/,
					name: 'vue',
					chunks: 'all'
				},
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: 'commons',
					chunks: 'all',
					filename: 'js/commons.[hash].min.js',
				}
			}
		}
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env']
						}
					}
				],
				exclude: /node_modules/
			},
			{
				test: /\.vue$/,
				use: 'vue-loader'
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader'
				]
			}
		]
	},
	plugins: [
		new Webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new MiniCssExtractPlugin({
			filename: 'css/[name].[contenthash].min.css'
		}),
		new CompressionPlugin({
			filename: '[path]/[name].min.gz'
		})
	]

};