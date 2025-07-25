import * as vscode from "vscode";
import { GetConfig } from "./_helpers";
import { logger } from "./_logger/logger";
import { registerCommands } from "./_util/register-commands/register-commans";
import { activateTranslationDecorations } from "./infrastructure/vscode/activate-translation-decorators";
import { GutterIconManager } from "./_helpers/gutter-icon-manager/gutter-icon-manager";
export let gutterIconManager: GutterIconManager;

/**
 * Activates the Lemon Tree extension.
 * Registers inline highlight and hover commands for t(...) calls.
 * @param context The VSCode extension context
 */
export function activate(context: vscode.ExtensionContext) {
	gutterIconManager = new GutterIconManager(context);
	activateTranslationDecorations(context);
	registerCommands(context);
}

/**
 * Deactivates the Lemon Tree extension.
 * Clears configuration subscribers and disposes of the logger.
 */
export function deactivate() {
	GetConfig.clearSubscribers();
	logger.clear();
	logger.dispose();
	gutterIconManager.dispose();
}
