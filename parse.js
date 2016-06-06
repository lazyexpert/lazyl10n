'use strict'
/*
  Пример моего рабочего запроса
  node parse.js -r ../../ -i 'locales, logs, keys, public, tests, views, node_modules' -o ../../locales/ -l 'en-US, ru, ua'
*/

/* Dependencies */
const args = require('minimist')(process.argv.slice(2)),
      fs = require('fs'),
      path = require('path')

/* Print help */
if( args.h || args.help ) {
  console.log('Correct Syntax:')
  console.log('node parse.js [--root | -r  root_folder_name] [--ignore || -i ignore_folders_comas_separated] [--output | -o output_folder_without_filename] [--locales | -l "ru, en-US, es, ua"]')
  console.log('Example syntax: (Ignore list should be string)')
  console.log('Ignore list can be regular expressions')
  console.log("node parse.js --root root_app_folder --ignore 'list_to_ignore, coma_separated, folders_being_ignored' --locales 'en-US, ru, ua' --output folder_for_locales")
  console.log('Minimum syntax usage:')
  console.log('node parse.js')
  console.log('Than - defaults used:')
  console.log('app_root = "./"')
  console.log('ignore_list = "node_modules"')
  console.log('output = "./"`)')
  console.log('locales = "en-US"')
  process.exit()
}

const default_locale = 'en-US'

let app_root, locales,ignore_list = ['node_modules'], output

/* If lazy mode */
if( args.lazy ) {
  // =)) call with: node parse.js --lazy
  let lazy = require('./parser_config')

  app_root = lazy.root
  ignore_list = lazy.ignore
  output = lazy.output
  locales = lazy.locales
} else {
  /* Get keys */
  app_root = path.join(__dirname, args.root || args.r || "./")

  if( args.ignore || args.i ) {
    let ignore = args.ignore || args.i
    ignore_list = ignore.split(",").map(el => el.trim())
  }

  if( args.locales || args.l ) {
    let local = args.locales || args.l
    locales = local.split(",").map(el => el.trim())
  }

  output = args.output || args.o || "."
}

output = path.join(__dirname, output)


console.log(`Arguments: \napp_root: ${app_root} \nignore_list: ${ignore_list.join(', ')} \nlocales: ${locales.join(', ')} \noutput: ${output}`)

let fileList = []

/* Get files list */
function collectFiles(path) {
  let folderList = fs.readdirSync(path).filter(el => {
    for(let t=0;t<ignore_list.length; t++)
      if(new RegExp(ignore_list[t]).test(el)) return false

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
