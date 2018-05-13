class Period {

  /**
   * Class for representing a period in a day
   * @constructor
   * @param {string} periodLetter - Letter of the period I represent.
   * @param {Object} periodData - Object with information about the period I represent.
   * @param {string} periodData.displayName - Custom name of the period.
   * @param {number} periodData.start - Time when the period starts in minutes since 00:00 of the day.
   * @param {number} periodData.end - Time when the period ends in minutes since 00:00 of the day.
   */
  constructor(periodLetter, periodData) {
    this.startTime = periodData.start;
    this.endTime = periodData.end;
    this.name = createElement('span', {
      classes: ['name'],
      content: [periodData.displayName]
    });
    this.wrapper = createElement('div', {
      classes: ['period'],
      data: {
        period: periodLetter.toUpperCase()
      },
      content: [
        this.name,
        createElement('span', {content: SomeFormatter.formatTime(periodData.start) + '–' + SomeFormatter.formatTime(periodData.end)}),
        this.toStart = createElement('span', {}),
        this.toEnd = createElement('span', {}),
        createElement('span', {content: SomeFormatter.formatDuration(periodData.end - periodData.start)})
      ]
    });
  }

  /**
   * Sets the displayed "time left" thingy of the period.
   * @param {number} minutes - Current number of minutes since the begining of the day.
   */
  setTime(minutes) {
    /*
     * examples:
     * before period  -  50, 100 "starting in 50 minutes"
     * period starts  -   0,  50 "ending in 50 minutes"
     * period partway - -20,  30 "ending in 30 minutes"
     * period ends    - -50,   0 "just ended"
     * after period   - -70, -20 "ended 20 minutes ago"
     */

    let timeToStart = this.startTime - minutes;
    this.toStart.innerHTML = SomeFormatter.translate(
      timeToStart === 0 ? 'juststarted' : timeToStart < 0 ? 'started' : 'starting',
      `<em>${Math.abs(timeToStart)}</em>`
    );

    let timeToEnd = this.endTime - minutes;
    this.toEnd.innerHTML = SomeFormatter.translate(
      timeToEnd === 0 ? 'justended' : timeToEnd < 0 ? 'ended' : 'ending',
      `<em>${Math.abs(timeToEnd)}</em>`
    );

    if (timeToStart > 0) {
      this.toStart.classList.add('previewed');
      this.toEnd.classList.remove('previewed');
    } else {
      this.toStart.classList.remove('previewed');
      this.toEnd.classList.add('previewed');
    }
  }

}
