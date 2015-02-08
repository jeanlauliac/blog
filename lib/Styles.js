var Absurd = require('Absurd')

var Styles = {
  build(cb) {
    var ab = new Absurd()
    ab.add({
      body: {
        backgroundColor: 'red',
      },
    })
    ab.compile(cb)
  },
}

module.exports = Styles