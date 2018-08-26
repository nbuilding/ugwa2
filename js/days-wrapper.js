const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_MIN = 1000 * 60;
const MIN_PER_DAY = 60 * 24;
const autoScrollDuration = 500;

Math.easeInOutQuad = prog => {
  prog *= 2;
  if (prog < 1) return prog * prog / 2;
  prog--;
  return (prog * (prog - 2) - 1) / -2;
};

class DaysWrapper {

  constructor(normalSchedules, altSchedules, firstDay, lastDay) {
    // CALCULATE WHAT viewers SHOULD EXIST
    const dayCount = (lastDay.getTime() - firstDay.getTime()) / MS_PER_DAY;
    const viewers = [];
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
      viewers.push(viewer);
    }
    document.body.appendChild(scrollWrapper = createElement('div', {
      classes: 'days-wrapper',
      content: [
        this.scrollSizeEnforcer = createElement('div', {
          classes: 'scroll-size-enforcer'
        }),
        ...viewers.map(v => v.wrapper),
        this.heading = createElement('div', {
          classes: 'heading',
          content: [
            this.headingDate = createElement('h3'),
            this.headingDay = createElement('h4', {
              classes: 'week-day-heading'
            })
          ]
        }),
        this.progressBar = createElement('div', {
          classes: 'progress-bar shadow4',
          content: [
            this.progress = createElement('span'),
            this.todayJump = createElement('button', {
              classes: 'text button',
              ripple: true,
              content: [Formatter.phrase('jump-to-today')]
            })
          ]
        })
      ]
    }));

    this.viewers = viewers;
    this.scrollWrapper = scrollWrapper;

    this.initWindowyThings();

    this.scrollWrapper.addEventListener('click', e => {
      let target = e.target;
      let periodWrapper, dayWrapper;
      do {
        if (target.classList.contains('day')) {
          dayWrapper = target;
          break;
        } else if (target.classList.contains('period')) {
          periodWrapper = target;
        }
      } while ((target = target.parentNode) && target.classList);
      if (dayWrapper) {
        const pdPos = viewers.map(v => v.wrapper).indexOf(dayWrapper);
        if (dayWrapper.classList.contains('selected')) {
          const viewer = viewers[pdPos];
          if (viewer.handleClick) viewer.handleClick(periodWrapper, e.target.tagName);
        } else {
          this.selected = pdPos;
          this.scrollTo(pdPos, true);
        }
      } else {
        viewers[this.selected].closeAllOpenPeriods();
      }
    });
    document.addEventListener('keydown', e => {
      const down = e.keyCode === 40;
      if ((e.keyCode === 38 || down) && document.activeElement.tagName !== 'TEXTAREA') {
        const viewer = viewers[this.selected];
        if (viewer.handleArrowPress) viewer.handleArrowPress(down);
        e.preventDefault();
      }
    });
    this.todayJump.addEventListener('click', e => {
      this.selected = this.today;
      this.scrollTo(this.selected, true);
    });

    this.timeZone = new Date().getTimezoneOffset();
    this.firstDay = Math.floor(firstDay.getTime() / MS_PER_DAY);
    this.updateTime();
    this.newDay();
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

    this.scrollWrapper.addEventListener('scroll', e => {
      window.requestAnimationFrame(() => {
        this.updateScrollMeasurements();
        const visibleViewers = this.viewers.slice(
          Math.floor((this.scrollX - this.screenWidth) / this.periodWidth),
          Math.ceil(this.scrollX / this.periodWidth)
        );
        this.viewers.filter(v => v.visible).forEach(v => !visibleViewers.includes(v) && v.hide());
        visibleViewers.forEach(v => v.show());
        const visibleUntriggeredDaycols = visibleViewers.filter(v => !v.initialized);
        if (visibleUntriggeredDaycols.length)
          visibleUntriggeredDaycols.forEach(d => d.initialize());
      });
    });

    this.scrollWrapper.addEventListener('wheel', e => {
      if (this.autoScrolling)
        this.stopAutoScrolling();

      const mousewheelScroll = e.deltaY && e.shiftKey;
      const integerScrollDiff = e.deltaY % 1 === 0;

      if (mousewheelScroll && integerScrollDiff) {
        this.selected += Math.sign(e.deltaY);
        this.scrollTo(this.selected, true);
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
    this.scrollSizeEnforcer.style.width = this.screenWidth * 2 + this.periodWidth * this.viewers.length + 'px';
    this.viewers.forEach((viewer, index) => {
      viewer.wrapper.style.transform = `translateX(${this.screenWidth + this.periodWidth * index}px)`;
    });
  }

  updateScrollMeasurements() {
    this.scrollX = this.scrollWrapper.scrollLeft;
    this.scrollY = this.scrollWrapper.scrollTop;
    this.headingDate.style.transform = `translateY(${-this.scrollY}px)`;
    this.headingDay.style.transform = `translateY(${-this.scrollY}px)`;
  }

  newDay() {
    this.selected = Math.floor((this.now / MIN_PER_DAY - this.firstDay));
    const todayPos = this.selected;
    this.scrollTo(todayPos, false);
    const viewer = this.viewers[todayPos];
    viewer.deinitialize();
    viewer.today = true;
    viewer.show();
    window.requestAnimationFrame(() => {
      viewer.initialize();
      viewer.handleSelection();
      this.today = todayPos;
      this.updateTime();
    });
  }

  updateTime() {
    this.now = Math.floor(Date.now() / MS_PER_MIN) - this.timeZone;
    if (this.today !== undefined) {
      clearChildren(this.progress);
      if (this.viewers[this.today].schedule !== null) {
        const {period, message, progress} = this.viewers[this.today].setTime(this.now % MIN_PER_DAY);
        const colour = Prefs.getPdColour(period);
        this.progress.appendChild(createFragment([
          createElement('span', {
            classes: ['period-span', colour === null ? 'clear' : Period.useBlack(colour) ? 'light' : 'dark'],
            styles: {
              backgroundColor: colour && `rgb(${colour})`
            },
            content: [Prefs.getPdName(period)]
          }),
          createElement('span', {content: ' ' + message})
        ]));
      } else {
        this.progress.textContent = Formatter.phrase('no-school');
      }
    }
  }

  get selected() {
    return this._selected;
  }

  set selected(s) {
    if (s < 0 || s >= this.viewers.length || typeof s !== 'number' || isNaN(s)) return;
    if (this.selected !== undefined)
      this.viewers[this.selected].handleDeselection();
    this._selected = s;
    this.viewers[s].handleSelection();
    const dateObj = this.viewers[s].date;
    this.headingDate.textContent = Formatter.date(dateObj.getMonth(), dateObj.getDate());
    this.headingDay.textContent = Formatter.weekday(dateObj.getDay());
    this.heading.style.transform = `translateX(${this.screenWidth + this.periodWidth * this._selected}px)`;
  }

}
