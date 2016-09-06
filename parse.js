'use strict'

/* Dependencies */
const fs = require('fs'),
      path = require('path')

const default_locale = 'en-US'

let app_root, locales, ignore_list = ['node_modules'], output

module.exports = function(config) {
  app_root = config.root
  ignore_list = config.ignore
  output = config.output
  locales = config.locales

  output = path.join(__dirname, output)

  let fileList = []

  /* Get files list */
  function collectFiles(path) {
    let folderList = fs.readdirSync(path).filter(el => {
      for(let t=0;t<ignore_list.length; t++)
        if(new RegExp(ignore_list[t]+"$").test(el)) return false

      if(/\.js$/.test(el)) {
        fileList.push(`${path}/${el}`)
        return false
      } else if(!/\./.test(el))
        return true
      return false
    })

    folderList.forEach( folder => collectFiles(`${path}/${folder}`))
  }

  collectFiles(app_root)

  let files = fileList.map(el => el.replace('//', '/'))

  let stringList = []

  /* Parse files for gettext calls */
  function parseFile(file) {
    let content = fs.readFileSync(file, 'utf-8'),
        match, regexp = /getText\(['|"|`](.*)['|"|`]\)/g

    while(match = regexp.exec(content))
      stringList.push(match[1])
  }

  files.forEach(file => parseFile(file))

  /* Save all to default locale */
  let enUS = {}

  stringList.forEach(el => enUS[el] = { singular : el })
  fs.writeFileSync(`${output}/${default_locale}.json`, JSON.stringify(enUS, null, 2))

  /* Write or append for other locales */
  locales.forEach(locale => {
    let path = `${output}/${locale}.json`
    var data = {};
    try{
      fs.accessSync(path, fs.F_OK)
      data = require(path)

      stringList.forEach(str => {
        if( !data[str] )
          data[str] = { singular : str}
      })
    } catch(e) {
      stringList.forEach(str => {
        data[str] = {
          singular : str
        }
      })
    }

    fs.writeFileSync(path, JSON.stringify(data, null, 2))
  })

  console.log("Finished with: success")
}
