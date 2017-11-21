#!/usr/bin/env node

const {Manifest} = require('@jeanlauliac/upd-configure');
const child_process = require('child_process');
const manifest = new Manifest();

const BUILD_DIR = '.git/__build_files';
const OUTPUT_DIR = 'output';

const copy = manifest.cli_template('/bin/cp', [
  {variables: ['input_files', 'output_file']},
]);

const jsFiles = manifest.rule(
  manifest.cli_template('node_modules/.bin/babel', [
    {
      literals: ['--presets', 'react', '-o'],
      variables: ['output_file', 'input_files'],
    },
  ]),
  [manifest.source('(tools/**/*.js)')],
  `${BUILD_DIR}/$1`,
);

manifest.rule(
  copy,
  [
    manifest.source('(favicon.png)'),
    manifest.source('(fonts/**/*)'),
  ],
  `${OUTPUT_DIR}/$1`,
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
const nodeBin = child_process.execSync('which node', {encoding: 'utf8'}).split('\n')[0];

manifest.rule(
  manifest.cli_template(nodeBin, [
    {
      literals: [`${BUILD_DIR}/tools/gen_article_html.js`],
      variables: ['output_file', 'dependency_file', 'input_files'],
    },
  ]),
  [articles],
  `${OUTPUT_DIR}/$1/index.html`,
  [jsFiles],
);

manifest.rule(
  manifest.cli_template(nodeBin, [
    {
      literals: [`${BUILD_DIR}/tools/gen_home_html.js`],
      variables: ['output_file', 'dependency_file', 'input_files'],
    },
  ]),
  [articles],
  `${OUTPUT_DIR}/index.html`,
  [jsFiles],
);

manifest.rule(
  manifest.cli_template(nodeBin, [
    {
      literals: [`${BUILD_DIR}/tools/gen_feed.js`],
      variables: ['output_file', 'dependency_file', 'input_files'],
    },
  ]),
  [articles],
  `${OUTPUT_DIR}/feed.xml`,
  [jsFiles],
);

manifest.export(__dirname);
