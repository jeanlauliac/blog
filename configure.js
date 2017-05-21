#!/usr/bin/env node

const {Manifest} = require('@jeanlauliac/upd-configure');
const manifest = new Manifest();

const BUILD_DIR = '.build_files';
const OUTPUT_DIR = 'dist';

const copy = manifest.cli_template('cp', [
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
  [manifest.source('lib/Styles.js')],
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




// const resource_cpp_files = manifest.rule(
//   manifest.cli_template("build/embed-resource.js", [
//     {variables: ["output_file", "input_files"]},
//   ]),
//   resource_sources,
//   `${BUILD_DIR}/($1).cpp`
// );

// const resource_index_file = manifest.rule(
//   manifest.cli_template("build/build-resource-index.js", [
//     {variables: ["output_file", "input_files"]},
//   ]),
//   resource_sources,
//   `${BUILD_DIR}/headers/resources.h`
// );

// const compile_cpp_cli = manifest.cli_template('clang++', [
//   {literals: ["-c", "-o"], variables: ["output_file"]},
//   {
//     literals: ["-std=c++14", "-Wall", "-fcolor-diagnostics", "-MMD", "-MF"],
//     variables: ["dependency_file"]
//   },
//   {
//     literals: ["-I", "/usr/local/include", "-I", `${BUILD_DIR}/headers`],
//     variables: ["input_files"],
//   },
// ]);

// const compiled_cpp_files = manifest.rule(
//   compile_cpp_cli,
//   [
//     manifest.source("(src/**/*).cpp"),
//     resource_cpp_files,
//   ],
//   `${BUILD_DIR}/($1).o`,
//   [resource_index_file]
// );

// manifest.rule(
//   manifest.cli_template('clang++', [
//     {literals: ["-o"], variables: ["output_file"]},
//     {
//       literals: ['-framework', 'OpenGL', '-Wall', '-std=c++14',
//         '-lglew', '-lglfw3', '-fcolor-diagnostics', '-L', '/usr/local/lib'],
//       variables: ["input_files"]
//     },
//   ]),
//   [compiled_cpp_files],
//   "dist/gl-demo"
// );

manifest.export(__dirname);
