#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

(function main() {
  fs.writeFileSync(process.argv[2], 'jeanlauliac.com\n');
})();
