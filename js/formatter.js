// TODO

const Formatter = {
  time(minutes) {
    return `at <em>${minutes}</em> minutes`;
  },
  duration(minutes) {
    return `for <em>${minutes}</em> minutes`;
  },
  date(month, date) {
    return 'month ' + month + ', date ' + date;
  },
  weekday(day) {
    return 'day #' + day + ' of the week';
  },
  phrase(phraseID, ...params) {
    return phraseID + ": " + JSON.stringify(params);
  }
};
