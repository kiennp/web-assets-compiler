import * as jsBeautify from 'js-beautify';
import { JSBeautifyFormatter } from './jsbeautify';

export class CSS extends JSBeautifyFormatter {
	public beautify(source: string, options: any): string {
		return jsBeautify.css(source, options);
	}
}
