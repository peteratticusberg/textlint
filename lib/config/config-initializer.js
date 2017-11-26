// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var fs = require("fs");
var path = require("path");
var ObjectAssign = require("object-assign");
var isFile = require("is-file");
var readPkg = require("read-pkg");
var config_1 = require("./config");
var logger_1 = require("../util/logger");
/**
 * read package.json if found it
 * @param {string} dir
 * @returns {Promise.<Array.<String>>}
 */
var getTextlintDependencyNames = function (dir) {
    return readPkg(dir)
        .then(function (pkg) {
        var dependencies = pkg.dependencies || {};
        var devDependencies = pkg.devDependencies || {};
        var mergedDependencies = ObjectAssign({}, dependencies, devDependencies);
        var pkgNames = Object.keys(mergedDependencies);
        return pkgNames.filter(function (pkgName) {
            var ruleOrFilter = pkgName.indexOf(config_1.Config.FILTER_RULE_NAME_PREFIX) !== -1 ||
                pkgName.indexOf(config_1.Config.RULE_NAME_PREFIX) !== -1;
            if (pkgName === "textlint-rule-helper") {
                return false;
            }
            return ruleOrFilter;
        });
    })
        .catch(function () {
        return [];
    });
};
/**
 * create object that fill with `defaultValue`
 * @param {Array} array
 * @param {*} defaultValue
 * @returns {Object}
 */
var arrayToObject = function (array, defaultValue) {
    var object = {};
    array.forEach(function (item) {
        object[item] = defaultValue;
    });
    return object;
};
/**
 * Initializer class for config of textlint.
 */
exports.configInit = {
    /**
     * Create .textlintrc file
     * @params {string} dir The directory of .textlintrc file
     * @returns {Promise.<number>} The exit code for the operation.
     */
    initializeConfig: function (dir) {
        return getTextlintDependencyNames(dir).then(function (pkgNames) {
            var rcFile = "." + config_1.Config.CONFIG_FILE_NAME + "rc";
            var filePath = path.resolve(dir, rcFile);
            if (isFile(filePath)) {
                logger_1.Logger.error(rcFile + " is already existed.");
                return Promise.resolve(1);
            }
            var filters = pkgNames
                .filter(function (pkgName) {
                return pkgName.indexOf(config_1.Config.FILTER_RULE_NAME_PREFIX) !== -1;
            })
                .map(function (filterName) {
                return filterName.replace(config_1.Config.FILTER_RULE_NAME_PREFIX, "");
            });
            var rules = pkgNames
                .filter(function (pkgName) {
                return pkgName.indexOf(config_1.Config.RULE_NAME_PREFIX) !== -1;
            })
                .map(function (filterName) {
                return filterName.replace(config_1.Config.RULE_NAME_PREFIX, "");
            });
            var defaultTextlintRc = {
                filters: arrayToObject(filters, true),
                rules: arrayToObject(rules, true)
            };
            var output = JSON.stringify(defaultTextlintRc, null, 2);
            fs.writeFileSync(filePath, output);
            return Promise.resolve(0);
        });
    }
};