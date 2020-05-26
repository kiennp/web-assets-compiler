import * as jsBeautify from 'js-beautify';
import { JSBeautifyFormatter } from './jsbeautify';

export class CSS extends JSBeautifyFormatter {
	public getFormatFunc(): (source: string) => string {
		return jsBeautify.css;
	}
}
