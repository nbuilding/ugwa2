class RadioGroup {

  constructor(title, choices) {
    this.choiceNames = choices;
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

  get choiceName() {
    return this.choiceNames[this._choice];
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
    options.type = options.type || 'single-line';
    this.wrapper = createElement('div', {
      classes: ['textfield', options.icon && 'has-icon', options.type],
      content: [
        createElement('label', {content: [label]}),
        this.input = createElement(
          options.type !== 'single-line' ? 'textarea' : 'input',
          {
            classes: 'input',
            readOnly: options.readOnly
          }
        ),
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
    if (options.onchange || options.type === 'multi-line') {
      this.input.addEventListener('input', e => {
        if (this.onchange) this.onchange(this.input.value);
        if (options.type === 'multi-line') {
          this.input.style.height = Math.ceil(2 + getTextSize(this.input.value, this.input).height) + 'px';
        }
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
    this.choices = choices;
    this.wrapper = createElement('ul', {
      classes: 'menu shadow8',
      content: this.choiceElements = choices.map(c => createElement('li', {content: [c], ripple: true})),
      tabindex: -1
    });
    this.wrapper.addEventListener('click', e => {
      if (this.onchoice && e.target !== this.wrapper)
        this.returnChoice(e.target.textContent);
    });
    this.wrapper.addEventListener('keydown', e => {
      if (e.keyCode === 13 || e.keyCode === 32)
        this.returnChoice(this.cursor);
      else if (e.keyCode === 37 || e.keyCode === 38)
        this.showCursor((this.cursor + choices.length - 1) % choices.length);
      else if (e.keyCode === 39 || e.keyCode === 40)
        this.showCursor((this.cursor + 1) % choices.length);
    });
    this.wrapper.addEventListener('blur', e => {
      this.close();
    });
  }

  returnChoice(choice) {
    if (typeof choice === 'number') this.onchoice(this.choices[choice], choice);
    else this.onchoice(choice, this.choices.indexOf(choice));
    this.close();
  }

  showCursor(cursor) {
    if (this.cursor !== null) this.choiceElements[this.cursor].classList.remove('selected');
    if (cursor !== null) this.choiceElements[cursor].classList.add('selected');
    this.cursor = cursor;
  }

  appear() {
    this.wrapper.classList.add('open');
    this.wrapper.setAttribute('tabindex', 0);
    this.wrapper.focus();
    this.cursor = 0;
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
    // this.wrapper.blur();
    this.wrapper.setAttribute('tabindex', -1);
    this.showCursor(null);
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
      if (this.onchange) this.onchange(i, c);
      // this.menu.close();
      this.input.focus();
    }
    // TODO: selection indicator thing and allow esc to cancel (will require revamp)
    this.input.addEventListener('keydown', e => {
      if (e.keyCode === 13 || e.keyCode === 32)
        this.focus();
    });
    this.wrapper.appendChild(this.menu.wrapper);
  }

  initialise() {
    const menuRect = this.menu.getRect();
    this.wrapper.style.width = Math.floor(menuRect.width) + 'px';
  }

  focus() {
    const inputRect = this.wrapper.getBoundingClientRect();
    this.menu.at(inputRect.left, inputRect.top - this.choice * 48 + 3);
    // TODO: scrolling within options (likely will be important), prevent off-screen dropdown
    this.menu.from(inputRect.left + inputRect.width / 2, inputRect.top + inputRect.height / 2);
    this.menu.appear();
    this.menu.cursor = this.choice;
  }

  onclick(e) {
    if (!this.menu.wrapper.contains(e.target)) this.focus();
  }

  // onblur() {
  //   this.menu.close();
  // }

  get choiceName() {
    return this.choices[this.choice];
  }

  set choiceName(id) {
    if (typeof id === 'number') this.choice = id;
    else this.choice = this.choices.indexOf(id);
    this.value = this.choices[this.choice];
  }

}
