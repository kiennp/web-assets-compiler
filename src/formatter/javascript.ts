import * as jsBeautify from 'js-beautify';
import { JSBeautifyFormatter } from './jsbeautify';

export class Javascript extends JSBeautifyFormatter {
	public beautify(source: string, options: any): string {
		return jsBeautify.js(source, options);
	}
}
