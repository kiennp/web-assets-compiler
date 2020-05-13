import * as sass from 'sass';
import * as postcss from 'postcss';
import * as autoprefixer from 'autoprefixer';
import * as path from 'path';
import * as fs from 'fs';
import { ICompiler, FileInfo } from "../compiler";
import { Output } from "../output";

export class SASSCompiler implements ICompiler {
	private indentedSyntax: boolean;
	public constructor(indentedSyntax: boolean = false) {
		this.indentedSyntax = indentedSyntax;
	}
	public compile(file: FileInfo): boolean {
		const defExt = {
			expanded: 'css',
			compressed: 'min.css',
		};
		try {
			file.formats.forEach((options) => {
				const outFile = `${file.dst}.${options.extension || defExt[options.style]}`;
				const outCSS = sass.renderSync({
					file: file.src,
					indentedSyntax: this.indentedSyntax,
					outputStyle: options.style,
					outFile: outFile,
					sourceMap: options.exportMap,
				});
				const css = postcss([autoprefixer({
					ignoreUnknownVersions: true,
				})]).process(outCSS.css, {
					from: file.src,
					to: outFile,
				});
				// Write css to file
				fs.writeFileSync(outFile, css.css.toString());
				if (outCSS.map && options.exportMap) {
					// Write source map
					const mapPath = `${outFile}.map`;
					fs.writeFileSync(mapPath, outCSS.map.toString());
					// Append source map info
					fs.appendFileSync(outFile, `\n\n/*# sourceMappingURL=${path.basename(mapPath)} */`);
				}
				Output.write(`SASS compiled: ${file.src} => ${outFile}`);
			});
		} catch (err) {
			Output.write(err.message);
			return false;
		}
		return true;
	}
}
