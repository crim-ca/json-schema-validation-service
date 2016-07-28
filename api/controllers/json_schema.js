'use strict';

const util = require('util'),
      Ajv = require('ajv'),
      Config = require('../../config.json');

module.exports = {
  validateSchema: validateSchema,
  //Bellow, for unit tests
  validateMetaschema: validateMetaschema,
  validateTargetType: validateTargetType,
  isSupersetOfPrimitiveArray: isSupersetOfPrimitiveArray,
  validateSubSchema : validateSubSchema,
  validateSearchEngineConstraints: validateSearchEngineConstraints,
  validatePscConstraints: validatePscConstraints
};

function validateSchema(req, res) {
  var response = validatePscConstraints(req.swagger.params.body.originalValue.schema);
  res.status(200);
  res.json({
    isValid: response
  });
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
    if(value === "string") {
      return true;
    } else if (value === "array" && isSingleSchemaOfTypeString(value)) {
      return true;
    }
  }

  return false
}

function validateLanguage(property, searchMode) {
  // Language is only used for fuzzy search mode
  if (searchMode !== Config.fuzzySearchMode) {
    return true;
  }

  if (searchMode === Config.fuzzySearchMode && !property.hasOwnProperty(Config.languageKeyword)) {
    throw new Error(`Missing mandatory language for property ${JSON.stringify(property)}`)
  }

  let language = property[Config.languageKeyword];
  if(!isElementOneOf(language, Config.languages)) {
    throw new Error(`Invalid language for property ${JSON.stringify(property)}.
-Accepted Config.languages: ${Config.languages.toString()}`)
  }

  return true;
}

function validateSearchMode(property, searchable) {
  // searchMode is mandatory only for searchable properties.
  if (!searchable) {
    return true;
  }

  // searchMode is mandatory only for properties of type string or string list.
  if (!isTypeString(property)) {
    return true;
  }

  var searchMode;
  if (!property.hasOwnProperty(Config.searchModeKeyword)) {
    searchMode = "fuzzy";
  } else {
    searchMode = property[Config.searchModeKeyword]
  }
  if(!isElementOneOf(searchMode, Config.searchModes)) {
    throw new Error(`Invalid search mode for property ${JSON.stringify(property)}`)
  }

  return validateLanguage(property, searchMode)
}

// keyword, default
// searchable, true
// searchMode, fuzzy
// language, (no default)
// Note: this function will only validate the constraints on simple types and lists of simple types. We are excluding:
// -Object types ({ "type": "object" })
// -Union types (E.G: { "type": ["number", "string"] })
// -Lists of objects
// -Tuples of any kind
function validateSearchable(property) {
  validateBooleanKeyword(property, Config.searchableKeyword);

  // Searchable is true by default
  let searchable = !property.hasOwnProperty(Config.searchableKeyword) || property[Config.searchableKeyword] === true;
  return validateSearchMode(property, searchable)
}

// Special constraints due to the use of a textual search engine
// keyword, default
// searchable, true
// searchMode, fuzzy
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
  validateMetaschema(schema);

  if (!validateTargetType(schema)) {
    return false;
  }

  let targetType = schema.targetType;
  let targetSchema = Config.targetSchemas[targetType];

  if (!validateSubSchema(schema, targetSchema)) {
    return false;
  }

  return validateSearchEngineConstraints(schema, targetSchema);
}


