import * as twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export default class SmsService {
    static async sendTextToSelf(message) {
        if (process.env.NODE_ENV !== 'production') {
            return;
        }
        try {
            console.log('twilio sid', accountSid, authToken);
            return client.messages.create({
                body: message,
                from: '+16152402816',
                to: '+16152027053'
            });
        } catch(err) {
            console.log('There was an error sending an SMS', err.message);
        }
    }
}