// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_util_1 = require("../util/config-util");
/**
 * Get rule keys from `.textlintrc` config object.
 * @param {Object} [rulesConfig]
 * @returns {{available: string[], disable: string[]}}
 */
function separateAvailableOrDisable(rulesConfig) {
    var ruleOf = {
        presets: [],
        available: [],
        disable: []
    };
    if (!rulesConfig) {
        return ruleOf;
    }
    Object.keys(rulesConfig).forEach(function (key) {
        // `textlint-rule-preset-XXX`
        if (config_util_1.isPresetRuleKey(key)) {
            if (typeof rulesConfig[key] === "object" || rulesConfig[key] === true) {
                ruleOf.presets.push(key);
            }
            return;
        }
        // `<plugin>/<rule-key>` should ignored
        if (config_util_1.isPluginRuleKey(key)) {
            return;
        }
        // ignore `false` value
        if (typeof rulesConfig[key] === "object" || rulesConfig[key] === true) {
            ruleOf.available.push(key);
        }
        else {
            ruleOf.disable.push(key);
        }
    });
    return ruleOf;
}
exports.separateAvailableOrDisable = separateAvailableOrDisable;