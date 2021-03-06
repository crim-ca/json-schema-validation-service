'use strict';

const util = require('util'),
  Ajv = require('ajv'),
  Config = require('../../config.json');

module.exports = {
  validateSchema: validateSchema,
  //Below, for unit tests
  validateMetaschema: validateMetaschema,
  validateTargetType: validateTargetType,
  isSupersetOfPrimitiveArray: isSupersetOfPrimitiveArray,
  validateSubSchema: validateSubSchema,
  validateSearchEngineConstraints: validateSearchEngineConstraints,
  validatePscConstraints: validatePscConstraints,
  isSchemaOfSimpleList: isSchemaOfSimpleList
};

function validateSchema(req, res) {
  const schema = req.swagger.params.body.originalValue.schema;
  let ajv = new Ajv();
  let validate;

  try {
    ajv.compile(schema);  // Draft v4 seems implied by the ajv //API
    executeValidation(req.swagger.params.body.originalValue.schema, function (response, errors) {
      if (response) {
        res.status(200);
        res.json({
          isValid: true
        });
      } else {
        console.log(errors.length);
        res.status(200);
        res.json({
          isValid: false,
          errors: errors
        });
      }
    });

  } catch (error) {
    res.status(422);
    res.json({
      "message": "Ajv " + error,
      "code": "AJV_SCHEMA_VALIDATION_FAILED",
      "failedValidation": true
    });
  }

}

function executeValidation(schema, callback) {
  var response = true;
  var errors = [];

  try {
    response = validatePscConstraints(schema);
  } catch (error) {
    response = false;
    errors.push({
      message: "PSC " + error,
      code: "PSC_SCHEMA_VALIDATION"
    });
  }
  callback(response, errors);
}

function validateMetaschema(schema) {
  var response = true;
  let ajv = new Ajv();
  try {
    ajv.compile(schema);  // Draft v4 seems implied by the ajv //API
  } catch (error) {
    console.log("Error validating Schema" + error);
  }
  return response;
}

function isElementOneOf(element, collection) {
  return collection.indexOf(element) != -1;
}

function validateTargetType(schema) {
  let target = schema.targetType;
  if (target === undefined) {
    return false;
  }

  return isElementOneOf(target, Config.targetTypes)
}

function isSupersetOfPrimitiveArray(superSet, subSet) {
  if (subSet === undefined || subSet.length == 0) {
    return true;
  } else if (superSet === undefined || superSet.length == 0) {
    return false;
  }

  function isElementOneOfPredicate(element) {
    return isElementOneOf(element, superSet);
  }

  return subSet.every(isElementOneOfPredicate);
}

function validateSubSchema(schema, subSchema) {
  // Get required fields from subSchema
  let requiredFieldNames = subSchema.required;

  // Are there all required in schema?
  let requiredFieldNamesInSchema = schema.required;

  if (!isSupersetOfPrimitiveArray(requiredFieldNamesInSchema, requiredFieldNames)) {
    throw new Error(`Missing required fields.
-Required fields needed: ${requiredFieldNames}.
-Required fields found: ${requiredFieldNamesInSchema}".`)
  }

  // The properties (key-value pairs) on an object are defined using the properties keyword.
  // The value of properties is an object, where each key is the name of a property and each value is a JSON schema used to validate that property.

  // Are the actual properties of the schema a super set of the sub schema?
  let properties = subSchema.properties;
  let propertiesInSchema = schema.properties;

  if (!isSupersetOf(propertiesInSchema, properties)) {
    throw new Error(`Properties missing or not matching.
-Properties required: ${JSON.stringify(properties)}.
-Properties found: ${JSON.stringify(propertiesInSchema)}".`)
  }

  return true;
}

// Compare two "JSON" objects.
// Does the superset has at least the same keys as the subset.
// Additionally, is the schema the same for the same keys.
function isSupersetOf(candidate, subset) {
  if (subset === undefined || subset.length == 0) {
    return true; // Empty subset; candidate is necessarily a superset.
  } else if (candidate === undefined || candidate.length == 0) {
    return false; // Non empty subset with an empty candidate; candidate cannot be a superset.
  }

  for (let propertyName in subset) {
    if (!candidate.hasOwnProperty(propertyName)) {
      throw new Error(`Element "${propertyName}" not found.`)
    }

    // Property found in both objects. Do they have the same schema?
    let candidatePropertySchema = JSON.stringify(candidate[propertyName]);
    let subsetPropertySchema = JSON.stringify(subset[propertyName]);

    if (candidatePropertySchema !== subsetPropertySchema) {
      throw new Error(`Schema of property "${propertyName}" was expected to be ${subsetPropertySchema}, but was ${candidatePropertySchema}.`)
    }
  }

  // If we got this far, we have a superset
  return true;
}

// Validate that keyword of property is non-null boolean
function validateBooleanKeyword(property, keywordName) {
  if (property.hasOwnProperty(keywordName)) {
    let value = property[keywordName];
    if (value !== null && value.constructor !== Boolean) {
      throw new Error(`Invalid type for keyword "${keywordName}". Property is "${JSON.stringify(property)}"`);
    }
    if (value !== true && value !== false) {
      throw new Error(`Invalid value for keyword "${keywordName}": "${value}"`);
    }
  }
}

function validateLocked(property) {
  validateBooleanKeyword(property, "locked");
}


// I.e. "items": {"type": "string"}
function isSingleSchemaOfTypeString(schema) {
  let itemsName = "items";
  if (!schema.hasOwnProperty(itemsName)) {
    return false;
  }

  let items = schema[itemsName];
  if (!items.hasOwnProperty(Config.typeKeyword)) {
    return false;
  }

  let value = items[Config.typeKeyword];
  return value === "string";
}

function isTypeString(property) {
  if (property.hasOwnProperty(Config.typeKeyword)) {
    let value = property[Config.typeKeyword];
    if (value === "string") {
      return true;
    } else if (value === "array" && isSingleSchemaOfTypeString(value)) {
      return true;
    }
  }

  return false
}

function validateLanguage(property, searchMode) {
  // Language is only used for language search mode
  if (searchMode !== Config.languageSearchMode) {
    return true;
  }

  if (searchMode === Config.languageSearchMode && !property.hasOwnProperty(Config.languageKeyword)) {
    throw new Error(`Missing mandatory searchMode for property ${JSON.stringify(property)}`)
  }

  let language = property[Config.languageKeyword];
  if (!isElementOneOf(language, Config.languages)) {
    throw new Error(`Invalid language for property ${JSON.stringify(property)}.
-Accepted Config.languages: ${Config.languages.toString()}`)
  }

  return true;
}

function validateSearchMode(property, searchable) {
  // searchModes is mandatory only for searchable properties.
  if (!searchable) {
    return true;
  }

  // searchModes is mandatory only for properties of type string or string list.
  if (!isTypeString(property)) {
    return true;
  }

  // Search mode is mandatory for searchable properties of type string
  if (!property.hasOwnProperty(Config.searchModeKeyword)) {
    throw new Error(`Mandatory ${Config.searchModeKeyword} keyword is missing in searchable string property: ${JSON.stringify(property)}}`)
  }

  let searchModes = property[Config.searchModeKeyword];
  if (!Array.isArray(searchModes)) {
    throw new Error(`Search mode must be a list. Property ${JSON.stringify(property)}`)
  }

  searchModes.forEach(function (mode) {
    if (!isElementOneOf(mode, Config.searchModes)) {
      throw new Error(`Invalid search mode for property ${JSON.stringify(property)}`)
    }
  });


  return validateLanguage(property, searchModes)
}

function isPrimitiveType(property) {
  return isElementOneOf(property[Config.typeKeyword], Config.primitiveTypes);
}

// Determine if we have an homogeneous array of simple types (primitive types or flat object)
function isSchemaOfSimpleList(propertySchema) {
  let type = propertySchema[Config.typeKeyword];

  if (type !== Config.arrayKeyword) {
    return false;
  }

  if (!propertySchema.hasOwnProperty(Config.itemsKeyword)) {
    return false;
  }

  let itemsSchema = propertySchema[Config.itemsKeyword];

  // Items will either be a schema object for list validations, or an array of schema objects for tuple validations.
  // In our case, we want an homogeneous list, so the schema must be an object
  return itemsSchema.constructor === Object && (isPrimitiveType(itemsSchema) || isSchemaOfFlatObject(itemsSchema));
}

function isSchemaOfFlatObject(schema) {
  // The schema must be an object
  let type = schema[Config.typeKeyword];
  if (type !== Config.objectKeyword) {
    return false;
  }

  // It must contains the properties field
  if (!schema.hasOwnProperty(Config.propertiesKeyword)) {
    return false
  }

  // Each property must be of primitive type (no lists or nested objects allowed)
  for (var propertyKey in schema.properties) {
    let property = schema.properties[propertyKey];
    if (!property.hasOwnProperty(Config.typeKeyword) || !isPrimitiveType(property)) {
      return false;
    }
  }

  return true
}

// Note: this function will only validate the constraints on simple types and lists of simple types or flat objects.
//
// We are excluding:
// -Object types ({ "type": "object" })
// -Union types (E.G: { "type": ["number", "string"] })
// -Lists of objects of more than one level
// -Tuples of any kind
//
// A flat object is an object made of only simple types; no lists, no objects inside the object.
function validateSearchable(property) {
  validateBooleanKeyword(property, Config.searchableKeyword);

  // Searchable is mandatory
  if (!property.hasOwnProperty(Config.searchableKeyword)) {
    throw new Error(`Mandatory ${Config.searchableKeyword} keyword is missing in property: ${JSON.stringify(property)}}`)
  }

  let searchable = property[Config.searchableKeyword];
  if (searchable) {
    if (!property.hasOwnProperty(Config.typeKeyword)) {
      throw new Error(`Searchable property is missing mandatory type ${JSON.stringify(property)}}`)
    }
    if (!isPrimitiveType(property) && !isSchemaOfSimpleList(property)) {
      throw new Error(`Searchable property must be of primitive type or an homogeneous array of primitive types (or flat objects).
 -Property: ${JSON.stringify(property)}`)
    }
  }

  return validateSearchMode(property, searchable)
}

// Special constraints due to the use of a textual search engine
// keyword, default
// searchable, true
// searchMode, (no default)
// language, (no default)
// locked, false
// Note: this function will only validate the constraints on simple types and lists of simple types. We are excluding:
// -Object types ({ "type": "object" })
// -Union types (E.G: { "type": ["number", "string"] })
// -Lists of objects
// -Tuples of any kind
function validateSearchEngineConstraintsForProperty(property) {
  validateLocked(property);
  validateSearchable(property);
  return true
}

function validateSearchEngineConstraints(schema) {
  let properties = schema.properties;
  for (let propertyName in properties) {
    if (!validateSearchEngineConstraintsForProperty(properties[propertyName])) {
      return false;
    }
  }

  return true;
}

function validatePscConstraints(schema) {

  if (!validateTargetType(schema)) {
    throw new Error(`Invalid property targetType: ${JSON.stringify(schema.targetType)}`);
    return false;
  }

  let targetType = schema.targetType;
  let targetSchema = require("../../data/targetSchemas/" + Config.targetSchemas[targetType]);

  if (!validateSubSchema(schema, targetSchema)) {
    throw new Error(`Invalid schema based on target schema: ${JSON.stringify(targetSchema)}`);
    return false;
  }

  return validateSearchEngineConstraints(schema, targetSchema);
}
