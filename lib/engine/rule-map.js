// LICENSE : MIT
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var map_like_1 = require("map-like");
/**
 * @typedef {{key: Function}} RulesObject
 */
var RuleMap = /** @class */ (function (_super) {
    __extends(RuleMap, _super);
    function RuleMap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * has rule at least one > 0
     * @returns {boolean}
     */
    RuleMap.prototype.hasRuleAtLeastOne = function () {
        return this.keys().length > 0;
    };
    RuleMap.prototype.getAllRuleNames = function () {
        return this.keys();
    };
    RuleMap.prototype.getRule = function (ruleKey) {
        return this.get(ruleKey);
    };
    /**
     * @returns {RulesObject}
     */
    RuleMap.prototype.getAllRules = function () {
        return this.toJSON();
    };
    RuleMap.prototype.isDefinedRule = function (ruleKey) {
        return this.has(ruleKey);
    };
    /**
     * @param {string} ruleKey
     * @param ruleHandler
     */
    RuleMap.prototype.defineRule = function (ruleKey, ruleHandler) {
        this.set(ruleKey, ruleHandler);
    };
    /**
     * reset defined rules
     */
    RuleMap.prototype.resetRules = function () {
        this.clear();
    };
    RuleMap.prototype.toJSON = function () {
        var object = {};
        this.forEach(function (value, key) {
            object[key] = value;
        });
        return object;
    };
    return RuleMap;
}(map_like_1.MapLike));
exports.RuleMap = RuleMap;