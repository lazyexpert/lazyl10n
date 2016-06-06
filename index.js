'use strict'

/* Dependencies */
const localePckg = require("express-locale"),
      fs = require('fs'),
      path = require('path'),
      sprintf = require('sprintf-js').sprintf,
      vsprintf = require('sprintf-js').vsprintf

const m = module.exports
/*
  Express Middleware
  Expect options object.
  {
    "languages" : ['en', 'ru', 'es'], //<-- supported languages - names should be exactly as locale files
    "locales_folder" : "./some/path/to/locales/folder"
  }
*/
module.exports.init = options => {
  m.languages = options.languages

  m.locales_folder = options.locales_folder

  /* Loaded to memory locales */
  global.locales = null

  m.loadLocales()

  return function(req, res, next) {
    let localefn = localePckg({ 'default' : 'en-US' })
    let userPick = req.session && req.session.locale ||
                   req.user && req.user.locale || null

    function attach() {
      if(req.user && req.user.locale)
        req.session.locale = req.user.locale

      req.getText = m.getText.bind(req)
      req.ngetText = m.ngetText.bind(req)

      next()
    }

    if(userPick) {
      req.locale = {
        code : userPick
      }
      attach()
    }  else localefn(req, res, attach )
  }
}

module.exports.loadLocales = () => {
  if( !global.locales ) {
    global.locales = {}
    m.languages.forEach(lang =>
      global.locales[lang] = require(`${m.locales_folder}${lang}.json`))
  }
}

/*
  Main method. Translates provided text to the most comfortable locale
  Assumed to have req object somewere in clojure
*/
module.exports.getText = function(text) {
  if( this.locale && global.locales[this.locale.code] && global.locales[this.locale.code][text] )
    return global.locales[this.locale.code][text].singular
  else if( global.locales['en-US'][text] )
    return global.locales['en-US'][text].singular
  else {
    console.warn("Couldn't find correct text")
    return text
  }
}

/*
  This method is almost same as getText, but uses sprintf syntax, to paste in string
  Expect arguments:
  - text - "I have %s ball(s). I cant give you the %s ball(s)"
  - other arguments exptected strings to paste in the %s place
*/
module.exports.ngetText = function(text) {
  let localizedText = null

  if( this.locale && global.locales[this.locale.code] && global.locales[this.locale.code][text] )
    localizedText = global.locales[this.locale.code][text].singular
  else if( global.locales['en-US'][text] )
    localizedText = global.locales['en-US'][text].singular
  else {
    console.warn("Couldn't find correct text")
    localizedText = text
  }

  let args = Array.prototype.slice.call(arguments, 1)
  return vsprintf(localizedText, args)
}
