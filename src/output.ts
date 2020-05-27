import * as vscode from 'vscode';

export class Output {
	private static _output: vscode.OutputChannel;
	private static get outChannel(): vscode.OutputChannel {
		if (!this._output) {
			this._output = vscode.window.createOutputChannel('Web assets compiler');
		}
		return this._output;
	}
	public static write(msg: string) {
		this.outChannel.appendLine(msg);
	}
	public static show() {
		this.outChannel.show();
	}
	static dispose() {
		this.outChannel.dispose();
	}
}
