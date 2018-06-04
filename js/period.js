class Period {

  /**
   * Class for representing a period in a day
   * @constructor
   * @param {string} period - The period's letter
   * @param {number} start - Time when the period starts in minutes since 00:00 of the day.
   * @param {number} end - Time when the period ends in minutes since 00:00 of the day.
   */
  constructor(period, start, end) {
    this.period = period = period.toUpperCase();
    this.startTime = start;
    this.endTime = end;
    this.wrapper = createElement('div', {
      classes: ['period'],
      data: {
        period: period.length === 1 && period
      },
      content: [
        this.name = createElement('span', {
          classes: ['name'],
          content: [Prefs.getPdName(period)]
        }),
        createElement('span', {content: Formatter.time(start) + '–' + Formatter.time(end)}),
        this.toStart = createElement('span', {}),
        this.toEnd = createElement('span', {}),
        createElement('span', {
          content: Formatter.phrase(
            'lasts',
            Formatter.duration(end - start)
          )
        }),
        this.note = createElement('textarea', {
          value: Prefs.getPdDesc(period)
        })
      ]
    });
    Period.setColourOf(this.wrapper, Prefs.getPdColour(period));
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
    this.toStart.innerHTML = Formatter.phrase(
      timeToStart === 0 ? 'juststarted' : timeToStart < 0 ? 'started' : 'starting',
      `<em>${Math.abs(timeToStart)}</em>`
    );

    let timeToEnd = this.endTime - minutes;
    this.toEnd.innerHTML = Formatter.phrase(
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

  /**
   * Sets the custom name of the period.
   */
  update() {
    this.name.textContent = Prefs.getPdName(this.period);
    this.note.value = Prefs.getPdDesc(this.period);
    Period.setColourOf(this.wrapper, Prefs.getPdColour(this.period));
  }

  /**
   * Expands the period card.
   */
  expand() {
    this.wrapper.classList.add('open');
  }

  /**
   * Collapses the period card.
   */
  collapse() {
    this.wrapper.classList.remove('open');
  }

  static setColourOf(element, colour) {
    if (typeof colour === 'string') {
      element.style.backgroundColor = colour;
      element.classList.remove('clear');
    } else {
      element.style.backgroundColor = null;
      element.classList.add('clear');
    }
  }

}
