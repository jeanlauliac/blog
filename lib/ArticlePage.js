var Author = require('./Author')
var Page = require('./Page')
var React = require('react')
var renderTime = require('./renderTime')

var ArticlePage = React.createClass({
  propTypes: {
    htmlContent: React.PropTypes.string.isRequired,
    article: React.PropTypes.object.isRequired,
  },

  render() {
    return (
      <Page title={this.props.article.title}>
        {this._renderArticle()}
      </Page>
    );
  },

  _renderArticle() {
    var article = this.props.article
    return (
      <article>
        <a id='home' className='icon-home' href='/' />
        <h1 id='main'>{article.title}</h1>
        {article.updated && renderTime(article.updated)}
        <section dangerouslySetInnerHTML={{
          __html: this.props.htmlContent,
        }} />
        <Author />
      </article>
    )
  },
})

module.exports = ArticlePage
