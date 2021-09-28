'use strict';

/**
 * @description Determines the format of the data response
 * 
 * @param {boolean} isSingleEntity - Checks for a single entity
 * @param {object} attributes - The attributes found on a contentType
 
 * @returns object | array of attributes
 */
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
