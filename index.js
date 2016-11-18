'use strict';

var fs = require('fs'),
	_ = require('lodash'),
	parse = require('csv-parse/lib/sync');

function L10n(path, opt, cb) {
	if (typeof opt === 'function') {
		cb = opt;
		opt = {};
	}

	opt = opt || {};
	this.path = path;
	this.blocks = {
		blockStart: opt.blockStart || '__(',
		blockEnd: opt.blockEnd || ')'
	};
	this.__blockRegExp = new RegExp('(' + regExpEscape(this.blocks.blockStart) + '.+?' + regExpEscape(this.blocks.blockEnd) + ')', 'g');
	this.errors = [];
	this.langs = [];
	this.count = 0;
	this.lang = null;
	this.count = 0;

	if (cb) {
		this.reload(cb);
	} else {
		this.reloadSync();
	}
}
L10n.prototype = {
	render: function (str, lang) {
		this.errors.length = 0;
		this.count = 0;

		if (lang) {
			this.lang = lang;
		} else if (this.lang === null && !this.langs.length) {
			throw new Error('No language file detected');
		} else if (this.lang === null) {
			this.lang = this.langs[0];
		}

		return str.replace(this.__blockRegExp, this.injector.bind(this));
	},

	setLang: function (lang) {
		if (this.langs.indexOf(lang) !== -1) {
			this.lang = lang;
		} else {
			throw new Error('Non-existing language: ' + lang);
		}

		return this;
	},

	reload: function (cb) {
		var self = this;

		fs.readFile(self.path, function (err, data) {
			if (err) return cb(err);

			try {
				self.reloadSync(parse(data));
				cb(null);
			} catch (e) {
				cb(e);
			}
		});
	},

	reloadSync: function (csv) {
		function patcher(originPath, path, value, parent, index) {
			if (path.length === index + 1) {
				if (parent[path[index]]) {
					throw new Error('Can not overwrite existing tree object with value! key(' + originPath + ')');
				}

				parent[path[index]] = value;
				return;
			}

			if (parent[path[index]] === undefined) {
				parent = parent[path[index]] = {};
			} else {
				if (!_.isPlainObject(parent[path[index]])) {
					throw new Error('Can not overwrite existing value with tree branch! key(' + originPath + ')');
				}

				parent = parent[path[index]];
			}

			patcher(originPath, path, value, parent, ++index)
		}

		var self = this,
			data = csv || parse(fs.readFileSync(self.path));

		self.langs = [];
		self.resources = {};

		data[0].slice(1).forEach(function (lang) {
			self.langs.push(lang);
			self.resources[lang] = [];
		});

		self.langs.forEach(function (lang, langIndex) {
			data.slice(1).forEach(function (res) {
				var path = res[0].trim();

				patcher(path, _.toPath(path), res[langIndex + 1], self.resources[lang], 0);
			});
		});
	},

	injector: function (str) {
		function prop(lang, path) {
			if (path.endsWith('.*')) {
				return JSON.stringify(_.property(path.slice(0, -2))(lang));
			} else if (path.endsWith('[*]')) {
				return JSON.stringify(_.toArray(_.property(path.slice(0, -3))(lang)));
			} else {
				return _.property(path)(lang);
			}
		}

		var self = this,
			key = str.replace(/\s/g, '').slice(self.blocks.blockStart.length, self.blocks.blockEnd.length*-1),
			template = prop(self.resources[self.lang], key);

		self.count++;

		if (template === undefined) {
			self.errors.push(key);
			return str;
		}

		return template;
	}
};

function regExpEscape(str) {
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = function (path, opt, cb) {
	return new L10n(path, opt, cb);
};