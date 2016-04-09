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
| template | My name is __(0), I am __(1) | Ich bin __(1) und ich heiße __(0)  |

You can use templates inside resorces (like in last row). Templates are filled with arguments wrapped in 'bindingStart' and 'bindingEnd' options (see below)

### constructor L10n
#### L10n(path[, options])
* path - absolute path to csv file
* options:
```
{ //defaults
  blockStart: '__(',  //start marks inside text to parse
  blockEnd: ')',  //end marks inside text to parse
  templateStart: '__(', //start marks inside resorce
  templateEnd: ')', //end marks inside resorce
  bindingStart: '{{',  //start marks for front, here for Angular
  bindingEnd: '}}'   //end marks for front, here for Angular
}
```
**return l10n instance**

### l10n instance methods
#### l10n.render(text, lang)
return localized text

#### l10n.reload()
reload csv file (sync), use render again to use updated resorces. 

#### l10n.errors
array of unknown resources (cleaned befor each use of l10n.render)

### Usage:
```js
var path = require('path'),
    CSVPath = path.join(__dirname, './lang.csv'), //absolute path to csv file
    options = { //default options
      blockStart: '__(',
  		blockEnd: ')',
  		templateStart: '__(',
  		templateEnd: ')',
  		bindingStart: '{{',
  		bindingEnd: '}}'
    },
    l10n = require('l10n-via-csv')(CSVPath, options);

var strToLocalize = '__(hello) __(guys)!. Angular template: __(template, name, age)',
    afterLocalize = l10n.render(strToLocalize, 'de');

console.log(afterLocalize); //--> Hallo Jungs! Angular template: Ich bin {{age}} und ich heiße {{name}}.
```
