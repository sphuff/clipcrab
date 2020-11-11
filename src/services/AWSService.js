const AWS = require('aws-sdk');
const fs = require('fs');
var s3 = new AWS.S3();

const BUCKET_NAME = 'podcast-clipper';
const STATUS_TRANSCODED = 'transcoded';
const STATUS_NOT_TRANSCODED = 'not transcoded';

module.exports = {
    STATUS_TRANSCODED: STATUS_TRANSCODED,
    STATUS_NOT_TRANSCODED: STATUS_NOT_TRANSCODED,
    AWSService: class AWSService {
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
    
        static getTranscodingStatus = (fileName) => {
            if (process.env.NODE_ENV !== 'production') {
                return STATUS_TRANSCODED;
            }
            const params = {
                Bucket: 'podcast-clipper-transcoder-lambda-transcode',
                Key: fileName,
            };
            return new Promise((resolve, reject) => {
                s3.headObject(params, (err, data) => {
                    if (err && err.code === 'NotFound') {  
                        // Handle no object on cloud here  
                        resolve(STATUS_NOT_TRANSCODED);
                    } else {
                        resolve(STATUS_TRANSCODED);
                    }
                });
            });
        }
    
        static getTranscodedFile = (fileName) => {
            if (process.env.NODE_ENV !== 'production') {
                return 'https://podcast-clipper.s3.amazonaws.com/mmbam-wizardmp3-2020-09-30T203501300Z-1.mp4';
            }
            const signedUrlExpireSeconds = 60 * 5;
            const contentDisposition = `attachment; filename=${fileName}`;
            const url = s3.getSignedUrl('getObject', {
                Bucket: 'podcast-clipper-transcoder-lambda-transcode',
                Key: fileName,
                ResponseContentDisposition: contentDisposition,
                Expires: signedUrlExpireSeconds,
            });
            return url;
        }
    }    
} 