'use strict';
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');

const { builApiEndpointPath } = require('../utils/builders');
const defaultConfig = require('../config/default-config');
const form = require('./utils/forms');

module.exports = () => {
  const docPlugin = strapi.plugin('documentation');

  return {
    getMergedDocumentationPath(version = this.getDocumentationVersion()) {
      return path.join(
        strapi.config.appPath,
        'src',
        'extensions',
        'documentation',
        'documentation',
        version
      );
    },

    getDocumentationVersion() {
      return docPlugin.config('info.version');
    },

    getFullDocumentationPath() {
      return path.join(
        strapi.config.appPath,
        'src',
        'extensions',
        'documentation',
        'documentation'
      );
    },

    getDocumentationVersions() {
      return fs
        .readdirSync(this.getFullDocumentationPath())
        .map(version => {
          try {
            const doc = JSON.parse(
              fs.readFileSync(
                path.resolve(this.getFullDocumentationPath(), version, 'full_documentation.json')
              )
            );
            const generatedDate = _.get(doc, ['info', 'x-generation-date'], null);

            return { version, generatedDate, url: '' };
          } catch (err) {
            return null;
          }
        })
        .filter(x => x);
    },

    async getFrontendForm() {
      const config = await strapi
        .store({
          environment: '',
          type: 'plugin',
          name: 'documentation',
          key: 'config',
        })
        .get();

      const forms = JSON.parse(JSON.stringify(form));

      _.set(forms, [0, 0, 'value'], config.restrictedAccess);
      _.set(forms, [0, 1, 'value'], config.password || '');

      return forms;
    },

    async generateFullDoc() {
      let paths = {};
      const apis = Object.keys(strapi.api);
      for (const apiName of apis) {
        const apiDirPath = path.join(
          strapi.config.appPath,
          'src',
          'api',
          apiName,
          'documentation',
          this.getDocumentationVersion()
        );
        const apiDocPath = path.join(apiDirPath, `${apiName}.json`);
        await fs.ensureFile(apiDocPath);
        const apiPathsObject = builApiEndpointPath(apiName);

        await fs.writeJson(apiDocPath, apiPathsObject, { spaces: 2 });
        paths = { ...paths, ...apiPathsObject.paths };
      }

      const fullDocJsonPath = path.join(
        this.getFullDocumentationPath(),
        this.getDocumentationVersion(),
        'full_documentation.json'
      );
      await fs.ensureFile(fullDocJsonPath);
      // write to full doc path
      await fs.writeJson(fullDocJsonPath, { ...defaultConfig, paths }, { spaces: 2 });
    },
  };
};
