// TODO

const Prefs = {

  periodData: {
    ZERO: {name: '0 period', desc: '', colour: null},
    A: {name: 'A period', desc: 'yanny howard', colour: [233, 30, 99]},
    B: {name: 'B period', desc: 'the woz', colour: [255, 193, 7]},
    C: {name: 'C period', desc: 'le fup', colour: [103, 58, 183]},
    D: {name: 'D period', desc: 'TOLENDO TOLENS', colour: [33, 150, 243]},
    E: {name: 'E period', desc: 'so.... um... so... um....', colour: [139, 195, 74]},
    F: {name: 'F period', desc: 'vocabphilia', colour: [156, 39, 176]},
    G: {name: 'G period', desc: '¡¡¡¿¿¿¿INGLÉS????!!!!', colour: [255, 152, 0]},
    H: {name: 'H period', desc: '', colour: null},
    BRUNCH: {name: 'Brunch', desc: 'useful i guess for... idk', colour: null},
    LUNCH: {name: 'Lunch', desc: 'I WANT TO PLAY SOME MINECRAAAAAFT', colour: null},
    FLEX: {name: 'Flex', desc: 'ALL SUBMIT TO YUN', colour: [96, 125, 139]},
    SELF: {name: 'SELF', desc: 'DOWN WITH SELF', colour: [96, 125, 139]},
    STAFF_COLLAB: {name: 'Staff collaboration', desc: '', colour: [96, 125, 139]},
    STAFF_MEETINGS: {name: 'Staff meetings', desc: '', colour: [96, 125, 139]}
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
