var path = require('path'),
	l10n = require('./../index'),
	defaultL10n = l10n(path.join(__dirname, 'lang.csv')),
	customL10n = l10n(path.join(__dirname, 'lang.csv'), {
		blockStart: '{{',
		blockEnd: '}}',
		templateStart: '__(',
		templateEnd: ')',
		bindingStart: '${',
		bindingEnd: '}'
	});

var defaultTest = 'My name is __(name) and I am __(age). ' +
	'Angular template: __(name.and.age, name, age)';

var customTest = 'My name is {{name}} and I am {{age}}. ' +
	'Angular template: {{name.and.age, name, age}}';

var unknownTest = 'I am __(age) and my name is __(unknown)';

if(defaultL10n.render(defaultTest, 'John') === 'My name is John and I am 21. Angular template: My name is {{name}} and I am {{age}}.' 
	&& defaultL10n.render(defaultTest, 'Brad') === 'My name is Brad and I am 54. Angular template: I am {{age}} and my name is {{name}}.'
	&& customL10n.render(customTest, 'John') === 'My name is John and I am 21. Angular template: My name is ${name} and I am ${age}.'
	&& defaultL10n.render(unknownTest, 'John') && defaultL10n.errors.length === 1 && defaultL10n.errors[0] === 'unknown') {
	console.log('Test passed');
} else {
	console.log('Test failed');
}

