var Page = require('./Page')
var React = require('react')
var renderTime = require('./renderTime')

var DISCLAIMER = `This is a personal site. The opinions expressed here are my
own and not those of my employer.`

var HomePage = React.createClass({
  propTypes: {
    articles: React.PropTypes.array.isRequired,
  },

  render() {
    return (
      <Page title='Jean Lauliac'>
        {this._renderArticles()}
        <hr />
        <p className='light'>{DISCLAIMER}</p>
      </Page>
    )
  },

  _renderArticles() {
    var articles = this.props.articles.sort((a, b) => b.updated - a.updated)
    return (
      <ul className='articles'>
        {articles.map((article) => {
          return <li key={article.key}>
            <h1>
              <a href={'/' + article.key}>
                {article.title}
              </a>
            </h1>
            {article.updated && renderTime(article.updated)}
          </li>
        })}
      </ul>
    )
  },
})

module.exports = HomePage
