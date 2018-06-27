const expandLessPath = 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z';
const blackThreshold = 140;

class Period {

  /**
   * Class for representing a period in a day
   * @constructor
   * @param {string} period - The period's letter
   * @param {number} start - Time when the period starts in minutes since 00:00 of the day.
   * @param {number} end - Time when the period ends in minutes since 00:00 of the day.
   * @param {boolean} today - If the period is representing a period today.
   */
  constructor(period, start, end, today) {
    this.period = period = period.toUpperCase();
    this.startTime = start;
    this.endTime = end;
    this.wrapper = createElement('div', {
      classes: ['period'],
      data: {
        period: period.length === 1 && period
      },
      content: [
        this.name = createElement('textarea', {
          classes: 'name',
          disabled: true,
          attr: {placeholder: 'A class undeserving of a name', spellcheck: false}
        }),
        this.timeRange = createElement('span', {content: Formatter.time(start) + '–' + Formatter.time(end)}),
        today && (this.toStart = createElement('span', {})),
        today && (this.toEnd = createElement('span', {})),
        this.duration = createElement('span', {
          content: Formatter.phrase(
            'lasts',
            Formatter.duration(end - start)
          )
        }),
        this.note = createElement('textarea', {
          classes: 'note',
          tabindex: -1,
          attr: {placeholder: 'Class description'}
        }),
        createElement('svg', {
          svg: true,
          attr: {
            width: 24,
            height: 24
          },
          content: [createElement('path', {
            svg: true,
            attr: {d: expandLessPath}
          })]
        })
      ]
    });
    this.spans = [this.timeRange, this.toStart, this.toEnd, this.duration].filter(a => a);
    if (!today) {
      this.timeRange.classList.add('previewed');
    }

    this.name.addEventListener('keydown', e => {
      if (e.keyCode === 13) e.preventDefault();
    });
    this.name.addEventListener('input', e => {
      if (this.name.value.includes('\n'))
        this.name.value = this.name.value.replace(/\r?\n/g, '');
      this.name.style.height = 0;
      this.name.style.height = this.name.scrollHeight - this.name.clientHeight + 'px';
    });
    this.name.addEventListener('change', e => {
      trigger('new name', period, this.name.value, this.name.style.height);
    });
    this.note.addEventListener('input', e => this.resizeNote());
    this.note.addEventListener('change', e => {
      trigger('new note', period, this.note.value, this.note.style.height);
    });

    this.name.value = Prefs.getPdName(this.period);
    this.note.value = Prefs.getPdDesc(this.period);
    Period.setColourOf(this.wrapper, Prefs.getPdColour(this.period));
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
   * Expands the period card.
   */
  expand() {
    if (this.wrapper.classList.contains('open')) return;
    this.spans.forEach(span => {
      span.style.height = span.scrollHeight + 'px';
    });
    if (this.noteHeight) {
      this.note.style.height = this.noteHeight;
    } else {
      this.note.style.transition = 'none';
      this.note.style.height = 0;
      this.noteHeight = this.note.style.height = this.note.scrollHeight + 20 + 'px';
      this.note.style.transition = null;
      this.note.offsetHeight;
    }
    this.note.setAttribute('tabindex', 0);
    this.wrapper.classList.add('open');
  }

  /**
   * Collapses the period card.
   */
  collapse() {
    this.wrapper.classList.remove('open');
    this.spans.forEach(span => {
      span.style.height = null;
    });
    this.note.style.height = null;
    this.note.setAttribute('tabindex', -1);
  }

  /**
   * Prepares the width of the period name
   */
  resizeName() {
    this.name.style.height = 0;
    this.name.style.height = this.name.scrollHeight - this.name.clientHeight + 'px';
  }

  resizeNote() {
    if (!this.wrapper.classList.contains('open')) return;
    const note = this.note;
    note.style.transition = 'none';
    note.style.height = 0;
    this.noteHeight = note.style.height = note.scrollHeight + 'px';
    note.offsetHeight; // force CSS refresh
    note.style.transition = null;
  }

  static useBlack([r, g, b]) {
    return r * 0.299 + g * 0.587 + b * 0.114 > blackThreshold;
  }

  static setColourOf(element, colour) {
    element.classList.remove('light');
    element.classList.remove('dark');
    if (Array.isArray(colour)) {
      element.style.backgroundColor = `rgb(${colour.join(',')})`;
      element.classList.remove('clear');
      element.classList.add(this.useBlack(colour) ? 'light' : 'dark');
    } else {
      element.style.backgroundColor = null;
      element.classList.add('clear');
    }
  }

}
