// TODO

const Formatter = {
  time(minutes) {
    return minutes + " minutes";
  },
  duration(minutes) {
    return minutes + " minutes";
  },
  phrase(phraseID, ...params) {
    return phraseID + ": " + JSON.stringify(params);
  }
};
