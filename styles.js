var Absurd = require('Absurd')
var modularScale = require('modular-scale')

var ANCHOR_COLOR = 'rgb(96,159,155)'
var ANCHOR_VISITED_COLOR = 'rgb(87,136,132)'
var SCALE = modularScale(1.145, 8).map(e => e + 'rem')
var LIGHTEST_GRAY = 'rgb(240,237,235)'
var LIGHTER_GRAY = 'rgb(222,215,211)'
var LIGHT_GRAY = 'rgb(202,195,191)'
var LESS_LIGHT_GRAY = 'rgb(172,165,161)'

var KEYWORD_COLOR = 'rgb(166, 103, 57)';
var STRING_COLOR = 'rgb(165, 83, 111)';

var CODE_COLORS = {
  c1: 'rgb(190, 185, 173)',
  k: KEYWORD_COLOR,
  kd: KEYWORD_COLOR,
  kr: KEYWORD_COLOR,
  kt: KEYWORD_COLOR,
  p: 'rgb(148, 134, 125)',
  s: STRING_COLOR,
  s1: STRING_COLOR,
}

function makeHeaders() {
  var obj = {}
  Array.apply(null, Array(5)).forEach((_, i) => {
    obj['h' + (i + 1)] = {
      fontSize: SCALE[i],
      fontWeight: 400,
      margin: '2rem 0 1rem 0',
    }
  })
  return obj
}

function makeCodeHighlights() {
  var styles = {}
  for (var type in CODE_COLORS) {
    var color = CODE_COLORS[type]
    styles['.' + type] = { color }
  }
  return { pre: styles }
}

function styles(cb) {
  var ab = new Absurd()
  ab.add({
    html: {
      boxSizing: 'border-box',
    },
    '*, *:before, *:after': {
      boxSizing: 'inherit',
    },
    body: {
      backgroundColor: 'rgb(251, 250, 245)',
      color: '#363533',
      fontFamily: "'PT Serif', serif",
      fontSize: '100%',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    main: {
      maxWidth: '58rem',
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
    pre: {
      overflowX: 'auto',
      marginLeft: '-1rem',
      paddingLeft: '1rem',
      borderLeft: '3px solid ' + LIGHTEST_GRAY,
      lineHeight: 1.4,
    },
    'pre, code': {
      fontFamily: 'Inconsolata',
    },
    'p.light': {
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
    'p.comments': {
      fontStyle: 'italic',
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
    'ul.articles': {
      listStyle: 'none',
      padding: 0,
      h1: {
        fontSize: SCALE[2],
        margin: '2rem 0 0 0',
        a: {
          color: 'inherit',
          ':hover': {
            color: ANCHOR_COLOR,
            ':visited': {
              color: ANCHOR_VISITED_COLOR,
            },
          },
        }
      }
    },
    'a#home': {
      display: 'none',
    },
    '@media screen and (min-width: 64em)': {
      'a#home': {
        display: 'block',
        position: 'fixed',
        left: '1rem',
        top: '1.2rem',
        border: 'none',
        color: LIGHTER_GRAY,
        fontSize: '1.5rem',
        marginRight: '.4em',
        ':hover': {
          color: LIGHT_GRAY,
        },
      },
    },
  })
  ab.add(makeHeaders())
  ab.add(makeCodeHighlights())
  ab.compile(cb)
}

module.exports = styles
