import * as vscode from 'vscode';
import * as assert from 'assert';
import * as fs from 'fs';
import { AssetType, FileInfo } from '../../compiler';
import { SASSCompiler } from '../../compiler/sass';
import { ExportFormat } from '../../settings';
import { writeTmpFile } from '.';

suite('SASS Compiler Test Suite', () => {
	vscode.window.showInformationMessage('Start sass compiler tests.');

	const testFormats: ExportFormat[] = [
		{ style: 'expanded', exportMap: true },
		{ style: 'expanded', exportMap: true, extension: 'ext' },
		{ style: 'compressed', exportMap: true },
		{ style: 'compressed', exportMap: true, extension: 'min.ext' },
	];

	const testCompile = (data: string, indent: boolean) => {
		const compiler = new SASSCompiler(indent);
		const tmpFile = writeTmpFile(data);
		const fileInfo = new FileInfo(tmpFile);
		fileInfo.type = AssetType.SASS;
		fileInfo.formats = testFormats;
		assert.strictEqual(true, compiler.compile(fileInfo), 'compile error');
		assert.strictEqual(true, fs.existsSync(`${tmpFile}.css`), 'css not generated!');
		assert.strictEqual(true, fs.existsSync(`${tmpFile}.css.map`), 'css map not generated!');
		assert.strictEqual(true, fs.existsSync(`${tmpFile}.min.css`), 'min css not generated!');
		assert.strictEqual(true, fs.existsSync(`${tmpFile}.min.css.map`), 'min css map not generated!');
		assert.strictEqual(true, fs.existsSync(`${tmpFile}.ext`), 'css not generated!');
		assert.strictEqual(true, fs.existsSync(`${tmpFile}.ext.map`), 'css map not generated!');
		assert.strictEqual(true, fs.existsSync(`${tmpFile}.min.ext`), 'min css not generated!');
		assert.strictEqual(true, fs.existsSync(`${tmpFile}.min.ext.map`), 'min css map not generated!');
		fs.unlinkSync(tmpFile);
		fs.unlinkSync(`${tmpFile}.css`);
		fs.unlinkSync(`${tmpFile}.css.map`);
		fs.unlinkSync(`${tmpFile}.min.css`);
		fs.unlinkSync(`${tmpFile}.min.css.map`);
		fs.unlinkSync(`${tmpFile}.ext`);
		fs.unlinkSync(`${tmpFile}.ext.map`);
		fs.unlinkSync(`${tmpFile}.min.ext`);
		fs.unlinkSync(`${tmpFile}.min.ext.map`);
	};

	test('Test compile SCSS', () => {
		testCompile(`
@mixin logofont {
	font: {
		family: "lucida grande", "lucida sans", sans-serif;
		size:   300%;
		weight: bold;
	}
}
h1 {
	@include logofont;
	small {
		font-size: 50%;
	}
}
span {
	font-weight: normal;
}
a {
	@extend span;
	color: red;
	&:hover {
		color: blue;
	}
}
`, false);
	});

	test('Test compile SASS with tab indent', () => {
		testCompile(`
@mixin logofont
	font
		family: "lucida grande", "lucida sans", sans-serif
		size:   300%
		weight: bold

h1
	@include logofont
	small
		font-size: 50%

span
	font-weight: normal

a
	@extend span
	color: red
	&:hover
		color: blue
`, true);
	});

	test('Test compile SASS with 2 space indent', () => {
		testCompile(`
@mixin logofont
  font
    family: "lucida grande", "lucida sans", sans-serif
    size:   300%
    weight: bold

h1
  @include logofont
  small
    font-size: 50%

span
  font-weight: normal

a
  @extend span
  color: red
  &:hover
    color: blue
`, true);
	});

	test('Test compile SASS with 4 space indent', () => {
		testCompile(`
@mixin logofont
    font
        family: "lucida grande", "lucida sans", sans-serif
        size:   300%
        weight: bold

h1
    @include logofont
    small
        font-size: 50%

span
    font-weight: normal

a
    @extend span
    color: red
    &:hover
        color: blue
`, true);
	});
});
