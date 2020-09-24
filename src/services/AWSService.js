const AWS = require('aws-sdk');
const fs = require('fs');
var s3 = new AWS.S3();

const BUCKET_NAME = 'podcast-clipper';

module.exports = class AWSService {
    static uploadFile = (filePath, fileName) => {
        // Read content from the file
        const fileContent = fs.readFileSync(filePath);
    
        // Setting up S3 upload parameters
        const params = {
            Bucket: BUCKET_NAME,
            Key: `uploads/${fileName}`, // File name you want to save as in S3
            Body: fileContent
        };
    
        // Uploading files to the bucket
        return new Promise((resolve, reject) => {
            s3.upload(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                console.log(`File uploaded successfully. ${data.Location}`);
                resolve(data.Location);
            });
        });
    };
}
