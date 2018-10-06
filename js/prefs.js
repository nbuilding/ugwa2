// TODO

const Prefs = {

  periodData: {
    ZERO: {name: '0', desc: '', colour: null},
    A: {name: 'a period', desc: 'yanny howard', colour: [233, 30, 99]},
    B: {name: 'b period', desc: 'the woz', colour: [255, 193, 7]},
    C: {name: 'Period C', desc: 'le fup', colour: [103, 58, 183]},
    D: {name: 'D period', desc: 'TOLENDO TOLENS', colour: [33, 150, 243]},
    E: {name: 'pe', desc: 'so.... um... so... um....', colour: [139, 195, 74]},
    F: {name: 'very long class name muahaha', desc: 'vocabphilia', colour: [156, 39, 176]},
    G: {name: 'españñññññññol', desc: '¡¡¡¿¿¿¿INGLÉS????!!!!', colour: [255, 152, 0]},
    H: {name: 'h', desc: '', colour: null},
    BRUNCH: {name: 'brunch lol', desc: 'useful i guess for... idk', colour: null},
    LUNCH: {name: 'longer longer passing period', desc: 'I WANT TO PLAY SOME MINECRAAAAAFT', colour: null},
    FLEX: {name: 'unproductive yet free time meant to reduce stress that totally won\'t be replaced with something more stressful and restricting that is also meant to reduce stress', desc: 'ALL SUBMIT TO YUN', colour: [96, 125, 139]},
    SELF: {name: 'oh. no.', desc: 'DOWN WITH SELF', colour: [96, 125, 139]},
    STAFF_COLLAB: {name: 'collab', desc: '', colour: [96, 125, 139]},
    STAFF_MEETINGS: {name: 'meet', desc: '', colour: [96, 125, 139]}
  },

  options: {
    breaks: true,
    self: true,
    zero: false,
    h: [false, false, false, true, false],
    staff: false
  },

  getPdName(period) {
    if (this.periodData[period]) {
      return this.periodData[period].name || '';
    } else {
      return period;
    }
  },

  getPdDesc(period) {
    return this.periodData[period] && this.periodData[period].desc || '';
  },

  getPdColour(period) {
    return this.periodData[period] && this.periodData[period].colour || null;
  },

  createPeriod(period) {
    this.periodData[period] = {name: period, note: '', colour: null}
  }

};

on('new name', (period, name) => {
  if (!Prefs.periodData[period]) Prefs.createPeriod(period);
  Prefs.periodData[period].name = name;
});
on('new note', (period, note) => {
  if (!Prefs.periodData[period]) Prefs.createPeriod(period);
  Prefs.periodData[period].note = note;
});
on('new colour', (period, colour) => {
  if (!Prefs.periodData[period]) Prefs.createPeriod(period);
  Prefs.periodData[period].colour = colour;
});
