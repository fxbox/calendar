/* global TwitterCldr */

'use strict';

import moment from 'components/moment';

/*
 * @todo:
 *   * @see http://www.unicode.org/cldr/charts/29/verify/dates/en.html
 *     for formatting the time of the day.
 */

const p = Object.freeze({
  // Properties
  listFormatter: Symbol('listFormatter'),

  // Methods
  formatUser: Symbol('formatUser'),
  formatAction: Symbol('formatAction'),
  formatTime: Symbol('formatTime'),
  isToday: Symbol('isToday'),
  isTomorrow: Symbol('isTomorrow'),
  isThisMonth: Symbol('isThisMonth'),
  formatHoursAndMinutes: Symbol('formatHoursAndMinutes'),
});

const PATTERNS = {
  en: {
    pattern: `OK, I'll remind [users] [action] [time].`,
  },
  fr: {
    pattern: `OK, je rappelerai [users] [action] [time].`,
  },
  ja: {
    pattern: `承知しました。[time][users]に[action]をリマインドします。`,
  },
};

export default class Confirmation {
  constructor(locale = 'en') {
    this.locale = locale;

    this[p.listFormatter] = new TwitterCldr.ListFormatter();
  }

  /**
   * Generate a phrase to be spoken to confirm a reminder.
   *
   * @param {Object} reminder
   * @return {string}
   */
  getReminderMessage(reminder) {
    console.log(reminder);

    const pattern = PATTERNS[this.locale].pattern;
    const data = {
      users: this[p.formatUser](reminder),
      action: this[p.formatAction](reminder),
      time: this[p.formatTime](reminder),
    };

    return pattern.replace(/\[([^\]]+)\]/g, (match, placeholder) => {
      return data[placeholder];
    });
  }

  [p.formatUser](reminder) {
    const users = reminder.users
      .map((user) => user.toLowerCase() === 'me' ? 'you' : user);
    return this[p.listFormatter].format(users);
  }

  [p.formatAction](reminder) {
    const action = reminder.action
      .replace(/\bI\b/gi, 'you')
      .replace(/\bmy\b/gi, 'your')
      .replace(/\bmine\b/gi, 'yours');
    const PATTERN1 = new RegExp(`\\bthat \\[action\\]`, 'iu');
    const PATTERN2 = new RegExp(`\\bit is \\[action\\]`, 'iu');

    if (PATTERN1.test(reminder.match)) {
      return `that ${action}`;
    } else if (PATTERN2.test(reminder.match)) {
      return `that it is ${action}`;
    }

    return `to ${action}`;
  }

  [p.formatTime](reminder) {
    const date = reminder.time;
    let time = '';

    if (this[p.isToday](date)) {
      const hour = this[p.formatHoursAndMinutes](date);
      time = `at ${hour} today`;
    } else if (this[p.isTomorrow](date)) {
      const hour = this[p.formatHoursAndMinutes](date);
      time = `at ${hour} tomorrow`;
    } else if (this[p.isThisMonth](date)) {
      time = moment(date).format('[on the] Do');
    } else {
      time = moment(date).format('[on] MMMM [the] Do');
    }

    return time;
  }

  [p.isToday](date) {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');
    return moment(date).isBetween(today, tomorrow);
  }

  [p.isTomorrow](date) {
    const tomorrow = moment().add(1, 'day').startOf('day');
    const in2days = moment().add(2, 'day').startOf('day');
    return moment(date).isBetween(tomorrow, in2days);
  }

  [p.isThisMonth](date) {
    const thisMonth = moment().startOf('month');
    const nextMonth = moment().add(1, 'month').startOf('month');
    return moment(date).isBetween(thisMonth, nextMonth);
  }

  /**
   * Return a string from a date suitable for speech synthesis.
   *
   * @param {Date} date
   * @return {string}
   */
  [p.formatHoursAndMinutes](date) {
    date = moment(date);
    if (date.minute() === 0) {
      return date.format('h A'); // 7 PM
    } else if (date.minute() === 15) {
      return date.format('[quarter past] h A');
    } else if (date.minute() === 30) {
      return date.format('[half past] h A');
    } else if (date.minute() === 45) {
      const nextHour = date.add(1, 'hour');
      return nextHour.format('[quarter to] h A');
    }
    return date.format('h m A'); // 6 24 AM
  }
}
