import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { tmpdir } from 'os';

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c, e) => {
		glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
			if (err) {
				return e(err);
			}

			// Add files to the test suite
			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

			try {
				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
					} else {
						c();
					}
				});
			} catch (err) {
				console.error(err);
				e(err);
			}
		});
	});
}

export function writeTmpFile(data: string): string {
	const tmpFile = path.join(tmpdir(), uuid.v4());
	fs.writeFileSync(tmpFile, data);
	return tmpFile;
}
