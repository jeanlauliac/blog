var ArticlePage = require('./ArticlePage')
var HomePage = require('./HomePage')
var React = require('react')
var async = require('async')
var fs = require('fs')
var marked = require('marked')
var moment = require('moment')
var mkdirp = require('mkdirp')
var ncp = require('ncp')
var path = require('path')
var styles = require('./styles')

var Directory = {
  ARTICLES: 'articles',
  OUTPUT: 'output',
}

var MetaField = {
  CONTENT: 'content',
  PUBLISHED: 'published',
  TITLE: 'title',
  UPDATED: 'updated',
}

var FILE_OPTS = { encoding: 'utf8' }
var MD_OPTS = { smartypants: true }

function buildArticleFromContent(info, content, cb) {
  var outDir = path.join(Directory.OUTPUT, info.key)
  mkdirp(outDir, (error) => {
    if (error) {
      cb(error)
      return
    }
    var outFile = path.join(outDir, 'index.html')
    if (!info.published) {
      fs.unlink(outFile, cb)
      return
    }
    var htmlContent = marked(content, MD_OPTS);
    var html = React.renderToStaticMarkup(
      <ArticlePage
        htmlContent={htmlContent}
        article={info}
      />
    )
    fs.writeFile(outFile, html, FILE_OPTS, (error) => {
      if (error) {
        cb(error)
        return
      }
      cb()
    })
  })
}

function buildArticleFromInfo(info, cb) {
  var contentFileName = info.contentFile
  var contentFile = path.join(Directory.ARTICLES, info.key, contentFileName)
  fs.readFile(contentFile, FILE_OPTS, (error, content) => {
    if (error) {
      cb(error)
      return
    }
    buildArticleFromContent(info, content, cb)
  })
}

function buildArticles(cb) {
  fs.readdir(Directory.ARTICLES, (error, articleKeys) => {
    if (error) {
      cb(error)
      return
    }
    async.map(articleKeys, getArticleInfo, (error, articles) => {
      if (error) {
        cb(error)
        return
      }
      async.parallel([
        buildHome.bind(null, articles),
        buildArticlesFromInfo.bind(null, articles),
      ], cb)
    })
  })
}

function buildArticlesFromInfo(articles, cb) {
  async.each(articles, (info, cb) => buildArticleFromInfo(info, cb), cb)
}

function buildCNAME(cb) {
  var outFile = path.join(Directory.OUTPUT, 'CNAME')
  fs.writeFile(outFile, 'jeanlauliac.com\n', FILE_OPTS, cb)
}

function buildHome(articles, cb) {
   var html = React.renderToStaticMarkup(
    <HomePage
      articles={articles}
    />
  )
  var outFile = path.join(Directory.OUTPUT, 'index.html')
  fs.writeFile(outFile, html, FILE_OPTS, cb)
}

function buildFonts(cb) {
  ncp('fonts', 'output/fonts', cb)
}

function buildStyles(cb) {
  styles((error, css) => {
    if (error) {
      cb(error)
      return
    }
    var cssFile = path.join(Directory.OUTPUT, 'index.css')
    fs.writeFile(cssFile, css, cb)
  })
}

function getArticleInfo(key, cb) {
  var metaFile = path.join(Directory.ARTICLES, key, 'article.json')
  fs.readFile(metaFile, FILE_OPTS, (error, data) => {
    if (error) {
      cb(error)
      return
    }
    var meta = JSON.parse(data)
    if (!meta.hasOwnProperty(MetaField.TITLE)) {
      cb(new TypeError('missing `title` field for article `' + key + '`'))
      return
    }
    cb(null, {
      contentFile: meta[MetaField.CONTENT] || 'index.md',
      key,
      published:
        typeof meta[MetaField.PUBLISHED] !== 'boolean' ||
        meta[MetaField.PUBLISHED],
      title: meta[MetaField.TITLE],
      updated:
        meta[MetaField.UPDATED] ?
          moment(meta[MetaField.UPDATED]).valueOf() :
          null,
    })
  })
}

;(function main(cb) {
  var done = false
  process.on('exit', () => {
    if (!done) {
      throw new Error('callback not called')
    }
  })
  async.parallel([
    buildArticles,
    buildCNAME,
    buildFonts,
    buildStyles,
  ], (error) => {
    done = true
    if (error) {
      throw error
    }
  })
})()
