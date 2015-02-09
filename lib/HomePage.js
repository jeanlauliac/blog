var Page = require('./Page')
var React = require('react')

var DISCLAIMER = `This is personal site. The opinions expressed here are my
own and not those of my employer.`

var HomePage = React.createClass({
  propTypes: {
    articles: React.PropTypes.array.isRequired,
  },

  render() {
    return (
      <Page title='Jean Lauliac Homepage'>
        <p>{DISCLAIMER}</p>
      </Page>
    )
  },
})

module.exports = HomePage
