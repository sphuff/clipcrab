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
            ACL: 'public-read',
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

    static uploadTranscoding = (filePath, fileName) => {
        // Read content from the file
        const fileContent = fs.readFileSync(filePath);
    
        // Setting up S3 upload parameters
        const params = {
            Bucket: 'podcast-clipper-transcoder-lambda-records',
            ACL: 'public-read',
            Key: fileName, // File name you want to save as in S3
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

    static getTranscodedFile = (fileName) => {
        const params = {
            Bucket: 'podcast-clipper-transcoder-lambda-transcode',
            Key: fileName,
        };
        const signedUrlExpireSeconds = 60 * 5;
        return new Promise((resolve, reject) => {
            this.s3Interval = setInterval(() => {
                s3.headObject(params, (err, data) => {
                    if (err && err.code === 'NotFound') {  
                        // Handle no object on cloud here  
                        console.log('transcode not there yet');
                    } else {
                        clearInterval(this.s3Interval);
                        this.s3Interval = null;
                        const contentDisposition = `attachment; filename=${fileName}`;
                        const url = s3.getSignedUrl('getObject', {
                            Bucket: 'podcast-clipper-transcoder-lambda-transcode',
                            Key: fileName,
                            ResponseContentDisposition: contentDisposition,
                            Expires: signedUrlExpireSeconds,
                        });
                        resolve(url);
                    }
                });
            }, 3000);
        })
    }
}
