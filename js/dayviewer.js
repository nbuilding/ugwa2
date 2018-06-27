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
  constructor(date, schedule, today) {
    this.date = date;
    this.schedule = schedule;
    this.today = today;
    this.state = DayViewer.UNINITIALIZED;
    this.wrapper = createElement('div', {
      classes: 'day'
    });
  }

  initialize() {
    const date = this.date;
    const schedule = this.schedule;
    const today = this.today;
    const oldWrapper = this.wrapper;

    if (schedule === null) {
      this.wrapper = createElement('div', {
        classes: 'day noschool h3',
        content: [Formatter.phrase('no-school')] // TEMP
      });
    } else {
      const periods = schedule.map(p => new Period(p.period, p.start, p.end, today));
      const periodWrappers = periods.map(p => p.wrapper);
      this.wrapper = createElement('div', {
        classes: 'day',
        content: periodWrappers
      });

      let openPeriod = null;
      this.onarrowpress = down => {
        if (openPeriod === null) {
          periods[openPeriod = down ? 0 : periods.length - 1].expand();
        } else {
          periods[openPeriod].collapse();
          if (down) openPeriod++;
          else openPeriod += this.periods.length - 1;
          periods[openPeriod %= periods.length].expand();
        }
      };
      this.onclick = (periodWrapper, targetTagName) => {
        if (periodWrapper) {
          const newOpenPeriod = periodWrappers.indexOf(periodWrapper);
          if (openPeriod !== newOpenPeriod) {
            if (openPeriod !== null) periods[openPeriod].collapse();
            periods[openPeriod = newOpenPeriod].expand();
          } else if (targetTagName !== 'TEXTAREA') {
            periods[openPeriod].collapse();
            openPeriod = null;
          }
        } else if (openPeriod !== null) {
          periods[openPeriod].collapse();
          openPeriod = null;
        }
      };
      this.closeOpenPeriods = () => {
        if (openPeriod === null) return;
        periods[openPeriod].collapse();
        openPeriod = null;
      };

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

      this.periods = periods;
    }

    oldWrapper.parentNode.replaceChild(this.wrapper, oldWrapper);
    if (this.periods) this.periods.forEach(p => p.resizeName());
    this.state = DayViewer.INITIALIZED;
    this.selected = false;
  }

  unload() {
    this.wrapper.remove();
    onnt('new name', this.onNewName);
    onnt('new note', this.onNewNote);
    onnt('new colour', this.onNewColour);
    this.state = DayViewer.DEAD;
  }

  onselected() {
    this.selected = true;
    this.wrapper.classList.add('selected');
    if (this.periods)
      this.periods.forEach(p => p.name.disabled = false);
  }

  onunselected() {
    this.selected = false;
    this.wrapper.classList.remove('selected');
    if (this.periods) {
      this.periods.forEach(p => p.name.disabled = true);
      this.closeOpenPeriods();
    }
  }

  /**
   * Updates the displayed times of each period.
   * @param {number} minutes - Current number of minutes since the begining of the day.
   */
  setTime(minutes) {
    if (this.periods)
      this.periods.forEach(p => p.setTime(minutes));
  }

}

DayViewer.UNINITIALIZED = 0;
DayViewer.INITIALIZED = 1;
DayViewer.DEAD = 2;
