import * as _ from 'lodash';
import * as chalk from 'chalk';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { getGlobbedPaths } from './utils/common';

export class Config {

  private static _instance: Config = new Config();

  private _config: any = {};

  public static getInstance(): Config {
    return Config._instance;
  }

  public static config() {
    return Config._instance.getConfig();
  }

  constructor() {
    if (Config._instance) {
      throw new Error('Error: Instantiation failed: Use Config.getInstance() instead of new.');
    }
    this._config = this.initGlobalConfig();
    Config._instance = this;
  }

  public getConfig() {
    return this._config;
  }

  /**
   * Validate NODE_ENV existence
   */
  private validateEnvironmentVariable() {
    let environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '\.+(j|t)s');
    console.log();
    if (!environmentFiles.length) {
      if (process.env.NODE_ENV) {
        console.error(chalk.red(
          '+ Error: No configuration file found for "'
          + process.env.NODE_ENV
          + '" environment using development instead'));
      } else {
        console.error(chalk.red('+ Error: NODE_ENV is not defined! Using default development environment'));
      }
      process.env.NODE_ENV = 'development';
    }
    // Reset console color
    console.log(chalk.white(''));
  };

  /**
   * Validate Secure=true parameter can actually be turned on
   * because it requires certs and key files to be available
   */
  private validateSecureMode(config: any): boolean {

    if (!config.secure || config.secure.ssl !== true) {
      return true;
    }

    let privateKey = fs.existsSync(path.resolve(config.secure.privateKey));
    let certificate = fs.existsSync(path.resolve(config.secure.certificate));

    if (!privateKey || !certificate) {
      console.log(chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'));
      console.log(chalk.red('  To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh'));
      console.log();
      config.secure.ssl = false;
      return false;
    } else {
      return true;
    }
  };

  /**
   * Validate Session Secret parameter is not set to default in production
   */
  private validateSessionSecret(config: any, testing: boolean) {

    if (process.env.NODE_ENV !== 'production') {
      return true;
    }

    if (config.sessionSecret === 'BurgerStack') {
      if (!testing) {
        console.log(chalk.red('+ WARNING: It is strongly recommended that you change sessionSecret config while running in production!'));
        console.log(chalk.red('  Please add `sessionSecret: process.env.SESSION_SECRET || \'super amazing secret\'` to '));
        console.log(chalk.red('  `config/env/production.ts` or `config/env/local.ts`'));
        console.log();
      }
      return false;
    } else {
      return true;
    }
  };

  /**
   * Initialize global configuration files
   */
  private initGlobalConfigFiles(config: any, assets: any) {
    config.assets = assets;

    // Appending files
    config.files = {
      client: {},
      server: {}
    };

    // Setting Globbed model files
    config.files.server.mdmodels = getGlobbedPaths(assets.server.mongodbModels, []);
    config.files.server.pgmodels = getGlobbedPaths(assets.server.postgresModels, []);

    // Setting Globbed route files
    config.files.server.routes = getGlobbedPaths(assets.server.routes, []);

    // Setting Globbed config files
    config.files.server.configs = getGlobbedPaths(assets.server.config, []);

    // Setting Globbed socket files
    config.files.server.sockets = getGlobbedPaths(assets.server.sockets, []);

    // Setting Globbed policies files
    config.files.server.policies = getGlobbedPaths(assets.server.policies, []);
  };

  /**
  * Initialize global configuration
  */
  private initGlobalConfig() {
    // Validate NODE_ENV existence
    this.validateEnvironmentVariable();

    // Get the base assets
    let baseAssets = require(path.join(process.cwd(), 'config/assets/base'));

    // Get the current assets
    let environmentAssets = require(path.join(process.cwd(), 'config/assets/', process.env.NODE_ENV)) || {};

    // Merge assets
    let assets = _.merge(baseAssets, environmentAssets);

    // Get the base config
    let baseConfig = require(path.join(process.cwd(), 'config/env/base'));

    // Get the current config
    let environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

    // Merge config files
    let config = _.merge(baseConfig, environmentConfig);

    // Extend the config object with the local-NODE_ENV.(j|t)s custom/local environment.
    // This will override any settings present in the local configuration.
    let localEnvFiles = getGlobbedPaths(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '\.+(j|t)s'), []);
    if (localEnvFiles.length === 1) {
      let localEnv = localEnvFiles.pop();
      if (fs.existsSync(localEnv)) {
        config = _.merge(config, require(localEnv) || {});
      }
    }

    // Initialize global globbed files
    this.initGlobalConfigFiles(config, assets);

    // Validate Secure SSL mode can be used
    this.validateSecureMode(config);

    // Validate session secret
    this.validateSessionSecret(config, false);

    return config;
  };
};
