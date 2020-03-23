const fs = require('fs');
const { LoremIpsum } = require("lorem-ipsum");
const argv = require('yargs')
    .option('input', {
        alias: 'i',
        describe: 'input file(s)',
        type: 'array',
        demandOption: true
    })
    .option('output', {
        alias: 'o',
        describe: 'output file(s)',
        default: [],
        type: 'array'
    })
    .option('single', {
        alias: 's',
        describe: 'replace text nodes with only a single word',
        default: false,
        type: 'boolean'
    })
    .option('headers', {
        alias: 'h',
        describe: 'replace header text as well',
        default: true,
        type: 'boolean'
    })
    .option('exclude', {
        type: 'array',
        default: [],
        describe: 'list of element types to exclude, eg: --exclude p a'
    })
    .argv;

if(!argv.headers) {
    argv.exclude = [...argv.exclude, 'h1','h2','h3','h4','h5','h6'];
}

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

function textNodesUnder(node){
    var all = [];
    for (node=node.firstChild;node;node=node.nextSibling){
        if (node.nodeType==3) all.push(node);
        else all = all.concat(textNodesUnder(node));
    }
    return all;
}

function toTitleCase(text) {
    const words = text.split(' ');
    for(let i = 0; i < words.length; i++) {
        if(words[i].length) {
            words[i] = words[i][0].toUpperCase() + words[i].slice(1);
        }
    }
    return words.join(' ');
}


function replaceHTMLTextWithLorumIpsum(inputFile) {

    const inputHTML = fs.readFileSync(inputFile);
    const { JSDOM } = require('jsdom');
    const jsdom = new JSDOM( inputHTML );
    const { window } = jsdom;
    const { document } = window;
    global.window = window;
    global.document = document;
    const $ = global.jQuery = require('jquery');

    const elementsToExclude = (argv.exclude || []).join(',');

    textNodesUnder(document.body).forEach(node => {
        const text = node.textContent;
        if(text && typeof text === 'string') {
            const exclude = elementsToExclude.length && $(node).parents(elementsToExclude).length > 0
            const titleCase = text.match(/\b[a-z]/g) === null;
            const firstLetterUpperCase = text.match(/^\s*[a-z]/) === null;
            const containsText = text.match(/[a-zA-Z]/) !== null;
            const sentences = text.match(/[^.?!\n\r]+[.?!](?=\s|$)/g);
            const wordCount = (text.match(/\S+/g) || []).length;
            if(!exclude && containsText && wordCount > (argv.single ? 0 : 1)) {
                let ipsum = sentences ? lorem.generateSentences(sentences.length) : lorem.generateWords(wordCount);
                if(titleCase) {
                    ipsum = toTitleCase(ipsum);
                } else if(firstLetterUpperCase) {
                    ipsum = ipsum.replace(/^\s*[a-z]/, a => a.toUpperCase());
                }
                node.nodeValue = titleCase ? toTitleCase(ipsum) : ipsum;
            }
        }
    });

    const doctype = document.doctype;
    let html = "<!DOCTYPE "
            + doctype.name
            + (doctype.publicId ? ' PUBLIC "' + doctype.publicId + '"' : '')
            + (!doctype.publicId && doctype.systemId ? ' SYSTEM' : '') 
            + (doctype.systemId ? ' "' + doctype.systemId + '"' : '')
            + '>';
    html += document.documentElement.outerHTML;

    return html;
}

for(let i = 0; i < argv.input.length; i++) {
    let output = argv.output[i] || argv.input[i].match(/^(.*?)(\.\w+|$)/)[1] + '-lorum-ipsum.html';
    fs.writeFileSync(output, replaceHTMLTextWithLorumIpsum(argv.input[i]));
}