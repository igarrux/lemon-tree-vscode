import * as vscode from "vscode";
export const DECORATION = vscode.window.createTextEditorDecorationType({
	backgroundColor: new vscode.ThemeColor("editor.wordHighlightBackground"),
	borderRadius: "3px",
});
