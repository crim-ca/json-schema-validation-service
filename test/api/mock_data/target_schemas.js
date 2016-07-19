var corpus = {
    "$schema": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "id": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "targetType": "corpus",
    "title": "Corpus",
    "description": "Corpus target schema",
    "type": "object",
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
        "_corpusID": {
            "type": "string",
            "description": "Internal Corpus GUID",
            "locked": true
        }
    }
};
var document = {
    "$schema": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "id": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "targetType": "document",
    "title": "Document",
    "description": "Document target schema",
    "type": "object",
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
                "description": "Internal schema ID",
                "locked": true
        },
        "_documentID": {
            "type": "string",
                "description": "Internal document GUID"
        }
    }
};
var text_document_surface = {
    "$schema": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "id": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "targetType": "text_document_surface",
    "title": "Text document surface",
    "description": "Text document surface schema",
    "type": "object",
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
        },
        "offsets": {
            "type": "array",
                "minItems": 1,
                "items": {
                "maxItems": 2,
                    "minItems": 2,
                    "type": "array",
                    "items": {
                    "type": "number"
                }
            }
        }
    }
};
var multimedia_document_content = {
    "$schema": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "id": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "title": "Multimedia document content",
    "description": "Multimedia document content schema",
    "targetType": "multimedia_document_content",
    "type": "object",
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
        },
        "begin": {
            "type": "number",
                "description": "Annotation starting time in miliseconds"
        },
        "end": {
            "type": "number",
                "description": "Annotation ending time in miliseconds"
        },
        "confidence": {
            "maximum": 100,
                "minimum": 0,
                "type": "number",
                "description": "Confidence degree"
        }
    }
};

const master = {
    "$schema": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "id": "http://adnotare.crim.ca/schema/custom-meta-schema#",
    "description": "A representation of the master schema",
    "type": "object",
    "required": [
        "@context",
        "@type"
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
};

module.exports = {
    corpus: corpus,
    document: document,
    text_document_surface: text_document_surface,
    multimedia_document_content: multimedia_document_content,
    master: master
};