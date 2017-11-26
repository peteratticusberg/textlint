// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interopRequire = require("interop-require");
var debug = require("debug")("textlint:plugin-loader");
var assert = require("assert");
/**
 * get plugin names from `configFileRaw` object
 * @param configFileRaw
 * @returns {Array}
 */
function getPluginNames(configFileRaw) {
    var plugins = configFileRaw.plugins;
    if (!plugins) {
        return [];
    }
    if (Array.isArray(plugins)) {
        return plugins;
    }
    return Object.keys(plugins);
}
exports.getPluginNames = getPluginNames;
/**
 * get pluginConfig object from `configFileRaw` that is loaded .textlintrc
 * @param {Object} configFileRaw
 * @returns {Object}
 * @example
 * ```js
 * "plugins": {
 *   "pluginA": {},
 *   "pluginB": {}
 * }
 * ```
 *
 * to
 *
 * ```js
 * {
 *   "pluginA": {},
 *   "pluginB": {}
 * }
 * ```
 *
 *
 *
 * ```js
 * "plugins": ["pluginA", "pluginB"]
 * ```
 *
 * to
 *
 * ```
 * // `true` means turn on
 * {
 *   "pluginA": true,
 *   "pluginB": true
 * }
 * ```
 */
function getPluginConfig(configFileRaw) {
    var plugins = configFileRaw.plugins;
    if (!plugins) {
        return {};
    }
    if (Array.isArray(plugins)) {
        if (plugins.length === 0) {
            return {};
        }
        // { "pluginA": true, "pluginB": true }
        return plugins.reduce(function (results, pluginName) {
            results[pluginName] = true;
            return results;
        }, {});
    }
    return plugins;
}
exports.getPluginConfig = getPluginConfig;
function loadAvailableExtensions(pluginNames, moduleResolver) {
    if (pluginNames === void 0) { pluginNames = []; }
    var availableExtensions = [];
    pluginNames.forEach(function (pluginName) {
        var pkgPath = moduleResolver.resolvePluginPackageName(pluginName);
        var plugin = interopRequire(pkgPath);
        if (!plugin.hasOwnProperty("Processor")) {
            return;
        }
        var Processor = plugin.Processor;
        debug(pluginName + " has Processor");
        assert(typeof Processor.availableExtensions === "function", "Processor.availableExtensions() should be implemented");
        availableExtensions.push.apply(availableExtensions, Processor.availableExtensions());
    });
    return availableExtensions;
}
exports.loadAvailableExtensions = loadAvailableExtensions;