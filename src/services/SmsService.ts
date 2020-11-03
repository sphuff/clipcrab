import fetch from 'node-fetch';

export default class SmsService {
    static async sendTextToSelf(message) {
        if (process.env.NODE_ENV !== 'production') {
            return;
        }
        const details = {
            phone: '6152027053',
            message,
            key: process.env.SMALLSMS_KEY,
        }
        const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&'); 
        const res = await fetch('https://smallsms.app/text', {
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            body: formBody,
        });
        
        const json = await res.json();
    }
}