var JSHINTRC = {
    "predef": [
        "console",
        "Ember",
        "DS",
        "Handlebars",
        "Metamorph",
        "ember_assert",
        "ember_warn",
        "ember_deprecate",
        "ember_deprecateFunc",
        "require",
        "equal",
        "test",
        "testBoth",
        "testWithDefault",
        "raises",
        "deepEqual",
        "start",
        "stop",
        "ok",
        "strictEqual",
        "module",
        "expect",
        "minispade",
        "URI",
        "History"
    ],

    "node" : false,
    "es5" : true,
    "browser" : true,

    "boss" : true,
    "curly": false,
    "debug": false,
    "devel": false,
    "eqeqeq": true,
    "evil": true,
    "forin": false,
    "immed": false,
    "laxbreak": false,
    "newcap": true,
    "noarg": true,
    "noempty": false,
    "nonew": false,
    "nomen": false,
    "onevar": false,
    "plusplus": false,
    "regexp": false,
    "undef": true,
    "sub": true,
    "strict": false,
    "white": false
}
;

minispade.register('ember-datetime/~tests/datetime_test', "(function() {// ==========================================================================\n// Project:   DateTime Unit Test\n// Copyright: ©2010 Martin Ottenwaelter\n// ==========================================================================\n\n/*globals module test ok equals same stop start */\n\nvar get = Ember.get, set = Ember.set;\n\nmodule('Time');\n\nvar dt, options, ms, timezone, startTime, timezones;\n\nmodule(\"Ember.DateTime\", {\n  setup: function() {\n    ms = 487054822032; // June 8, 1985, 05:00:22:32 UTC\n    options = { year: 1985, month: 6, day: 8, hour: 4, minute: 0, second: 22, millisecond: 32, timezone: 60 }; // an arbitrary time zone\n    dt = Ember.DateTime.create(options);\n    timezones = [480, 420, 0, -60, -120, -330]; // PST, PDT, UTC, CET, CEST, Mumbai\n  },\n  teardown: function() {\n    dt = options = ms = timezone = startTime = null;\n  }\n});\n\nfunction timeShouldBeEqualToHash(t, h, message) {\n  if (h === undefined) h = options;\n  if (h.timezone === undefined) h.timezone = Ember.DateTime.timezone;\n  if (message === undefined) message = \"%@ of time should be equal to hash\";\n  \n  if (t === null) {\n    ok(false, 'Time should not be null');\n    return;\n  }\n    \n  equal(get(t, 'year'), h.year , Ember.String.fmt(message, ['year']));\n  equal(get(t, 'month'), h.month, Ember.String.fmt(message, ['month']));\n  equal(get(t, 'day'), h.day, Ember.String.fmt(message, ['day']));\n  equal(get(t, 'hour'), h.hour, Ember.String.fmt(message, ['hour']));\n  equal(get(t, 'minute'), h.minute, Ember.String.fmt(message, ['minute']));\n  equal(get(t, 'second'), h.second, Ember.String.fmt(message, ['second']));\n  equal(get(t, 'millisecond'), h.millisecond, Ember.String.fmt(message, ['millisecond']));\n  equal(get(t, 'timezone'), h.timezone, Ember.String.fmt(message, ['timezone']));\n}\n\nfunction formatTimezone(offset) {\n  var modifier = offset < 0 ? '+' : '-';\n  offset = Math.abs(offset);\n  var minutes = offset % 60;\n  var hours = (offset - minutes) / 60;\n  return modifier + Ember.DateTime._pad(hours) + ':' + Ember.DateTime._pad(minutes);\n}\n\ntest('_toMilliseconds()', function() {\n  var originalTimezone = options.timezone;\n  var originalHour = options.hour;\n\n  dt = Ember.DateTime;\n  timezone = 300;\n  startTime = 1264958583000; // Sun, 31 Jan 2010 17:23:03 GMT (a randomly chosen time with which to re-init the internal date object for more robustness)\n\n  // Check the default behavior\n  equal(dt._toMilliseconds(null, ms, timezone), ms, \"Should equal start milliseconds when no options hash provided\");\n  equal(dt._toMilliseconds({}, ms, timezone), ms, \"Should equal start milliseconds when empty options hash provided\");\n  \n  // Test a completely defined date/time hash with no specified start milliseconds.\n  equal(dt._toMilliseconds(options, null, options.timezone), ms, \"Milliseconds should express the parsed options hash\");\n\n  // Now specify the same time in timezone (+60), one hour west of the prime meridian.\n  // Pass in 'startTime' to force a reset of the internal date object so we can be sure we're not\n  // succeeding because of old values.\n  options.hour = originalHour - 1;\n  equal(dt._toMilliseconds(options, startTime, options.timezone + 60), ms, \"Should get same milliseconds when expressing time in westerly time zone\");\n\n  // Now specify the same time in timezone (-60), one hour east of the prime meridian\n  options.hour = originalHour + 1;\n  equal(dt._toMilliseconds(options, startTime, options.timezone - 60), ms, \"Should get same milliseconds when expressing time in easterly time zone\");\n\n  // Now start at the original 1985 time, but modify only the hour as specified in time zone 60.\n  options = { hour: originalHour - 1 };\n  equal(dt._toMilliseconds(options, ms, originalTimezone + 60, false), ms, \"Should get same result modifying only the hour as expressed in westerly time zone\");\n\n  // Now do the same thing the other way\n  options = { hour: originalHour + 1 };\n  equal(dt._toMilliseconds(options, ms, originalTimezone - 60, false), ms, \"Should get same result modifying only the hour as expressed in westerly time zone\");\n});\n\ntest('create with a hash', function() {\n  timeShouldBeEqualToHash(dt, options);\n});\n\ntest('create with local time milliseconds', function() {\n  var d = new Date(); // create a local date\n  var hash = { // create a hash that represents it, expressed in local time\n    year: d.getFullYear(),\n    month: d.getMonth() + 1,\n    day: d.getDate(),\n    hour: d.getHours(),\n    minute: d.getMinutes(),\n    second: d.getSeconds(),\n    millisecond: d.getMilliseconds(),\n    timezone: d.getTimezoneOffset()\n  };\n  \n  dt = Ember.DateTime.create(d.getTime()); // init a DateTime using that date's milliseconds\n  timeShouldBeEqualToHash(dt, hash);\n\n  // Now try creating with 0 milliseconds\n  equal(get(Ember.DateTime.create(0), 'milliseconds'), 0, \"Can create with 0 milliseconds\");\n});\n\ntest('create with default time zone', function() {\n  var d = new Date();\n\n  // Check that the default creation time zone is local\n  timezone = d.getTimezoneOffset(); // get the current location's time zone.\n  dt = Ember.DateTime.create();\n  equal(get(dt, 'timezone'), timezone, \"Default time zone should be local\");\n});\n\ntest('create with a hash containing milliseconds and a specified time zone', function() {\n  // Check that creating a predefined date from milliseconds returns the correct values\n  dt = Ember.DateTime.create({ milliseconds: ms, timezone: options.timezone });\n  timeShouldBeEqualToHash(dt, options);\n});\n\ntest('create with hashes expressed in various time zones', function() {\n  timezones.forEach(function(timezone) {\n    options.timezone = timezone;\n    dt = Ember.DateTime.create(options);\n    timeShouldBeEqualToHash(dt, options);\n  });\n});\n\ntest('create with default time zone', function() {\n  var d = new Date();\n\n  // Check that the default creation time zone is local\n  timezone = d.getTimezoneOffset(); // get the current location's time zone.\n  dt = Ember.DateTime.create();\n  equal(get(dt, 'timezone'), timezone, \"Default time zone should be local\");\n});\n\ntest('create with a hash containing milliseconds and a specified time zone', function() {\n  // Check that creating a predefined date from milliseconds returns the correct values\n  dt = Ember.DateTime.create({ milliseconds: ms, timezone: options.timezone });\n  timeShouldBeEqualToHash(dt, options);\n});\n\ntest('Adjust with hashes expressed in various time zones', function() {\n  timezones.forEach(function(timezone) {\n    var newHour;\n\n    options.timezone = timezone;\n    dt = Ember.DateTime.create(options);\n\n    // According to Date specs, must specify all three of year, month, and date if we specify one of them,\n    // for the calculation to be correct.  Calling adjust to change only one can have\n    // unpredictable results, depending on what the other two values already were.\n    timeShouldBeEqualToHash(dt.adjust({ year: 2005, month: 9, day: 30 }), {year: 2005, month: 9, day: 30, hour: options.hour, minute: options.minute, second: options.second, millisecond: options.millisecond, timezone: timezone});\n\n    // Setting only the hour should cascade minute, second, and millisecond to 0, etc\n    timeShouldBeEqualToHash(dt.adjust({ hour:         3 }), { year: options.year, month: options.month, day: options.day, hour: 3, minute: 0, second: 0, millisecond: 0, timezone: timezone});\n    timeShouldBeEqualToHash(dt.adjust({ minute:       1 }), { year: options.year, month: options.month, day: options.day, hour: options.hour, minute: 1, second: 0, millisecond: 0, timezone: timezone});\n    timeShouldBeEqualToHash(dt.adjust({ second:      12 }), { year: options.year, month: options.month, day: options.day, hour: options.hour, minute: options.minute, second: 12, millisecond: 0, timezone: timezone});\n    timeShouldBeEqualToHash(dt.adjust({ millisecond: 18 }), { year: options.year, month: options.month, day: options.day, hour: options.hour, minute: options.minute, second: options.second, millisecond: 18, timezone: timezone});\n    \n    // Test taking each to time zone 0.  Manually calculate what the hour should be\n    // then test that a call to get() returns that value.\n    newHour = Math.floor((options.hour + 48 + (timezone / 60)) % 24); // small hack -- add 48 hours to ensure positive results when adding negative time zone offsets (doesn't affect the calculation since we mod by 24)\n    equal(get(dt.adjust({ timezone: 0 }), 'hour'), newHour);\n  });\n});\n\ntest('advance', function() {\n  var o = options;\n  \n  timeShouldBeEqualToHash(\n    dt.advance({ year: 1, month: 1, day: 1, hour: 1, minute: 1, second: 1, millisecond: 1 }),\n    { year: o.year + 1, month: o.month + 1, day: o.day + 1, hour: o.hour + 1, minute: o.minute + 1, second: o.second + 1, millisecond: o.millisecond + 1, timezone: o.timezone });\n  \n  timeShouldBeEqualToHash(dt.advance({year:         1}), { year: o.year + 1, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: o.timezone });\n  timeShouldBeEqualToHash(dt.advance({month:        1}), { year: o.year, month: o.month + 1, day: o.day, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: o.timezone });\n  timeShouldBeEqualToHash(dt.advance({day:          1}), { year: o.year, month: o.month, day: o.day + 1, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: o.timezone });\n  timeShouldBeEqualToHash(dt.advance({hour:         1}), { year: o.year, month: o.month, day: o.day, hour: o.hour + 1, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: o.timezone });\n  timeShouldBeEqualToHash(dt.advance({minute:       1}), { year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute + 1, second: o.second, millisecond: o.millisecond, timezone: o.timezone });\n  timeShouldBeEqualToHash(dt.advance({second:       1}), { year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second + 1, millisecond: o.millisecond, timezone: o.timezone });\n  timeShouldBeEqualToHash(dt.advance({millisecond:  1}), { year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond + 1, timezone: o.timezone });\n  \n  // Convert time from CEST to UTC, then UTC to UTC+05:30 (Mumbai)\n  var h = { year: 1985, month: 5, day: 8, hour: 1, minute: 0, second: 22, millisecond: 925, timezone: -120 };\n  var t = Ember.DateTime.create(h);\n  timeShouldBeEqualToHash(t, h);\n  timeShouldBeEqualToHash(t.advance({ timezone: 120 }), { year: 1985, month: 5, day: 7, hour: 23, minute: 0, second: 22, millisecond: 925, timezone: 0 });\n  timeShouldBeEqualToHash(t.advance({ timezone: 120 }).advance({ timezone: -330 }), { year: 1985, month: 5, day: 8, hour: 4, minute: 30, second: 22, millisecond: 925, timezone: -330 });\n  equal(Ember.DateTime.compare(\n    t.advance({ timezone: 120 }).advance({ timezone: -330 }),\n    t.advance({ timezone: -210 })),\n    0);\n});\n\ntest('compare', function() {\n  var exception = null;\n  \n  equal(Ember.DateTime.isComparable, true, \"Ember.DateTime is comparable\");\n  equal(Ember.compare(dt, dt), 0, \"A DateTime instance is equal to itself via compare()\");\n  equal(dt.isEqual(dt), true, \"A DateTime instance is equal to itself via isEqual()\");\n  equal(dt.advance({hour: 1}).isEqual(dt), false);\n  equal(Ember.compare(dt, dt.advance({hour: 1})), -1);\n  equal(Ember.compare(dt.advance({hour: 1}), dt), 1);\n  equal(Ember.DateTime.compareDate(dt, dt.advance({hour: 1})), 0);\n  equal(Ember.DateTime.compareDate(dt, dt.adjust({hour: 0}).advance({day: 1, second: -1})), 0);\n  equal(Ember.DateTime.compareDate(dt, dt.adjust({hour: 0}).advance({day: 1})), -1);\n  equal(Ember.DateTime.compareDate(dt, dt.advance({day: 1})), -1);\n  equal(Ember.compare(\n    Ember.DateTime.create({year: 1985, month: 5, day: 7, hour: 23, minute: 0, second: 22, millisecond: 925, timezone:    0}),\n    Ember.DateTime.create({year: 1985, month: 5, day: 8, hour:  1, minute: 0, second: 22, millisecond: 925, timezone: -120})),\n    0, \"The expressions of the same date in two different time zones are considered equal\");\n  \n  try {\n    equal(Ember.DateTime.compareDate(\n      Ember.DateTime.create({year: 1985, month: 5, day: 7, hour: 23, minute: 0, second: 22, millisecond: 925, timezone:    0}),\n      Ember.DateTime.create({year: 1985, month: 5, day: 8, hour:  1, minute: 0, second: 22, millisecond: 925, timezone: -120})),\n      0);\n  } catch(e) {\n    exception = e;\n  } finally {\n    ok(!Ember.none(exception), \"Comparing two dates with a different timezone via compareDate() should throw an exception.\");\n  }\n});\n\ntest('Format', function() {\n  equal(\n    dt.toFormattedString('%a %A %b %B %d %D %h %H %I %j %m %M %p %S %w %y %Y %%a'),\n    'Sat Saturday Jun June 08 8 4 04 04 159 06 00 AM 22 6 85 1985 %a');\n  \n  equal(dt.toFormattedString('%Z'), formatTimezone(get(dt, 'timezone')));\n  equal(dt.adjust({ timezone:    0 }).toFormattedString('%Y-%m-%d %H:%M:%S %Z'), '1985-06-08 05:00:22 +00:00');\n  equal(dt.adjust({ timezone: -120 }).toFormattedString('%Y-%m-%d %H:%M:%S %Z'), '1985-06-08 07:00:22 +02:00');\n  equal(dt.adjust({ timezone:  420 }).toFormattedString('%Y-%m-%d %H:%M:%S %Z'), '1985-06-07 22:00:22 -07:00'); // the previous day\n});\n\ntest('fancy getters', function() {\n  equal(get(dt, 'isLeapYear'), false);\n\n  // (note must set all three components of a date\n  // in order to get predictable results, per JS Date object spec)\n  equal(get(Ember.DateTime.create({ year: 1900, month: 1, day: 1 }), 'isLeapYear'), false);\n  equal(get(Ember.DateTime.create({ year: 2000, month: 1, day: 1 }), 'isLeapYear'), true);\n  equal(get(Ember.DateTime.create({ year: 2004, month: 1, day: 1 }), 'isLeapYear'), true);\n  \n  equal(get(dt, 'daysInMonth'), 30); // june\n  equal(get(Ember.DateTime.create({ year: 2000, month: 2, day: 1 }), 'daysInMonth'), 29);\n  equal(get(Ember.DateTime.create({ year: 2001, month: 2, day: 1 }), 'daysInMonth'), 28);\n  \n  equal(get(dt, 'dayOfYear'), 159);\n  equal(get(Ember.DateTime.create({ year: 2000, month: 12, day: 31 }), 'dayOfYear'), 366);\n  equal(get(Ember.DateTime.create({ year: 2001, month: 12, day: 31 }), 'dayOfYear'), 365);\n\n  equal(get(dt, 'week'), 22);\n  equal(get(Ember.DateTime.create({ year: 2006, month:  1, day:  1 }), 'week0'),  1);\n  equal(get(Ember.DateTime.create({ year: 2006, month:  1, day:  1 }), 'week1'),  0);\n  equal(get(Ember.DateTime.create({ year: 2006, month:  1, day:  8 }), 'week0'),  2);\n  equal(get(Ember.DateTime.create({ year: 2006, month:  1, day:  8 }), 'week1'),  1);\n  equal(get(Ember.DateTime.create({ year: 2006, month: 12, day: 31 }), 'week0'), 53);\n  equal(get(Ember.DateTime.create({ year: 2006, month: 12, day: 31 }), 'week1'), 52);\n\n  equal(get(dt, 'lastMonday').toFormattedString('%A'), 'Monday');\n  equal(get(dt, 'nextFriday').toFormattedString('%A'), 'Friday');\n  equal(get(dt, 'lastWednesday').toFormattedString('%A'), 'Wednesday');\n  \n  equal(\n    get(Ember.DateTime.create({ year: 2010, month: 9, day: 29, hour: 0, minute: 30, timezone: -120 }).adjust({ day: 1 }), 'lastMonday').toISO8601(),\n    \"2010-08-30T00:30:00+02:00\");\n});\n \ntest('parse', function() {\n  timeShouldBeEqualToHash(\n    Ember.DateTime.parse('08/05/1985 01:00:22 %a', '%d/%m/%Y %H:%M:%S %%a'),\n    { year: 1985, month: 5, day: 8, hour: 1, minute: 0, second: 22, millisecond: 0 });\n  timeShouldBeEqualToHash(\n    Ember.DateTime.parse('08/05/1985 01:00:22 PM', '%d/%m/%Y %H:%M:%S %p'),\n    { year: 1985, month: 5, day: 8, hour: 13, minute: 0, second: 22, millisecond: 0 }); \n  timeShouldBeEqualToHash(\n    Ember.DateTime.parse('Wed 08 May 1985 01:00:22 AM', '%a %d %b %Y %H:%M:%S %p'),\n    { year: 1985, month: 5, day: 8, hour: 1, minute: 0, second: 22, millisecond: 0 });\n  ok(\n    Ember.DateTime.parse('Tue 08 May 1985 01:00:22 AM', '%a %d %b %Y %H:%M:%S %p') === null,\n      '1985-05-08 is not a tuesday');\n  ok(\n    Ember.DateTime.parse('07/01/20201 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z') === null &&\n    Ember.DateTime.parse('07/01/20201 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z') === null &&\n    Ember.DateTime.parse('07/01/20201 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z') === null &&\n    Ember.DateTime.parse('07/01/20201 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z') === null &&\n    Ember.DateTime.parse('07/01/20201 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z') === null &&\n    Ember.DateTime.parse('07/01/20201 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z') === null &&\n    Ember.DateTime.parse('07/01/20201 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z') === null &&\n    Ember.DateTime.parse('07/01/20201 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z') === null &&\n    Ember.DateTime.parse('07/01/20201 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z') === null,\n      'Should be able to fail to parse multiple times');\n  timeShouldBeEqualToHash(\n    Ember.DateTime.parse('1/1/01 0:0:0', '%m/%d/%y %H:%M:%S'),\n    { year: 2001, month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 },\n    'Should be able to have single digit for month, day, hour, minute, second');\n  timeShouldBeEqualToHash(\n    Ember.DateTime.parse('70-01-01 00:00:00', '%y-%m-%d %H:%M:%S'),\n    { year: 2070, month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }); \n  timeShouldBeEqualToHash(\n    Ember.DateTime.parse('71-01-01 00:00:00', '%y-%m-%d %H:%M:%S'),\n    { year: 1971, month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 });\n  timeShouldBeEqualToHash(\n    Ember.DateTime.parse('71-01-01 12:00 AM', '%y-%m-%d %i:%M %p'),\n    { year: 1971, month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 });\n  timeShouldBeEqualToHash(\n    Ember.DateTime.parse('71-01-01 12:00 PM', '%y-%m-%d %i:%M %p'),\t\n    { year: 1971, month: 1, day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 });\n});\n\ntest('parse with time zones',function() {\n  equal(\n    Ember.DateTime.parse('08/05/1985 01:00:22 %a -0700', '%d/%m/%Y %H:%M:%S %%a %Z').toISO8601(),\n    \"1985-05-08T01:00:22-07:00\");\n  equal(\n    Ember.DateTime.parse('08/05/1985 01:00:22 %a +02:00', '%d/%m/%Y %H:%M:%S %%a %Z').toISO8601(),\n    \"1985-05-08T01:00:22+02:00\");\n  equal(\n    Ember.DateTime.parse('07/01/2020 18:33:22 %a Z', '%d/%m/%Y %H:%M:%S %%a %Z').toISO8601(),\n    \"2020-01-07T18:33:22+00:00\");\n});\n\ntest('parse without a format uses default ISO8601', function() {\n  equal(Ember.DateTime.parse(\"2010-09-17T18:35:08Z\").toISO8601(), \"2010-09-17T18:35:08+00:00\");\n});\n\ntest('parse with hours and meridian', function(){\n  equal(Ember.DateTime.parse(\"03/25/2011 5:12:50PM Z\", \"%m/%d/%Y %I:%M:%S%p %Z\").toISO8601(), \"2011-03-25T17:12:50+00:00\");\n  equal(Ember.DateTime.parse(\"03/25/2011 5:12:50PM Z\", \"%m/%d/%Y %i:%M:%S%p %Z\").toISO8601(), \"2011-03-25T17:12:50+00:00\");\n  equal(Ember.DateTime.parse(\"03/25/2011 05:12:50PM Z\", \"%m/%d/%Y %I:%M:%S%p %Z\").toISO8601(), \"2011-03-25T17:12:50+00:00\");\n  equal(Ember.DateTime.parse(\"03/25/2011 05:12:50PM Z\", \"%m/%d/%Y %i:%M:%S%p %Z\").toISO8601(), \"2011-03-25T17:12:50+00:00\");\n});\n\ntest('invalid day/month range', function(){\n  equal(Ember.DateTime.parse('2010-03-32T10:10:10Z'), null);\n  equal(Ember.DateTime.parse('2010--1-10T10:10:10Z'), null);\n\n  equal(Ember.DateTime.parse('2010-13-10T10:10:10Z'), null);\n\n  equal(Ember.DateTime.parse('2010-04-31T10:10:10Z'), null);\n  equal(Ember.DateTime.parse('2010-06-31T10:10:10Z'), null);\n  equal(Ember.DateTime.parse('2010-09-31T10:10:10Z'), null);\n  equal(Ember.DateTime.parse('2010-11-31T10:10:10Z'), null);\n\n  equal(Ember.DateTime.parse('2012-02-30T10:10:10Z'), null);\n});\n\ntest('bad parsing', function() {\n  equal(Ember.DateTime.parse(Ember.DateTime.parse(\"foo\")), null);\n  equal(Ember.DateTime.parse(\"2010-09-17T18:35:08Z\", Ember.DATETIME_ISO8601).toISO8601(), \"2010-09-17T18:35:08+00:00\");\n});\n\ntest('binding', function() {\n  var fromObject = Ember.Object.create({value: dt});\n  var toObject = Ember.Object.create({value: ''});\n  var root = { fromObject: fromObject, toObject: toObject };\n  var format = '%Y-%m-%d %H:%M:%S';\n  var binding = Ember.Binding.dateTime(format).from('fromObject.value').to('toObject.value').connect(root);\n  Ember.run.sync();\n  equal(get(toObject, 'value'), dt.toFormattedString(format));\n});\n\ntest('cache', function() {\n  \n  Ember.DateTime.create(options);\n  var cache_length_1 = Ember.keys(Ember.DateTime._dt_cache).length;\n  Ember.DateTime.create(options);\n  var cache_length_2 = Ember.keys(Ember.DateTime._dt_cache).length;\n  equal(\n    cache_length_1, cache_length_2,\n    \"Creating twice the same datetime should not modify the cache's length\");\n  \n  var dates = [];\n  for (var i = 0; i < 3*Ember.DateTime._DT_CACHE_MAX_LENGTH; i++) {\n    dates[i] = Ember.DateTime.create(i);\n  }\n  ok(\n    Ember.keys(Ember.DateTime._dt_cache).length <= 2*Ember.DateTime._DT_CACHE_MAX_LENGTH,\n    \"Creating a lot of datetimes should not make a cache larger than the maximum allowed size\");\n\n});\n\ntest('timezones', function() {\n  var o = options;\n  \n  options.timezone = 0;\n  timeShouldBeEqualToHash(Ember.DateTime.create(options), options);\n  \n  options.timezone = -120;\n  timeShouldBeEqualToHash(Ember.DateTime.create(options), options);\n\n  options.timezone = 330;\n  timeShouldBeEqualToHash(Ember.DateTime.create(options), options);\n  \n  options.timezone = 0; // note that test dates will now be created at timezone 0\n  dt = Ember.DateTime.create(options);\n\n  timeShouldBeEqualToHash(dt,                  {year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: o.timezone });\n  timeShouldBeEqualToHash(dt.toTimezone(480),  {year: o.year, month: o.month, day: o.day - 1, hour: 20, minute:  o.minute, second: o.second, millisecond: o.millisecond, timezone: 480 });\n  timeShouldBeEqualToHash(dt.toTimezone(420),  {year: o.year, month: o.month, day: o.day - 1, hour: 21, minute:  o.minute, second: o.second, millisecond: o.millisecond, timezone: 420 });\n  timeShouldBeEqualToHash(dt.toTimezone(),     {year: o.year, month: o.month, day: o.day, hour: o.hour, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: 0 });\n  timeShouldBeEqualToHash(dt.toTimezone(-60),  {year: o.year, month: o.month, day: o.day, hour: 5, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: -60 });\n  timeShouldBeEqualToHash(dt.toTimezone(-120), {year: o.year, month: o.month, day: o.day, hour: 6, minute: o.minute, second: o.second, millisecond: o.millisecond, timezone: -120 });\n  timeShouldBeEqualToHash(dt.toTimezone(-330), {year: o.year, month: o.month, day: o.day, hour: 9, minute: 30, second: o.second, millisecond: o.millisecond, timezone: -330 });\n});\n\ntest('extend', function() {\n  var dateTimeExt = Ember.DateTime.extend();\n\n  // Should parse and produce a date object that is an instance of 'dateTimeExt'\n  var parsedDateTimeExt = dateTimeExt.parse('2011-10-15T21:30:00Z');\n  ok(parsedDateTimeExt instanceof dateTimeExt, 'Correctly produced an instance of the extended type.');\n});\n\n})();\n//@ sourceURL=ember-datetime/~tests/datetime_test");minispade.register('ember-form/~tests/datepicker_test', "(function() {var set = Ember.set;\n\nmodule(\"Ember.DatePicker\");\n\ntest(\"should work\", function() {\n  var proxy = Ember.DatePicker.create();\n  ok(proxy);\n});\n\n})();\n//@ sourceURL=ember-form/~tests/datepicker_test");minispade.register('ember-geolocation/~tests/geo_location_test', "(function() {\n})();\n//@ sourceURL=ember-geolocation/~tests/geo_location_test");