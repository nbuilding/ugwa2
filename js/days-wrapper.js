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
    for (let day = 0; day <= dayCount; day++) {
      const dateObj = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + day);
      const date = dateObj.getDate();
      const month = dateObj.getMonth();
      const dateID = ('0' + (month + 1)).slice(-2) + '-' + ('0' + date).slice(-2);
      const schedule = altSchedules[dateID] !== undefined
        ? altSchedules[dateID]
        : normalSchedules[dateObj.getDay()];
      dayCols.push({
        elem: createElement('div', {
          classes: ['day-col', altSchedules[dateID] !== undefined && 'alt'],
          content: [
            createElement('h3', {content: [Formatter.date(month, date)]})
          ]
        }),
        viewer: new DayViewer(dateObj, schedule, day === 184),
        trigger() {
          this.viewer.initialize(this.elem);
        }
      });
    }
    document.body.appendChild(createFragment(dayCols.map(d => d.elem)));

    this.dayCols = dayCols;

    this.initWindowyThings();

    this.selected = 0;
  }

  scrollTo(pdPos, animate = true) {
    if (!animate) {
      window.scrollTo(this.screenWidth / 2 + this.periodWidth * (pdPos - 0.5), this.scrollY);
      return;
    }
    this.autoScrolling = window.requestAnimationFrame(() => {
      const startPdPos = this.toPdPos(this.scrollX);
      const pdPosChange = pdPos - startPdPos;
      const startTime = Date.now();
      const scroll = () => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= autoScrollDuration) {
          this.scrollTo(pdPos, false);
          this.selected = pdPos;
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
      window.scrollBy(vel, 0);
      this.autoScrolling = window.requestAnimationFrame(scroll);
    };
    scroll();
  }

  snapToADay() {
    this.scrollTo(Math.round(this.toPdPos(this.scrollX)), true);
  }

  toPdPos(scrollX) {
    return (scrollX - this.screenWidth / 2) / this.periodWidth + 0.5;
  }

  stopAutoScrolling() {
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
    });

    this.updateScrollMeasurements();
    window.addEventListener('scroll', e => {
      this.updateScrollMeasurements();
    });

    window.addEventListener('wheel', e => {
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

    const touchSpeeds = [];
    window.addEventListener('touchstart', e => {
      if (this.autoScrolling)
        this.stopAutoScrolling();
      Array.from(e.changedTouches).forEach(t => {
        touchSpeeds[t.identifier] = {
          oldX: t.clientX,
          oldY: t.clientY,
          xSpeed: 0,
          ySpeed: 0
        };
      });
    });
    window.addEventListener('touchmove', e => {
      Array.from(e.changedTouches).forEach(t => {
        touchSpeeds[t.identifier] = {
          oldX: t.clientX,
          oldY: t.clientY,
          xSpeed: t.clientX - touchSpeeds[t.identifier].oldX,
          ySpeed: t.clientY - touchSpeeds[t.identifier].oldY
        };
      });
    });
    window.addEventListener('touchend', e => {
      if (!this.autoScrolling) {
        this.momentumScrolling(-touchSpeeds[e.changedTouches[0].identifier].xSpeed / 3);
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
    this.scrollX = window.pageXOffset;
    this.scrollY = window.pageYOffset;
  }

}
