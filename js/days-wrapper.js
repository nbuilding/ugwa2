const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_MIN = 1000 * 60;
const MIN_PER_DAY = 60 * 24;
const AUTO_SCROLL_DURATION = 300;
const DATE_SELECTOR_HEIGHT = 400;

class DaysWrapper {

  constructor(firstDay, lastDay, getSchedule) {
    // CALCULATE WHAT viewers SHOULD EXIST
    this.getSchedule = getSchedule;
    const dayCount = (lastDay.getTime() - firstDay.getTime()) / MS_PER_DAY;
    const viewers = [];
    let scrollWrapper;
    for (let day = 0; day <= dayCount; day++) {
      const dateObj = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + day);
      const viewer = new DayViewer(dateObj);
      viewers.push(viewer);
    }
    document.body.appendChild(scrollWrapper = createElement('div', {
      classes: 'days-wrapper',
      content: [
        this.scroller = createElement('div', {
          classes: 'scrolling-container',
          content: [
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
          ]
        }),
        this.progressBar = createElement('div', {
          classes: 'progress-bar shadow4',
          content: [
            this.progressLine = createElement('div', {
              classes: 'progress-line'
            }),
            this.progress = createElement('span'),
            this.todayJump = createElement('button', {
              classes: 'text button',
              ripple: true,
              content: [Formatter.phrase('jump-to-today')]
            })
          ]
        }),
        this.settingsBtn = createElement('button', {
          classes: 'fab contained icon',
          content: [
            createElement('span', {
              classes: 'icon ugwa'
            })
          ],
          ripple: true
        }),
        createElement('div', {
          classes: 'back-to-top',
          content: [
            this.backToTop = createElement('button', {
              classes: 'contained button',
              ripple: true,
              content: [Formatter.phrase('to-top')]
            })
          ]
        }),
        (this.dateSelector = new DateSelector(this, firstDay, lastDay)).wrapper
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
          this.animateToDay(pdPos);
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
      this.animateToDay(this.selected);
    });
    this.backToTop.addEventListener('click', e => {
      this.scrollData.smoothY = 0;
    });
    this.settingsBtn.addEventListener('click', e => {
      window.location = './settings.html'; // TEMP
    });

    this.timeZone = new Date().getTimezoneOffset();
    this.firstDay = Math.floor(firstDay.getTime() / MS_PER_DAY);
    this.updateTime();
    this.newDay();

    setInterval(() => {
      this.updateTime();
      this.newDay();
    }, 5000);
    on('new name', on('new colour', () => this.updateTime()));
  }

  getScrollPos(pdPos) {
    return this.screenWidth / 2 + this.periodWidth * (pdPos + 0.5);
  }

  scrollToDay(pdPos) {
    this.setScrollX = this.getScrollPos(pdPos);
  }

  animateToDay(pdPos) {
    this.selected = pdPos;
    this.scrollData.smoothX = this.getScrollPos(pdPos);
  }

  scrollFrame() {
    this.dateSelector.animate();
    if (this.scrollingMode !== 'manual') {
      if (this.scrollData.velX !== 0 || this.scrollData.resnap) {
        if (Math.abs(this.scrollData.velX) < 0.5) {
          this.scrollData.velX = 0;
          this.animateToDay(Math.max(Math.min(Math.round(this.toPdPos(this.scrollX)), this.viewers.length - 1), 0));
        } else {
          this.scrollData.velX *= 0.9;
          this.setScrollX = this.scrollX + this.scrollData.velX;
        }
      }

      if (this.scrollData.velY !== 0 || this.scrollData.resnap) {
        if (Math.abs(this.scrollData.velY) < 0.5) {
          this.scrollData.velY = 0;
        } else {
          this.scrollData.velY *= this.scrollY < -DATE_SELECTOR_HEIGHT ? 0.5 : 0.9;
          this.setScrollY = this.scrollY + this.scrollData.velY;
        }
      }

      if (this.scrollData.smoothX !== null) {
        if (Math.abs(this.scrollData.smoothX - this.scrollX) < 0.5) {
          this.setScrollX = this.scrollData.smoothX;
          this.scrollData.smoothX = null;
        }
        else
          this.setScrollX = (this.scrollData.smoothX - this.scrollX) / 5 + this.scrollX;
      }

      if (this.scrollData.smoothY !== null) {
        if (Math.abs(this.scrollData.smoothY - this.scrollY) < 0.5) {
          this.setScrollY = this.scrollData.smoothY;
          this.scrollData.smoothY = null;
          this.scrollData.showingDateSel = this.scrollData.showingDateSel && this.scrollY === 0
            ? false : !this.scrollData.showingDateSel && this.scrollY === -DATE_SELECTOR_HEIGHT
            ? true : this.scrollData.showingDateSel;
        }
        else
          this.setScrollY = (this.scrollData.smoothY - this.scrollY) / 5 + this.scrollY;
      }

      if (this.scrollData.resnap) {
        this.scrollData.resnap = false;
      }

      if (this.scrollData.velX === 0 && this.scrollData.velY === 0
          && this.scrollData.smoothX === null && this.scrollData.smoothY === null) {
        if (this.scrollY < 0 && this.scrollY !== -DATE_SELECTOR_HEIGHT) {
          this.scrollData.smoothY = this.scrollData.showingDateSel || this.scrollY > -150 ? 0 : -DATE_SELECTOR_HEIGHT;
        } else if (this.scrollY >= 0 && this.scrollData.showingDateSel) {
          this.scrollData.showingDateSel = false;
        }
        if (this.scrollY > 0 && this.scrollY < 100) {
          this.scrollData.smoothY = 0;
        }
      }
    } else {
      this.scrollData.smoothX = null;
      this.scrollData.smoothY = null;
      if (this.scrollData.lastTrackpadScroll !== null && Date.now() - this.scrollData.lastTrackpadScroll > 100) {
        this.scrollingMode = 'auto';
        this.scrollData.resnap = true;
        this.scrollData.lastTrackpadScroll = null;
      }
    }
    window.requestAnimationFrame(() => this.scrollFrame());
  }

  toPdPos(scrollX) {
    return (scrollX - this.screenWidth / 2) / this.periodWidth - 0.5;
  }

  isOfDateSelector(target) {
    return this.dateSelector.wrapper.contains(target);
  }

  initWindowyThings() {
    this.scrollingMode = 'auto'; // manual, auto
    this.scrollData = {
      velX: 0, velY: 0, smoothX: null, smoothY: null, resnap: false,
      showingDateSel: false, lastTrackpadScroll: null
    };

    this.updateWidthMeasurements();
    window.addEventListener('resize', e => {
      this.updateWidthMeasurements();
      if (this.scrollingMode !== 'manual')
        this.scrollToDay(this.selected);
    });

    this.scrollWrapper.addEventListener('scroll', e => {
      window.requestAnimationFrame(() => { // disable native scrolling
        this.scrollWrapper.scrollLeft = this.scrollWrapper.scrollTop = 0;
      });
      e.preventDefault();
    }, {passive: false});

    this.onscroll = () => {
      this.scroller.style.transform = `translate(${-this.scrollX}px, ${-this.scrollY}px)`;
      const visibleViewers = this.viewers.slice(
        Math.max(Math.floor((this.scrollX - this.screenWidth) / this.periodWidth), 0),
        Math.min(Math.ceil(this.scrollX / this.periodWidth), this.viewers.length)
      );
      this.viewers.filter(v => v.visible).forEach(v => !visibleViewers.includes(v) && v.hide());
      visibleViewers.forEach(v => v.show());
      const visibleUntriggeredDaycols = visibleViewers.filter(v => !v.initialized);
      if (visibleUntriggeredDaycols.length) {
        visibleUntriggeredDaycols.forEach(d => d.initialize(this.getSchedule(d.date)));
        if (visibleUntriggeredDaycols.includes(this.viewers[this.selected]))
          this.viewers[this.selected].handleSelection();
      }
      // if (this.scrollY < 500) this.setScrollY = 500; // TEMP
    };

    this.scrollWrapper.addEventListener('wheel', e => {
      const integerScrollDiff = Math.abs(e.deltaY) > 60 && e.deltaY % 10 === 0;
      if (this.isOfDateSelector(e.target)) {
        const dateSel = this.dateSelector;
        if (integerScrollDiff) {
          dateSel.autoScroll = (dateSel.autoScroll !== null ? dateSel.autoScroll : dateSel.scroll) + e.deltaY;
        } else {
          dateSel.setScroll = dateSel.scroll + e.deltaY;
        }
      } else {
        const mousewheelScroll = e.deltaY && e.shiftKey;

        if (mousewheelScroll && integerScrollDiff) {
          this.selected += Math.sign(e.deltaY);
          this.animateToDay(this.selected);
        } else if (integerScrollDiff && !mousewheelScroll) {
          if (e.deltaY < 0 && (this.scrollY === 0 || this.scrollData.smoothY === 0) && !this.scrollData.showingDateSel) {
            this.scrollData.showingDateSel = true;
            this.scrollData.smoothY = -DATE_SELECTOR_HEIGHT;
          } else if ((this.scrollY === -DATE_SELECTOR_HEIGHT || this.scrollData.smoothY === -DATE_SELECTOR_HEIGHT) && this.scrollData.showingDateSel) {
            this.scrollData.showingDateSel = false;
            this.scrollData.smoothY = 0;
          } else {
            this.scrollData.smoothY = (this.scrollData.smoothY !== null ? this.scrollData.smoothY : this.scrollY) + e.deltaY;
          }
        } else {
          this.scrollingMode = 'manual';
          this.setScrollX = this.scrollX + e.deltaX;
          this.setScrollY = this.scrollY + e.deltaY;
          this.scrollData.lastTrackpadScroll = Date.now();
        }
      }
      e.preventDefault();
    });

    document.body.addEventListener('keydown', e => {
      if (document.activeElement.tagName === 'TEXTAREA') return;
      if (e.keyCode === 37) this.animateToDay(Math.max(--this.selected, 0));
      else if (e.keyCode === 39) this.animateToDay(Math.min(++this.selected, this.viewers.length - 1));
    });

    const fingerData = [];
    this.scrollWrapper.addEventListener('touchstart', e => {
      if (document.activeElement.tagName === 'TEXTAREA') return;
      const ofDateSel = this.isOfDateSelector(e.target);
      if (ofDateSel) {
        this.dateSelector.autoScroll = null;
        this.dateSelector.scrollVel = 0;
      } else {
        this.scrollingMode = 'manual';
      }
      const now = Date.now();
      Array.from(e.changedTouches).forEach(t => {
        fingerData[t.identifier] = {
          originalScrollX: this.scrollX,
          originalX: t.clientX,
          oldX: t.clientX,
          xDiff: 0,
          originalScrollY: ofDateSel ? this.dateSelector.scroll : this.scrollY,
          originalY: t.clientY,
          oldY: t.clientY,
          yDiff: 0,
          oldTime: now,
          timeDiff: 0,
          scrolling: false,
          ofDateSel: ofDateSel
        };
      });
    });
    this.scrollWrapper.addEventListener('touchmove', e => {
      if (document.activeElement.tagName === 'TEXTAREA') return;
      const now = Date.now();
      Array.from(e.changedTouches).forEach(t => {
        const finger = fingerData[t.identifier];
        finger.xDiff = t.clientX - finger.oldX;
        finger.oldX = t.clientX;
        finger.yDiff = t.clientY - finger.oldY;
        finger.oldY = t.clientY;
        finger.timeDiff = now - finger.oldTime;
        finger.oldTime = now;
        if (!finger.scrolling && (Math.abs(finger.originalX - t.clientX) > 5
            || Math.abs(finger.originalY - t.clientY) > 5))
          finger.scrolling = true;
        if (finger.scrolling) {
          if (finger.ofDateSel) {
            this.dateSelector.setScroll = finger.originalScrollY - t.clientY + finger.originalY;
          } else {
            this.setScrollX = finger.originalScrollX - t.clientX + finger.originalX;
            this.setScrollY = finger.originalScrollY - t.clientY + finger.originalY;
          }
        }
      });
      e.preventDefault();
    }, {passive: false});
    this.scrollWrapper.addEventListener('touchend', e => {
      if (document.activeElement.tagName === 'TEXTAREA') return;
      const finger = fingerData[e.changedTouches[0].identifier];
      if (finger.scrolling) {
        if (finger.ofDateSel) {
          this.dateSelector.scrollVel = -finger.yDiff / finger.timeDiff * 17 || 0;
        } else {
          this.scrollData.resnap = true;
          this.scrollData.velX = -finger.xDiff / finger.timeDiff * 17 || 0;
          this.scrollData.velY = -finger.yDiff / finger.timeDiff * 17 || 0;
        }
      }
      if (!finger.ofDateSel) this.scrollingMode = 'auto';
      Array.from(e.changedTouches).forEach(t => {
        fingerData[t.identifier] = null;
      });
    });

    this.scrollY = 0;
    this.scrollFrame();
  }

  updateWidthMeasurements() {
    this.screenWidth = window.innerWidth;
    this.periodWidth = Math.min(this.screenWidth, 500);
    this.viewers.forEach((viewer, index) => {
      viewer.wrapper.style.transform = `translateX(${this.screenWidth + this.periodWidth * index}px)`;
    });
    this.heading.style.transform = `translateX(${this.screenWidth + this.periodWidth * this.selected}px)`;
  }

  set setScrollX(x) {
    this.scrollX = x;
    this.onscroll();
  }

  set setScrollY(y) {
    this.scrollY = y;
    this.backToTop.style.transform = `translateY(${-Math.min(y - 200, 36 + 16)}px)`;
    this.dateSelector.wrapper.style.transform = `translateY(${-y}px)`;
    this.onscroll();
  }

  newDay() {
    const todayPos = Math.floor((this.now / MIN_PER_DAY - this.firstDay))
      + (+window.location.search.slice(1) || 0); // TEMP
    if (todayPos !== this.today) {
      this.selected = todayPos;
      this.scrollToDay(todayPos);
      const viewer = this.viewers[todayPos];
      viewer.deinitialize();
      viewer.today = true;
      viewer.show();
      window.requestAnimationFrame(() => {
        viewer.initialize(this.getSchedule(viewer.date));
        viewer.handleSelection();
        this.today = todayPos;
        this.updateTime();
      });
    }
  }

  updateTime() {
    this.now = Math.floor(Date.now() / MS_PER_MIN) - this.timeZone
      + (+window.location.hash.slice(1) || 0); // TEMP
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
        if (progress >= 0) {
          this.progressLine.style.display = null;
          this.progressLine.style.setProperty('--progress', progress * 100 + '%');
          this.progressLine.style.setProperty('--color', colour ? `rgb(${colour})` : 'var(--secondary-text)');
          document.body.classList.add('progress-line-showing');
        } else {
          this.progressLine.style.display = 'none';
          document.body.classList.remove('progress-line-showing');
        }
      } else {
        this.progress.textContent = Formatter.phrase('no-school');
        this.progressLine.style.display = 'none';
        document.body.classList.remove('progress-line-showing');
      }
    }
  }

  get selected() {
    return this._selected;
  }

  set selected(s) {
    if (s < 0 || s >= this.viewers.length || typeof s !== 'number' || isNaN(s) || this._selected === s) return;
    if (this._selected !== undefined)
      this.viewers[this._selected].handleDeselection();
    this._selected = s;
    this.viewers[s].handleSelection();
    const dateObj = this.viewers[s].date;
    this.headingDate.textContent = Formatter.date(dateObj.getMonth(), dateObj.getDate());
    this.headingDay.textContent = Formatter.weekday(dateObj.getDay());
    this.heading.style.transform = `translateX(${this.screenWidth + this.periodWidth * this._selected}px)`;
    this.dateSelector.autoScroll = this.dateSelector.getScrollPos(s);
  }

}
