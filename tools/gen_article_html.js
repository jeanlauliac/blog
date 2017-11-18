#!/usr/bin/env node

'use strict';

const ArticlePage = require('./lib/ArticlePage');
const Articles = require('./lib/Articles');
const NodeDeps = require('./lib/NodeDeps');
const React = require('React');
const fs = require('fs');
const marked = require('marked');
const path = require('path');
const pygmentize = require('pygmentize-bundled');
const {JSDOM} = require('jsdom');

const DOCTYPE = '<!DOCTYPE html>\n'

const MD_OPTS = {
  smartypants: true,
  highlight: (code, lang, cb) => {
    pygmentize({
      lang,
      format: 'html',
      options: { nowrap: true },
    }, code, (error, value) => {
      cb(error, value.toString().trim());
    });
  },
};

function buildHTML(dirPath, contentPath, manifest, cb) {
  if (!manifest.published) {
    process.nextTick(() => cb(null, ''));
    return;
  }
  const content = fs.readFileSync(contentPath, 'utf8');
  marked(content, MD_OPTS, (error, htmlContent) => {
    if (error) {
      cb(error)
      return
    }
    const dom = JSDOM.fragment(`<div>${htmlContent}</div>`);
    const elems = dom.firstChild.children;
    for (let i = 0; i < elems.length; ++i) {
      const elem = elems[i];
      if (elem.tagName !== 'P') continue;
      const nodes = elem.childNodes;
      for (let j = 0; j < nodes.length; ++j) {
        const node = nodes[j];
        if (typeof node.nodeValue !== 'string') continue;
      // last.nodeValue = last.nodeValue.replace(/[ \n]+([^ \n]+)$/, '\u00A0$1');
        node.nodeValue = node.nodeValue.replace(/[ \n]+([a-zA-Z0-9-]{1,8}[.:,;])/g, '\u00A0$1');
      }
    }
    const html = DOCTYPE + React.renderToStaticMarkup(
      <ArticlePage
        htmlContent={dom.firstChild.innerHTML}
        article={manifest}
      />
    );
    cb(null, html);
  });
}

function writeDepFile(depfilePath, outputPath, depPaths) {
  const st = fs.createWriteStream(depfilePath);
  st.write(`${outputPath}: ${depPaths.join(' ')}\n`);
  st.end();
}

(function main() {
  const outputPath = process.argv[2];
  const depfilePath = process.argv[3];
  const inputPath = process.argv[4];
  const manifest = Articles.readManifestSync(inputPath);
  const dirPath = path.dirname(inputPath);
  const contentPath = path.resolve(dirPath, manifest.contentFile);
  buildHTML(dirPath, contentPath, manifest, (error, html) => {
    if (error) throw error;
    fs.writeFileSync(outputPath, html);
    writeDepFile(depfilePath, outputPath, NodeDeps.get().concat([contentPath]));
  });
})();
