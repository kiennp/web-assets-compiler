import * as jsBeautify from 'js-beautify';
import { JSBeautifyFormatter } from './jsbeautify';

export class HTML extends JSBeautifyFormatter {
	public beautify(source: string, options: any): string {
		return jsBeautify.html(source, options);
	}
}
