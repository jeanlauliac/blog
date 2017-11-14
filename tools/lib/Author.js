var React = require('react')

var Author = React.createClass({
  render() {
    return (
      <p className="comments" style={{margin: '3rem 0 1rem 0'}}>
        Hi! I'm Jean. Find me{' '}
        <a href='https://twitter.com/jeanlauliac'>on Twitter</a>{' '}
        or <a href='https://github.com/jeanlauliac'>GitHub</a>.
      </p>
    )
  }
})

module.exports = Author
