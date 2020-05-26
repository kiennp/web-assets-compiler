import * as jsBeautify from 'js-beautify';
import { JSBeautifyFormatter } from './jsbeautify';

export class HTML extends JSBeautifyFormatter {
	public getFormatFunc(): (source: string) => string {
		return jsBeautify.html;
	}
}
