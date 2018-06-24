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
    this.periods = schedule.map(p => new Period(p.period, p.start, p.end, today));
    const periodWrappers = this.periods.map(p => p.wrapper);
    this.wrapper = createElement('div', {
      tabindex: 0,
      classes: 'day',
      content: periodWrappers
    });
    let openPeriod = null;
    this.wrapper.addEventListener('keydown', e => {
      if (e.keyCode !== 40 && e.keyCode !== 38) return;
      else e.preventDefault();

      const down = e.keyCode === 40;
      if (openPeriod === null) {
        this.periods[openPeriod = down ? 0 : this.periods.length - 1].expand();
      } else {
        this.periods[openPeriod].collapse();
        if (down) openPeriod++;
        else openPeriod += this.periods.length - 1;
        this.periods[openPeriod %= this.periods.length].expand();
      }
    });
    this.wrapper.addEventListener('click', e => {
      const periodWrapper = (() => {
        let target = e.target;
        while (target && !periodWrappers.includes(target))
          target = target.parentNode;
        return target;
      })();
      if (periodWrapper) {
        const newOpenPeriod = periodWrappers.indexOf(periodWrapper);
        if (openPeriod !== newOpenPeriod) {
          if (openPeriod !== null) this.periods[openPeriod].collapse();
          this.periods[openPeriod = newOpenPeriod].expand();
        }
      } else if (openPeriod !== null) {
        this.periods[openPeriod].collapse();
        openPeriod = null;
      }
    });

    on('new name', (period, name, height) => {
      this.periods.filter(p => p.period === period).forEach(p => {
        p.name.value = name;
        p.name.style.height = height;
      });
    });
    on('new note', (period, note, height) => {
      this.periods.filter(p => p.period === period).forEach(p => {
        p.note.value = note;
        if (p.wrapper.classList.contains('open'))
          p.note.style.height = height;
      });
    });
    on('new colour', (period, colour) => {
      this.periods.filter(p => p.period === period).forEach(p => Period.setColourOf(p.wrapper, colour));
    });
  }

  /**
   * Updates the displayed times of each period.
   * @param {number} minutes - Current number of minutes since the begining of the day.
   */
  setTime(minutes) {
    this.periods.forEach(p => p.setTime(minutes));
  }

  /**
   * Does stuff now knowing that it is in the DOM.
   */
  initialize() {
    this.periods.forEach(p => p.resizeName());
  }

}
