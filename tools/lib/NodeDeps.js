'use strict';

function get() {
  return Object.values(require.cache)
    .filter(module => !/\/node_modules\//.test(module.filename))
    .map(module => module.filename)
}

module.exports = {get};
