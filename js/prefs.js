const SETTINGS_NAME = '[ugwa2] demos.prefs'; // TEMP
const roundnessClasses = ['sharp', 'roundish', 'round'];

const Prefs = {

  periodData: {
    ZERO: {name: '0 period', desc: '', colour: null},
    A: {name: 'A period', desc: '', colour: [233, 30, 99]},
    B: {name: 'B period', desc: '', colour: [255, 193, 7]},
    C: {name: 'C period', desc: '', colour: [103, 58, 183]},
    D: {name: 'D period', desc: '', colour: [33, 150, 243]},
    E: {name: 'E period', desc: '', colour: [139, 195, 74]},
    F: {name: 'F period', desc: '', colour: [156, 39, 176]},
    G: {name: 'G period', desc: '', colour: [255, 152, 0]},
    H: {name: 'H period', desc: '', colour: null},
    BRUNCH: {name: 'Brunch', desc: '', colour: null},
    LUNCH: {name: 'Lunch', desc: '', colour: null},
    FLEX: {name: 'Flex', desc: '', colour: [96, 125, 139]},
    SELF: {name: 'SELF', desc: '', colour: [96, 125, 139]},
    STAFF_COLLAB: {name: 'Staff collaboration', desc: '', colour: [96, 125, 139]},
    STAFF_MEETINGS: {name: 'Staff meetings', desc: '', colour: [96, 125, 139]}
  },

  options: {
    theme: 'dark',
    roundness: 2,
    breaks: true,
    self: true,
    zero: false,
    h: [false, false, false, false, false],
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
  },

  loadPrefs() {
    let prefs = storage.getItem(SETTINGS_NAME);
    try {
      prefs = JSON.parse(prefs);
      if (typeof prefs !== 'object' || prefs === null) throw new Error();
    } catch (e) {
      prefs = {};
      storage.setItem(SETTINGS_NAME, '{}');
    }
    if (prefs.periods) {
      for (let period in prefs.periods) {
        if (!this.periodData[period]) continue;
        const data = prefs.periods[period];
        data.name && (this.periodData[period].name = data.name);
        data.note && (this.periodData[period].desc = data.note);
        data.colour && (this.periodData[period].colour = data.colour);
      }
    }
    if (prefs.options) {
      for (let option in prefs.options) {
        if (this.options[option] !== undefined && option !== 'h')
          this.options[option] = prefs.options[option];
      }
      if (prefs.options.h && Array.isArray(prefs.options.h))
        this.options.h = prefs.options.h;
    }
  },

  savePrefs() {
    storage.setItem(SETTINGS_NAME, JSON.stringify({
      periods: this.periodData,
      options: this.options
    }));
  },

  applyTheme() {
    document.body.className = `${this.options.theme} ${roundnessClasses[this.options.roundness]}`;
  }

};

on('new name', (period, name) => {
  if (!Prefs.periodData[period]) Prefs.createPeriod(period);
  Prefs.periodData[period].name = name;
  Prefs.savePrefs();
});
on('new note', (period, note) => {
  if (!Prefs.periodData[period]) Prefs.createPeriod(period);
  Prefs.periodData[period].note = note;
  Prefs.savePrefs();
});
on('new colour', (period, colour) => {
  if (!Prefs.periodData[period]) Prefs.createPeriod(period);
  Prefs.periodData[period].colour = colour;
  Prefs.savePrefs();
});

try {
  window.storage = localStorage;
} catch (e) {
  window.storage = {
    getItem: a => storage[a],
    setItem: (a, b) => storage[a] = b,
    removeItem: a => delete storage[a]
  }
}

Prefs.loadPrefs();
