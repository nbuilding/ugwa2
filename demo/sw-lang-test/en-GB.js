const phrases = {
  TITLE: 'Different languages using service workers - Ugwa 2',
  HEADING: 'Different languages using service workers test',
  DIALECTAL_SPELLING: 'The following word is only here to test simplified vs. traditional English: ',
  COLOUR: 'colour',
  SELECT_LANG: 'Select a language:'
};

function translate(id) {
  return phrases[id];
}
