// defines a generated theme
const theme = `mundorum` // default, bw, mundorum
const themeDir = `tokens-theme/${theme}/**/*.json`

// custom: to import the css transform group
const StyleDictionary = require('style-dictionary')
const fs = require('fs')
const { transferableAbortController } = require('util')

const jsonStrCSS =
  fs.readFileSync('css/style.json').toString()

// find the path in the token tree and converts to the value
function getFinalValue(tokenName, dictionary) {
  const tokenPath = tokenName.split('.')
  let value = dictionary.tokens
  let subpath = ''
  for (const path of tokenPath) {
    subpath += path + '.'
    if (!value[path]) {
      value = subpath + '..?'
      break
    } else {
      value = value[path]
    }
  }
  return value
}

// convert token fonts into css imports
function cssImportFonts (dictionary) {
  let cssFonts = ''
  const dic = dictionary.tokens
  if (dic.asset && dic.asset.font) {
    const fonts = dic.asset.font
    for (const f in fonts) {
      const ftype =
        (fonts[f].ttf) ? fonts[f].ttf :
        (fonts[f].woff) ? fonts[f].woff :
        (fonts[f].woff2) ? fonts[f].woff2 :
        (fonts[f].eot) ? fonts[f].eot : null
      if (ftype != null)
        cssFonts += `@font-face {\n  font-family: '${fonts[f].name.value}';\n  src: url('${ftype.value}');\n}\n`
    }
    cssFonts += '\n'
  }
  return cssFonts
}

// convert JSON items to CSS definitions
function convertJSONtoCSS (jsonStrCSS) {
  let css = ''
  const jsonCSS = JSON.parse(jsonStrCSS)
  for (const jc in jsonCSS) {
    css += `${jc} {\n`
    for (const prop in jsonCSS[jc]) {
      let value = jsonCSS[jc][prop]
      // check Array type and transform in a string
      if (Array.isArray(value))
        value = value.join(' ')
      if (value.includes('{'))
        value = value
          .replace(/\.value/g, '')
          .replace(/\./g, '-')
          .replace(/{/g, 'var(--')
          .replace(/}/g, ')')
      css += `  ${prop}: ${value};\n`
    }
    css += '}\n'
  }
  return css
}

/* Output 1: aggregated tokens */
StyleDictionary.registerFormat({
  name: 'jsonAggregatedFormat',
  formatter: function({dictionary, platform, options, file}) {
    return JSON.stringify(dictionary.tokens, null, 2)
  }
})

/* Output 2: same JSON replacing tokens by final values */
StyleDictionary.registerFormat({
  name: 'jsonResolvedFormat',
  formatter: function({dictionary, platform, options, file}) {
    const jsonResClasses = jsonStrCSS
      .replace(/{(.*)}/g, (match, tokenName) => getFinalValue(tokenName, dictionary))

    return jsonResClasses
  }
})

/* Output 3: CSS file with token variables */
StyleDictionary.registerFormat({
  name: 'cssClassFormat',
  formatter: function({dictionary, platform, options, file}) {
    return cssImportFonts(dictionary) + convertJSONtoCSS (jsonStrCSS)
  }
})

/* Output 4: CSS file with final values */
StyleDictionary.registerFormat({
  name: 'cssResolvedClassFormat',
  formatter: function({dictionary, platform, options, file}) {
    const jsonResClasses = jsonStrCSS
      .replace(/{(.*)}/g, (match, tokenName) => getFinalValue(tokenName, dictionary))
    return cssImportFonts(dictionary) + convertJSONtoCSS (jsonResClasses)
  }
})

module.exports = {
  source: [`tokens/**/*.json`, themeDir],
  // custom transforms
  transform: {
    'shape/rem': {
      type: 'value',
      matcher: (token) => token.attributes.category === 'shape',
      transformer: (token) => token.original.value + 'rem'
    }
  },
  platforms: {
    "css": {
      "options": {
        "showFileHeader": true
      },
      // extends css transform group with custom transforms
      'transforms': StyleDictionary.transformGroup['css'].concat(['shape/rem']),
      "buildPath": "build/",
      "files": [
        {
          "format": "css/variables",
          "destination": "css/variables.css"
        },
        {
          "format": "jsonAggregatedFormat",
          "destination": "intermediary/aggregated-tokens.json"
        },
        {
          "format": "jsonResolvedFormat",
          "destination": "json/css-style-resolved.json"
        },
        {
          "format": "cssClassFormat",
          "destination": "css/style-tokens.css",
        },
        {
          "format": "cssResolvedClassFormat",
          "destination": "css/style-resolved.css"
        }
      ]
    }
  }
}