import * as assert from "assert";
import { beforeEach, afterEach, describe, it, vi, expect } from "vitest";
import * as vscode from "vscode";
import { GetConfig } from "./get-config";

// Mock modules
vi.mock("fs");
vi.mock("yaml");
vi.mock("../../_util/toast/toast");
vi.mock("../../_logger/logger");

import * as fs from "fs";
import * as yaml from "yaml";
import { logger } from "../../_logger/logger";

describe("GetConfig", () => {
	let workspaceFoldersStub: any;
	let createFileSystemWatcherStub: any;
	let watcherMock: any;

	beforeEach(() => {
		// Reset static state
		GetConfig.clearSubscribers();

		workspaceFoldersStub = vi.mocked(vscode.workspace).workspaceFolders = [
			{ uri: { fsPath: "/test/workspace" } },
		] as any;

		watcherMock = {
			onDidChange: vi.fn(),
			onDidCreate: vi.fn(),
			onDidDelete: vi.fn(),
			dispose: vi.fn(),
		};

		createFileSystemWatcherStub = vi
			.mocked(vscode.workspace.createFileSystemWatcher)
			.mockReturnValue(watcherMock);
	});

	afterEach(() => {
		GetConfig.clearSubscribers();
		vi.restoreAllMocks();
	});

	describe("directory getter", () => {
		it("should return workspace folder path", () => {
			const result = GetConfig.directory;
			assert.strictEqual(result, "/test/workspace");
		});

		it("should return undefined when no workspace folders", () => {
			vi.mocked(vscode.workspace).workspaceFolders = undefined as any;
			const result = GetConfig.directory;
			assert.strictEqual(result, undefined);
		});

		it("should return undefined when empty workspace folders", () => {
			vi.mocked(vscode.workspace).workspaceFolders = [] as any;
			const result = GetConfig.directory;
			assert.strictEqual(result, undefined);
		});
	});

	describe("path getter", () => {
		it("should return lemon-tree.yaml path", () => {
			const result = GetConfig.path;
			assert.strictEqual(result, "/test/workspace/lemon-tree.yaml");
		});

		it("should handle undefined directory in path", () => {
			vi.mocked(vscode.workspace).workspaceFolders = undefined as any;
			const result = GetConfig.path;
			assert.strictEqual(result, "undefined/lemon-tree.yaml");
		});
	});

	describe("subscribeToConfig", () => {
		it("should create file watcher on first subscription", () => {
			const listener = vi.fn();

			GetConfig.subscribeToConfig(listener);

			expect(createFileSystemWatcherStub).toHaveBeenCalledOnce();
			expect(watcherMock.onDidChange).toHaveBeenCalledOnce();
			expect(watcherMock.onDidCreate).toHaveBeenCalledOnce();
			expect(watcherMock.onDidDelete).toHaveBeenCalledOnce();
		});

		it("should not create additional watchers for subsequent subscriptions", () => {
			const listener1 = vi.fn();
			const listener2 = vi.fn();

			GetConfig.subscribeToConfig(listener1);
			GetConfig.subscribeToConfig(listener2);

			expect(createFileSystemWatcherStub).toHaveBeenCalledOnce();
		});

		it("should return unsubscribe function", () => {
			const listener = vi.fn();

			const unsubscribe = GetConfig.subscribeToConfig(listener);

			assert.strictEqual(typeof unsubscribe, "function");
			assert.strictEqual(unsubscribe(), true);
		});

		it("should call listeners when config changes", async () => {
			const listener = vi.fn();
			const configSpy = vi
				.spyOn(GetConfig, "config")
				.mockResolvedValue({ test: "config" });

			GetConfig.subscribeToConfig(listener);

			// Simulate file change
			const changeCallback = watcherMock.onDidChange.mock.calls[0][0];
			await changeCallback();

			expect(listener).toHaveBeenCalledWith({ test: "config" });
		});

		it("should call listeners when file is created", async () => {
			const listener = vi.fn();
			const configSpy = vi
				.spyOn(GetConfig, "config")
				.mockResolvedValue({ test: "created" });

			GetConfig.subscribeToConfig(listener);

			// Simulate file creation
			const createCallback = watcherMock.onDidCreate.mock.calls[0][0];
			await createCallback();

			expect(listener).toHaveBeenCalledWith({ test: "created" });
		});

		it("should call listeners when file is deleted", async () => {
			const listener = vi.fn();
			const configSpy = vi
				.spyOn(GetConfig, "config")
				.mockResolvedValue({});

			GetConfig.subscribeToConfig(listener);

			// Simulate file deletion
			const deleteCallback = watcherMock.onDidDelete.mock.calls[0][0];
			await deleteCallback();

			expect(listener).toHaveBeenCalledWith({});
		});

		it("should handle multiple listeners correctly", async () => {
			const listener1 = vi.fn();
			const listener2 = vi.fn();
			const configSpy = vi
				.spyOn(GetConfig, "config")
				.mockResolvedValue({ test: "multi" });

			GetConfig.subscribeToConfig(listener1);
			GetConfig.subscribeToConfig(listener2);

			// Simulate file change
			const changeCallback = watcherMock.onDidChange.mock.calls[0][0];
			await changeCallback();

			expect(listener1).toHaveBeenCalledWith({ test: "multi" });
			expect(listener2).toHaveBeenCalledWith({ test: "multi" });
		});
	});

	describe("clearSubscribers", () => {
		it("should clear all subscribers and dispose watcher", () => {
			const listener = vi.fn();
			GetConfig.subscribeToConfig(listener);

			GetConfig.clearSubscribers();

			expect(watcherMock.dispose).toHaveBeenCalledOnce();
			assert.strictEqual(GetConfig.watcher, null);
		});

		it("should handle no watcher case", () => {
			assert.doesNotThrow(() => GetConfig.clearSubscribers());
		});
	});

	describe("config", () => {
		it("should return cached config when available and omitCache is false", async () => {
			const cachedConfig = { test: "cached" };
			(GetConfig as any).cachedConfig = cachedConfig;

			const result = await GetConfig.config(false);

			assert.deepStrictEqual(result, cachedConfig);
		});

		it("should reload config when omitCache is true", async () => {
			const cachedConfig = { test: "cached" };
			(GetConfig as any).cachedConfig = cachedConfig;

			const loadConfigSpy = vi
				.spyOn(GetConfig as any, "loadConfig")
				.mockResolvedValue(undefined);

			await GetConfig.config(true);

			expect(loadConfigSpy).toHaveBeenCalledOnce();
		});

		it("should return empty object when no cached config", async () => {
			vi.spyOn(GetConfig as any, "loadConfig").mockResolvedValue(
				undefined
			);
			(GetConfig as any).cachedConfig = null;

			const result = await GetConfig.config();

			assert.deepStrictEqual(result, {});
		});

		it("should use default value false for omitCache when not provided", async () => {
			const cachedConfig = { test: "default" };
			(GetConfig as any).cachedConfig = cachedConfig;

			const result = await GetConfig.config(); // Sin parámetro

			assert.deepStrictEqual(result, cachedConfig);
		});
	});

	describe("loadConfig", () => {
		let readFileSyncStub: any;
		let yamlParseStub: any;
		let loggerStub: any;

		beforeEach(() => {
			readFileSyncStub = vi.mocked(fs.readFileSync);
			yamlParseStub = vi.mocked(yaml.parse);
			loggerStub = vi.mocked(logger.appendLine);
		});

		it("should return early when no directory", async () => {
			vi.mocked(vscode.workspace).workspaceFolders = undefined as any;

			await (GetConfig as any).loadConfig();

			expect(readFileSyncStub).not.toHaveBeenCalled();
		});

		it("should successfully load valid config", async () => {
			const configData = {
				languages: ["en", "es"],
				sourceLanguage: "en",
			};
			readFileSyncStub.mockReturnValue("yaml content");
			yamlParseStub.mockReturnValue(configData);

			await (GetConfig as any).loadConfig();

			assert.deepStrictEqual((GetConfig as any).cachedConfig, configData);
			expect(loggerStub).not.toHaveBeenCalled();
		});

		it("should show error when yaml.parse returns null", async () => {
			readFileSyncStub.mockReturnValue("yaml content");
			yamlParseStub.mockReturnValue(null);

			await (GetConfig as any).loadConfig();

			expect(loggerStub).toHaveBeenCalledWith(
				"Failed to parse lemon-tree.yaml file"
			);
		});

		it("should show error when yaml.parse returns non-object", async () => {
			readFileSyncStub.mockReturnValue("yaml content");
			yamlParseStub.mockReturnValue("string");

			await (GetConfig as any).loadConfig();

			expect(loggerStub).toHaveBeenCalledWith(
				"lemon-tree.yaml file is not a valid YAML object"
			);
		});

		it("should handle ENOENT error", async () => {
			const error = new Error("ENOENT: no such file");
			readFileSyncStub.mockImplementation(() => {
				throw error;
			});

			await (GetConfig as any).loadConfig();

			expect(loggerStub).toHaveBeenCalledWith(
				"Failed to read lemon-tree.yaml file"
			);
		});

		it("should handle EISDIR error", async () => {
			const error = new Error("EISDIR: illegal operation on a directory");
			readFileSyncStub.mockImplementation(() => {
				throw error;
			});

			await (GetConfig as any).loadConfig();

			expect(loggerStub).toHaveBeenCalledWith(
				"lemon-tree.yaml is a directory, must be a file"
			);
		});

		it("should handle EACCES error", async () => {
			const error = new Error("EACCES: permission denied");
			readFileSyncStub.mockImplementation(() => {
				throw error;
			});

			await (GetConfig as any).loadConfig();

			expect(loggerStub).toHaveBeenCalledWith(
				"No permissions to read lemon-tree.yaml file"
			);
		});

		it("should handle EPERM error", async () => {
			const error = new Error("EPERM: operation not permitted");
			readFileSyncStub.mockImplementation(() => {
				throw error;
			});

			await (GetConfig as any).loadConfig();

			expect(loggerStub).toHaveBeenCalledWith(
				"No permissions to read lemon-tree.yaml file"
			);
		});

		it("should handle EPIPE error", async () => {
			const error = new Error("EPIPE: broken pipe");
			readFileSyncStub.mockImplementation(() => {
				throw error;
			});

			await (GetConfig as any).loadConfig();

			expect(loggerStub).toHaveBeenCalledWith(
				"lemon-tree.yaml file is not a valid YAML file"
			);
		});

		it("should handle non-Error exception", async () => {
			// Necesitamos mockear yaml.parse para que lance algo que no sea Error
			yamlParseStub.mockImplementation(() => {
				// Una manera de lanzar algo que no sea Error
				const nonError = "string error";
				throw nonError;
			});
			readFileSyncStub.mockReturnValue("yaml content");

			await (GetConfig as any).loadConfig();

			expect(loggerStub).toHaveBeenCalledWith(
				"[Lemon Tree] Failed to read lemon-tree.yaml file. Unexpected error string error"
			);
		});

		it("should handle unknown error message", async () => {
			const error = new Error("Some unknown error type");
			readFileSyncStub.mockImplementation(() => {
				throw error;
			});

			await (GetConfig as any).loadConfig();

			// Debería caer en el catch pero no en ninguna condición específica, por lo que no se llama Toast.error
			expect(loggerStub).not.toHaveBeenCalled();
		});
	});
});
