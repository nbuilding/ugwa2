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

    let baseDate = options.range[0];
    this.baseYear = baseDate.getFullYear();
    this.baseMonth = baseDate.getMonth();
    this.baseDate = baseDate.getDate();

    this.makeDates();

    this.makeClicky();
  }

  makeDates() {
    const options = this.options;
    const dateWidth = options.dateWidth;
    const dateHeight = options.dateHeight;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttributeNS(null, 'width', options.width);

    const dateLabels = document.createElementNS(SVG_NS, 'g');
    dateLabels.style.textAnchor = 'middle';
    dateLabels.style.dominantBaseline = 'middle';

    const monthHighlights = document.createElementNS(SVG_NS, 'g');

    const offset = (options.range[0].getDay() + 7 - options.weekStart) % 7;
    let days = (options.range[1].getTime() - options.range[0].getTime()) / MS_PER_DAY + 1;
    let pos = offset - 1;
    let lastMonth = null;
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
      if (!lastMonth || month !== lastMonth.month) {
        lastMonth = {
          month: month,
          path: `M0 ${Math.floor(pos / 7 + 1) * dateHeight}H${pos % 7 * dateWidth}`
            + `V${Math.floor(pos / 7) * dateHeight}H${options.width}`
        };
      }
      if (dateDate === DatePicker.getMonthLength(date.getFullYear(), month) || days === 0) {
        lastMonth.path += `V${Math.floor(pos / 7) * dateHeight}H`
          + `${pos % 7 * dateWidth + dateWidth}V${Math.floor(pos / 7 + 1) * dateHeight}`
          + 'H0z';

        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttributeNS(null, 'd', lastMonth.path);
        monthHighlights.appendChild(path);
      }
    }
    svg.setAttributeNS(null, 'height', Math.ceil(pos / 7) * dateHeight);

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.style.display = 'none';
    circle.setAttributeNS(null, 'r', 10); // TEMP

    svg.appendChild(circle);
    svg.appendChild(monthHighlights);
    svg.appendChild(dateLabels);
    this.wrapper.appendChild(svg);

    this.svg = svg;
    this.circle = circle;
    this.visualOffset = offset;
  }

  makeClicky() {
    const options = this.options;
    const svg = this.svg;
    this.svg.addEventListener('click', e => {
      const box = svg.getBoundingClientRect();
      this.value = Math.floor((e.clientX - box.left) / options.dateWidth)
        + Math.floor((e.clientY - box.top) / options.dateHeight) * 7
        - this.visualOffset;
    }, false);
  }

  getDateFromOffset(offset) {
    return new Date(this.baseYear, this.baseMonth, this.baseDate + offset);
  }

  get value() {
    return this.selected || null;
  }

  set value(newDate) {
    const options = this.options;
    const circle = this.circle;
    if (typeof newDate === 'number') newDate = this.getDateFromOffset(newDate);
    if (newDate.getTime() < options.range[0].getTime()) {
      newDate = options.noUnselected ? options.range[0] : null;
    } else if (newDate.getTime() > options.range[1].getTime()) {
      newDate = options.noUnselected ? options.range[1] : null;
    }
    if (newDate) {
      circle.style.display = null;
      const offset = (newDate.getTime() - options.range[0].getTime()) / MS_PER_DAY + this.visualOffset;
      circle.setAttributeNS(null, 'cx', (offset % 7 + 0.5) * options.dateWidth);
      circle.setAttributeNS(null, 'cy', (Math.floor(offset / 7) + 0.5) * options.dateHeight);
    } else {
      circle.style.display = 'none';
    }
    this.selected = newDate;
  }

  static getMonthLength(year, month) {
    // https://stackoverflow.com/questions/9852837/leap-year-check-using-bitwise-operators-amazing-speed
    return monthLengths[month] + (month === 1 && !(year & 3 || year & 15 && !(year % 25)));
  }

}
