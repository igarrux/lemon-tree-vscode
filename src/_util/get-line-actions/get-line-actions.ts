import * as vscode from "vscode";
/**
 * Determines the actions available for a given range in a document.
 * It checks for errors in the document and returns appropriate actions based on the presence of errors.
 * @param document The text document to check for errors.
 * @param range The range within the document to check for actions.
 * @returns An array of actions that can be performed on the translation key within the range.
 * Possible actions include update, add, and remove.
 */
export const getLineActions = (
	document: vscode.TextDocument,
	range: vscode.Range,
	fnRange: vscode.Range
): Array<"add" | "update" | "remove"> => {
	try {
		const diagnostics = vscode.languages.getDiagnostics(document.uri);
		const hasError = diagnostics.some((d) => {
			console.log({
				fnRange: { start: fnRange.start, end: fnRange.end },
				range: { start: range.start, end: range.end },
			});
			console.log({
				severity: d.severity,
				errorSeverity: vscode.DiagnosticSeverity.Error,
			});
			return (
				(d.range.contains(range.start) || d.range.contains(fnRange)) &&
				d.severity === vscode.DiagnosticSeverity.Error
			);
		});

		return hasError ? ["add", "remove"] : ["update", "remove"];
	} catch {
		return ["update", "remove"];
	}
};
