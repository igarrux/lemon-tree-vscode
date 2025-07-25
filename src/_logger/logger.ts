import * as vscode from "vscode";

export const buildLogger = (skipCache: boolean = false): (() => vscode.OutputChannel) => {
	let output: vscode.OutputChannel | null = null;
	return () => {
        if (output && !skipCache) return output;
		output = vscode.window.createOutputChannel("Lemon Tree");
		return output;
	};
};

export const logger = buildLogger()();
