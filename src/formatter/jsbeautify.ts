import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { IFormatter } from '../formatter';

export abstract class JSBeautifyFormatter implements IFormatter {
	public filePath?: string;
	public format(document: vscode.TextDocument, range?: vscode.Range): vscode.TextEdit[] {
		this.filePath = document.isUntitled ? undefined : document.fileName;
		let result: vscode.TextEdit[] = [];
		if (!range) {
			const rangeStart = new vscode.Position(0, 0);
			const rangeEnd = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
			range = new vscode.Range(rangeStart, rangeEnd);
		} else {
			// JS beautify doesn't support format range
			return [];
		}
		const source = document.getText(range);
		const formatted = this.beautify(source, this.getOptions());
		if (formatted && formatted !== source) {
			result.push(new vscode.TextEdit(range, formatted));
		}
		return result;
	}
	public abstract beautify(source: string, options: any): string;
	private getOptions() {
		if (this.filePath) {
			let dir = path.dirname(this.filePath);
			do {
				const cfgFile = path.join(dir, '.jsbeautifyrc');
				if (fs.existsSync(cfgFile)) {
					try {
						return JSON.parse(fs.readFileSync(cfgFile).toString());
					} catch (err) {
						return undefined;
					}
				}
			} while (dir !== (dir = path.dirname(dir)));
		}
		return undefined;
	}
}
