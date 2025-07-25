import * as vscode from "vscode";
import { GetConfig } from "../../_helpers";
import {
	handleActiveLineUI,
	lemon,
} from "../../_util/handle-active-line-ui/handle-active-line-ui";

export const activateTranslationDecorations = (
	context: vscode.ExtensionContext
) => {
	const editor = vscode.window.activeTextEditor;
	const selector = editor?.document.languageId;
	const document = vscode.window.activeTextEditor?.document;
	if (editor) vscode.languages.registerCodeLensProvider(selector!, lemon);

	const onDidChangeActiveTextEditor =
		vscode.window.onDidChangeActiveTextEditor(handleActiveLineUI);

	const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(
		(e) => {
			if (e.document !== document) return;
			handleActiveLineUI(vscode.window.activeTextEditor!);
		}
	);
	const onDidChangeTextEditorSelector =
		vscode.window.onDidChangeTextEditorSelection(() => {
			handleActiveLineUI(vscode.window.activeTextEditor!);
		});

	const onDidChangeDiagnostics = vscode.languages.onDidChangeDiagnostics(
		(e) => {
			if (e.uris.find((uri) => uri.fsPath === document?.uri.fsPath)) {
				handleActiveLineUI(vscode.window.activeTextEditor!);
			}
		}
	);
	GetConfig.subscribeToConfig(() => {
		handleActiveLineUI(vscode.window.activeTextEditor);
	});
	context.subscriptions.push(
		onDidChangeActiveTextEditor,
		onDidChangeTextDocument,
		onDidChangeTextEditorSelector,
		onDidChangeDiagnostics
	);
};
