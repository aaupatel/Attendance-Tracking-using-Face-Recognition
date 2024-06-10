const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN;  

const client = twilio(accountSid, authToken);

function sendWhatsAppMessage(to, body) {
    client.messages.create({
        from: 'whatsapp:+15188400563',
        to:`whatsapp:+91${to}`,
        body: body
    }).then(message => {
        console.log(`Message sent: ${message}`);
    }).catch(error => {
        console.error('Error sending WhatsApp message:', error);
    });
}

module.exports = sendWhatsAppMessage;