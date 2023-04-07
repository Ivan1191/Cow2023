var path = require('path');
var webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
    context: __dirname,
    entry: {
        signin: './src/signin.js',
        farm: './src/farm/farm.js',
        farm_create: './src/farm/create.js',
        farm_edit: './src/farm/edit.js',
        ghelper: './src/ghelper.js',

        pro: './src/pro/pro.js',

        user: './src/user/user.js',
        user_create: './src/user/create.js',
        user_edit: './src/user/edit.js',

        role_manage: './src/role_manage.js',
        chart: './src/chart.js',
        profile: './src/profile.js',
        backstage: './src/backstage.js',

        audio_list: './src/audio/list.js',
        audio_editor: './src/audio/editor.js',
        temperature: './src/temperature.js',
        live: './src/live.js',
        alarmrecord: './src/alarmrecord.js',
        audioplayback: './src/audioplayback.js',

        audioClassManage: './src/audioClassManage/audioClassManage.js',
        audioClassManage_create: './src/audioClassManage/create.js',
        audioClassManage_edit: './src/audioClassManage/edit.js',
    },

    output: {
        path: path.resolve(__dirname, './public/build'),
        filename: '[name].bundle.js'
    },

    module: {
        loaders: [
        //     {
        //     test: /\.js$/,
        //     loaders: ['babel-loader?' + JSON.stringify({
        //         cacheDirectory: true,
        //         plugins: ["transform-class-properties", "add-module-exports"],
        //         presets: [
        //             'es2015',
        //             'stage-0'
        //         ],
        //     })],
        //     exclude: /node_modules/,
        // },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            }
        ]
    },

    resolve: {
        modules: [path.resolve(__dirname, './src'), path.resolve(__dirname, './public'), 'node_modules'],
        extensions: [".js", ".css"],
    },

    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new UglifyJSPlugin({parallel:true,test: /\.js$/, exclude: /node_modules/,}),
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
        })
    ]
};
