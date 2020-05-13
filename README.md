# Web assets compiler

A VSCode Extension that help you to compile SASS/SCSS files to CSS files.

## Features

* Compile SASS/SCSS to CSS
* Autoprefix support for CSS
* Live compile when save file
* Customize format of export files
* Customize compile options for a file/folder

## Usage/Shortcuts

1. Open command by press `F1` or `Ctrl + Shift + P` (`Cmd + Shift + P` on MAC) and type `Web assets compiler: Compile This File` to compile opening file.
1. Open command by press `F1` or `Ctrl + Shift + P` (`Cmd + Shift + P` on MAC) and type `Web assets compiler: Compile All` to start compiler.

## Extension Settings

You can use VS Code configurations or `.webassetcompiler.json` file at root of work folder.  
`.webassetcompiler.json` will overwrites VS Code configurations  
All changed in VS Code configurations will be reflected in `.webassetcompiler.json` if exists

### VSCode settings

```javascript
{
    // enable/disable compile on save
    // default is false
    "webAssetsCompiler.compileOnSave": true,
    // export format list
    "webAssetsCompiler.exportFormats": [
        {
            // export style, expanded/compressed
            "format": "",
            // output file extension
            "extension": "",
            // enable/disable export source mapping
            // default is true
            "sourceMap": true
        }
    ],
    // list of watching folders
    "webAssetsCompiler.targetFolders" : [
        {
            // watching folder, relative path from work folder
            "input": "",
            // output folder, relative path from work folder
            "output": "",
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
                    "sourceMap": true
                }
            ],
        }
    ]
}
```

### `.webassetcompiler.json` file

Same as VS Code settings without `webAssetsCompiler` prefix
