var React = require('react')

var Author = React.createClass({
  render() {
    return (
      <div>
        <hr />
        <p className='comments'>
          I'm Jean. Find me{' '}
          <a href='https://twitter.com/jeanlauliac'>on Twitter</a>{' '}
          or <a href='https://github.com/jeanlauliac'>GitHub</a>.
        </p>
      </div>
    )
  }
})

module.exports = Author
