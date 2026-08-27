const nodemailer = require('nodemailer');

function getTransporter() {
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'APP_URL'];
    const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

    if (missingEnvVars.length > 0) {
        throw new Error(`Configuração de e-mail ausente: ${missingEnvVars.join(', ')}`);
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
}

async function enviarEmailConfirmacao(email, token) {
    const confirmationUrl = new URL('/verificar-email', process.env.APP_URL);
    confirmationUrl.searchParams.set('token', token);

    await getTransporter().sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Confirme seu e-mail no PetCare Connect',
        text: `Confirme seu e-mail acessando: ${confirmationUrl.toString()}`,
        html: `<p>Olá!</p><p>Confirme seu e-mail para ativar sua conta no PetCare Connect.</p><p><a href="${confirmationUrl.toString()}">Confirmar meu e-mail</a></p><p>Este link expira em 24 horas.</p>`
    });
}

module.exports = { enviarEmailConfirmacao };
