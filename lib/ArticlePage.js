var React = require('react')
var moment = require('moment')

var ArticlePage = React.createClass({
  propTypes: {
    htmlContent: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    dateTime: React.PropTypes.number,
  },

  render() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>
          <link
            href='http://fonts.googleapis.com/css?family=PT+Sans|PT+Serif:400,400italic|Inconsolata'
            rel='stylesheet'
            type='text/css' />
          <link
            href='/index.css'
            rel='stylesheet'
            type='text/css' />
        </head>
        <body>
          {this._renderArticle()}
        </body>
      </html>
    );
  },

  _renderArticle() {
    var dateTimeEl = null;
    if (this.props.dateTime) {
      var dateTime = moment(this.props.dateTime)
      dateTimeEl = (
        <time dateTime={dateTime.toISOString()}>
          {moment(dateTime).format('D MMM YYYY')}
        </time>
      )
    }
    return (
      <article>
        <h1 id='main'>{this.props.title}</h1>
        {dateTimeEl}
        <section dangerouslySetInnerHTML={{
          __html: this.props.htmlContent,
        }} />
        <hr />
        <p className='author'>Jean Lauliac</p>
      </article>
    )
  },
})

module.exports = ArticlePage