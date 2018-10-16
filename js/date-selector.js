const DATE_HEIGHT = 36;
const SELECTOR_HEIGHT = 300 - 66;

class DateSelector {

  constructor(parent, firstDay, lastDay) {
    this.parent = parent;
    const offset = -firstDay.getDay();
    const dayCount = (lastDay.getTime() - firstDay.getTime()) / MS_PER_DAY;
    const dates = [];
    const months = [];
    const firstYear = firstDay.getFullYear();
    const firstMonth = firstDay.getMonth();
    const firstDate = firstDay.getDate();
    for (let day = offset; day <= dayCount; day++) {
      const dateObj = new Date(firstYear, firstMonth, firstDate + day);
      const monthID = dateObj.getMonth() + '-' + dateObj.getFullYear();
      if (!months.length || months[months.length - 1].monthID !== monthID) {
        months.push({
          monthID: monthID,
          month: dateObj.getMonth(),
          year: dateObj.getFullYear(),
          wrapper: createElement('span', {
            classes: 'month'
          }),
          dates: []
        });
      }
      const date = {
        monthIndex: months.length - 1,
        index: day,
        span: createElement('span', {
          classes: ['date', day < 0 && 'placeholder'],
          data: {
            index: day < 0 || day
          },
          content: [dateObj.getDate()]
        })
      };
      months[months.length - 1].dates.push(date);
      dates.push(date);
    }
    months.forEach(month => {
      month.wrapper.appendChild(createFragment(month.dates.map(date => date.span)));
      month.topY = Math.floor((month.dates[0].index - offset) / 7);
    });
    this.wrapper = createElement('div', {
      classes: 'date-selector shadow1',
      content: [
        this.monthName = createElement('div', {
          classes: 'monthname'
        }),
        createElement('div', {
          classes: 'weekdays shadow4',
          content: Formatter.weekdayletters().map(l => createElement('span', {
            classes: 'date',
            content: l
          }))
        }),
        this.monthWrapper = createElement('div', {
          classes: 'months',
          content: [
            this.todayMarker = createElement('span', {
              classes: 'date today',
              content: [
                createElement('span', {
                  classes: 'shadow1'
                })
              ]
            }),
            ...months.map(month => month.wrapper)
          ]
        })
      ]
    });
    this.wrapper.addEventListener('click', e => {
      if (e.target.dataset.index) {
        this.parent.selected = +e.target.dataset.index;
        this.parent.animateToDay(this.parent.selected);
      }
    });
    this.offset = offset;
    this.months = months;
    this.dates = dates;
    this.rows = Math.ceil(dates.length / 7);
    this.lastHighlightDate = null;
    this.lastHighlightMonth = null;
    this.scroll = 0;
    this.autoScroll = null;
    this.scrollVel = 0;
  }

  placeMarker(dateIndex) {
    const y = Math.floor(dateIndex / 7);
    const x = dateIndex % 7;
    if (x <= 6) {
      this.todayMarker.style.transform = `translate(${x * 100}%, ${y * DATE_HEIGHT}px)`;
    } else if (x <= 6.5) {
      this.todayMarker.style.transform = `translate(${((x - 5) * (x - 5) + 5) * 100}%, ${y * DATE_HEIGHT}px)`;
    } else {
      this.todayMarker.style.transform = `translate(${(1 - (8 - x) * (8 - x)) * 100}%, ${(y + 1) * DATE_HEIGHT}px)`;
    }
  }

  animate() {
    const markerPos = this.parent.toPdPos(this.parent.scrollX || 0) - this.offset;
    if (this.lastHighlightDate) this.lastHighlightDate.classList.remove('today-highlight');
    if (this.lastHighlightMonth) this.lastHighlightMonth.classList.remove('highlighted');
    if (markerPos < 0.5 || markerPos > this.dates.length - 0.5) {
      this.lastHighlightDate = null;
    } else {
      const today = this.dates[Math.round(markerPos)];
      (this.lastHighlightDate = today.span).classList.add('today-highlight');
      (this.lastHighlightMonth = this.months[today.monthIndex].wrapper).classList.add('highlighted');
      this.monthName.textContent = Formatter.month(this.months[today.monthIndex].month, this.months[today.monthIndex].year);
    }
    this.placeMarker(markerPos);
    if (this.scrollVel !== 0) {
      if (Math.abs(this.scrollVel) < 0.5) {
        this.scrollVel = 0;
      } else {
        this.scrollVel *= 0.9;
        this.setScroll = this.scroll + this.scrollVel;
      }
    }
    if (this.autoScroll !== null)
      this.setScroll = this.scroll + (this.autoScroll - this.scroll) / 5;
  }

  getScrollPos(selected) {
    return Math.floor((selected - this.offset) / 7) * DATE_HEIGHT - SELECTOR_HEIGHT / 2 + DATE_HEIGHT / 2;
  }

  set setScroll(y) {
    const max = this.rows * DATE_HEIGHT - SELECTOR_HEIGHT;
    if (y > max) y = max;
    else if (y < 0) y = 0;
    this.scroll = y;
    this.monthWrapper.style.transform = `translateY(${-y}px)`;
  }

}
