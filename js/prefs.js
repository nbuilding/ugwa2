// TODO

const Prefs = {

  periodData: {
    A: {name: 'a period', desc: 'yanny howard', colour: '#f44336'},
    BRUNCH: {name: 'brunch lol', desc: 'useful i guess for... idk', colour: null},
    B: {name: 'b period', desc: 'the woz', colour: '#3F51B5'}
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
