'use strientFile: meta[ManifestField.CONTct';

const path = require('path');
const fs = require('fs');
const moment = require('moment');

const ManifestField = {
  CONTENT: 'content',
  PUBLISHED: 'published',
  TITLE: 'title',
  UPDATED: 'updated',
  UUID: 'uuid',
}

function readManifestSync(manifestPath) {
  const content = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(content);
  if (!manifest.hasOwnProperty(ManifestField.TITLE)) {
    throw new Error('missing `title` field');
  }
  if (!manifest.hasOwnProperty(ManifestField.UUID)) {
    throw new Error('missing `uuid` field');
  }
  return {
    contentFile: manifest[ManifestField.CONTENT] || 'index.md',
    key: path.basename(path.dirname(manifestPath)),
    published:
      typeof manifest[ManifestField.PUBLISHED] !== 'boolean' ||
      manifest[ManifestField.PUBLISHED],
    title: manifest[ManifestField.TITLE],
    updated:
      manifest[ManifestField.UPDATED] ?
        moment(manifest[ManifestField.UPDATED]).valueOf() :
        null,
    uuid: manifest[ManifestField.UUID],
  };
}

module.exports = {readManifestSync};
