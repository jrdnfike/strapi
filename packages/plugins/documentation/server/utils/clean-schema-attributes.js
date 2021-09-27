'use strict';
const _ = require('lodash');
const getSchemaData = require('./get-schema-data');

const cleanSchemaAttributes = attributes => {
  // Make a copy of the attributes
  const attributesCopy = _.cloneDeep(attributes);

  for (const prop in attributesCopy) {
    let attribute = attributesCopy[prop];

    if (attributes.default) {
      delete attributesCopy[prop].default;
    } else if (attribute.type === 'datetime') {
      attributesCopy[prop] = { type: 'string' };
    } else if (attribute.type === 'decimal') {
      attributesCopy[prop] = { type: 'number', format: 'float' };
    } else if (attribute.type === 'integer') {
      attributesCopy[prop] = { type: 'integer' };
    } else if (attribute.type === 'json') {
      attributesCopy[prop] = { type: 'object' };
    } else if (attribute.type === 'uid') {
      attributesCopy[prop] = { type: 'string', format: 'uuid' };
    } else if (attribute.type === 'media') {
      const imageAttributes = strapi.plugin('upload').contentType('file').attributes;
      const isSingleEntity = !attribute.multiple;

      attributesCopy[prop] = {
        type: 'object',
        properties: {
          data: getSchemaData(isSingleEntity, cleanSchemaAttributes(imageAttributes)),
        },
      };
    } else if (attribute.type === 'component') {
      const componentAttributes = strapi.components[attribute.component].attributes;
      const isSingleEntity = !attribute.repeatable;
      attributesCopy[prop] = {
        type: 'object',
        properties: {
          data: getSchemaData(isSingleEntity, cleanSchemaAttributes(componentAttributes)),
        },
      };
    } else if (attribute.type === 'relation') {
      // TODO: Sanitize relation attributes and list them in the schema
      const isSingleEntity = !attribute.relation.includes('ToMany');
      attributesCopy[prop] = {
        type: 'object',
        properties: {
          data: getSchemaData(isSingleEntity, {}),
        },
      };
    } else {
      // Prevent messages like "unkown datatype: relation" by providing
      // the attribute's type as a default string value
      attributesCopy[prop] = { default: JSON.stringify(attribute.type) };
    }
  }

  return attributesCopy;
};

module.exports = cleanSchemaAttributes;
