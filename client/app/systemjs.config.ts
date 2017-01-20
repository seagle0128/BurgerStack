declare var System: SystemJSLoader.System;

let SYSTEM_CONFIG = {
  defaultJSExtensions: true,

  paths: {
    // paths serve as alias
    'npm:': 'npm/'
  },
  // map tells the System loader where to look for things
  map: {
    // our app is within the app folder
    app: 'app',

    // angular bundles
    '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
    '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
    '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
    '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
    '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
    '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
    '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
    '@angular/upgrade': 'npm:@angular/upgrade/bundles/upgrade.umd.js',
    '@angular/upgrade/static': 'npm:@angular/upgrade/bundles/upgrade-static.umd.js',

    // other libraries
    'rxjs': 'npm:rxjs'
  },
  // packages tells the System loader how to load when no filename and/or no extension
  packages: {
    rxjs: {
      defaultExtension: 'js'
    }
  }
};

System.config(SYSTEM_CONFIG);
