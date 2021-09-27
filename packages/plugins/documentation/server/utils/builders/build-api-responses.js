'use strict';

const getSchemaData = require('../get-schema-data');
const cleanSchemaAttributes = require('../clean-schema-attributes');

const getMeta = isSingleEntity => {
  if (isSingleEntity) {
    return { type: 'object' };
  }

  return {
    properties: {
      pagination: {
        properties: {
          page: { type: 'integer' },
          pageSize: { type: 'integer', minimum: 25 },
          pageCount: { type: 'integer', maximum: 1 },
          total: { type: 'integer' },
        },
      },
    },
  };
};

module.exports = (attributes, route, isSingleEntity = false) => {
  let schema;
  if (route.method === 'DELETE') {
    schema = {
      type: 'integer',
      format: 'int64',
    };
  } else {
    schema = {
      properties: {
        data: getSchemaData(isSingleEntity, cleanSchemaAttributes(attributes)),
        meta: getMeta(isSingleEntity),
      },
    };
  }

  return {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema,
          },
        },
      },
    },
  };
};
