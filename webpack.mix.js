let mix = require('laravel-mix');

mix.webpackConfig({
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: Config.babel()
                    }
                ]
            }
        ]
    }
});

mix.sass('__source/__styles/admin.sass', 'assets/css/fewoadminstyle.css')
    .sass('__source/__styles/frontend.sass', 'assets/css/fewostyle.css')
    .react('__source/__scripts/admin.js', 'assets/js/fewoadminscript.js')
    .react('__source/__scripts/frontend.js', 'assets/js/fewoscript.js');
