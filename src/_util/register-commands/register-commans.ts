import * as vscode from "vscode";
import { logger } from "../../_logger/logger";
import { runLemonTreeCommand } from "../../infrastructure/cli/LemonTreeCli";

export const registerCommands = (context: vscode.ExtensionContext) => {
	const workspaces = vscode.workspace.workspaceFolders;
	if (!workspaces || workspaces.length === 0) {
		vscode.window.showErrorMessage("No workspace folder found.");
		return;
	}

	const workspace = workspaces[0].uri.fsPath;
	const removeTranslationCommand = vscode.commands.registerCommand(
		"lemon-tree.remove-translation",
		async (text: string) => {
			logger.append(
				`[lemon-tree] removeTranslation called with: ${text}`
			);
			await runLemonTreeCommand("delete", text, workspace);
		}
	);

	const updateTranslationCommand = vscode.commands.registerCommand(
		"lemon-tree.update-translation",
		async (text: string) => {
			logger.append(
				`[lemon-tree] updateTranslation called with: ${text}`
			);
			await runLemonTreeCommand("set", text, workspace);
		}
	);

	context.subscriptions.push(
		removeTranslationCommand,
		updateTranslationCommand
	);
};
