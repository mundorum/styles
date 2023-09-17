# Mundorum Design

Mundorum design system using design tokens and styles.

## Install

~~~
npm install -D style-dictionary
~~~

## Build

Generating resolved JSON and CSS files:
~~~
npx style-dictionary build
~~~

To change the generated theme, change the `theme` variable in the config.js.

## Config

* `config.js`
  * `theme`: defines a generated theme;
  * `themeDir`: directory that contains the theme definitions;

  * `transform`: add specialized measures to the CSS output, e.g., add the `rem` measure to shape specifications;
  * `format`: customized formats that load an extra `classes.json` file and generate:
    * `classes/classes-resolved.json`: JSON classes with tokens transformed in their respective values;
    * `css/variables.css`: JSON tokens transformed in CSS variables;
    * `css/classes-tokens.css`: JSON classes transformed in CSS converting first-level properties in CSS classes and tokens to CSS variables;
    * `css/classes-resolved.css`: same as the previous, but converting tokens in their respective values;
    * `intermediary/aggregated-tokens.json`: an auxiliary file aggregating all tokens in a single hierarchical file.


