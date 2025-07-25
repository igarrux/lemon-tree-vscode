import * as vscode from "vscode";
import { getLineActions } from "../../_util/get-line-actions/get-line-actions";
import type { Range } from "vscode";

export const getHoverMessages = (
	document: vscode.TextDocument,
	ranges: { key: string; range: Range, fnRange: Range }[]
): vscode.DecorationOptions[] => {
	return ranges.map(({ range, key, fnRange }) => {
		const param = encodeURIComponent(JSON.stringify(key));
		const remove = `command:lemon-tree.remove-translation?${param}`;
		const update = `command:lemon-tree.update-translation?${param}`;
		const action = getLineActions(document, range, fnRange);
		const uploadAction = action.includes("update") ? "Update" : "Add";
		const markdown = new vscode.MarkdownString(
			` ### 🍋 Lemon Tree \n\n **Key:** \`${key}\`\n\n` +
				`[${uploadAction} Translation](${update})\n\n` +
				`[Remove Translation](${remove})`
		);
		markdown.isTrusted = true;
		return { range, hoverMessage: markdown };
	});
};
