const faceDetect = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "http://adnotare.crim.ca/schema/custom-meta-schema#",
  "targetType": "multimedia_document_content",
  "title": "Face_Detect",
  "description": "A representation of a face detection in a video media file",
  "type": "object",
  "required": [
    "@context",
    "@type",
    "_schemaID",
    "begin",
    "end",
    "confidence"
  ],
  "properties": {
    "@context": {
      "format": "url",
      "type": "string",
      "description": "JSON-LD context",
      "locked": true
    },
    "@type": {
      "type": "string",
      "description": "JSON-LD type",
      "locked": true
    },
    "_schemaID": {
      "type": "string",
      "description": "Internal schema GUID",
      "locked": true
    },
    "begin": {
      "format": "date-time-local",
      "type": "string",
      "description": "Annotation starting time",
      "locked": true
    },
    "end": {
      "format": "date-time-local",
      "type": "string",
      "description": "Annotation ending time",
      "locked": true
    },
    "confidence": {
      "maximum": 100,
      "minimum": 0,
      "type": "number",
      "locked": true,
    },
    "faceId": {
      "title": "Face Id",
      "description": "Face detection faceId",
      "type": "string",
      "language": "fr"
    },
    "poseType": {
      "title": "Pose Type",
      "description": "Face detection poseType [ -2: 'Low', -1: 'Left profile', 0: 'Frontal', 1: 'Right profile', 2: 'High' ]",
      "type": "number",
      "enum": [
        -2, -1, 0, 1, 2
      ],
      "default": 0
    }
  }
};

const faceDetectWithRef = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "inherited": {
    "master": {
      "description": "A representation of the master schema",
      "type": "object",
      "required": [
        "@context",
        "@type",
        "_schemaID"
      ],
      "properties": {
        "@context": {
          "format": "url",
          "type": "string",
          "description": "JSON-LD context",
          "locked": true
        },
        "@type": {
          "type": "string",
          "description": "JSON-LD type",
          "locked": true
        },
        "_schemaID": {
          "format": "url",
          "type": "string",
          "description": "Internal schema ID",
          "locked": true
        }
      }
    }
  },
  "allOf": {
    "$ref": "#/inherited/master"
  },
  "properties": {
    "begin": {
      "format": "date-time-local",
      "type": "string",
      "description": "Annotation starting time",
      "locked": true
    },
    "end": {
      "format": "date-time-local",
      "type": "string",
      "description": "Annotation ending time",
      "locked": true
    },
    "confidence": {
      "maximum": "100",
      "minimum": "0",
      "type": "number",
      "locked": true
    },
    "faceId": {
      "title": "Face Id",
      "description": "Face detection faceId",
      "type": "string",
      "language": "fr"
    },
    "poseType": {
      "title": "Pose Type",
      "description": "Face detection poseType [ -2: 'Low', -1: 'Left profile', 0: 'Frontal', 1: 'Right profile', 2: 'High' ]",
      "type": "number",
      "enum": [-2, -1, 0, 1, 2],
      "default": 0
    }
  }
};

const token = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "Token_EN",
  "title": "Token_EN",
  "type": "object",
  "targetType": "text_document_surface",
  "description": "PACTE Tokenizer example",
  "required": [
    "@context",
    "@type",
    "_schemaID",
    "length",
    "kind",
    "string"
  ],
  "properties": {
    "@context": {
      "format": "url",
      "type": "string",
      "description": "JSON-LD context",
      "locked": true
    },
    "@type": {
      "type": "string",
      "description": "JSON-LD type",
      "locked": true
    },
    "_schemaID": {
      "type": "string",
      "description": "Internal schema GUID",
      "locked": true
    },
    "category": {
      "type": "string",
      "enum": [
        "CC",
        "CD",
        "DT",
        "EX",
        "FW",
        "IN",
        "JJ",
        "JJR",
        "JJS",
        "LS",
        "MD",
        "NN",
        "NNS",
        "NNP",
        "NNPS",
        "PDT",
        "POS",
        "PRP",
        "PRP$",
        "RB",
        "RBR",
        "RBS",
        "RP",
        "SYM",
        "TO",
        "UH",
        "VB",
        "VBD",
        "VBG",
        "VBN",
        "VBP",
        "VBZ",
        "WDT",
        "WP",
        "WP$",
        "WRB"
      ],
      "description": " vers le tagset?"
    },
    "kind": {
      "description": "",
      "type": "string"
    },
    "length": {
      "description": "",
      "type": "integer",
      "minimum": 0
    },
    "orth": {
      "type": "string",
      "description": "",
      "enum": [
        "upperInitial",
        "allCaps", "lowercase"]
    },
    "string": {
      "type": "string",
      "description": ""
    },
    "lemma": {
      "type": "string",
      "description": ""
    },
    "gender": {
      "type": "string",
      "description": ""
    },
    "number": {
      "type": "string",
      "description": ""
    }
  }
};

var v5WithData = {
  "properties": {
    "smaller": {
      "type": "number",
      "maximum": {
        "$data": "1/larger"
      }
    },
    "larger": {"type": "number"}
  }
}

module.exports = {
  faceDetect: faceDetect,
  faceDetectWithRef: faceDetectWithRef,
  token: token,
  v5WithData: v5WithData
};