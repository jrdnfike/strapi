'use strict';

module.exports = (isSingleEntity, attributes) => {
  if (isSingleEntity) {
    return {
      type: 'object',
      properties: {
        id: { type: 'string' },
        attributes: { type: 'object', properties: attributes },
      },
    };
  }

  return {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        attributes: { type: 'object', properties: attributes },
      },
    },
  };
};
