var path = require('path'),
	assert = require('assert'),
	l10n = require('./../index'),
	cb = (function(num, test) {
		return function() {
			num--;
			if(!num)
				test();
		}
	})(2, tests),
	defaultL10n = l10n(path.join(__dirname, 'lang.csv'), cb),
	customL10n = l10n(path.join(__dirname, 'lang.csv'), {
		blockStart: '{{',
		blockEnd: '}}',
		bindingStart: '${',
		bindingEnd: '}'
	}, cb);

function tests() {
	var defaultTest = 'My name is __(name) and I am __(age). ' +
		'Angular template: __(name.and.age, name, age)';

	var customTest = 'My name is {{name}} and I am {{age}}. ' +
		'Angular template: {{name.and.age, name, age}}';

	var unknownTest = 'I am __(age) and my name is __(unknown)';

	assert.equal(defaultL10n.render(defaultTest, 'John'), 'My name is John and I am 21. Angular template: My name is {{name}} and I am {{age}}.');
	assert.equal(defaultL10n.setLang('Brad').render(defaultTest), 'My name is Brad and I am 54. Angular template: I am {{age}} and my name is {{name}}.');
	assert.equal(customL10n.render(customTest, 'John'), 'My name is John and I am 21. Angular template: My name is ${name} and I am ${age}.');
	
	defaultL10n.render(unknownTest, 'John');
	assert.equal(defaultL10n.errors.length, 1);
	assert.equal(defaultL10n.errors[0], 'unknown');
}