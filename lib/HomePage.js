var Author = require('./Author')
var Page = require('./Page')
var React = require('react')
var renderTime = require('./renderTime')

var HomePage = React.createClass({
  propTypes: {
    articles: React.PropTypes.array.isRequired,
  },

  render() {
    return (
      <Page title='Jean Lauliac'>
        {this._renderArticles()}
        <Author />
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
