#!/usr/bin/env node

'use strict';

const ArticlePage = require('../lib/ArticlePage');
const Articles = require('./lib/Articles');
const React = require('React');
const fs = require('fs');
const marked = require('marked');
const path = require('path');
const pygmentize = require('pygmentize-bundled');

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
    const html = DOCTYPE + React.renderToStaticMarkup(
      <ArticlePage
        htmlContent={htmlContent}
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
    writeDepFile(depfilePath, outputPath, [contentPath]);
  });
})();
