// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var path = require("path");
var tryResolve = require("try-resolve");
var debug = require("debug")("textlint:module-resolver");
var validateConfigConstructor = function (ConfigConstructor) {
    assert(ConfigConstructor.CONFIG_PACKAGE_PREFIX &&
        ConfigConstructor.FILTER_RULE_NAME_PREFIX &&
        ConfigConstructor.RULE_NAME_PREFIX &&
        ConfigConstructor.RULE_PRESET_NAME_PREFIX &&
        ConfigConstructor.PLUGIN_NAME_PREFIX);
};
/**
 * Create full package name and return
 * @param {string} prefix
 * @param {string} name
 * @returns {string}
 */
exports.createFullPackageName = function (prefix, name) {
    if (name.charAt(0) === "@") {
        var scopedPackageNameRegex = new RegExp("^" + prefix + "(-|$)");
        // if @scope/<name> -> @scope/<prefix><name>
        if (!scopedPackageNameRegex.test(name.split("/")[1])) {
            /*
             * for scoped packages, insert the textlint-rule after the first / unless
             * the path is already @scope/<name> or @scope/textlint-rule-<name>
             */
            return name.replace(/^@([^/]+)\/(.*)$/, "@$1/" + prefix + "$2");
        }
    }
    return "" + prefix + name;
};
/**
 * This class aim to resolve textlint's package name and get the module path.
 *
 * Define
 *
 * - `package` is npm package
 * - `module` is package's main module
 *
 * ## Support
 *
 * - textlint-rule-*
 * - textlint-preset-*
 * - textlint-plugin-*
 * - textlint-config-*
 */
var TextLintModuleResolver = /** @class */ (function () {
    /**
     *
     * @param {Config|*} ConfigConstructor config constructor like object
     * It has static property like CONFIG_PACKAGE_PREFIX etc...
     * @param {string} [baseDirectory]
     * @constructor
     */
    function TextLintModuleResolver(ConfigConstructor, baseDirectory) {
        if (baseDirectory === void 0) { baseDirectory = ""; }
        validateConfigConstructor(ConfigConstructor);
        /**
         * @type {string} config package prefix
         */
        this.CONFIG_PACKAGE_PREFIX = ConfigConstructor.CONFIG_PACKAGE_PREFIX;
        /**
         * @type {string} rule package's name prefix
         */
        this.RULE_NAME_PREFIX = ConfigConstructor.RULE_NAME_PREFIX;
        /**
         * @type {string} filter rule package's name prefix
         */
        this.FILTER_RULE_NAME_PREFIX = ConfigConstructor.FILTER_RULE_NAME_PREFIX;
        /**
         * @type {string} rule preset package's name prefix
         */
        this.RULE_PRESET_NAME_PREFIX = ConfigConstructor.RULE_PRESET_NAME_PREFIX;
        /**
         * @type {string} plugins package's name prefix
         */
        this.PLUGIN_NAME_PREFIX = ConfigConstructor.PLUGIN_NAME_PREFIX;
        /**
         * @type {string} baseDirectory for resolving
         */
        this.baseDirectory = baseDirectory;
    }
    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    TextLintModuleResolver.prototype.resolveRulePackageName = function (packageName) {
        var baseDir = this.baseDirectory;
        var PREFIX = this.RULE_NAME_PREFIX;
        var fullPackageName = exports.createFullPackageName(PREFIX, packageName);
        // <rule-name> or textlint-rule-<rule-name>
        var pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            debug("rule fullPackageName: " + fullPackageName);
            throw new ReferenceError("Failed to load textlint's rule module: \"" + packageName + "\" is not found.\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md\n");
        }
        return pkgPath;
    };
    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    TextLintModuleResolver.prototype.resolveFilterRulePackageName = function (packageName) {
        var baseDir = this.baseDirectory;
        var PREFIX = this.FILTER_RULE_NAME_PREFIX;
        var fullPackageName = exports.createFullPackageName(PREFIX, packageName);
        // <rule-name> or textlint-filter-rule-<rule-name> or @scope/<rule-name>
        var pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            debug("filter rule fullPackageName: " + fullPackageName);
            throw new ReferenceError("Failed to load textlint's filter rule module: \"" + packageName + "\" is not found.\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md\n");
        }
        return pkgPath;
    };
    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    TextLintModuleResolver.prototype.resolvePluginPackageName = function (packageName) {
        var baseDir = this.baseDirectory;
        var PREFIX = this.PLUGIN_NAME_PREFIX;
        var fullPackageName = exports.createFullPackageName(PREFIX, packageName);
        // <plugin-name> or textlint-plugin-<rule-name>
        var pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            debug("plugin fullPackageName: " + fullPackageName);
            throw new ReferenceError("Failed to load textlint's plugin module: \"" + packageName + "\" is not found.\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md\n");
        }
        return pkgPath;
    };
    /**
     * Take package name, and return path to module.
     * @param {string} packageName
     * The user must specify preset- prefix to these `packageName`.
     * @returns {string} return path to module
     */
    TextLintModuleResolver.prototype.resolvePresetPackageName = function (packageName) {
        var baseDir = this.baseDirectory;
        var PREFIX = this.RULE_PRESET_NAME_PREFIX;
        /* Implementation Note
    
        preset name is defined in config file:
        In the case, `packageName` is "preset-gizmo"
        TextLintModuleResolver resolve "preset-gizmo" to "textlint-rule-preset-gizmo"
        {
            "rules": {
                "preset-gizmo": {
                    "ruleA": false
                }
            }
        }
         */
        // preset-<name> or textlint-rule-preset-<name>
        // @scope/preset-<name> or @scope/textlint-rule-preset-<name>
        var packageNameWithoutPreset = packageName
            .replace(/^preset-/, "")
            .replace(/^@([^/]+)\/preset-(.*)$/, "@$1/$2");
        var fullPackageName = exports.createFullPackageName(PREFIX, packageNameWithoutPreset);
        var fullFullPackageName = "" + PREFIX + packageNameWithoutPreset;
        // preset-<preset-name> or textlint-rule-preset-<preset-name>
        var pkgPath = tryResolve(path.join(baseDir, fullFullPackageName)) ||
            tryResolve(path.join(baseDir, packageNameWithoutPreset)) ||
            // <preset-name> or textlint-rule-preset-<rule-name>
            tryResolve(path.join(baseDir, fullPackageName)) ||
            tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            debug("preset fullPackageName: " + fullPackageName);
            debug("preset fullFullPackageName: " + fullFullPackageName);
            throw new ReferenceError("Failed to load textlint's preset module: \"" + packageName + "\" is not found.\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md\n");
        }
        return pkgPath;
    };
    /**
     * Take Config package name, and return path to module.
     * @param {string} packageName
     * @returns {string} return path to module
     */
    TextLintModuleResolver.prototype.resolveConfigPackageName = function (packageName) {
        var baseDir = this.baseDirectory;
        var PREFIX = this.CONFIG_PACKAGE_PREFIX;
        var fullPackageName = exports.createFullPackageName(PREFIX, packageName);
        // <plugin-name> or textlint-config-<rule-name>
        var pkgPath = tryResolve(path.join(baseDir, fullPackageName)) || tryResolve(path.join(baseDir, packageName));
        if (!pkgPath) {
            throw new ReferenceError("Failed to load textlint's config module: \"" + packageName + "\" is not found.\nSee FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/failed-to-load-textlints-module.md\n");
        }
        return pkgPath;
    };
    return TextLintModuleResolver;
}());
exports.TextLintModuleResolver = TextLintModuleResolver;