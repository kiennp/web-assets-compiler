import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Output } from './output';
import { Settings, ExportFormat, TargetConfig } from './settings';
import { Task } from './task';
import { SASSCompiler } from './compiler/sass';

export type ICompiler = {
	compile: (file: FileInfo) => boolean,
};

export enum AssetType {
	UNKNOWN = 0,
	SASS,
	SCSS,
}

export class FileInfo {
	public src: string;
	public dst: string;
	public type: AssetType;
	public formats: ExportFormat[];
	private lastCompile?: Date;

	public constructor(filepath: string, containerFolder?: TargetFolder) {
		if (!containerFolder) {
			containerFolder = new TargetFolder({
				input: path.dirname(filepath),
				output: '',
				includePattern: '',
				excludePattern: '',
				languageName: '',
				formats: Settings.getExportFormats(),
			});
		}
		this.src = filepath;
		this.dst = path.join(containerFolder.output || containerFolder.input, this.getFileNameWithoutExtension(filepath));
		this.type = containerFolder.type || this.getFileType(filepath);
		this.formats = containerFolder.formats;
	}

	/**
	 * Is file compilable
	 */
	public get isCompilable(): boolean {
		return !this.lastCompile || this.lastCompile < this.getLastModified();
	}

	/**
	 * Update last compiled time
	 */
	public updateLastCompile() {
		this.lastCompile = this.getLastModified();
	}

	/**
	 * Get file name without extension
	 * @param filepath File path
	 */
	private getFileNameWithoutExtension(filepath: string): string {
		return path.basename(filepath, path.extname(filepath));
	}

	/**
	 * Get last modified time of file
	 */
	private getLastModified(): Date {
		return fs.statSync(this.src).mtime;
	}

	/**
	 * Get type of file
	 * @param filePath File path
	 */
	private getFileType(filePath: string): AssetType {
		const fileName = path.basename(filePath);
		if (fileName.endsWith('.sass')) {
			return AssetType.SASS;
		} else if (fileName.endsWith('.scss')) {
			return AssetType.SCSS;
		}
		return AssetType.UNKNOWN;
	}
}

type FileList = { [id: string]: FileInfo };

class TargetFolder {
	public input: string;
	public output: string;
	private includePattern?: RegExp;
	private excludePattern?: RegExp;
	public type?: AssetType;
	public formats: ExportFormat[];
	public files: FileList;

	public constructor(cfg: TargetConfig) {
		this.input = cfg.input || '';
		this.output = cfg.output || '';
		this.includePattern = this.parseRegex(cfg.includePattern);
		this.excludePattern = this.parseRegex(cfg.excludePattern);
		if (cfg.languageName) {
			switch (cfg.languageName.toUpperCase()) {
				case 'SASS':
					this.type = AssetType.SASS;
					break;
				case 'SCSS':
					this.type = AssetType.SCSS;
					break;
			}
		}
		this.formats = cfg.formats || [];
		this.files = {};
	}

	/**
	 * Parse `string` to `RegExp`
	 * @param pattern Pattern string
	 */
	private parseRegex(pattern?: string): RegExp | undefined {
		try {
			if (pattern) {
				return new RegExp(pattern);
			}
		} catch (ex) {
			// Nothing to do
		}
	}

	/**
	 * Search files
	 */
	public searchFiles() {
		this.clear();
		Task.run(() => {
			if (fs.existsSync(this.input)) {
				Output.write('Search files: ' + this.input);
				if (this.includePattern) {
					Output.write('  Include: ' + this.includePattern);
				}
				if (this.excludePattern) {
					Output.write('  Exclude: ' + this.excludePattern);
				}
				fs.readdirSync(this.input).forEach((filename) => {
					if ((!this.includePattern || filename.match(this.includePattern)) && (!this.excludePattern || !filename.match(this.excludePattern))) {
						Output.write('- Hit! ' + filename);
						const filepath = path.join(this.input, filename);
						this.files[filepath] = new FileInfo(filepath, this);
					}
				});
			} else {
				Output.write('Not exists: ' + this.input);
			}
		});
	}

	/**
	 * Clear files list
	 */
	public clear() {
		for (const key in this.files) {
			delete this.files[key];
		}
	}
}

type CompileConfig = {
	compileOnSave: boolean,
	formats: ExportFormat[],
	targetFolders: TargetFolder[],
};

export class Compiler {

	private inputFolders: { [id: string]: { workFolder: string, targetIndex: number } };
	private workFolderCfg: { [id: string]: CompileConfig };

	public constructor() {
		this.inputFolders = {};
		this.workFolderCfg = {};
		this.refreshSettings();
	}

	/**
	 * Process when run `Compile All` command
	 */
	public async compileAll() {
		Task.run(() => {
			for (const key in this.workFolderCfg) {
				if (this.workFolderCfg.hasOwnProperty(key)) {
					this.workFolderCfg[key].targetFolders.forEach(folder => {
						this.compile(folder.files);
					});
				}
			}
		});
	}

	/**
	 * Process when files were added/removed/renamed
	 * @param files File list
	 */
	public async refreshTargetFiles(files: vscode.Uri[]) {
		let updatedConfig: string[] = [];
		let updatedFolder: { [id: string]: string[] } = {};
		for (var i = 0; i < files.length; i++) {
			const filepath = files[i].fsPath;
			const workFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filepath))?.uri.fsPath;
			if (workFolder) {
				const parentDir = path.dirname(filepath);
				if (this.isConfigFile(filepath, parentDir)) {
					// Configuration file added/removed
					if (updatedConfig.indexOf(workFolder) < 0) {
						updatedConfig.push(workFolder);
					}
				} else if (this.inputFolders.hasOwnProperty(parentDir)) {
					// Is file in one of target folders
					if (!updatedFolder.hasOwnProperty(workFolder)) {
						updatedFolder[workFolder] = [];
					}
					if (updatedFolder[workFolder].indexOf(parentDir) < 0) {
						updatedFolder[workFolder].push(parentDir);
					}
				}
			}
		}
		// Refresh watching list of workspace folder when configuration was updated
		updatedConfig.forEach((folder) => {
			this.updateWorkFolderConfigFile(folder);
			if (updatedFolder.hasOwnProperty(folder)) {
				delete updatedFolder[folder];
			}
		});
		// Refresh file list of input folder when file list was changed
		for (const workFolder in updatedFolder) {
			updatedFolder[workFolder].forEach((folder) => {
				if (this.inputFolders.hasOwnProperty(folder)) {
					const workFolder = this.inputFolders[folder].workFolder;
					const targetIdx = this.inputFolders[folder].targetIndex;
					if (this.workFolderCfg.hasOwnProperty(workFolder) && targetIdx >= 0 && targetIdx < this.workFolderCfg[workFolder].targetFolders.length) {
						this.workFolderCfg[workFolder].targetFolders[targetIdx].searchFiles();
					}
				}
			});
		}
	}

	/**
	 * Process when configurations was updated
	 */
	public async refreshSettings() {
		if (vscode.workspace.workspaceFolders) {
			vscode.workspace.workspaceFolders.forEach((folder) => {
				Settings.overwriteConfigFile(folder.uri.fsPath);
				this.loadFromWorkFolder(folder.uri.fsPath);
			});
		}
	}

	/**
	 * Process when workspace folders changed
	 * @param e Event arguments
	 */
	public async workspaceFoldersChanged(e: vscode.WorkspaceFoldersChangeEvent) {
		e.removed.forEach((folder) => {
			this.removeWorkFolder(folder.uri.fsPath);
		});
		e.added.forEach((folder) => {
			this.loadFromWorkFolder(folder.uri.fsPath);
		});
	}

	/**
	 * Process when file saved
	 * @param txtDoc Text document
	 */
	public async processSave(txtDoc: vscode.TextDocument, isOnSave: boolean = true) {
		const currentFile = txtDoc.fileName;
		const parentDir = path.dirname(currentFile);
		if (this.isConfigFile(currentFile, parentDir)) {
			this.updateWorkFolderConfigFile(parentDir);
			return;
		}
		let lst: FileList = {};
		if (this.inputFolders.hasOwnProperty(parentDir)) {
			const workFolder = this.inputFolders[parentDir].workFolder;
			const targetIdx = this.inputFolders[parentDir].targetIndex;
			if (this.workFolderCfg.hasOwnProperty(workFolder) && (!isOnSave || this.workFolderCfg[workFolder].compileOnSave) && targetIdx < this.workFolderCfg[workFolder].targetFolders.length) {
				if (this.workFolderCfg[workFolder].targetFolders[targetIdx].files.hasOwnProperty(currentFile)) {
					lst[currentFile] = this.workFolderCfg[workFolder].targetFolders[targetIdx].files[currentFile];
				}
			}
		} else {
			if (!lst.hasOwnProperty(currentFile) && (!isOnSave || Settings.isCompileOnSave())) {
				lst[currentFile] = new FileInfo(currentFile);
			}
		}
		this.compile(lst);
	}

	/**
	 * Check if file is config file
	 * @param filepath File path
	 * @param parentDir Parent folder
	 */
	private isConfigFile(filepath: string, parentDir: string) {
		return (Settings.isConfigFileName(filepath) && this.workFolderCfg.hasOwnProperty(parentDir));
	}

	/**
	 * Compile files
	 * @param files File list
	 */
	private compile(files: FileList) {
		for (const key in files) {
			if (files.hasOwnProperty(key)) {
				const f = files[key];
				Task.run(() => {
					if (f.isCompilable) {
						let compilerInstance: ICompiler | undefined = undefined;
						switch (f.type) {
							case AssetType.SASS:
								compilerInstance = new SASSCompiler();
								break;
							case AssetType.SCSS:
								compilerInstance = new SASSCompiler();
								break;
							default:
								Output.write("File type isn't supported: " + f.src);
								break;
						}
						if (compilerInstance && compilerInstance.compile(f)) {
							f.updateLastCompile();
						}
					} else {
						Output.write("No changed from last compiled: " + f.src);
					}
				});
			}
		}
	}

	/**
	 * Remove work folder settings
	 * @param workFolder Work folder path
	 */
	private removeWorkFolder(workFolder: string) {
		if (this.workFolderCfg.hasOwnProperty(workFolder)) {
			// Delete old settings
			this.workFolderCfg[workFolder].targetFolders.forEach((folder) => {
				folder.clear();
				if (this.inputFolders.hasOwnProperty(folder.input)) {
					delete this.inputFolders[folder.input];
				}
			});
			delete this.workFolderCfg[workFolder];
		}
	}

	/**
	 * Load settings from work folder
	 * @param workFolder Work folder path
	 */
	private loadFromWorkFolder(workFolder: string) {
		this.removeWorkFolder(workFolder);
		// Load settings
		Task.run(() => {
			Output.write('Load workspace settings: ' + workFolder);
			this.workFolderCfg[workFolder] = {
				compileOnSave: Settings.isCompileOnSave(workFolder),
				formats: Settings.getExportFormats(workFolder),
				targetFolders: [],
			};
			// Load watching folder list
			Settings.getTargetFolders(workFolder).forEach((cfg) => {
				Output.write('Watching folder: ' + cfg.input);
				let target = new TargetFolder(cfg);
				target.input = path.join(workFolder, target.input);
				if (target.output && target.output !== '') {
					target.output = path.join(workFolder, target.output);
				}
				if (cfg.formats === undefined || cfg.formats.length <= 0) {
					target.formats = this.workFolderCfg[workFolder].formats;
				}
				this.workFolderCfg[workFolder].targetFolders.push(target);
				this.inputFolders[target.input] = {
					workFolder: workFolder,
					targetIndex: this.workFolderCfg[workFolder].targetFolders.length - 1,
				};
				target.searchFiles();
			});
		});
	}

	/**
	 * Update configuration in work folder
	 * @param workFolder Work folder path
	 */
	private updateWorkFolderConfigFile(workFolder: string) {
		Settings.overwriteWorkspaceConfiguration(workFolder);
		this.loadFromWorkFolder(workFolder);
	}

	dispose() { }
}
