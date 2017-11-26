/// <reference types="node" />
import { EventEmitter } from "events";
import { TextLintModuleResolver } from "./textlint-module-resolver";
import { Config } from "../config/config";
export declare class TextLintModuleLoader extends EventEmitter {
    moduleResolver: TextLintModuleResolver;
    config: any;
    static readonly Event: {
        rule: string;
        filterRule: string;
        plugin: string;
        error: string;
    };
    constructor(config: Config);
    /**
     * set up lint rules using {@lint Config} object.
     * The {@lint Config} object was created with initialized {@link TextLintEngine} (as-known Constructor).
     * @param {Config} config the config is parsed object
     */
    loadFromConfig(config: Config): void;
    /**
     * load rule from plugin name.
     * plugin module has `rules` object and define rule with plugin prefix.
     * @param {string} pluginName
     */
    loadPlugin(pluginName: string): void;
    loadPreset(presetName: string): void;
    /**
     * load rule file with `ruleName` and define rule.
     * if rule is not found, then throw ReferenceError.
     * if already rule is loaded, do not anything.
     * @param {string} ruleName
     */
    loadRule(ruleName: string): void;
    /**
     * load filter rule file with `ruleName` and define rule.
     * if rule is not found, then throw ReferenceError.
     * if already rule is loaded, do not anything.
     * @param {string} ruleName
     */
    loadFilterRule(ruleName: string): void;
}