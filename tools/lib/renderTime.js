var React = require('react')
var moment = require('moment')

function renderTime(dateTime) {
  // if (!value) {
  //   return null
  // }
  // var dateTime = moment(value)
  return (
    <time dateTime={dateTime.toISOString()}>
      {dateTime.format('D MMM YYYY')}
    </time>
  );
}

module.exports = renderTime
