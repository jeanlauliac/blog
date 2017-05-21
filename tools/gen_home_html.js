#!/usr/bin/env node

'use strict';

const Articles = require('./lib/Articles');
const HomePage = require('./lib/HomePage');
const NodeDeps = require('./lib/NodeDeps');
const React = require('React');
const fs = require('fs');
const path = require('path');

const DOCTYPE = '<!DOCTYPE html>\n'

function buildHTML(manifests) {
  const html = DOCTYPE + React.renderToStaticMarkup(
    <HomePage articles={manifests} />
  );
  return html;
}

function writeDepFile(depfilePath, outputPath, depPaths) {
  const st = fs.createWriteStream(depfilePath);
  st.write(`${outputPath}: ${depPaths.join(' ')}\n`);
  st.end();
}

(function main() {
  const outputPath = process.argv[2];
  const depfilePath = process.argv[3];
  const inputPaths = process.argv.slice(4);
  const manifests = inputPaths.map(fp => Articles.readManifestSync(fp));
  const html = buildHTML(manifests);
  fs.writeFileSync(outputPath, html);
  writeDepFile(depfilePath, outputPath, NodeDeps.get());
})();
