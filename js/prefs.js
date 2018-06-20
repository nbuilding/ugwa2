// TODO

const Prefs = {

  periodData: {
    A: {name: 'a period', desc: 'yanny howard', colour: [244, 67, 54]},
    BRUNCH: {name: 'brunch lol', desc: 'useful i guess for... idk', colour: null},
    B: {name: 'b period', desc: 'the woz', colour: [33, 150, 243]},
    C: {name: 'Period C', desc: 'le fup', colour: [139, 195, 74]},
    D: {name: 'D period', desc: 'ALL SUBMIT TO YUN', colour: [103, 58, 183]},
    LUNCH: {name: 'longer longer passing period', desc: 'I WANT TO PLAY SOME MINECRAAAAAFT', colour: null},
    F: {name: 'very long class name muahaha', desc: 'vocabphilia', colour: [156, 39, 176]}
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
