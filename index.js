'use strict';

var fs = require('fs'),
	parse = require('csv-parse/lib/sync');

function L10n(path, opt) {
	opt = opt || {};
	this.path = path;
	this.blocks = {
		blockStart: opt.blockStart || '__(',
		blockEnd: opt.blockEnd || ')',
		templateStart:  opt.templateStart || opt.blockStart || '__(',
		templateEnd: opt.templateEnd || opt.blockEnd || ')',
		bindingStart: opt.bindingStart || '{{',
		bindingEnd: opt.bindingEnd || '}}'
	};
	this.__blockRegExp = new RegExp('(' + regExpEscape(this.blocks.blockStart) + '.+?' + regExpEscape(this.blocks.blockEnd) + ')', 'g');
	this.__templateRegExp = new RegExp('(' + regExpEscape(this.blocks.templateStart) + '\\d+' + regExpEscape(this.blocks.templateEnd) + ')', 'g');
	this.errors = [];

	this.reload(path);
}
L10n.prototype = {
	render: function(str, lang) {
		if(!(lang in this.lang)) {
			throw new Error('Unknown language: '+lang);
		}

		lang = this.lang[lang];

		var injector = this.injector(lang);

		return str.replace(this.__blockRegExp, injector);
	},
	
	reload: function() {
		var self = this,
			data = parse(fs.readFileSync(self.path)),
			column = data[0],
			langs = [],
			ret = {};

		for(var i=1; i<column.length; i++) {
			langs.push(column[i]);
		}

		this.lang = langs.reduce(function(ret, lang, index) {
			var clang = ret[lang] = {},
				position = index+1;
	
			for(var j=1; j<data.length; j++) {
				clang[data[j][0]] = self.parseTemplate(data[j][position]);
			}
			
			return ret;
		}, ret);
	},

	parseTemplate: function(str) {
		var self = this,
			ret = {};

		ret.parts = str.split(self.__templateRegExp);
		ret.parts.forEach(function(part, index) {

			if(self.__templateRegExp.test(part)) {
				var num = part.slice(self.blocks.templateStart.length, self.blocks.templateEnd.length*-1);
				ret[num] = index;
			}
		});

		return ret;
	},

	injector: function(lang) {
		var self = this;

		return function(str){
			var args = str.replace(/\s/g, '').slice(self.blocks.blockStart.length, self.blocks.blockEnd.length*-1).split(','),
				template = lang[args[0]];   

			if(template === undefined) {
				self.errors.push('Undeclared ');
				return str;
			}

			args.slice(1).forEach(function(arg, index){
				template.parts[template[index]] = self.blocks.bindingStart+arg+self.blocks.bindingEnd;
			});

			return template.parts.join('');
		}
	}
};

function regExpEscape(str) {
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = function(path, opt) {
	return new L10n(path, opt);
};