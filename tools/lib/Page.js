var Page = require('./Page')
var React = require('react')

var GOOGLE_SCRIPT = `
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-59510471-1', 'auto');
  ga('send', 'pageview');
`

var Page = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
  },

  render() {
    return (
      <html lang='en'>
        <head>
          <meta charSet='utf-8' />
          <meta name='viewport' content='width=device-width' />
          <title>{this.props.title}</title>
          <link
            href='http://fonts.googleapis.com/css?family=PT+Sans%7CPT+Serif:400,400italic%7CInconsolata'
            rel='stylesheet'
            type='text/css' />
          <link href='/index.css' rel='stylesheet' type='text/css' />
          <link href='/fonts/fontello.css' rel='stylesheet' type='text/css' />
          <link href='/feed.xml' rel='alternate' type='application/atom+xml' />
          <link rel="icon" href="/favicon.png" />
        </head>
        <body>
          <main>
            {this.props.children}
          </main>
          {this._renderTrackingScript()}
        </body>
      </html>
    );
  },

  _renderTrackingScript() {
    return (
      <script dangerouslySetInnerHTML={{ __html: GOOGLE_SCRIPT }} />
    );
  },
})

module.exports = Page
