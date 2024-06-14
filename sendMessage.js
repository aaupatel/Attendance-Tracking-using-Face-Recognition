require('dotenv').config();
const axios = require('axios');

const sendWhatsAppMessage = async (to, message) => {
    const apiKey = process.env.PERISKOPE_API_KEY; // Your PERISKOPE_API_KEY
    const xPhone = process.env.PERISKOPE_X_PHONE; // Your organization phone number
    const url = 'https://api.periskope.app/v1/message/send';
    
    const chatId = `91${to.replace('+', '').replace(/\s+/g, '')}@c.us`;
    //console.log(chatId);
    const payload = {
        message: message,
        chat_id: chatId
    };
    
    try {
        const response = await axios.post(url, payload, {
            headers: {
                'x-phone': xPhone, 
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`Message sent: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.error('Error response:', error.response ? error.response.data : error.message);
    }
};

module.exports = sendWhatsAppMessage;