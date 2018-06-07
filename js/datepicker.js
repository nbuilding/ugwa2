const SVG_NS = 'http://www.w3.org/2000/svg';
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

class DatePicker {

  constructor(wrapper, options = {}) {
    this.wrapper = wrapper;

    options.weekStart = options.weekStart || 0;
    options.width = options.width || wrapper.getBoundingClientRect().width;
    options.dateWidth = options.dateWidth || options.width / 7;
    options.dateHeight = options.dateHeight || options.dateWidth;
    if (!options.range) {
      let currentYear = new Date().getFullYear();
      options.range = [new Date(currentYear, 0, 1), new Date(currentYear, 11, 31)];
    }
    this.options = options;
    this.days = (options.range[1].getTime() - options.range[0].getTime()) / MS_PER_DAY;

    let baseDate = options.range[0];
    this.baseYear = baseDate.getFullYear();
    this.baseMonth = baseDate.getMonth();
    this.baseDate = baseDate.getDate();

    this.makeBar();

    this.makeDates();

    this.makeInteractive();

    if (options.noUnselected) this.date = new Date();
  }

  makeBar() {
    const options = this.options;
    const bar = document.createElement('div');
    bar.classList.add('bar');

    if (options.formatMonth) {
      const monthBar = document.createElement('div');
      monthBar.classList.add('month-name');
      bar.appendChild(monthBar);
      this.monthNameBar = monthBar;
    } else {
      this.monthNameBar = null;
    }

    if (options.dayStrings) {
      const dayBar = document.createElement('div');
      dayBar.classList.add('weekday-names');
      for (let i = 0; i < options.dayStrings.length; i++) {
        const day = document.createElement('span');
        day.textContent = options.dayStrings[i];
        dayBar.appendChild(day);
      }
      bar.appendChild(dayBar);
    }

    this.wrapper.appendChild(bar);
  }

  makeDates() {
    const options = this.options;
    const dateWidth = options.dateWidth;
    const dateHeight = options.dateHeight;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttributeNS(null, 'width', options.width);
    svg.classList.add('calendar');

    const dateLabels = document.createElementNS(SVG_NS, 'g');
    dateLabels.style.textAnchor = 'middle';
    dateLabels.style.dominantBaseline = 'middle';
    dateLabels.classList.add('dates');

    const monthHighlights = document.createElementNS(SVG_NS, 'g');
    dateLabels.classList.add('month-highlights');

    const offset = (options.range[0].getDay() + 7 - options.weekStart) % 7;
    let days = this.days + 1;
    let pos = offset - 1;
    let lastMonth = null;
    this.monthHighlights = [];
    while (days--) {
      pos++;

      const date = this.getDateFromOffset(pos - offset);
      const dateDate = date.getDate();
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttributeNS(null, 'x', (pos % 7 + 0.5) * dateWidth);
      text.setAttributeNS(null, 'y', (Math.floor(pos / 7) + 0.5) * dateHeight);
      text.textContent = dateDate;
      dateLabels.appendChild(text);

      const month = date.getMonth();
      const year = date.getFullYear();
      if (!lastMonth || month !== lastMonth.month) {
        const top = Math.floor(pos / 7) * dateHeight;
        lastMonth = {
          month: month,
          top: top,
          path: `M0 ${top + dateHeight}H${pos % 7 * dateWidth}V${top}H${options.width}`
        };
      }
      if (dateDate === DatePicker.getMonthLength(year, month) || days === 0) {
        lastMonth.path += `V${Math.floor(pos / 7) * dateHeight}H`
          + `${pos % 7 * dateWidth + dateWidth}V${Math.floor(pos / 7 + 1) * dateHeight}`
          + 'H0z';

        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttributeNS(null, 'd', lastMonth.path);
        monthHighlights.appendChild(path);
        this.monthHighlights.push({
          name: options.formatMonth ? options.formatMonth(year, month) : '',
          top: lastMonth.top,
          path: path
        });
      }
    }
    svg.setAttributeNS(null, 'height', Math.ceil(pos / 7) * dateHeight);

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.style.display = 'none';
    circle.setAttributeNS(null, 'r', 10); // TEMP
    circle.classList.add('selected');

    svg.appendChild(circle);
    svg.appendChild(monthHighlights);
    svg.appendChild(dateLabels);
    this.wrapper.appendChild(svg);

    this.svg = svg;
    this.dateLabels = dateLabels;
    this.circle = circle;
    this.visualOffset = offset;
  }

  makeInteractive() {
    const options = this.options;
    const svg = this.svg;
    const wrapper = this.wrapper;

    svg.addEventListener('click', e => {
      const box = svg.getBoundingClientRect();
      this.offset = Math.floor((e.clientX - box.left) / options.dateWidth)
        + Math.floor((e.clientY - box.top) / options.dateHeight) * 7
        - this.visualOffset;
    }, false);

    wrapper.addEventListener('keydown', e => {
      const date = this.date;
      if (!date) return;
      const month = date.getMonth();
      const year = date.getFullYear();

      let preventScroll = true;
      switch (e.keyCode) {
        case 37:
          this.offset--;
          break;
        case 38:
          this.offset -= 7;
          break;
        case 39:
          this.offset++;
          break;
        case 40:
          this.offset += 7;
          break;
        case 36:
          this.date = new Date(year, date.getMonth(), 1);
          break;
        case 35:
          this.date = new Date(year, month, DatePicker.getMonthLength(year, month));
          break;
        case 33:
          if (month === 0) {
            this.date = new Date(year - 1, 11,
              Math.min(date.getDate(), DatePicker.getMonthLength(year - 1, 11)));
          } else {
            this.date = new Date(year, month - 1,
              Math.min(date.getDate(), DatePicker.getMonthLength(year, month - 1)));
          }
          break;
        case 34:
          if (month === 11) {
            this.date = new Date(year + 1, 0,
              Math.min(date.getDate(), DatePicker.getMonthLength(year + 1, 0)));
          } else {
            this.date = new Date(year, month + 1,
              Math.min(date.getDate(), DatePicker.getMonthLength(year, month + 1)));
          }
          break;
        default:
          preventScroll = false;
      }
      if (preventScroll) e.preventDefault();
    }, false);

    if (options.formatMonth) {
      const monthHighlights = this.monthHighlights;
      const onscroll = e => {
        const threshold = wrapper.scrollTop + options.dateHeight;
        let i = monthHighlights.length;
        while (i--) if (monthHighlights[i].top < threshold) break;
        if (this.currentHighlight !== i) {
          if (this.currentHighlight >= 0) {
            monthHighlights[this.currentHighlight].path.classList.remove('highlight');
          }
          this.currentHighlight = i;
          monthHighlights[i].path.classList.add('highlight');
          this.monthNameBar.textContent = monthHighlights[i].name;
        }
      };
      onscroll();
      wrapper.addEventListener('scroll', onscroll, false);
    }
  }

  getDateFromOffset(offset) {
    return new Date(this.baseYear, this.baseMonth, this.baseDate + offset);
  }

  get date() {
    return this.selectedDate || null;
  }

  set date(newDate) {
    if (newDate === null) {
      this.offset = null;
      return;
    }
    this.offset = Math.floor((newDate.getTime() - this.options.range[0].getTime()) / MS_PER_DAY);
  }

  get offset() {
    return this.selected;
  }

  set offset(newOffset) {
    const options = this.options;
    const circle = this.circle;
    if (newOffset !== null) {
      if (newOffset < 0) {
        newOffset = options.noUnselected ? 0 : null;
      } else if (newOffset > this.days) {
        newOffset = options.noUnselected ? this.days : null;
      }
    }
    if (newOffset !== null) {
      this.selectedDate = this.getDateFromOffset(newOffset);

      let pos = newOffset + this.visualOffset;
      circle.style.display = null;
      circle.setAttributeNS(null, 'cx', (pos % 7 + 0.5) * options.dateWidth);
      circle.setAttributeNS(null, 'cy', (Math.floor(pos / 7) + 0.5) * options.dateHeight);
    } else {
      this.selectedDate = null;

      circle.style.display = 'none';
    }
    this.selected = newOffset;
  }

  static getMonthLength(year, month) {
    // https://stackoverflow.com/questions/9852837/leap-year-check-using-bitwise-operators-amazing-speed
    return monthLengths[month] + (month === 1 && !(year & 3 || year & 15 && !(year % 25)));
  }

}
