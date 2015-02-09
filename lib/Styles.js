var Absurd = require('Absurd')
var modularScale = require('modular-scale')

var ANCHOR_COLOR = 'rgb(96,159,155)'
var ANCHOR_VISITED_COLOR = 'rgb(126,159,155)'
var SCALE = modularScale(1.145, 8).map(e => e + 'rem')
var LIGHT_GRAY = 'rgb(202,195,191)'
var LESS_LIGHT_GRAY = 'rgb(172,165,161)'

function makeHeaders() {
  var obj = {}
  Array.apply(null, Array(5)).forEach((_, i) => {
    obj['h' + (i + 1)] = {
      fontSize: SCALE[i],
      fontWeight: 400,
    }
  })
  return obj
}

function styles(cb) {
  var ab = new Absurd()
  ab.add({
    body: {
      backgroundColor: 'rgb(251, 250, 245)',
      color: '#363533',
      fontFamily: "'PT Serif', serif",
      fontSize: '100%',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    article: {
      maxWidth: '50rem',
      margin: '4rem auto',
      padding: '0 2rem'
    },
    section: {
      maxWidth: '40rem',
    },
    time: {
      color: LIGHT_GRAY,
      fontStyle: 'italic',
    },
    hr: {
      maxWidth: '3rem',
      backgroundColor: LIGHT_GRAY,
      border: 'none',
      height: '1px',
      margin: '3rem 0 1rem 0',
    },
    'p.author': {
      color: LIGHT_GRAY,
      fontStyle: 'italic',
      a: {
        border: 'none',
        color: 'inherit',
        marginRight: '.4em',
        ':hover': {
          color: LESS_LIGHT_GRAY,
        },
      },
    },
    a: {
      color: ANCHOR_COLOR,
      textDecoration: 'none',
      ':hover': {
        borderBottom: '1px dotted ' + ANCHOR_COLOR,
      },
      ':visited': {
        color: ANCHOR_VISITED_COLOR,
      },
    },
    '::selection': {
      backgroundColor: 'rgb(240, 235, 225)',
    },
  })
  ab.add(makeHeaders())
  ab.compile(cb)
}

module.exports = styles
