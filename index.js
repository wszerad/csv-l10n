'use strict';

var fs = require('fs'),
	parse = require('csv-parse/lib/sync');

function L10n(path, opt, cb) {
	if(typeof opt === 'function') {
		cb = opt;
		opt = {};
	}
	
	opt = opt || {};
	this.path = path;
	this.blocks = {
		blockStart: opt.blockStart || '__(',
		blockEnd: opt.blockEnd || ')',
		templateStart:  opt.templateStart || '${',
		templateEnd: opt.templateEnd || '}',
		bindingStart: opt.bindingStart || '{{',
		bindingEnd: opt.bindingEnd || '}}'
	};
	this.__blockRegExp = new RegExp('(' + regExpEscape(this.blocks.blockStart) + '.+?' + regExpEscape(this.blocks.blockEnd) + ')', 'g');
	this.__templateRegExp = new RegExp('(' + regExpEscape(this.blocks.templateStart) + '\\d+' + regExpEscape(this.blocks.templateEnd) + ')', 'g');
	this.errors = [];
	this.langs = [];
	this.lang = null;
	this.count = 0;

	if(cb) {
		this.reload(cb);
	} else {
		this.reloadSync();	
	}
}
L10n.prototype = {
	render: function(str, lang) {
		this.errors.length = 0;
		this.count = 0;

		if(lang) {
			this.lang = lang;
		} else if(this.lang === null && !this.langs.length) {
			throw new Error('No language file detected');
		} else if(this.lang === null) {
			this.lang = this.langs[0];
		}

		return str.replace(this.__blockRegExp, this.injector.bind(this));
	},

	setLang: function(lang) {
		if(this.langs.indexOf(lang) !== -1) {
			this.lang = lang;
		} else {
			throw new Error('Non-existent language: '+lang);
		}

		return this;
	},

	reload: function(cb) {
		var self = this;
		
		fs.readFile(self.path, function(err, data) {
			if(err)
				return cb(err);
			
			self.reloadSync(parse(data));

			cb(null);
		});
	},

	reloadSync: function(csv) {
		var self = this,
			data = csv || parse(fs.readFileSync(self.path));

		var column = data[0],
			langs = [],
			ret = {};

		for(var i=1; i<column.length; i++) {
			langs.push(column[i]);
		}

		self.langs = langs;
		self.resources = langs.reduce(function(ret, lang, index) {
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

	injector: function(str) {
		var self = this,
			args = str.replace(/\s/g, '').slice(self.blocks.blockStart.length, self.blocks.blockEnd.length*-1).split(','),
			lang = self.resources[self.lang],
			template = lang[args[0]];
		
		this.count++;
		
		if(template === undefined) {
			self.errors.push(args[0]);
			return args[0];
		}

		args.slice(1).forEach(function(arg, index){
			template.parts[template[index]] = self.blocks.bindingStart+arg+self.blocks.bindingEnd;
		});

		return template.parts.join('');
	}
};

function regExpEscape(str) {
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = function(path, opt, cb) {
	return new L10n(path, opt, cb);
};