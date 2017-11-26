// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageType_1 = require("../shared/type/MessageType");
/**
 * the `index` is in the `range` and return true.
 * @param {Number} index
 * @param {Number[]} range
 * @returns {boolean}
 */
var isContainedRange = function (index, range) {
    var start = range[0], end = range[1];
    return start <= index && index <= end;
};
/**
 * filter messages by ignore messages
 * @param {Object[]} messages
 * @returns {Object[]} filtered messages
 */
function filterMessages(messages) {
    if (messages === void 0) { messages = []; }
    var lintingMessages = messages.filter(function (message) {
        return message.type === MessageType_1.default.lint;
    });
    var ignoreMessages = messages.filter(function (message) {
        return message.type === MessageType_1.default.ignore;
    });
    // if match, reject the message
    return lintingMessages.filter(function (message) {
        return !ignoreMessages.some(function (ignoreMessage) {
            var isInIgnoringRange = isContainedRange(message.index, ignoreMessage.range);
            if (isInIgnoringRange && ignoreMessage.ignoringRuleId) {
                // "*" is wildcard that match any rule
                if (ignoreMessage.ignoringRuleId === "*") {
                    return true;
                }
                return message.ruleId === ignoreMessage.ignoringRuleId;
            }
            return isInIgnoringRange;
        });
    });
}
exports.default = filterMessages;