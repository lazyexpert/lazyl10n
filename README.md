# Description
This module is provided as is. Use it on your own risks.

# Brief:
Module can collect all used strings from you source code.

According to configured locales creates default locale overwriting existing data
and appends keys to other locales, that way if the key in translation exists,
it wont be overwritten.

Can ignore folders, pass them to parser config.

The best use(currently the only) is with passport middleware and express-session module.

# Installation
Install module:
``` javascript
const lazyl10n = require('lazyl10n')
```

# Initialization
Init module:
``` javascript
// Init module after passport and sessions middleware
// Use it as middleware
// My working example
app.use(lazyl10n.init({
    languages : ['en-US', 'ru', 'ua'],
    locales_folder : path.join(__dirname, '../../locales/'),
    default: 'ru',
    // This config is actually config of parser
    config : {
      "root": path.join(__dirname, '../../'),
      "ignore": ["locales", "logs", "keys", "public", "tests", "views", "node_modules"],
      "output": "../../locales",
      "locales": [ "ru", "ua" ]
    }
  }))
```


# Usage:
``` javascript
// For usual case
req.getText("Site title")

// For ngetText
req.ngetText("I have %d kittens and thats %s!", 5, 'awesome') // I have 5 kittens and thats awesome!
```
