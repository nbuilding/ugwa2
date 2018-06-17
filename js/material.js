class RadioGroup {

  constructor(title, choices) {
    this.wrapper = createElement('div', {
      classes: 'radios',
      content: [
        createElement('span', {
          classes: 'title caption',
          content: [title]
        }),
        ...(this.choices = choices.map(c => createElement('div', {
          classes: 'radio',
          tabindex: -1,
          content: [
            createElement('span', {
              classes: 'radio-button',
              ripple: true,
              roundRipple: true,
              content: [
                createElement('span', {classes: 'icon'})
              ]
            }),
            createElement('label', {content: [c]})
          ]
        })))
      ]
    });
    this.choices.forEach((radioWrapper, i) => {
      // distinction between mouse and keyboard blur
      radioWrapper.addEventListener('mousedown', e => {
        radioWrapper.classList.add('mouse-focused');
      });
      radioWrapper.addEventListener('blur', e => {
        radioWrapper.classList.remove('mouse-focused');
      });

      radioWrapper.addEventListener('mousedown', e => {
        if (e.target === radioWrapper) return;
        this.choice = i;
      });
      radioWrapper.addEventListener('touchstart', e => {
        if (e.target === radioWrapper) return;
        this.choice = i;
      });
      radioWrapper.addEventListener('keydown', e => {
        if (e.keyCode === 13 || e.keyCode === 32)
          this.choice = i;
        else if (e.keyCode === 37 || e.keyCode === 38)
          this.choice = (this._choice + this.choices.length - 1) % this.choices.length;
        else if (e.keyCode === 39 || e.keyCode === 40)
          this.choice = (this._choice + 1) % this.choices.length;
      });
    });

    this._choice = -1;
  }

  get choice() {
    return this._choice;
  }

  set choice(newChoice) {
    if (this._choice === newChoice) return;

    if (this._choice >= 0) {
      this.choices[this._choice].classList.remove('checked');
      this.choices[this._choice].setAttribute('tabindex', -1);
      if (document.activeElement === this.choices[this._choice]) {
        this.choices[this._choice].blur();
        this.choices[newChoice].focus();
      }
    }

    this._choice = newChoice;
    this.choices[newChoice].classList.add('checked');
    this.choices[newChoice].setAttribute('tabindex', 0);
    if (this.choices[newChoice].classList.contains('pressed')) {
      this.choices[newChoice].classList.remove('pressed');
      window.getComputedStyle(this.choices[newChoice]);
    }
    this.choices[newChoice].classList.add('pressed');

    if (this.onchange) this.onchange(newChoice);
  }

}

class Switch {

  constructor(label) {
    this.wrapper = createElement('div', {
      classes: 'switch',
      tabindex: 0,
      content: [
        createElement('label', {content: [label]}),
        createElement('span', {
          classes: 'track',
          content: [
            createElement('span', {
              classes: 'thumb shadow1',
              content: [createElement('span', {classes: 'rippler', ripple: true, roundRipple: true})]
            })
          ]
        })
      ]
    });

    // distinction between mouse and keyboard blur
    this.wrapper.addEventListener('mousedown', e => {
      this.wrapper.classList.add('mouse-focused');
    });
    this.wrapper.addEventListener('blur', e => {
      this.wrapper.classList.remove('mouse-focused');
    });

    this.wrapper.addEventListener('click', e => {
      if (e.target === this.wrapper) return;
      this.checked = !this.checked;
    });
    this.wrapper.addEventListener('keydown', e => {
      if (e.keyCode === 13 || e.keyCode === 32)
        this.checked = !this.checked;
    });
  }

  get checked() {
    return this.wrapper.classList.contains('checked');
  }

  set checked(checked) {
    if (checked === this.checked) return;
    if (checked) {
      this.wrapper.classList.add('checked');
    } else {
      this.wrapper.classList.remove('checked');
    }
    if (this.onchange) this.onchange(checked);
  }

}

class TextField {

  constructor(label, options = {}) {
    this.wrapper = createElement('div', {
      classes: ['textfield', options.readOnly && 'has-icon'],
      content: [
        createElement('label', {content: [label]}),
        this.input = createElement('input', {readOnly: options.readOnly}),
        createElement('span', {content: [
          this.line = createElement('span')
        ]}),
        options.icon && (this.icon = createElement('button', {
          content: [
            createElement('svg', {
              svg: true,
              attr: {
                width: 18,
                height: 18
              },
              content: [createElement('path', {svg: true, attr: {d: options.icon}})]
            })
          ]
        }))
      ]
    });

    this.wrapper.addEventListener('mousedown', e => {
      if (document.activeElement === this.input
           && e.target !== this.input) {
        // this prevents a weird blurfocus flicker when clicking on the label
        e.preventDefault();
      }
    });
    this.wrapper.addEventListener('click', e => {
      this.line.style.transitionDelay = '0s';
      this.line.style.setProperty('--click-x', (e.clientX - this.wrapper.getBoundingClientRect().left) + 'px');
      this.input.focus();
      if (this.onclick) this.onclick(e);
    });
    this.input.addEventListener('focus', e => {
      this.wrapper.classList.add('focused');
      if (this.onfocus) this.onfocus();
    });
    this.input.addEventListener('blur', e => {
      this.wrapper.classList.remove('focused');
      this.line.style.setProperty('--click-x', null);
      this.line.style.transitionDelay = null;
      if (this.onblur) this.onblur();
    });
    if (options.onchange) {
      this.input.addEventListener('input', e => {
        options.onchange(this.input.value);
      });
    }
    if (options.icon && options.oniconclick) {
      this.icon.addEventListener('click', e => {
        options.oniconclick();
      });
    }
    this.input.addEventListener('change', e => {
      if (this.input.value) this.wrapper.classList.add('filled');
      else this.wrapper.classList.remove('filled');
    });
  }

  get value() {
    return this.input.value;
  }

  set value(val) {
    this.input.value = val;
    if (val) this.wrapper.classList.add('filled');
    else this.wrapper.classList.remove('filled');
  }

}

class Menu {

  constructor(choices) {
    // TODO: add keyboard support
    this.wrapper = createElement('ul', {
      classes: 'menu shadow8',
      content: choices.map(c => createElement('li', {content: [c], ripple: true}))
    });
    this.wrapper.addEventListener('click', e => {
      if (this.onchoice && e.target !== this.wrapper)
        this.onchoice(e.target.textContent, choices.indexOf(e.target.textContent));
    });
  }

  appear() {
    this.wrapper.classList.add('open');
  }

  at(menuX, menuY) {
    this.wrapper.style.left = menuX + 'px';
    this.wrapper.style.top = menuY + 'px';
  }

  getRect() {
    this.wrapper.style.transform = 'scale(1)';
    this.wrapper.style.transition = 'none';
    const rect = this.wrapper.getBoundingClientRect();
    this.wrapper.style.transform = null;
    this.wrapper.getBoundingClientRect(); // force css refresh thing
    this.wrapper.style.transition = null;
    return rect;
  }

  from(fromX, fromY) {
    const rect = this.getRect();
    this.wrapper.style.transformOrigin = `${fromX - rect.left}px ${fromY - rect.top}px`;
  }

  appearAtFrom(menuX, menuY, fromX, fromY) {
    this.at(menuX, menuY);
    this.from(fromX, fromY);
    this.appear();
  }

  close() {
    this.wrapper.classList.remove('open');
  }

}

class Dropdown extends TextField {

  constructor(label, choices, defaultVal) {
    super(label, {
      readOnly: true,
      icon: 'M7 10l5 5 5-5z'
    });
    this.value = defaultVal === undefined ? 'Select' : choices[defaultVal];
    this.choices = choices;
    this.choice = defaultVal;
    this.menu = new Menu(choices);
    this.menu.onchoice = (c, i) => {
      this.choice = i;
      this.value = c;
      this.menu.close();
    }
    // TODO: selection indicator thing and allow esc to cancel (will require revamp)
    this.input.addEventListener('keydown', e => {
      if (e.keyCode === 13 || e.keyCode === 32)
        this.menu.close();
      else if ((e.keyCode === 37 || e.keyCode === 38) && this.choice > 0) {
        this.value = choices[--this.choice];
      } else if ((e.keyCode === 39 || e.keyCode === 40) && this.choice < choices.length - 1) {
        this.value = choices[++this.choice];
      }
    });
    this.wrapper.appendChild(this.menu.wrapper);
  }

  initialise() {
    const menuRect = this.menu.getRect();
    this.wrapper.style.width = Math.floor(menuRect.width) + 'px';
  }

  onfocus() {
    const inputRect = this.wrapper.getBoundingClientRect();
    this.menu.at(inputRect.left, inputRect.top - this.choice * 48 + 3);
    // TODO: scrolling within options (likely will be important), prevent off-screen dropdown
    this.menu.from(inputRect.left + inputRect.width / 2, inputRect.top + inputRect.height / 2);
    this.menu.appear();
  }

  onclick(e) {
    if (!this.menu.wrapper.contains(e.target)) this.onfocus();
  }

  onblur() {
    this.menu.close();
  }

  get choiceName() {
    return this.choices[this.choice];
  }

  set choiceName(id) {
    if (typeof id === 'number') this.choice = id;
    else this.choice = this.choices.indexOf(id);
    this.value = this.choices[this.choice];
  }

}
