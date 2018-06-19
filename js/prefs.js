// TODO

const Prefs = {

  periodData: {
    A: {name: 'a period', desc: 'yanny howard', colour: '#f44336'},
    BRUNCH: {name: 'brunch lol', desc: 'useful i guess for... idk', colour: null},
    B: {name: 'b period', desc: 'the woz', colour: '#2196F3'},
    C: {name: 'Period C', desc: 'le fup', colour: '#8BC34A'},
    D: {name: 'D period', desc: 'ALL SUBMIT TO YUN', colour: '#673AB7'},
    LUNCH: {name: 'longer longer passing period', desc: 'I WANT TO PLAY SOME MINECRAAAAAFT', colour: null},
    F: {name: 'very long class name muahaha', desc: 'vocabphilia', colour: '#9C27B0'}
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
