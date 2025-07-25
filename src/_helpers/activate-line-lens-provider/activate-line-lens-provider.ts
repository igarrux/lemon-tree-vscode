import * as vscode from "vscode";
import type { Range } from "vscode";
import { getLineActions } from "../../_util/get-line-actions/get-line-actions";

export class LemonCodeLensProvider implements vscode.CodeLensProvider {
	private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
	readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

	private activeLine: number | null = null;
	private matches: { range: Range; key: string; fnRange: Range }[] = [];

	setMatches(
		line: number,
		matches: { range: Range; key: string; fnRange: Range }[]
	) {
		this.activeLine = line;
		this.matches = matches;
		this._onDidChangeCodeLenses.fire();
	}

	async provideCodeLenses(
		document: vscode.TextDocument
	): Promise<vscode.CodeLens[]> {
		if (this.activeLine === null) return [];

		const lenses: vscode.CodeLens[] = [];

		for (const { range, key, fnRange } of this.matches) {
			const actions = getLineActions(document, range, fnRange);

			if (actions.includes("update")) {
				lenses.push(
					new vscode.CodeLens(range, {
						title: "🌐 Update",
						command: "lemon-tree.update-translation",
						arguments: [key],
					})
				);
			}

			if (actions.includes("add")) {
				lenses.push(
					new vscode.CodeLens(range, {
						title: "✚ Add",
						command: "lemon-tree.update-translation",
						arguments: [key],
					})
				);
			}

			if (actions.includes("remove")) {
				lenses.push(
					new vscode.CodeLens(range, {
						title: "🗑️ Remove",
						command: "lemon-tree.remove-translation",
						arguments: [key],
					})
				);
			}
		}

		return lenses;
	}
}
