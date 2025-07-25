import * as vscode from "vscode";
import * as path from "path";

export class GutterIconManager {
	private decorationType: vscode.TextEditorDecorationType | null = null;
	private readonly lemonIcon: string;
	private readonly loadingIcon: string;
	private _activeLine = -1;
	private _editor: vscode.TextEditor | undefined;

	constructor(private readonly context: vscode.ExtensionContext) {
		this.lemonIcon = this.getIconPath("lemon.svg");
		this.loadingIcon = this.getIconPath("loading.svg");
	}

	private getIconPath(file: string): string {
		return this.context.asAbsolutePath(path.join("media", file));
	}

    public lineConfig(line: number, editor: vscode.TextEditor) {
        this._activeLine = line;
        this._editor = editor;
        this.applyDecoration(this.lemonIcon);
    }

	private applyDecoration(iconPath: string) {
		this.dispose(); // clear previous decoration
		if (this._activeLine < 0 || !this._editor) return; // no valid line to decorate
		this.decorationType = vscode.window.createTextEditorDecorationType({
			gutterIconPath: vscode.Uri.file(iconPath),
			gutterIconSize: "contain",
		});
		const line = this._activeLine;
		const range = new vscode.Range(line, 0, line, 0);
		this._editor.setDecorations(this.decorationType, [range]);
	}

	public updating() {
		this.applyDecoration(this.loadingIcon);
	}

	public done() {
		this.applyDecoration(this.lemonIcon);
	}

	public dispose() {
		if (this.decorationType) {
			this.decorationType.dispose();
			this.decorationType = null;
		}
	}
}
