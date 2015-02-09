var React = require('react')

var Author = React.createClass({
  render() {
    return (
      <div>
        <hr />
        <p className='light'>
          <a href='/' rel='author'>Jean Lauliac</a>
          <a className='icon-twitter' href='https://twitter.com/jeanlauliac' />
          <a className='icon-github' href='https://github.com/jeanlauliac' />
        </p>
      </div>
    )
  }
})

module.exports = Author
