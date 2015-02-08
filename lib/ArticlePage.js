var React = require('react')
var moment = require('moment')

var GOOGLE_SCRIPT = `
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-59510471-1', 'auto');
  ga('send', 'pageview');
`

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
          {this._renderTrackingScript()}
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

  _renderTrackingScript() {
    return (
      <script dangerouslySetInnerHTML={{ __html: GOOGLE_SCRIPT }} />
    );
  },
})

module.exports = ArticlePage