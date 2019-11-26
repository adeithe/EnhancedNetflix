const {CheckerPlugin} = require('awesome-typescript-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Path = require('path');

const config = {
	mode: process.env.NODE_ENV,
	devtool: false,
	module: { rules: [] },
	plugins: [],
	optimization: {}
};

// ==============
// ENTRY / OUTPUT
// ==============
config.entry = {
	content_script: Path.join(__dirname, './src/injector.ts'),
	enhancement: Path.join(__dirname, './src/index.ts')
};

config.output = {
	path: Path.join(__dirname, 'dist'),
	filename: '[name].js'
};

// ============
// MODULE RULES
// ============
config.module.rules.push(
	{
		test: /\.tsx?$/,
		exclude: /node_modules/,
		loader: 'awesome-typescript-loader?{configFileName: "tsconfig.json"}'
	},
	{
		test: /\.s?[ca]ss$/,
		use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
	}
);

// =======
// PLUGINS
// =======
config.plugins.push(
	new CheckerPlugin(),
	new MiniCssExtractPlugin({
		filename: '[name].css',
		chunkFilename: '[id].css'
	}),
	new Webpack.optimize.AggressiveMergingPlugin(),
	new Webpack.optimize.OccurrenceOrderPlugin(),
	new CopyWebpackPlugin([
		Path.join(__dirname, './src/data'),
		Path.join(__dirname, './src/manifest.json')
	])
);

// ===================
// RESOLVE DIRECTORIES
// ===================
config.resolve = {
	extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css'],
	modules: ['node_modules']
};

module.exports = config;