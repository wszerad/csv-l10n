var path = require('path'),
	assert = require('assert'),
	l10n = require('./../index'),
	cb = (function(num, test) {
		return function(err) {
			if(err) throw err;

			num--;
			if(!num)
				test();
		}
	})(2, tests),
	defaultL10n = l10n(path.join(__dirname, 'lang.csv'), cb),
	customL10n = l10n(path.join(__dirname, 'lang.csv'), {
		blockStart: '{{',
		blockEnd: '}}'
	}, cb);

function tests() {

	var defaultTest = 'My name is __(name) and I am __(age).';

	var customTest = 'My name is {{name}} and I am {{age}}.';

	var unknownTest = 'I am __(age) and my name is __(unknown)';

	var valuesMap = 'Months = __(months.*)';

	var valuesArray = 'Months = __(months[*])';

	var nestedMap = '__(nested.*)';

	var nestedArray = '__(nested[*])';

	assert.equal(defaultL10n.render(defaultTest, 'John'), 'My name is John and I am 21.');
	assert.equal(defaultL10n.render(valuesMap), 'Months = {"january":"January","february":"February","march":"March","april":"April","may":"May","june":"June","july":"July","august":"August","september":"September","october":"October","november":"November","december":"December"}');
	assert.equal(defaultL10n.render(valuesArray), 'Months = ["January","February","March","April","May","June","July","August","September","October","November","December"]');
	assert.equal(defaultL10n.render(nestedMap), '{"a":{"0":"One","1":"Two"},"b":{"0":"First","1":"Second"}}');
	assert.equal(defaultL10n.render(nestedArray), '[{"0":"One","1":"Two"},{"0":"First","1":"Second"}]');
	assert.equal(defaultL10n.setLang('Brad').render(defaultTest), 'My name is Brad and I am 54.');
	assert.equal(customL10n.render(customTest, 'John'), 'My name is John and I am 21.');

	defaultL10n.render(unknownTest, 'John');
	assert.equal(defaultL10n.errors.length, 1);
	assert.equal(defaultL10n.errors[0], 'unknown');
}