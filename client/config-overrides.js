const rewireMobX = require('react-app-rewire-mobx');
const rewireCssModules = require('react-app-rewire-css-modules');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const rewireHtml = (config, env) => {
    // ensure that built script is injected in head rather than the body
    // so that the exported function is present in the script tag in the body
    const HtmlPlugin = config.plugins.filter(plugin => 
            plugin.constructor.name === 'HtmlWebpackPlugin')[0];
    HtmlPlugin.options.inject = 'head';
    return config;
}

module.exports = function override(config, env) {
    config = rewireMobX(config, env);
    config = rewireCssModules(config, env);
    if (env === 'production') {
        config.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false
        }));
    }
    config = rewireHtml(config, env);
    return config;
}
