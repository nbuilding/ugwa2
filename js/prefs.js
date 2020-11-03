const SETTINGS_NAME = '[ugwa2] demos.prefs'; // TEMP
const roundnessClasses = ['sharp', 'roundish', 'round'];

const Prefs = {

  periodData: {
//     ZERO: {name: '0 period', desc: '', colour: null}, // no 0 period this year!
    1: {name: 'Period 1', desc: '', colour: [233, 30, 99]},
    2: {name: 'Period 2', desc: '', colour: [255, 193, 7]},
    3: {name: 'Period 3', desc: '', colour: [103, 58, 183]},
    4: {name: 'Period 4', desc: '', colour: [33, 150, 243]},
    5: {name: 'Period 5', desc: '', colour: [139, 195, 74]},
    6: {name: 'Period 6', desc: '', colour: [156, 39, 176]},
    7: {name: 'Period 7', desc: '', colour: [255, 152, 0]},
    8: {name: 'Period 8', desc: '', colour: null},
//     BRUNCH: {name: 'Brunch', desc: '', colour: null}, // no brunch this year either
    LUNCH: {name: 'Lunch', desc: '', colour: null},
    OFFICE_HOURS: {name: 'Office Hours', desc: '', colour: [96, 125, 139]},
    SELF: {name: 'SELF', desc: '', colour: [96, 125, 139]},
    GUNN_TOGETHER: {name: 'Gunn Together', desc: '', colour: null, gt: true} // TODO: treat GT specially.
//     STAFF_COLLAB: {name: 'Staff collaboration', desc: '', colour: [96, 125, 139]}, // staff stuff left out for now
//     STAFF_MEETINGS: {name: 'Staff meetings', desc: '', colour: [96, 125, 139]}
  },

  options: {
    theme: 'dark',
    roundness: 2,
    breaks: true,
    self: false,
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
