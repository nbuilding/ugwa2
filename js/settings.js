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
    const collapsibleSidebar = document.querySelector('.dimmer');
    this.sidebarBtn.addEventListener('click', () => (this.switchToMe(), collapsibleSidebar.classList.remove('open')));
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
  Prefs.loadPrefs();
  Prefs.applyTheme();
  const sections = new SectionManager({
    appearance: section => {
      const themes = ['light', 'dark', 'neither'],
            roundnesses = ['sharp', 'roundish', 'round'],
            themeRadios = new RadioGroup('Colour theme', ['light', 'dark', 'neither']),
            roundnessRadios = new RadioGroup('Rounded corners', ['sharp', 'modestly round', 'overly round']);
      section.appendChild(themeRadios.wrapper);
      section.appendChild(roundnessRadios.wrapper);
      themeRadios.choice = (themes.indexOf(Prefs.options.theme) + 3) % 3; // temp
      roundnessRadios.choice = Prefs.options.roundness;
      themeRadios.onchange = roundnessRadios.onchange = theme => {
        document.body.className = `${themes[themeRadios.choice]} ${roundnesses[roundnessRadios.choice]}`;
        Prefs.options.theme = themes[themeRadios.choice];
        Prefs.options.roundness = roundnessRadios.choice;
        Prefs.savePrefs();
      };
    },
    periods: section => {
      const showBreaks = new Switch('show brunch and lunch'),
//             showSELF = new Switch('show SELF'),
//             show0 = new Switch('show zero period'),
            showStaff = new Switch('show staff periods'),
            switches = [showBreaks, showStaff];
      showBreaks.checked = Prefs.options.breaks;
//       showSELF.checked = Prefs.options.self;
//       show0.checked = Prefs.options.zero;
      showStaff.checked = Prefs.options.staff;
      showBreaks.onchange = checked => { Prefs.options.breaks = checked; Prefs.savePrefs(); };
//       showSELF.onchange = checked => { Prefs.options.self = checked; Prefs.savePrefs(); };
//       show0.onchange = checked => { Prefs.options.zero = checked; Prefs.savePrefs(); };
      showStaff.onchange = checked => { Prefs.options.staff = checked; Prefs.savePrefs(); };
      section.appendChild(createFragment(switches.map(s => s.wrapper)))
    },
    locales: section => {
      const language = new Dropdown('Language', ['English (traditional)', 'English (simplified)', '█████'], 0),
            time = new RadioGroup('Time format', ['10:54pm', '10:54PM', '10:54 pm', '10:54 PM', '22:54', '???']),
            duration = new RadioGroup('Duration format', ['4 hours, 20 minutes', '4 hours and 20 minutes', '260 minutes', '4:20 hours', '-260 comment karma']),
            date = new RadioGroup('Date format', ['03-14', '3/14', 'Mar. 14', 'Mar 14', 'March 14', 'March 14th', '14/3', '14 Mar.', '14 Mar', '14 March', '14th of March', '3 + 14 = 5']),
            weekdays = new RadioGroup('Format of the days of the week', ['SMTWΘFS', 'SMTWTFS', 'Su M Tu W Th F Sa', 'Sun Mon Tue Wed Thu Fri Sat', 'Sun. Mon. Tue. Wed. Thu. Fri. Sat', 'Sun Mon Tues Wed Thurs Fri Sat', 'Sun. Mon. Tues. Wed. Thurs. Fri. Sat', 'Sun. Mon. Tues. Wed. Thurs. Fri. Sat', 'SOOHAAM']),
            weekstart = new RadioGroup('The week starts on', ['Sunday', 'Monday', 'Thursday']);
      time.choice = 0;
      duration.choice = 1;
      date.choice = 4;
      weekdays.choice = 1;
      weekstart.choice = 0;
      section.appendChild(createFragment([
        language.wrapper,
        time.wrapper,
        duration.wrapper,
        date.wrapper,
        weekdays.wrapper,
        weekstart.wrapper
      ]));
    },
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

  document.getElementById('close').addEventListener('click', e => {
    window.location.href = './schedules.html'; // TEMP
  });
}

document.addEventListener('DOMContentLoaded', initialize);
