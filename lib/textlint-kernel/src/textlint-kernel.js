// MIT © 2017 azu
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var source_code_1 = require("./core/source-code");
// sequence
var fixer_processor_1 = require("./fixer/fixer-processor");
// parallel
var linter_processor_1 = require("./linter/linter-processor");
// message process manager
var MessageProcessManager_1 = require("./messages/MessageProcessManager");
var filter_ignored_process_1 = require("./messages/filter-ignored-process");
var filter_duplicated_process_1 = require("./messages/filter-duplicated-process");
var filter_severity_process_1 = require("./messages/filter-severity-process");
var sort_messages_process_1 = require("./messages/sort-messages-process");
/**
 * @param {TextlintKernelPlugin[]} plugins
 * @param {string} ext
 * @returns {TextlintKernelPlugin|undefined} PluginConstructor
 */
function findPluginWithExt(plugins, ext) {
    if (plugins === void 0) { plugins = []; }
    var availablePlugins = plugins.filter(function (kernelPlugin) {
        var plugin = kernelPlugin.plugin;
        assert.ok(plugin !== undefined, "Processor(" + kernelPlugin.pluginId + " should have { \"pluginId\": string, \"plugin\": plugin }.");
        var options = kernelPlugin.options;
        return options !== false;
    });
    var matchPlugins = availablePlugins.filter(function (kernelPlugin) {
        var plugin = kernelPlugin.plugin;
        // static availableExtensions() method
        var textlintKernelProcessor = plugin.Processor;
        assert.ok(typeof textlintKernelProcessor.availableExtensions === "function", "Processor(" + textlintKernelProcessor.name + " should have availableExtensions()");
        var extList = textlintKernelProcessor.availableExtensions();
        return extList.some(function (targetExt) { return targetExt === ext || "." + targetExt === ext; });
    });
    if (matchPlugins.length === 0) {
        return;
    }
    return matchPlugins[0];
}
/**
 * add fileName to trailing of error message
 * @param {string|undefined} fileName
 * @param {string} message
 * @returns {string}
 */
function addingAtFileNameToError(fileName, message) {
    if (!fileName) {
        return message;
    }
    return message + "\nat " + fileName;
}
/**
 * TextlintKernel is core logic written by pure JavaScript.
 *
 * Pass
 *
 * - config
 * - plugins
 * - rules
 * - filterRules
 * - messageProcessor
 *
 */
var TextlintKernel = /** @class */ (function () {
    /**
     * @param config
     */
    function TextlintKernel(config) {
        if (config === void 0) { config = {}; }
        // this.config often is undefined.
        this.config = config;
        // Initialize Message Processor
        // Now, It it built-in process only
        // filter `shouldIgnore()` results
        this.messageProcessManager = new MessageProcessManager_1.default([filter_ignored_process_1.default]);
        // filter duplicated messages
        this.messageProcessManager.add(filter_duplicated_process_1.default);
        // filter by severity
        this.messageProcessManager.add(filter_severity_process_1.default(this.config));
        this.messageProcessManager.add(sort_messages_process_1.default);
    }
    /**
     * lint text by registered rules.
     * The result contains target filePath and error messages.
     * @param {string} text
     * @param {Object} options linting options
     * @returns {Promise.<TextlintResult>}
     */
    TextlintKernel.prototype.lintText = function (text, options) {
        var _this = this;
        return Promise.resolve().then(function () {
            var ext = options.ext;
            var plugin = findPluginWithExt(options.plugins, ext);
            if (plugin === undefined) {
                throw new Error("Not found available plugin for " + ext);
            }
            var Processor = plugin.plugin.Processor;
            var pluginOptions = plugin.options;
            assert(Processor !== undefined, "This plugin has not Processor: " + plugin);
            var processor = new Processor(pluginOptions);
            return _this._parallelProcess({
                processor: processor,
                text: text,
                options: options
            });
        });
    };
    /**
     * fix texts and return fix result object
     * @param {string} text
     * @param {Object} options lint options
     * @returns {Promise.<TextlintFixResult>}
     */
    TextlintKernel.prototype.fixText = function (text, options) {
        var _this = this;
        return Promise.resolve().then(function () {
            var ext = options.ext;
            var plugin = findPluginWithExt(options.plugins, ext);
            if (plugin === undefined) {
                throw new Error("Not found available plugin for " + ext);
            }
            var Processor = plugin.plugin.Processor;
            var pluginOptions = plugin.options;
            assert(Processor !== undefined, "This plugin has not Processor: " + plugin);
            var processor = new Processor(pluginOptions);
            return _this._sequenceProcess({
                processor: processor,
                text: text,
                options: options
            });
        });
    };
    /**
     * process text in parallel for Rules and return {Promise.<TextLintResult>}
     * In other word, parallel flow process.
     * @param {*} processor
     * @param {string} text
     * @param {Object} options
     * @returns {Promise.<TextlintResult>}
     * @private
     */
    TextlintKernel.prototype._parallelProcess = function (_a) {
        var processor = _a.processor, text = _a.text, options = _a.options;
        var ext = options.ext, filePath = options.filePath, rules = options.rules, filterRules = options.filterRules, configBaseDir = options.configBaseDir;
        var _b = processor.processor(ext), preProcess = _b.preProcess, postProcess = _b.postProcess;
        assert(typeof preProcess === "function" && typeof postProcess === "function", "processor should implement {preProcess, postProcess}");
        var ast = preProcess(text, filePath);
        var sourceCode = new source_code_1.default({
            text: text,
            ast: ast,
            ext: ext,
            filePath: filePath
        });
        var linterProcessor = new linter_processor_1.default(processor, this.messageProcessManager);
        return linterProcessor
            .process({
            config: this.config,
            rules: rules,
            filterRules: filterRules,
            sourceCode: sourceCode,
            configBaseDir: configBaseDir
        })
            .catch(function (error) {
            error.message = addingAtFileNameToError(filePath, error.message);
            return Promise.reject(error);
        });
    };
    /**
     * process text in series for Rules and return {Promise.<TextlintFixResult>}
     * In other word, sequence flow process.
     * @param {*} processor
     * @param {string} text
     * @param {TextlintKernelOptions} options
     * @returns {Promise.<TextlintFixResult>}
     * @private
     */
    TextlintKernel.prototype._sequenceProcess = function (_a) {
        var processor = _a.processor, text = _a.text, options = _a.options;
        var ext = options.ext, filePath = options.filePath, rules = options.rules, filterRules = options.filterRules, configBaseDir = options.configBaseDir;
        assert(processor, "processor is not found for " + ext);
        var _b = processor.processor(ext), preProcess = _b.preProcess, postProcess = _b.postProcess;
        assert(typeof preProcess === "function" && typeof postProcess === "function", "processor should implement {preProcess, postProcess}");
        var ast = preProcess(text, filePath);
        var sourceCode = new source_code_1.default({
            text: text,
            ast: ast,
            ext: ext,
            filePath: filePath
        });
        var fixerProcessor = new fixer_processor_1.default(processor, this.messageProcessManager);
        return fixerProcessor
            .process({
            config: this.config,
            rules: rules,
            filterRules: filterRules,
            sourceCode: sourceCode,
            configBaseDir: configBaseDir
        })
            .catch(function (error) {
            error.message = addingAtFileNameToError(filePath, error.message);
            return Promise.reject(error);
        });
    };
    return TextlintKernel;
}());
exports.TextlintKernel = TextlintKernel;