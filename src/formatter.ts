import * as vscode from 'vscode';
import { CSS } from './formatter/css';
import { Javascript } from './formatter/javascript';
import { HTML } from './formatter/html';

export enum Language {
	SCSS = 'scss',
	CSS = 'css',
	JS = 'javascript',
	HTML = 'html',
}

export type IFormatter = {
	format(document: vscode.TextDocument, range?: vscode.Range): vscode.TextEdit[],
}

class UnknownFormatter implements IFormatter {
	public format(): vscode.TextEdit[] {
		return [];
	}
}

export class Formatter {
	public static format(document: vscode.TextDocument, range?: vscode.Range): vscode.TextEdit[] {
		return this.getFormatter(document).format(document, range);
	}

	private static getFormatter(document: vscode.TextDocument): IFormatter {
		switch (document.languageId) {
			case Language.SCSS:
			case Language.CSS:
				return new CSS();
			case Language.JS:
				return new Javascript();
			case Language.HTML:
				return new HTML();
		}
		return new UnknownFormatter();
	}
}
