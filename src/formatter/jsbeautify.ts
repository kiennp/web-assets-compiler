import * as vscode from 'vscode';
import { IFormatter } from '../formatter';

export abstract class JSBeautifyFormatter implements IFormatter {
	public format(document: vscode.TextDocument, range?: vscode.Range): vscode.TextEdit[] {
		const formatFunc = this.getFormatFunc();
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
		const formatted = formatFunc(source);
		if (formatted && formatted !== source) {
			result.push(new vscode.TextEdit(range, formatted));
		}
		return result;
	}
	public abstract getFormatFunc(): (source: string) => string;
}
