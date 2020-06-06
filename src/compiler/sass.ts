import * as sass from 'sass';
import * as postcss from 'postcss';
import * as autoprefixer from 'autoprefixer';
import * as path from 'path';
import * as fs from 'fs';
import { ICompiler, CompilerResult, FileInfo } from "../compiler";
import { Output } from "../output";

export class SASSCompiler implements ICompiler {
	private indentedSyntax: boolean;
	public constructor(indentedSyntax: boolean = false) {
		this.indentedSyntax = indentedSyntax;
	}
	public compile(file: FileInfo): CompilerResult {
		const defExt = {
			expanded: 'css',
			compressed: 'min.css',
		};
		let sourceFiles: string[] = [];
		try {
			file.formats.forEach((options) => {
				const outFile = `${file.dst}.${options.extension || defExt[options.style]}`;
				const outCSS = sass.renderSync({
					file: file.src,
					indentedSyntax: this.indentedSyntax,
					outputStyle: options.style,
					outFile: outFile,
					sourceMap: true,
					omitSourceMapUrl: true,
				});
				const css = postcss([autoprefixer({
					ignoreUnknownVersions: true,
				})]).process(outCSS.css, {
					from: file.src,
					to: outFile,
				});
				// Create parent folder if not exists
				const parentDir = path.dirname(outFile);
				if (!fs.existsSync(parentDir)) {
					fs.mkdirSync(parentDir, { recursive: true });
				}
				// Write css to file
				fs.writeFileSync(outFile, css.css.toString());
				if (outCSS.map) {
					const mapString = outCSS.map.toString();
					const mapObj = JSON.parse(mapString);
					sourceFiles = this.getSourceFilePaths(outFile, mapObj.sources, file.src);
					// Write source map
					if (options.exportMap) {
						const mapPath = `${outFile}.map`;
						fs.writeFileSync(mapPath, mapString);
						// Append source map info
						fs.appendFileSync(outFile, `\n\n/*# sourceMappingURL=${path.basename(mapPath)} */`);
					}
				}
				Output.write(`SASS compiled: ${file.src} => ${outFile}`);
			});
		} catch (err) {
			Output.show();
			Output.write(err.message);
			return { isSuccess: false, relatedFiles: [] };
		}
		return { isSuccess: true, relatedFiles: sourceFiles };
	}
	public getRelated(filePath: string): string[] {
		try {
			const result = sass.renderSync({
				file: filePath,
				sourceMap: `${filePath}.map`,
			});
			if (result.map) {
				const map = JSON.parse(result.map.toString());
				return this.getSourceFilePaths(filePath, map.sources);
			}
		} catch (err) {
			Output.write(`  Can't get related files: ${filePath}`);
		}
		return [];
	}
	private getSourceFilePaths(filePath: string, mapSources: string[], mainSourcePath?: string): string[] {
		const parentDir = path.dirname(filePath);
		const excludeSrc = mainSourcePath || filePath;
		let result: string[] = [];
		mapSources.forEach(relPath => {
			const absPath = path.normalize(path.join(parentDir, relPath));
			if (absPath !== excludeSrc) {
				result.push(absPath);
			}
		});
		return result;
	}
}
