var React = require('react')
var moment = require('moment')
var xmlEscape = require('xml-escape')

var XML_META = '<?xml version="1.0" encoding="utf-8" ?>\n'

var Feed = {
  render(articles) {
    articles = articles.sort((a, b) => b.updated - a.updated)
    if (articles.length < 1) {
      throw new Error('need at least one article')
    }
    var entries = articles.map((article) => {
      return (
  `<entry>
    <title>${xmlEscape(article.title)}</title>
    <link type="text/html" href="${'/' + article.key}" />
    <updated>${moment(article.updated).toISOString()}</updated>
    <id>urn:uuid:${article.uuid}</id>
    <author><name>Jean Lauliac</name></author>
  </entry>`
      )
    })
    return (
      XML_META +
`<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${'Jean Lauliac'}</title>
  <link href="/" />
  <updated>${moment(articles[0].updated).toISOString()}</updated>
  <id>urn:uuid:CF0B3C2B-A9DA-4639-B14A-5F7315DE6EF1</id>
  ${entries.join('')}
</feed>
`
    )
  }
}

module.exports = Feed
