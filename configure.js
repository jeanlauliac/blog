#!/usr/bin/env node

const {Manifest} = require('@jeanlauliac/upd-configure');
const manifest = new Manifest();

const BUILD_DIR = '.build_files';
const OUTPUT_DIR = 'output';

const copy = manifest.cli_template('/bin/cp', [
  {variables: ['input_files', 'output_file']},
]);

manifest.rule(
  copy,
  [
    manifest.source('(favicon.png)'),
    manifest.source('(fonts/**/*)'),
  ],
  `${OUTPUT_DIR}/$1`
);

manifest.rule(
  manifest.cli_template('tools/gen_styles.js', [
    {variables: ['input_files', 'output_file']},
  ]),
  [manifest.source('styles.js')],
  `${OUTPUT_DIR}/index.css`
);

manifest.rule(
  manifest.cli_template('tools/gen_cname.js', [
    {variables: ['output_file']},
  ]),
  [manifest.source('tools/gen_cname.js')],
  `${OUTPUT_DIR}/CNAME`
);

const articles = manifest.source('articles/(*)/article.json');

manifest.rule(
  manifest.cli_template('node_modules/.bin/babel-node', [
    {
      literals: ['--presets', 'react', 'tools/gen_article_html.js'],
      variables: ['output_file', 'dependency_file', 'input_files'],
    },
  ]),
  [articles],
  `${OUTPUT_DIR}/$1/index.html`
);

manifest.rule(
  manifest.cli_template('node_modules/.bin/babel-node', [
    {
      literals: ['--presets', 'react', 'tools/gen_home_html.js'],
      variables: ['output_file', 'dependency_file', 'input_files'],
    },
  ]),
  [articles],
  `${OUTPUT_DIR}/index.html`
);

manifest.rule(
  manifest.cli_template('node_modules/.bin/babel-node', [
    {
      literals: ['--presets', 'react', 'tools/gen_feed.js'],
      variables: ['output_file', 'dependency_file', 'input_files'],
    },
  ]),
  [articles],
  `${OUTPUT_DIR}/feed.xml`
);

manifest.export(__dirname);
