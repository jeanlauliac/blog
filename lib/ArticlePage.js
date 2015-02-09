var Page = require('./Page')
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
      <Page title={this.props.title}>
        {this._renderArticle()}
      </Page>
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
        <p className='author'>
          <a href='/' rel='author'>Jean Lauliac</a>
          <a className='icon-twitter' href='https://twitter.com/jeanlauliac' />
          <a className='icon-github' href='https://github.com/jeanlauliac' />
        </p>
      </article>
    )
  },
})

module.exports = ArticlePage
