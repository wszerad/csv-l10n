# l10n-via-csv
Simple engine for l10n (provided via csv files)

### csv table design
| key\lang (this one is unused) | en  | de  |
|---|---|---|
| hello | Hello | Hallo |
| month.january | January | Januar  |
| template | My name is __(0), I am __(1) | Ich bin __(1) und ich heiße __(0)  |

You can use templates inside resorces like in last row. Default template block begin of '__(' end with ')' and inside has number of argument.
Later inside translated text you can use block like: __(template, name, age) where first argument is resorce key and next are following arguments to use inside template.
Templates are replaced with bindings {{argument}} (usable with Angular and configurable with options)

### Methods & Properties
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
return l10n instance


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

var strToLocalize = 'My name is __(name) and I am __(age). Angular template: __(name.and.age, name, age)',
    afterLocalize = l10n.render(strToLocalize);

console.log(afterLocalize); //--> My name is John and I am 21. Angular template: My name is {{name}} and I am {{age}}.
```
