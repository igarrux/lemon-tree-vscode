import * as vscode from "vscode";
import * as fs from "fs";
import * as yaml from "yaml";
import { Toast } from "../../_util/toast/toast";
import { LemonTreeConfig } from "../../types/lemon-tree-config.type";
import { logger } from "../../_logger/logger";

/**
 * Get the lemon-tree configuration from the lemon-tree.yaml file
 * @returns The lemon-tree configuration
 */
export class GetConfig {
	private static subscribers = new Map<
		string,
		(config: LemonTreeConfig | {}) => void
	>();

	static watcher: vscode.FileSystemWatcher | null = null;
	private static cachedConfig: LemonTreeConfig | null = null;

	static get directory() {
		return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	}

	static get path() {
		return `${this.directory}/lemon-tree.yaml`;
	}

	/**
	 * Subscribe to changes in lemon-tree.yaml configuration.
	 * This will create a file watcher if it doesn't exist.
	 * The listener will be called with the updated configuration.
	 * It returns a function to unsubscribe from the changes.
	 * @param listener Callback to invoke when configuration changes
	 * @returns  Function to unsubscribe from the changes
	 * @example
	 * ```ts
	 * const unsubscribe = GetConfig.subscribeToConfig((config) => {
	 *   console.log("Configuration changed:", config);
	 *   return () => console.log("Unsubscribed from config changes");
	 * });
	 * // Later, to unsubscribe
	 * unsubscribe();
	 * ```
	 * @memberof GetConfig
	 * @static
	 * @throws {Error} If lemon-tree.yaml file is not found or is not a valid YAML file
	 * @throws {Error} If there are no permissions to read the lemon-tree.yaml file
	 * @throws {Error} If lemon-tree.yaml is a directory instead of a file
	 * @throws {Error} If lemon-tree.yaml file is not a valid YAML file
	 * @returns {() => boolean} Function to unsubscribe from the changes
	 */
	static subscribeToConfig(
		listener: (config: LemonTreeConfig | {}) => void
	): () => boolean {
		if (!this.subscribers.size) {
			this.watcher = vscode.workspace.createFileSystemWatcher(this.path);
			this.watcher.onDidChange(() => this.callSubscribers());
			this.watcher.onDidCreate(() => this.callSubscribers());
			this.watcher.onDidDelete(() => this.callSubscribers());
		}
		const id = crypto.randomUUID();
		this.subscribers.set(id, listener);
		return () => this.subscribers.delete(id);
	}

	private static async callSubscribers() {
		const config = await this.config(true);
		this.subscribers.forEach((fn) => fn(config));
	}
	static clearSubscribers() {
		this.subscribers.clear();
		if (this.watcher) {
			this.watcher.dispose();
			this.watcher = null;
		}
		this.cachedConfig = null;
	}

	/**
	 * Get the lemon-tree configuration.
	 * @param omitCache Whether to omit the cache and reload the configuration
	 * @returns The lemon-tree configuration
	 */
	static async config(
		omitCache: boolean = false
	): Promise<LemonTreeConfig | {}> {
		if (this.cachedConfig && !omitCache) return this.cachedConfig;
		await this.loadConfig();
		return this.cachedConfig || {};
	}

	/**
	 * Load the lemon-tree configuration from the lemon-tree.yaml file.
	 * This will read the file and parse it as YAML.
	 * this does not return anything, it just updates the cachedConfig property.
	 * if you want to get the configuration, use the `config` method.
	 * @throws {Error} If lemon-tree.yaml file is not found or is not a valid YAML file
	 * @throws {Error} If there are no permissions to read the lemon-tree.yaml file
	 * @throws {Error} If lemon-tree.yaml is a directory instead of a file
	 * @throws {Error} If lemon-tree.yaml file is not a valid YAML file
	 * @memberof GetConfig
	 * @static
	 * @returns {Promise<void>} A promise that resolves when the configuration is loaded
	 *
	 */
	private static async loadConfig(): Promise<void> {
		if (!this.directory) return;
		try {
			const file = fs.readFileSync(this.path, "utf8");
			const config = yaml.parse(file);
			if (!config) {
				return logger.appendLine(
					"Failed to parse lemon-tree.yaml file"
				);
			}
			if (typeof config !== "object") {
				return logger.appendLine(
					"lemon-tree.yaml file is not a valid YAML object"
				);
			}

			this.cachedConfig = config as LemonTreeConfig;
		} catch (error) {
			if (!(error instanceof Error)) {
				return logger.appendLine(
					`[Lemon Tree] Failed to read lemon-tree.yaml file. Unexpected error ${error}`
				);
			}
			const message = error?.message as string;
			if (message.includes("ENOENT")) {
				return logger.appendLine("Failed to read lemon-tree.yaml file");
			}
			if (message.includes("EISDIR")) {
				return logger.appendLine(
					"lemon-tree.yaml is a directory, must be a file"
				);
			}
			if (message.includes("EACCES")) {
				return logger.appendLine(
					"No permissions to read lemon-tree.yaml file"
				);
			}
			if (message.includes("EPERM")) {
				return logger.appendLine(
					"No permissions to read lemon-tree.yaml file"
				);
			}
			if (message.includes("EPIPE")) {
				return logger.appendLine(
					"lemon-tree.yaml file is not a valid YAML file"
				);
			}
		}
	}
}
