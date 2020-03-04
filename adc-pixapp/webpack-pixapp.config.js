const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: ['./src/app.js', './css/main.scss'],
	output: {
		path: __dirname + '/dist',
		filename: 'main.js'
	},
	module: {
		rules: [{
			test: /\.(js|jsx)$/,
			exclude: /node_modules/,
			use: ['babel-loader']
		}, {
			test: /\.scss$/,
			use: [
				MiniCssExtractPlugin.loader,
				'css-loader', // translates CSS into CommonJS
				'sass-loader' // compiles Sass to CSS, using Node Sass by default
			]
		}, {
			test: /\.(jpg|png|svg|gif)$/,
            use: [{
				loader: 'url-loader',
				options: { limit: 8192 }
            }]
		}]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'main.css',
			chunkFilename: '[id].css'
		}),
	]
}