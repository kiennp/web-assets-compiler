# Web assets compiler

A VSCode Extension that help you to compile SASS/SCSS files to CSS files.

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/kiennp.web-assets-compiler?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=kiennp.web-assets-compiler)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/kiennp.web-assets-compiler?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=kiennp.web-assets-compiler)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/d/kiennp.web-assets-compiler?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=kiennp.web-assets-compiler)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/kiennp.web-assets-compiler?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=kiennp.web-assets-compiler)
[![GitHub](https://img.shields.io/github/license/kiennp/web-assets-compiler?style=flat-square)](https://github.com/kiennp/web-assets-compiler)

## Features

* Use `js-beautify` as SCSS/CSS/JS/HTML formatter
* Compile SASS/SCSS to CSS
* Autoprefix support for CSS
* Live compile when save file
* Customize format of export files
* Customize compile options for a file/folder

## Usage/Shortcuts

1. Open command by press `F1` or `Ctrl + Shift + P` (`Cmd + Shift + P` on MAC) and type `Web assets compiler: Compile This File` to compile opening file.
1. Open command by press `F1` or `Ctrl + Shift + P` (`Cmd + Shift + P` on MAC) and type `Web assets compiler: Compile All` to start compiler.
1. Open command by press `F1` or `Ctrl + Shift + P` (`Cmd + Shift + P` on MAC) and type `Web assets compiler: Generate config file` to save settings to config file in workspace root folder.

## Extension Settings

* You can use VS Code configurations or `.webassetcompiler.json` file at root of work folder.  
* `.webassetcompiler.json` will overwrites VS Code configurations  
* All changed in VS Code configurations will be reflected in `.webassetcompiler.json` if file is exists

### VSCode settings

```javascript
{
    // enable/disable compile on save
    // default is true
    "webAssetsCompiler.compileOnSave": true,
    // export format list
    "webAssetsCompiler.exportFormats": [
        {
            // export style, expanded/compressed
            "format": "expanded",
            // output file extension (without dot)
            "extension": "",
            // enable/disable export source mapping
            // default is false
            "sourceMap": false
        }
    ],
    // list of watching folders
    "webAssetsCompiler.targetFolders" : [
        {
            // watching folder, relative path from work folder
            "input": "",
            // output folder, relative path from work folder
            "output": "",
            // watching all sub folder or not
            // default is true
            "includeSubFolder": true,
            // file name regex of include list
            // include all files if this value isn't set
            "includePattern": "",
            // file name regex of exclude list
            // no file is excluded if this value isn't set
            "excludePattern": "",
            // type of input file, SASS/SCSS
            // file extension will be used to check language name if this value isn't set
            "languageName": "",
            // same as `webAssetsCompiler.exportFormats`
            // `webAssetsCompiler.exportFormats` will be used if this value isn't set
            "formats": [
                {
                    "format": "expanded",
                    "extension": "",
                    "sourceMap": false
                }
            ],
        }
    ]
}
```

### `.webassetcompiler.json` file

Same as VS Code settings without `webAssetsCompiler` prefix

## Autoprefixer settings

Settings same as browserslist.  
[Click here for more details](https://github.com/browserslist/browserslist#queries)

## SCSS/CSS/JS/HTML formatter settings

Settings same as css formatter in `js-beautify`.  
[Click here for more details](https://github.com/beautify-web/js-beautify#loading-settings-from-environment-or-jsbeautifyrc-javascript-only)
