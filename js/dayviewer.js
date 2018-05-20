class DayViewer {

  /**
   * Class for representing a day's schedule
   * @constructor
   * @param {Date} date - The represented date.
   * @param {Object[]} schedule - The periods of the day.
   * @param {string} schedule[].period - The period letter.
   * @param {number} schedule[].start - The period's start time in minutes since 00:00 of the day.
   * @param {number} schedule[].end - The period's end time in minutes since 00:00 of the day.
   */
  constructor(date, schedule) {
    this.date = date;
    this.periods = schedule.map(p => new Period(p.period, {
      displayName: customNames[p.period],
      start: p.start,
      end: p.end
    }));
    this.wrapper = createElement('div', {
      classes: ['day'],
      content: this.periods.map(p => p.wrapper)
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
   * Updates the names of the respective period.
   * @param {string} affectedPeriod - Letter of the period with the new custom name.
   */
  newName(affectedPeriod) {
    let period = affectedPeriod.toUpperCase();
    this.periods.filter(p => p.period === period).forEach(p => p.setDisplayName(customNames[period]));
  }

}
