#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

(function main() {
  const stfunc = require(path.resolve(process.cwd(), process.argv[2]));
  stfunc((error, css) => {
    if (error) throw error;
    fs.writeFileSync(process.argv[3], css);
  });
})();
