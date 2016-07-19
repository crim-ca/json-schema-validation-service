const faceDetect = {
    "$schema": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "id": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "targetType": "multimedia_document_content",
    "title": "Face_Detect",
    "description": "A representation of a face detection in a video media file",
    "type": "object",
    "required": [
        "@context",
        "@type",
        "_familyType",
        "begin",
        "end",
        "annotationType",
        "confidence",
        "faceId",
        "poseType"
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

const token = {
    "$schema": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "id": "http://adnotare.crim.ca/schema/custom-meta-schema#",
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

module.exports = {
    token: token,
    faceDetect: faceDetect
};