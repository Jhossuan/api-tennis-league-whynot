import twilio from "twilio"

export const SendMessage = (phone: string, code: string) => {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

    client.messages
        .create({
            body: `Tu código de verificación es: ${code}`,
            from:'whatsapp:+14155238886',
            to: `whatsapp:${phone}`,
        })
        .then(message => console.log("Twilio Then", message.sid))
        .catch(error => console.error("Twilio Catch",error));
}