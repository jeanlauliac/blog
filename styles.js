var Absurd = require('Absurd')
var modularScale = require('modular-scale')

var ANCHOR_COLOR = 'rgb(159, 35, 53)'
var ANCHOR_VISITED_COLOR = 'rgb(159, 125, 129)'
var SCALE = modularScale(1.145, 8).map(e => e + 'rem')
var LIGHTEST_GRAY = 'rgb(240,237,235)'
var LIGHTER_GRAY = 'rgb(222,215,211)'
var LIGHT_GRAY = 'rgb(139, 134, 131)'
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
  var obj = {};
  Array.apply(null, Array(5)).forEach((_, i) => {
    obj['h' + (i + 1)] = {
      fontSize: SCALE[i],
      fontWeight: 400,
      margin: '2rem 0 1rem 0',
    };
  });
  return {article: obj};
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
      backgroundColor: 'rgb(255, 254, 251)',
      color: '#363534',
      fontFamily: "Georgia, Palatino, serif",
      fontSize: '100%',
      fontWeight: 400,
      lineHeight: 1.6,
      margin: 0,
      padding: 0,
    },
    main: {
      maxWidth: '58rem',
      margin: '1rem auto 2rem auto',
      padding: '0 1rem'
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
      fontFamily: 'monospace',
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
      backgroundColor: 'rgb(230, 225, 215)',
    },
    'ul.articles': {
      listStyle: 'none',
      padding: 0,
      ul: {
        listStyle: 'none',
        padding: 0,
      },
      h1: {
        fontSize: SCALE[4],
        margin: '2rem 0 0 0',
        fontWeight: 900,
      },
      h2: {
        fontSize: SCALE[3],
        margin: '1rem 0 0 0',
        fontWeight: 400,
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
      display: 'block',
      border: 'none',
      color: LIGHTER_GRAY,
      fontSize: '1.5rem',
      marginRight: '.4em',
      ':hover': {
        color: LIGHT_GRAY,
      },
    },
    '@media screen and (min-width: 64em)': {
      'a#home': {
        position: 'fixed',
        left: '1.2rem',
        top: '2.2rem',
      },
    },
  })
  ab.add(makeHeaders())
  ab.add(makeCodeHighlights())
  ab.compile(cb)
}

module.exports = styles
