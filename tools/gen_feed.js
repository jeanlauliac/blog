#!/usr/bin/env node

'use strict';

const Articles = require('./lib/Articles');
const Feed = require('./lib/Feed');
const NodeDeps = require('./lib/NodeDeps');
const React = require('React');
const fs = require('fs');
const path = require('path');

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
  const xml = Feed.render(manifests);
  fs.writeFileSync(outputPath, xml);
  writeDepFile(depfilePath, outputPath, NodeDeps.get());
})();
