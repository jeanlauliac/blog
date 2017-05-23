const Author = require('./Author');
const Page = require('./Page');
const React = require('react');
const moment = require('moment');
const renderTime = require('./renderTime');

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
    );
  },

  _renderArticles() {
    return (
      <ul className='articles'>
        {this._renderYears(this.props.articles)}
      </ul>
    );
  },

  _renderYears(articles) {
    const artsByYear = groupBy(articles, ar => {
      return ar.updated.clone().dayOfYear(1).valueOf();
    });
    const years = Array.from(artsByYear.entries()).sort((a, b) => b[0] - a[0]);
    return years.map(year => (
      <li key={year[0]}>
        <h1>{moment(year[0]).year()}</h1>
        <ul>
          {this._renderYearArticles(year[1])}
        </ul>
      </li>
    ));
  },

  _renderYearArticles(articles) {
    articles = articles.sort((a, b) => b.updated.diff(a.updated));
    return articles.map(article => {
      return (
        <li key={article.key}>
          <h2>
            <a href={'/' + article.key}>
              {article.title}
            </a>
          </h2>
          {article.updated && renderTime(article.updated)}
        </li>
      );
    });
  },
})

function groupBy(iter, fn) {
  const result = new Map();
  for (const el of iter) {
    const key = fn(el);
    let arr = result.get(key);
    if (arr == null) {
      arr = [];
      result.set(key, arr);
    }
    arr.push(el);
  }
  return result;
}

module.exports = HomePage
