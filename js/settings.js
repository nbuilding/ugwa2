class Section {

  constructor(parent, name, addContent) {
    this.parent = parent;
    this.displayName = Formatter.phrase(name);
    this.section = parent.contentWrapper.appendChild(createElement('div', {
      classes: 'section',
      content: [
        createElement('h5', {
          content: [this.displayName]
        })
      ]
    }));
    this.sidebarBtn = parent.sidebarWrapper.appendChild(createElement('li', {
      ripple: true,
      content: [
        createElement('span', {
          classes: 'icon ' + name
        }),
        createElement('span', {
          content: [this.displayName]
        })
      ]
    }));
    this.sidebarBtn.addEventListener('click', () => this.switchToMe());
    addContent(this.section);
  }

  deactivate() {
    this.sidebarBtn.classList.remove('active');
    this.section.classList.remove('active');
    this.parent.selected = null;
  }

  activate() {
    this.sidebarBtn.classList.add('active');
    this.section.classList.add('active');
    this.parent.selected = this;
  }

  switchToMe() {
    if (this.parent.selected) this.parent.selected.deactivate();
    this.activate();
  }

}

class SectionManager extends Array {

  constructor(sections, sidebarWrapper, contentWrapper) {
    super();
    this.selected = null;
    this.sidebarWrapper = sidebarWrapper;
    this.contentWrapper = contentWrapper;
    Object.keys(sections).forEach(sec => {
      this.push(new Section(this, sec, sections[sec]));
    });
  }

}

function initialize() {
  const sections = new SectionManager({
    appearance: section => {
      const themes = ['light', 'dark', 'neither'],
            roundnesses = ['sharp', 'roundish', 'round'],
            themeRadios = new RadioGroup('Colour theme', ['light', 'dark', 'neither']),
            roundnessRadios = new RadioGroup('Rounded corners', ['sharp', 'modestly round', 'overly round']);
      section.appendChild(themeRadios.wrapper);
      section.appendChild(roundnessRadios.wrapper);
      themeRadios.onchange = roundnessRadios.onchange = theme => {
        document.body.className = `${themes[themeRadios.choice]} ${roundnesses[roundnessRadios.choice]}`;
      };
      themeRadios.choice = 1; // temp
      roundnessRadios.choice = 1;
    },
    periods: section => 'Periods',
    locales: section => 'Locales',
    barcodes: section => 'Barcodes',
    staff: section => 'Staff',
    clubs: section => 'Clubs',
    'last-psa': section => 'Last PSA',
    about: section => 'About',
    credits: section => 'Credits'
  }, document.querySelector('.sidebar'), document.querySelector('.content'));
  sections[0].activate();

  const collapsibleSidebar = document.querySelector('.dimmer');
  document.getElementById('menu').addEventListener('click', e => {
    collapsibleSidebar.classList.add('open');
  });
  document.getElementById('close-menu').addEventListener('click', e => {
    collapsibleSidebar.classList.remove('open');
  });
  collapsibleSidebar.addEventListener('click', e => {
    if (e.target === collapsibleSidebar)
      collapsibleSidebar.classList.remove('open');
  });
}

document.addEventListener('DOMContentLoaded', initialize);
