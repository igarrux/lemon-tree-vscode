import * as childProcess from "child_process";
import * as vscode from "vscode";
import { logger } from "../../_logger/logger";
import { gutterIconManager } from "../../extension";

/**
 * Runs the lemon-tree CLI command in the given project root.
 * @param action 'set' or 'delete'
 * @param text The translation key/text
 * @param rootPath The project root path
 */
export async function runLemonTreeCommand(
	action: "set" | "delete",
	text: string,
	rootPath: string
): Promise<boolean> {

	const cmd = `LT_AUTO_YES=true npx ltr ${action} "${text}"`;
	logger.append(`Running command: ${cmd}`);
	gutterIconManager.updating();
	return new Promise<boolean>((resolve) => {
		childProcess.exec(cmd, { cwd: rootPath }, (err, stdout, stderr) => {
			gutterIconManager.done();
			logger.append(`Running command: ${cmd}`);
			if (err?.code === 4) {
				logger.append(
					`Not found: ${cmd} ${err?.message} ${stdout} ${stderr}`
				);
				return resolve(false);
			}
			if (err?.code === 1) {
				logger.append(
					`Failed: ${cmd} ${err?.message} ${stdout} ${stderr}`
				);
				return resolve(false);
			}

			if (err?.code === 5) {
				logger.append(
					`Fatal error: ${cmd} ${err?.message} ${stdout} ${stderr}`
				);
				logger.show(false);
				return resolve(false);
			}

			if (err?.code === 0) {
				logger.append(
					`Success: ${cmd} ${err?.message} ${stdout} ${stderr}`
				);
				vscode.window.showInformationMessage(
					`Lemon Tree: ${text} ${
						action === "set" ? "added" : "removed"
					}`
				);
				return resolve(true);
			}

			if (err || stderr && !stderr.includes('overwritten')) {
				vscode.window.showErrorMessage(
					`Lemon Tree error: ${
						err?.message || stderr || "Unknown error"
					}`
				);
				logger.append(
					stderr?.replace(/\[.*?m/g, "").split("\n")[0] ||
						err?.message ||
						""
				);
				return resolve(false);
			}

			logger.append(`Success: ${cmd} ${stdout} ${stderr}`);
			vscode.window.showInformationMessage(
				`Lemon Tree: ${text} ${action === "set" ? "added" : "removed"}`
			);
			return resolve(true);
		});
	});
}
