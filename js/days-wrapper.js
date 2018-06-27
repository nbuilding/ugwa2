const msPerDay = 1000 * 60 * 60 * 24;
const autoScrollDuration = 500;

Math.easeInOutQuad = prog => {
  prog *= 2;
  if (prog < 1) return prog * prog / 2;
  prog--;
  return (prog * (prog - 2) - 1) / -2;
};

class DaysWrapper {

  constructor(normalSchedules, altSchedules, firstDay, lastDay) {
    const dayCount = (lastDay.getTime() - firstDay.getTime()) / msPerDay;
    const dayCols = [];
    let scrollWrapper;
    for (let day = 0; day <= dayCount; day++) {
      const dateObj = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + day);
      const date = dateObj.getDate();
      const month = dateObj.getMonth();
      const dateID = ('0' + (month + 1)).slice(-2) + '-' + ('0' + date).slice(-2);
      const schedule = altSchedules[dateID] !== undefined
        ? altSchedules[dateID]
        : normalSchedules[dateObj.getDay()];
      const viewer = new DayViewer(dateObj, schedule, day === 184); // TEMP
      dayCols.push({
        viewer: viewer,
        triggered: false,
        trigger() {
          if (this.triggered) return;
          this.viewer.initialize();
          this.triggered = true;
        }
      });
    }
    document.body.appendChild(scrollWrapper = createElement('div', {
      classes: 'days-wrapper',
      content: [
        this.dateHeading = createElement('h3', {
          classes: 'date-heading',
          content: ['2018-03-03']
        }),
        ...dayCols.map(d => d.viewer.wrapper)
      ]
    }));

    this.dayCols = dayCols;
    this.scrollWrapper = scrollWrapper;

    this.initWindowyThings();

    this.selected = 0; // TODO: scroll to today
  }

  scrollTo(pdPos, animate = true) {
    if (!animate) {
      this.scrollWrapper.scrollLeft = this.screenWidth / 2 + this.periodWidth * (pdPos + 0.5);
      return;
    }
    this.stopAutoScrolling();
    this.autoScrolling = window.requestAnimationFrame(() => {
      this.selected = pdPos;
      const startPdPos = this.toPdPos(this.scrollX);
      const pdPosChange = pdPos - startPdPos;
      const startTime = Date.now();
      const scroll = () => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= autoScrollDuration) {
          this.scrollTo(pdPos, false);
          this.autoScrolling = false;
          return;
        }
        this.scrollTo(Math.easeInOutQuad(elapsedTime / autoScrollDuration) * pdPosChange + startPdPos, false);
        this.autoScrolling = window.requestAnimationFrame(scroll);
      };
      scroll();
    });
  }

  momentumScrolling(vel) {
    const scroll = () => {
      vel *= 0.9;
      if (Math.abs(vel) < 0.2) {
        this.autoScrolling = false;
        this.snapToADay();
        return;
      }
      this.scrollWrapper.scrollBy(vel, 0);
      this.autoScrolling = window.requestAnimationFrame(scroll);
    };
    scroll();
  }

  snapToADay() {
    this.scrollTo(Math.round(this.toPdPos(this.scrollX)), true);
  }

  toPdPos(scrollX) {
    return (scrollX - this.screenWidth / 2) / this.periodWidth - 0.5;
  }

  stopAutoScrolling() {
    if (!this.autoScrolling) return;
    window.cancelAnimationFrame(this.autoScrolling);
    this.autoScrolling = false;
  }

  trackpadScroll() {
    if (this.trackpadScrollTimeout !== null)
      clearInterval(this.trackpadScrollTimeout);
    this.trackpadScrollTimeout = setTimeout(() => {
      this.snapToADay();
    }, 500);
  }

  initWindowyThings() {
    this.autoScrolling = false;
    this.trackpadScrollTimeout = null;

    this.updateWidthMeasurements();
    window.addEventListener('resize', e => {
      this.updateWidthMeasurements();
      if (!this.autoScrolling)
        this.scrollTo(this.selected, false);
    });

    this.updateScrollMeasurements();
    this.scrollWrapper.addEventListener('scroll', e => {
      this.updateScrollMeasurements();
      const visibleUntriggeredDaycols = this.dayCols.slice(
        Math.floor((this.scrollX - this.screenWidth) / this.periodWidth),
        Math.ceil(this.scrollX / this.periodWidth)
      ).filter(d => !d.triggered);
      if (visibleUntriggeredDaycols.length)
        window.requestAnimationFrame(() => { // async triggering to prevent lag
          visibleUntriggeredDaycols.forEach(d => d.trigger());
        });
    });

    this.scrollWrapper.addEventListener('wheel', e => {
      if (this.autoScrolling)
        this.stopAutoScrolling();

      const mousewheelScroll = e.deltaY && e.shiftKey;
      const integerScrollDiff = e.deltaY % 1 === 0;

      if (mousewheelScroll && integerScrollDiff) {
        this.scrollTo(this.selected += Math.sign(e.deltaY), true);
        e.preventDefault();
      }
      else if (e.deltaX || mousewheelScroll);
        this.trackpadScroll();
    });

    document.body.addEventListener('keydown', e => {
      if (document.activeElement.tagName === 'TEXTAREA') return;
      if (e.keyCode === 37) this.scrollTo(--this.selected, true);
      else if (e.keyCode === 39) this.scrollTo(++this.selected, true);
    });

    const touchSpeeds = [];
    this.scrollWrapper.addEventListener('touchstart', e => {
      if (this.autoScrolling)
        this.stopAutoScrolling();
      const now = Date.now();
      Array.from(e.changedTouches).forEach(t => {
        touchSpeeds[t.identifier] = {
          oldX: t.clientX,
          xDiff: 0,
          oldTime: now,
          timeDiff: 0
        };
      });
    });
    this.scrollWrapper.addEventListener('touchmove', e => {
      const now = Date.now();
      Array.from(e.changedTouches).forEach(t => {
        touchSpeeds[t.identifier] = {
          oldX: t.clientX,
          xDiff: t.clientX - touchSpeeds[t.identifier].oldX,
          oldTime: now,
          timeDiff: now - touchSpeeds[t.identifier].oldTime
        };
      });
    });
    this.scrollWrapper.addEventListener('touchend', e => {
      if (!this.autoScrolling) {
        this.momentumScrolling(-touchSpeeds[e.changedTouches[0].identifier].xDiff
          / touchSpeeds[e.changedTouches[0].identifier].timeDiff * 17
          || 0);
      }
      Array.from(e.changedTouches).forEach(t => {
        touchSpeeds[t.identifier] = null;
      });
    });
  }

  updateWidthMeasurements() {
    this.screenWidth = window.innerWidth;
    this.periodWidth = Math.min(this.screenWidth, 500);
  }

  updateScrollMeasurements() {
    this.scrollX = this.scrollWrapper.scrollLeft;
    this.scrollY = this.scrollWrapper.scrollTop;
    this.dateHeading.style.top = -this.scrollY + 'px';
  }

  get selected() {
    return this._selected;
  }

  set selected(s) {
    if (this._selected)
      this.dayCols[this._selected].viewer.wrapper.classList.remove('selected');
    this._selected = s;
    this.dayCols[s].viewer.wrapper.classList.add('selected');
    const dateObj = this.dayCols[s].viewer.date;
    this.dateHeading.textContent = Formatter.date(dateObj.getMonth(), dateObj.getDate());
  }

}
