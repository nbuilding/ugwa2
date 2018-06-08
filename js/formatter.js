// TODO

const Formatter = {
  time(minutes) {
    return minutes + " minutes";
  },
  duration(minutes) {
    return minutes + " minutes";
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
