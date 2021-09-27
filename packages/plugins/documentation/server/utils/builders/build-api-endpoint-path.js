'use strict';

const _ = require('lodash');
const pathToRegexp = require('path-to-regexp');

const queryParams = require('../query-params');
const buildApiRequests = require('./build-api-requests');
const buildApiResponses = require('./build-api-responses');

const parsePathWithVariables = routePath => {
  const parsedPath = pathToRegexp
    .parse(routePath)
    .map(token => {
      if (_.isObject(token)) {
        return token.prefix + '{' + token.name + '}';
      }

      return token;
    })
    .join('');

  return parsedPath;
};

module.exports = apiName => {
  const attributes = strapi.contentType(`api::${apiName}.${apiName}`).attributes;
  const routes = strapi.api[apiName].routes[apiName].routes;
  const paths = routes.reduce(
    (acc, route) => {
      const hasPathParams = route.path.includes('/:');

      if (route.method === 'GET') {
        const routePath = route.path.includes(':')
          ? parsePathWithVariables(route.path)
          : route.path;

        const { responses } = buildApiResponses(attributes, route, hasPathParams);
        _.set(acc.paths, `${routePath}.get.responses`, responses);
        _.set(acc.paths, `${routePath}.get.tags`, [_.upperFirst(route.info.apiName)]);

        if (hasPathParams) {
          const pathParams = pathToRegexp
            .parse(route.path)
            .filter(token => _.isObject(token))
            .map(param => {
              return {
                name: param.name,
                in: 'path',
                description: '',
                deprecated: false,
                required: true,
                schema: { type: 'string' },
              };
            });

          _.set(acc.paths, `${routePath}.get.parameters`, pathParams);
        } else {
          _.set(acc.paths, `${routePath}.get.parameters`, queryParams);
        }
      }

      if (route.method === 'POST') {
        const routePath = route.path.includes(':')
          ? parsePathWithVariables(route.path)
          : route.path;

        const { responses } = buildApiResponses(attributes, route, hasPathParams);
        const { requestBody } = buildApiResponses(attributes, route);
        _.set(acc.paths, `${routePath}.post.responses`, responses);
        _.set(acc.paths, `${routePath}.post.requestBody`, requestBody);
        _.set(acc.paths, `${routePath}.post.tags`, [_.upperFirst(route.info.apiName)]);
      }

      if (route.method === 'PUT') {
        const routePath = route.path.includes(':')
          ? parsePathWithVariables(route.path)
          : route.path;

        const { responses } = buildApiResponses(attributes, route, hasPathParams);
        const { requestBody } = buildApiRequests(attributes, route);
        _.set(acc.paths, `${routePath}.put.responses`, responses);
        _.set(acc.paths, `${routePath}.put.requestBody`, requestBody);
        _.set(acc.paths, `${routePath}.put.tags`, [_.upperFirst(route.info.apiName)]);
      }

      if (route.method === 'DELETE') {
        const routePath = route.path.includes(':')
          ? parsePathWithVariables(route.path)
          : route.path;
        const { responses } = buildApiResponses(attributes, route, hasPathParams);
        _.set(acc.paths, `${routePath}.delete.responses`, responses);
        _.set(acc.paths, `${routePath}.delete.tags`, [_.upperFirst(route.info.apiName)]);
      }

      return acc;
    },
    { paths: {} }
  );

  return paths;
};
