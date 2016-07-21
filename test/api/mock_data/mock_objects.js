var v5 = {
    smaller: 5,
    larger: 7
};

const faceInvalid = {
  'begin': 12345,
  'confidence': 'http://www.crim.ca/schema/face/confidence.html',
  'faceId': 'http://www.crim.ca/schema/face/faceId.html',
  'poseType': 'http://www.crim.ca/schema/face/poseType.html',
};

const faceValid = {
    "@context" : "http://test.com",
    "@type": "json-ld type",
    "_bucketID": "ABCD",
    "_schemaType": "XYZ",
    'begin': 12345,
    'end': 123456,
    'confidence': 15,
    'faceId': 'http://www.crim.ca/schema/face/faceId.html',
    'poseType': 'http://www.crim.ca/schema/face/poseType.html',
};

module.exports = {
    v5: v5,
    faceValid: faceValid,
    faceInvalid: faceInvalid
};