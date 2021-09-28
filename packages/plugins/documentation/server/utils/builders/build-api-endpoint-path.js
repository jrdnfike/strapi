'use strict';

const _ = require('lodash');
const pathToRegexp = require('path-to-regexp');

const queryParams = require('../query-params');
const buildApiRequests = require('./build-api-requests');
const buildApiResponses = require('./build-api-responses');

const parsePathWithVariables = routePath => {
  return pathToRegexp
    .parse(routePath)
    .map(token => {
      if (_.isObject(token)) {
        return token.prefix + '{' + token.name + '}';
      }

      return token;
    })
    .join('');
};

const getPathParams = routePath => {
  return pathToRegexp
    .parse(routePath)
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
};

const getPaths = (routes, attributes, tag) => {
  const paths = routes.reduce(
    (acc, route) => {
      const hasPathParams = route.path.includes('/:');
      const methodVerb = route.method.toLowerCase();

      if (methodVerb === 'get') {
        const routePath = hasPathParams ? parsePathWithVariables(route.path) : route.path;

        // FIXME:
        // Using pathParams to distinguish between single entity vs list of entities
        // is not reliable
        const { responses } = buildApiResponses(attributes, route, hasPathParams);
        _.set(acc.paths, `${routePath}.${methodVerb}.responses`, responses);
        _.set(acc.paths, `${routePath}.${methodVerb}.tags`, [_.upperFirst(tag)]);

        if (hasPathParams) {
          const pathParams = getPathParams(route.path);
          _.set(acc.paths, `${routePath}.${methodVerb}.parameters`, pathParams);
        } else {
          _.set(acc.paths, `${routePath}.${methodVerb}.parameters`, queryParams);
        }
      }

      if (methodVerb === 'post' || methodVerb === 'put') {
        const routePath = hasPathParams ? parsePathWithVariables(route.path) : route.path;

        const { responses } = buildApiResponses(attributes, route, hasPathParams);
        const { requestBody } = buildApiRequests(attributes, route);

        _.set(acc.paths, `${routePath}.${methodVerb}.responses`, responses);
        _.set(acc.paths, `${routePath}.${methodVerb}.requestBody`, requestBody);
        _.set(acc.paths, `${routePath}.${methodVerb}.tags`, [_.upperFirst(tag)]);

        if (hasPathParams) {
          const pathParams = getPathParams(route.path);
          _.set(acc.paths, `${routePath}.${methodVerb}.parameters`, pathParams);
        }
      }

      if (methodVerb === 'delete') {
        const routePath = hasPathParams ? parsePathWithVariables(route.path) : route.path;
        const { responses } = buildApiResponses(attributes, route, hasPathParams);
        _.set(acc.paths, `${routePath}.${methodVerb}.responses`, responses);
        _.set(acc.paths, `${routePath}.${methodVerb}.tags`, [_.upperFirst(tag)]);

        if (hasPathParams) {
          const pathParams = getPathParams(route.path);
          _.set(acc.paths, `${routePath}.${methodVerb}.parameters`, pathParams);
        }
      }

      return acc;
    },
    { paths: {} }
  );

  return paths;
};

module.exports = api => {
  if (!api.ctNames.length) {
    const attributes = { foo: { type: 'string ' } };
    // No contenType because it's uses admin routes?
    const routes = strapi.plugin(api.name).routes['admin'].routes;

    return getPaths(routes, attributes, api.name);
  }

  for (const contentTypeName of api.ctNames) {
    const contentType = strapi.contentType(`${api.getter}::${api.name}.${contentTypeName}`);
    const attributes = contentType.attributes;

    const routes =
      api.getter === 'plugin'
        ? strapi.plugin(api.name).routes['content-api'].routes
        : strapi.api[api.name].routes[contentTypeName].routes;

    const tag = api.name === contentTypeName ? api.name : `${api.name} - ${contentTypeName}`;
    return getPaths(routes, attributes, tag);
  }
};
