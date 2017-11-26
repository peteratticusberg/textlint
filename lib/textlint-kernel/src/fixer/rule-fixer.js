"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
/**
 * Fix Command object has `range` and `text`.
 * @typedef {Object} FixCommand
 * @property {number[]} range range is an array of numbers : [start, end]
 * @property {string} text text is replace value.
 * @property {boolean} isAbsolute if `range` is relative, should be `false`
 */
/**
 * Creates a fix command that inserts text at the specified index in the source text.
 * @param {number} index The 0-based index at which to insert the new text.
 * @param {string} text The text to insert.
 * @returns {FixCommand} The fix command.
 * @private
 */
function insertTextAt(index, text) {
    assert(text, "text must be string");
    return {
        range: [index, index],
        text: text,
        isAbsolute: false
    };
}
/**
 * Creates a fix command that inserts text at the specified index in the source text.
 * @param {number} index The 0-based index at which to insert the new text.
 * @param {string} text The text to insert.
 * @returns {FixCommand} The fix command.
 * @private
 */
function insertTextAtAbsolute(index, text) {
    assert(text, "text must be string");
    return {
        range: [index, index],
        text: text,
        isAbsolute: true
    };
}
/**
 * Creates code fixing commands for rules.
 * It create command for fixing texts.
 * The `range` arguments of these command is should be **relative** value from reported node.
 * See {@link SourceLocation} class for more detail.
 * @constructor
 */
var RuleFixer = /** @class */ (function () {
    function RuleFixer() {
    }
    /**
     * Creates a fix command that inserts text after the given node or token.
     * The fix is not applied until applyFixes() is called.
     * @param {TxtNode} node The node or token to insert after.
     * @param {string} text The text to insert.
     * @returns {FixCommand} The fix command.
     */
    RuleFixer.prototype.insertTextAfter = function (node, text) {
        return insertTextAtAbsolute(node.range[1], text);
    };
    /**
     * Creates a fix command that inserts text after the specified range in the source text.
     * The fix is not applied until applyFixes() is called.
     * @param {number[]} range The range to replace, first item is start of range, second
     *      is end of range.
     *      The `range` should be **relative** value from reported node.
     * @param {string} text The text to insert.
     * @returns {FixCommand} The fix command.
     */
    RuleFixer.prototype.insertTextAfterRange = function (range, text) {
        return insertTextAt(range[1], text);
    };
    /**
     * Creates a fix command that inserts text before the given node or token.
     * The fix is not applied until applyFixes() is called.
     * @param {TxtNode} node The node or token to insert before.
     * @param {string} text The text to insert.
     * @returns {FixCommand} The fix command.
     */
    RuleFixer.prototype.insertTextBefore = function (node, text) {
        return insertTextAtAbsolute(node.range[0], text);
    };
    /**
     * Creates a fix command that inserts text before the specified range in the source text.
     * The fix is not applied until applyFixes() is called.
     * @param {number[]} range The range to replace, first item is start of range, second
     *      is end of range.
     *      The `range` should be **relative** value from reported node.
     * @param {string} text The text to insert.
     * @returns {FixCommand} The fix command.
     */
    RuleFixer.prototype.insertTextBeforeRange = function (range, text) {
        return insertTextAt(range[0], text);
    };
    /**
     * Creates a fix command that replaces text at the node or token.
     * The fix is not applied until applyFixes() is called.
     * @param {TxtNode} node The node or token to remove.
     * @param {string} text The text to insert.
     * @returns {FixCommand} The fix command.
     */
    RuleFixer.prototype.replaceText = function (node, text) {
        return {
            range: node.range,
            text: text,
            isAbsolute: true
        };
    };
    /**
     * Creates a fix command that replaces text at the specified range in the source text.
     * The fix is not applied until applyFixes() is called.
     * @param {number[]} range The range to replace, first item is start of range, second
     *      is end of range.
     *      The `range` should be **relative** value from reported node.
     * @param {string} text The text to insert.
     * @returns {FixCommand} The fix command.
     */
    RuleFixer.prototype.replaceTextRange = function (range, text) {
        return {
            range: range,
            text: text,
            isAbsolute: false
        };
    };
    /**
     * Creates a fix command that removes the node or token from the source.
     * The fix is not applied until applyFixes() is called.
     * @param {TxtNode} node The node or token to remove.
     * @returns {FixCommand} The fix command.
     */
    RuleFixer.prototype.remove = function (node) {
        return this.replaceText(node, "");
    };
    /**
     * Creates a fix command that removes the specified range of text from the source.
     * The fix is not applied until applyFixes() is called.
     * @param {number[]} range The range to remove, first item is start of range, second
     *      is end of range.
     *      The `range` should be **relative** value from reported node.
     * @returns {FixCommand} The fix command.
     */
    RuleFixer.prototype.removeRange = function (range) {
        return this.replaceTextRange(range, "");
    };
    return RuleFixer;
}());
exports.default = RuleFixer;