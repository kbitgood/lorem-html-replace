# Lorem HTML Replace

This is a tool for replacing all the text in HTML files with Lorum Ipsum garble-de-gook

## Usage

This is written as a command line tool so to invoke it use node:

```
node convert.js <options>
```

## Options

`--input <file1> <file2> <...>` or `-i <file1> <file2> <...>`

A list of files to input into the script. The script expects HTML files. Required if `folder` is not set.

`--output <file1> <file2> <...>` or `-o <file1> <file2> <...>`

A list of file locations to output to. Must be in the same order as the files specified in `input`. Defaults to use the same path as the input files but with "-lorem-ipsum" appended to the file name.

`--folder <folder>` or `-f <folder>`

Instead of inputing all files manually you can specify a folder. The script will use all HTML files in the folder recursively. Required if `input` is not set.

`--single` or `-s` or `--no-single`

A boolean specifying whether to tnclude or exclude text nodes that only contain a single word. Defaults to `false`. 

`--headers` or `-h` or `--no-headers`

A boolean specifying whether to tnclude or exclude text nodes that are in header tags. Defaults to `true`.

`--exclude <tagName> <tagName> <...>`

A list of tag names (ie: `p`, `div`, `td`, etc.) to exclude from the conversion to lorum ipsum. Defaults to none.