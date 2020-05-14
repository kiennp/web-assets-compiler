import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Task } from './task';
import { Output } from './output';

const CONFIG_FILE_NAME = '.webassetcompiler.json';

export type ExportFormat = {
	format?: string,
	extension?: string,
	sourceMap?: boolean,
	style: 'expanded' | 'compressed',
	exportMap: boolean,
};

export interface TargetConfig {
	input?: string,
	output?: string,
	includeSubFolder?: boolean,
	includePattern?: string,
	excludePattern?: string,
	languageName?: string,
	formats?: ExportFormat[],
};

export class Settings {
	/**
	 * Check if file name is same as config file
	 * @param filepath File path
	 */
	public static isConfigFileName(filepath: string) {
		return (CONFIG_FILE_NAME === path.basename(filepath));
	}

	/**
	 * Overwrite workspace settings by config file
	 * @param workFolder Work folder path
	 */
	public static overwriteWorkspaceConfiguration(workFolder: string) {
		Task.run(() => {
			const cfgFile = path.join(workFolder, CONFIG_FILE_NAME);
			if (fs.existsSync(cfgFile)) {
				const cfgStr = fs.readFileSync(cfgFile).toString();
				const cfgObj = JSON.parse(cfgStr);
				if (typeof cfgObj === 'object') {
					let settings = this.getWorkspaceConfig(workFolder);
					for (const key in cfgObj) {
						settings.update(key, cfgObj[key]).then(() => { }, (failed) => {
							Output.write(failed);
						});
					}
				}
			}
		});
	}

	/**
	 * Overwrite config file
	 * @param workFolder Work folder path
	 * @param createIfNotExists Create file if not exists
	 */
	public static overwriteConfigFile(workFolder: string, createIfNotExists: boolean = false) {
		Task.run(() => {
			const cfgFile = path.join(workFolder, CONFIG_FILE_NAME);
			if (createIfNotExists || fs.existsSync(cfgFile)) {
				fs.writeFileSync(cfgFile, JSON.stringify(this.getWorkspaceConfig(workFolder), null, "\t"));
			}
		});
	}

	/**
	 * Get workspace configurations
	 * @param workFolder Work folder path
	 */
	private static getWorkspaceConfig(workFolder?: string): vscode.WorkspaceConfiguration {
		if (workFolder) {
			return vscode.workspace.getConfiguration('webAssetsCompiler', vscode.Uri.file(workFolder));
		} else {
			return vscode.workspace.getConfiguration('webAssetsCompiler');
		}
	}

	/**
	 * Get config for file
	 * @param workFolder Work folder path
	 * @param key Config key
	 */
	private static getConfig<T>(workFolder: string | undefined, key: string, defaultValue: T): T {
		return this.getWorkspaceConfig(workFolder).get<T>(key, defaultValue);
	}

	/**
	 * Check if file is compilable on save
	 * @param workFolder Work folder path
	 */
	public static isCompileOnSave(workFolder?: string): boolean {
		return this.getConfig<boolean>(workFolder, 'compileOnSave', false);
	}

	/**
	 * Get export formats
	 * @param workFolder Work folder path
	 */
	public static getExportFormats(workFolder?: string): ExportFormat[] {
		const value = this.getConfig<ExportFormat[]>(workFolder, 'exportFormats', []);
		for (let i = 0; i < value.length; i++) {
			const format = value[i];
			value[i].style = 'expanded';
			if (format.format) {
				switch (format.format) {
					case 'expanded':
					case 'compressed':
						value[i].style = format.format;
				}
			}
			value[i].exportMap = (format.sourceMap === undefined || format.sourceMap);
		}
		return value;
	}

	/**
	 * Get watching folder list
	 * @param workFolder Work folder path
	 */
	public static getTargetFolders(workFolder?: string): TargetConfig[] {
		return this.getConfig<TargetConfig[]>(workFolder, 'targetFolders', []);
	}
}
