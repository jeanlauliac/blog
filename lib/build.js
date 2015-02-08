var ArticlePage = require('./ArticlePage')
var React = require('react')
var async = require('async')
var marked = require('marked')
var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')

var Directory = {
  ARTICLES: 'articles',
  OUTPUT: 'output',
}

var MetaField = {
  CONTENT: 'content',
  TITLE: 'title',
  UPDATED: 'updated',
}

var FILE_OPTS = { encoding: 'utf8' }
var MD_OPTS = { smartypants: true }

function buildArticle(key, cb) {
  var metaFile = path.join(Directory.ARTICLES, key, 'article.json')
  fs.readFile(metaFile, FILE_OPTS, (error, data) => {
    if (error) {
      cb(error)
      return
    }
    buildArticleFromMeta(key, JSON.parse(data), cb)
  })
}

function buildArticleFromContent(key, meta, content, cb) {
  var htmlContent = marked(content, MD_OPTS);
  if (!meta.hasOwnProperty(MetaField.TITLE)) {
    cb(new TypeError('missing `title` field for article `' + key + '`'))
    return
  }
  var html = React.renderToStaticMarkup(
    <ArticlePage title={meta[MetaField.TITLE]} htmlContent={htmlContent} />
  )
  var outDir = path.join(Directory.OUTPUT, key)
  mkdirp(outDir, (error) => {
    if (error) {
      cb(error)
      return
    }
    var outFile = path.join(outDir, 'index.html')
    fs.writeFile(outFile, html, FILE_OPTS, (error) => {
      if (error) {
        cb(error)
        return
      }
      cb()
    })
  })
}

function buildArticleFromMeta(key, meta, cb) {
  var contentFileName = meta[MetaField.CONTENT] || 'index.md'
  var contentFile = path.join(Directory.ARTICLES, key, contentFileName)
  fs.readFile(contentFile, FILE_OPTS, (error, content) => {
    if (error) {
      cb(error)
      return
    }
    buildArticleFromContent(key, meta, content, cb)
  })
}

;(function main(cb) {
  fs.readdir(Directory.ARTICLES, (error, articleKeys) => {
    if (error) {
      cb(error)
      return
    }
    async.each(articleKeys, buildArticle, cb)
  })
})((error) => {
  if (error) {
    throw error
  }
})