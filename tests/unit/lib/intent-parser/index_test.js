import moment from 'components/moment';
import chrono from 'js/lib/intent-parser/parsers/chrono/chrono';
import IntentParser from 'js/lib/intent-parser/index';

describe('intent-parser', function() {
  describe('Properly parses expected reminder sentences.', function() {
    const fixtures = [
      {
        sentence: 'Remind me to go to the office at 5pm.',
        parsed: {
          recipients: ['me'],
          action: 'go to the office',
          confirmation: 'OK, I\'ll remind you to go to the office at ' +
          '5 P.M. today.',
          due: moment({ hour: 17 }).toDate().getTime(),
          intent: 'reminder',
        },
      },
      {
        sentence: 'Remind John to take out trash tomorrow!',
        parsed: {
          recipients: ['John'],
          action: 'take out trash',
          confirmation: 'OK, I\'ll remind John to take out trash at ' +
          '12 P.M. tomorrow.',
          due: moment({ hour: 12 }).add(1, 'day').toDate().getTime(),
          intent: 'reminder',
        },
      },
      {
        sentence: 'Hey!! Please can you remind Tom and Jerry that ' +
        'they\'ve got a meeting at 1 today?',
        parsed: {
          recipients: ['Tom', 'Jerry'],
          action: 'they have got a meeting',
          confirmation: 'OK, I\'ll remind Tom and Jerry that ' +
          'they have got a meeting at 1 P.M. today.',
          due: moment({ hour: 13 }).toDate().getTime(),
          intent: 'reminder',
        },
      },
      {
        sentence: 'What is Sandra doing on Wednesday night?',
        parsed: {
          recipients: ['Sandra'],
          action: null,
          confirmation: undefined,
          due: moment({ hour: 22 }).day(3).toDate().getTime(),
          intent: 'query',
        },
      },
    ];

    fixtures.forEach(({ sentence, parsed }) => {
      it(sentence, function() {
        chrono.setRef(new Date());
        const intentParser = new IntentParser();
        return intentParser.parse(sentence).then((result) => {
          assert.deepEqual(result.recipients, parsed.recipients);
          assert.equal(result.action, parsed.action);
          assert.equal(result.confirmation, parsed.confirmation);
          assert.equal(result.due, parsed.due);
          assert.equal(result.intent, parsed.intent);
        });
      });
    });
  });
});
