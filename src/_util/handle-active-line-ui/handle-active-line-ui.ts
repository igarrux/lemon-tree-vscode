import * as vscode from "vscode";
import type { Range } from "vscode";
import { buildGetTranslationDetails } from "..";
import { LemonCodeLensProvider } from "../../_helpers/activate-line-lens-provider/activate-line-lens-provider";
import { getHoverMessages } from "../../_helpers/get-hover-message/get-hover-message";
import { DECORATION } from "./configs/decoration.config";
import { gutterIconManager } from "../../extension";

export const lemon = new LemonCodeLensProvider();
export const handleActiveLineUI = async (
	editor: vscode.TextEditor | undefined
) => {
	if (!editor) return;
	const getTranslationDetails = await buildGetTranslationDetails();
	const activeLine = editor.selection.active.line;
	const line = editor.document.lineAt(activeLine);

	let match;
	const ranges: { range: Range; key: string; fnRange: Range }[] = [];
	while ((match = getTranslationDetails(line.text))) {
		const { quote, key, start, end, fnStart, fnEnd } = match;
		if (!key || (quote === "`" && key.includes("${"))) continue;
		const line = activeLine;
		const fnRange = new vscode.Range(line, fnStart, line, fnEnd);

		const range = new vscode.Range(line, start, line, end);
		ranges.push({ range, key, fnRange });
	}
	const hoverMessages = getHoverMessages(editor.document, ranges);
	gutterIconManager.dispose();
	if (ranges.length > 0) gutterIconManager.lineConfig(activeLine, editor);
	lemon.setMatches(activeLine, ranges);
	editor.setDecorations(DECORATION, hoverMessages);
};
