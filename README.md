# csv-l10n
Simple engine for l10n (provided via csv files)

```
npm install csv-l10n
```

### csv table design
| key\lang (this one is unused) | en  | de  |
|---|---|---|
| hello | Hello | Hallo |
| guys | guys | Jungs  |
| welcome.day | good morning | guten Morgen  |
| welcome.night | good evening | guten Abend  |

### constructor L10n
#### L10n(path[, options, cb])
* path - absolute path to csv file
* options:
```
{ //defaults
  blockStart: '__(',  //start marks inside text to parse
  blockEnd: ')',  //end marks inside text to parse
}
```
* cb - if not specified lang file will by loaded sync
**return l10n instance**

### l10n instance methods
#### l10n.render(text[, lang])
* text - to localization
* lang - default first lang (second csv column)
return localized text

#### l10n.reload(cb)
reload csv file (async), use render again to use updated resorces.

#### l10n.reloadSync()
reload csv file (sync), use render again to use updated resorces. 

#### l10n.setLang()
reload set lang to use by default.

#### l10n.langs
array of loaded langs

#### l10n.errors
array of unknown resources (cleaned befor each use of l10n.render)

#### l10n.count
number of injections during rendering

### Usage:
```js
var path = require('path'),
    CSVPath = path.join(__dirname, './lang.csv'), //absolute path to csv file
    options = { //default options
        blockStart: '__(',
        blockEnd: ')',
    },
    l10n = require('csv-l10n')(CSVPath, options);

var strToLocalize = '__(hello) __(guys)!.',
    mapToLocalize = '__(welcome.*)',
    arrayToLocalize = '__(welcome[*])';

console.log(l10n.render(strToLocalize, 'de'));      //--> Hallo Jungs!.
console.log(l10n.render(mapToLocalize, 'en'));      //--> {"day": "good morning", "night": "good evening"}
console.log(l10n.render(arrayToLocalize, 'de'));    //--> ["guten Morgen", "guten Abend"]
```
