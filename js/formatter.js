// TODO

/*
 * OCCURRENCES
 * time: in periods
 * duration: in periods, progress bar
 * date: heading
 * day of the week: heading
 * DOTW letter: date selector
 * phrases:
 *   lasts: periods
 *   no-school: days
 *   juststarted, started, starting, justended, ended, ending: periods, progress bar
 */

const Formatter = {
  time(minutes) {
    const hours = Math.floor(minutes / 60);
    return `<em>${((hours + 11) % 12 + 1) + ':' + ('0' + minutes % 60).slice(-2)}</em>` + (hours < 12 && hours > 0 ? 'am' : 'pm');
  },
  duration(minutes) {
    const hours = Math.floor(minutes / 60);
    minutes %= 60;
    if (hours > 0) {
      return `<em>${hours}</em>` + ' hour' + (hours > 1 ? 's' : '')
        + (minutes > 0 ? ' and ' + `<em>${minutes}</em>` + ' minute' + (minutes > 1 ? 's' : '') : '');
    } else {
      return `<em>${minutes}</em>` + ' minute' + (minutes === 1 ? '' : 's');
    }
  },
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  date(month, date) {
    return this.months[month] + ' ' + date;
  },
  days: ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur'],
  weekday(day) {
    return this.days[day] + 'day';
  },
  weekdayletter(day) {
    return day === 4 ? '&theta;' : this.days[day][0];
  },
  phrase(phraseID, ...params) {
    switch (phraseID) {
      case 'no-school':
        return 'No school!';
      case 'lasts':
        return 'Lasts for ' + params[0];
      case 'juststarted':
        return 'Just started';
      case 'started':
        return 'Started ' + params[0] + ' ago';
      case 'starting':
        return 'Starting in ' + params[0];
      case 'justended':
        return 'Just ended';
      case 'ended':
        return 'Ended ' + params[0] + ' ago';
      case 'ending':
        return 'Ending in ' + params[0];
      case 'jump-to-today':
        return 'Today';
      case 'appearance': return 'Appearance';
      case 'periods': return 'Periods';
      case 'locales': return 'Locales';
      case 'barcodes': return 'Barcodes';
      case 'staff': return 'Staff';
      case 'clubs': return 'Clubs';
      case 'last-psa': return 'Last PSA';
      case 'about': return 'About';
      case 'credits': return 'Credits';
      default:
        return `Unknown phrase "<em>${phraseID}</em>"`;
    }
  }
};
