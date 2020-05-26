import * as jsBeautify from 'js-beautify';
import { JSBeautifyFormatter } from './jsbeautify';

export class Javascript extends JSBeautifyFormatter {
	public getFormatFunc(): (source: string) => string {
		return jsBeautify.js;
	}
}
