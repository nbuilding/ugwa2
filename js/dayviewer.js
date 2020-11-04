class DayViewer {

  /**
   * Class for representing a day's schedule
   * @constructor
   * @param {Date} date - The represented date.
   * @param {Object[]} schedule - The periods of the day.
   * @param {string} schedule[].period - The period letter.
   * @param {number} schedule[].start - The period's start time in minutes since 00:00 of the day.
   * @param {number} schedule[].end - The period's end time in minutes since 00:00 of the day.
   * @param {boolean} today - If this represents today.
   */
  constructor(date) {
    this.date = date;
    this.wrapper = createElement('div', {
      classes: 'day'
    });
    this.today = false;
    this.hide();
    this.deinitialize();
  }

  initialize(schedule) {
    this.schedule = schedule;
    const date = this.date;
    const oldWrapper = this.wrapper;
    const today = this.today;
    const weekday = date.getDay();

    schedule = schedule !== null && schedule
      .filter(({period}) => (period !== 'BRUNCH' && period !== 'LUNCH' || Prefs.options.breaks)
                         && (period !== 'ZERO' || Prefs.options.zero)
                         && (period !== '8' || Prefs.options.showH)
                         && (period !== 'STAFF_COLLAB' && period !== 'STAFF_MEETINGS' || Prefs.options.staff));

    if (schedule === null || !schedule.length) {
      this.wrapper.appendChild(createElement('span', {content: [Formatter.phrase('no-school')]}));
      this.wrapper.classList.add('noschool', 'h3');
    } else {
      const periods = schedule.map(p => new Period(p.period, p.start, p.end, today, true));
      const periodWrappers = periods.map(p => p.wrapper);
      this.wrapper.appendChild(createFragment(periodWrappers));

      this.onNewName = on('new name', (period, name, height) => {
        this.periods.filter(p => p.period === period).forEach(p => {
          p.name.value = name;
          p.name.style.height = height;
        });
      });
      this.onNewNote = on('new note', (period, note, height) => {
        this.periods.filter(p => p.period === period).forEach(p => {
          p.note.value = note;
          p.noteHeight = height;
          if (p.wrapper.classList.contains('open')) {
            p.note.style.height = height;
          }
        });
      });
      this.onNewColour = on('new colour', (period, colour) => {
        this.periods.filter(p => p.period === period).forEach(p => Period.setColourOf(p.wrapper, colour));
      });

      if (this.time) this.setTime(this.time);

      this.periods = periods;
      this.periodWrappers = periodWrappers;
    }

    oldWrapper.parentNode.replaceChild(this.wrapper, oldWrapper);
    if (this.periods) this.periods.forEach(p => p.resizeName());
    this.selected = false;

    this.initialized = true;
  }

  deinitialize() {
    clearChildren(this.wrapper);
    this.wrapper.classList.remove('noschool', 'h3');

    this.periods = null;
    this.periodWrappers;
    this.openPeriod = null;

    this.initialized = false;
  }

  handleSelection() {
    this.selected = true;
    this.wrapper.classList.add('selected');
    if (this.periods)
      this.periods.forEach(p => p.name.disabled = false);
  }

  handleDeselection() {
    this.selected = false;
    this.wrapper.classList.remove('selected');
    if (this.periods) {
      this.periods.forEach(p => p.name.disabled = true);
      this.closeAllOpenPeriods();
    }
  }

  handleArrowPress(down) {
    const periods = this.periods;
    if (!periods) return;
    if (this.openPeriod === null) {
      periods[this.openPeriod = down ? 0 : periods.length - 1].expand();
    } else {
      periods[this.openPeriod].collapse();
      if (down) this.openPeriod++;
      else this.openPeriod += this.periods.length - 1;
      periods[this.openPeriod %= periods.length].expand();
    }
  }

  handleClick(periodWrapper, targetTagName) {
    const periods = this.periods;
    if (!periods) return;
    const periodWrappers = this.periodWrappers;
    if (periodWrapper) {
      const newOpenPeriod = periodWrappers.indexOf(periodWrapper);
      if (this.openPeriod !== newOpenPeriod) {
        if (this.openPeriod !== null) periods[this.openPeriod].collapse();
        periods[this.openPeriod = newOpenPeriod].expand();
      } else if (targetTagName !== 'TEXTAREA') {
        periods[this.openPeriod].collapse();
        this.openPeriod = null;
      }
    } else if (this.openPeriod !== null) {
      periods[this.openPeriod].collapse();
      this.openPeriod = null;
    }
  }

  closeAllOpenPeriods() {
    if (!this.periods) return;
    if (this.openPeriod === null) return;
    this.periods[this.openPeriod].collapse();
    this.openPeriod = null;
  }

  show() { this.wrapper.style.display = null; this.visible = true; }
  hide() { this.wrapper.style.display = 'none'; this.visible = false; }

  /**
   * Updates the displayed times of each period.
   * @param {number} minutes - Current number of minutes since the begining of the day.
   */
  setTime(minutes) {
    this.time = minutes;
    if (this.today && this.periods) {
      const messages = this.periods.map((p, i) => p.setTime(minutes, i === this.periods.length - 1));
      let periodIndex = messages.findIndex(m => m);
      if (!~periodIndex) periodIndex = this.periods.length - 1;
      messages[periodIndex].period = this.periods[periodIndex].period;
      return messages[periodIndex];
    }
  }

}
