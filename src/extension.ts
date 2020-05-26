import * as vscode from 'vscode';
import * as formatter from './formatter';
import { Compiler } from './compiler';
import { Output } from './output';
import { Settings } from './settings';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

	Output.write('Extension is now active!');

	[
		formatter.Language.SCSS,
		formatter.Language.CSS,
		formatter.Language.JS,
		formatter.Language.HTML,
	].forEach(language => {
		let disposableFormatFile = vscode.languages.registerDocumentFormattingEditProvider({ language }, {
			provideDocumentFormattingEdits: (document: vscode.TextDocument) => {
				return formatter.Formatter.format(document);
			}
		});
		let disposableFormatRange = vscode.languages.registerDocumentRangeFormattingEditProvider({ language }, {
			provideDocumentRangeFormattingEdits: (document: vscode.TextDocument, range: vscode.Range) => {
				return formatter.Formatter.format(document, range);
			}
		});
		context.subscriptions.push(
			disposableFormatFile,
			disposableFormatRange,
		);
	});

	let compiler = new Compiler();

	vscode.workspace.workspaceFolders?.forEach((folder) => {
		Settings.overwriteWorkspaceConfiguration(folder.uri.fsPath);
	});

	let disposableCompileThis = vscode.commands.registerCommand('webAssetsCompiler.compileThis', () => {
		if (vscode.window.activeTextEditor) {
			compiler.processSave(vscode.window.activeTextEditor.document, false);
		}
	});

	let disposableCompileAll = vscode.commands.registerCommand('webAssetsCompiler.compileAll', () => {
		compiler.compileAll();
	});

	let disposableGenerateConfigFile = vscode.commands.registerCommand('webAssetsCompiler.generateConfigFile', () => {
		compiler.refreshSettings(true);
	});

	let disposableOnChangeConfiguration = vscode.workspace.onDidChangeConfiguration(() => {
		compiler.refreshSettings();
	});

	let disposableOnRename = vscode.workspace.onDidRenameFiles((e) => {
		let files: vscode.Uri[] = [];
		e.files.forEach((f) => {
			files.push(f.oldUri);
			files.push(f.newUri);
		});
		compiler.refreshTargetFiles(files);
	});

	let disposableOnCreate = vscode.workspace.onDidCreateFiles((e) => {
		let files: vscode.Uri[] = [];
		e.files.forEach((fUri) => {
			files.push(fUri);
		});
		compiler.refreshTargetFiles(files);
	});

	let disposableOnDelete = vscode.workspace.onDidDeleteFiles((e) => {
		let files: vscode.Uri[] = [];
		e.files.forEach((fUri) => {
			files.push(fUri);
		});
		compiler.refreshTargetFiles(files);
	});

	let disposableOnSave = vscode.workspace.onDidSaveTextDocument((e) => {
		compiler.processSave(e);
	});

	let disposableOnWorkFoldersChanged = vscode.workspace.onDidChangeWorkspaceFolders((e) => {
		compiler.workspaceFoldersChanged(e);
	});

	context.subscriptions.push(
		disposableCompileThis,
		disposableCompileAll,
		disposableGenerateConfigFile,
		disposableOnChangeConfiguration,
		disposableOnRename,
		disposableOnCreate,
		disposableOnDelete,
		disposableOnSave,
		disposableOnWorkFoldersChanged,
		compiler,
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }
