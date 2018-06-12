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
              classes: 'button',
              ripple: true,
              roundRipple: true,
              content: [
                createElement('span', {classes: 'icon'})
              ]
            }),
            createElement('span', {classes: 'label', content: [c]})
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
        this.choice = i;
      });
      radioWrapper.addEventListener('touchstart', e => {
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
        createElement('span', {classes: 'label', content: [label]}),
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
      classes: 'textfield',
      content: [
        createElement('label', {content: [label]}),
        this.input = createElement('input'),
        createElement('span', {content: [
          this.line = createElement('span')
        ]})
      ]
    });

    this.wrapper.addEventListener('mousedown', e => {
      if (document.activeElement === this.input) e.preventDefault();
    });
    this.wrapper.addEventListener('click', e => {
      this.line.style.transitionDelay = '0s';
      this.line.style.setProperty('--click-x', (e.clientX - this.wrapper.getBoundingClientRect().left) + 'px');
      this.input.focus();
    });
    this.input.addEventListener('focus', e => {
      this.wrapper.classList.add('focused');
    });
    this.input.addEventListener('blur', e => {
      this.wrapper.classList.remove('focused');
      this.line.style.setProperty('--click-x', null);
      this.line.style.transitionDelay = null;
    });
    if (options.onchange) {
      this.input.addEventListener('input', e => {
        this.onchange(this.input.value);
      });
    }
    this.input.addEventListener('change', e => {
      if (this.input.value) this.wrapper.classList.add('filled');
      else this.wrapper.classList.remove('filled');
    });
  }

}
