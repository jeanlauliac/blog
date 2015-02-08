var React = require('react')

var ArticlePage = React.createClass({
  propTypes: {
    htmlContent: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
  },

  render() {
    return (
      <html>
        <head><title>{this.props.title}</title></head>
        <body>
          {this._renderArticle()}
        </body>
      </html>
    );
  },

  _renderArticle() {
    return (
      <article>
        <h1 id='main'>{this.props.title}</h1>
        <section dangerouslySetInnerHTML={{
          __html: this.props.htmlContent,
        }} />
      </article>
    )
  },
})

module.exports = ArticlePage