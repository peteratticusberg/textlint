// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SeverityLevel_1 = require("../shared/type/SeverityLevel");
/**
 * Filter messages by their severity.
 * @param {TextlintMessage[]} messages
 * @returns {TextlintMessage[]} filtered messages
 */
function filterWarningMessages(messages) {
    if (messages === void 0) { messages = []; }
    return messages.filter(function (message) {
        return message.severity === SeverityLevel_1.default.error;
    });
}
exports.filterWarningMessages = filterWarningMessages;
/**
 * Pass through all messages.
 * @param {TextlintMessage[]} messages
 * @returns {TextlintMessage[]}
 */
function through(messages) {
    if (messages === void 0) { messages = []; }
    return messages;
}
exports.through = through;
/**
 * Create message filter by config.quiet.
 * @param {Config} config
 * @returns {Function} filter function for messages
 */
function createSeverityFilter(config) {
    if (config.quiet) {
        return filterWarningMessages;
    }
    else {
        return through;
    }
}
exports.default = createSeverityFilter;