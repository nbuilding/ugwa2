// TODO

const Prefs = {

  periodData: {
    A: {name: 'a period', desc: 'yanny howard', colour: [233, 30, 99]},
    B: {name: 'b period', desc: 'the woz', colour: [255, 193, 7]},
    C: {name: 'Period C', desc: 'le fup', colour: [103, 58, 183]},
    D: {name: 'D period', desc: 'TOLENDO TOLENS', colour: [33, 150, 243]},
    E: {name: 'pe', desc: 'TOLENDO TOLENS', colour: [139, 195, 74]},
    F: {name: 'very long class name muahaha', desc: 'vocabphilia', colour: [156, 39, 176]},
    G: {name: 'españñññññññol', desc: '¡¡¡¿¿¿¿INGLÉS????!!!!', colour: [255, 152, 0]},
    BRUNCH: {name: 'brunch lol', desc: 'useful i guess for... idk', colour: null},
    LUNCH: {name: 'longer longer passing period', desc: 'I WANT TO PLAY SOME MINECRAAAAAFT', colour: null},
    FLEX: {name: 'unproductive yet free time meant to reduce stress that totally won\'t be replaced with something more stressful and restricting that is also meant to reduce stress', desc: 'ALL SUBMIT TO YUN', colour: [96, 125, 139]}
  },

  getPdName(period) {
    return this.periodData[period] && this.periodData[period].name;
  },

  getPdDesc(period) {
    return this.periodData[period] && this.periodData[period].desc;
  },

  getPdColour(period) {
    return this.periodData[period] && this.periodData[period].colour;
  }

};

on('new name', (period, name) => {
  if (Prefs.periodData[period]) Prefs.periodData[period].name = name;
});
on('new note', (period, note) => {
  if (Prefs.periodData[period]) Prefs.periodData[period].note = note;
});
on('new colour', (period, colour) => {
  if (Prefs.periodData[period]) Prefs.periodData[period].colour = colour;
});
