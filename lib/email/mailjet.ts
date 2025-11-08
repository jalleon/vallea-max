// Mailjet email service for Valea Max
// Handles transactional emails with bilingual support (FR/EN)

import Mailjet from 'node-mailjet'

// Lazy initialization - only create client when actually sending email
let mailjetClient: any = null

const getMailjetClient = () => {
  if (!mailjetClient) {
    mailjetClient = new Mailjet({
      apiKey: process.env.MAILJET_API_KEY || '',
      apiSecret: process.env.MAILJET_SECRET_KEY || ''
    })
  }
  return mailjetClient
}

export interface EmailTemplate {
  to: string
  toName?: string
  subject: string
  htmlContent: string
  textContent?: string
}

export const emailService = {
  /**
   * Send a generic email
   */
  sendEmail: async ({ to, toName, subject, htmlContent, textContent }: EmailTemplate) => {
    try {
      const mailjet = getMailjetClient()
      const response = await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_FROM_EMAIL!,
              Name: process.env.MAILJET_FROM_NAME!
            },
            To: [
              {
                Email: to,
                Name: toName || ''
              }
            ],
            Subject: subject,
            TextPart: textContent || '',
            HTMLPart: htmlContent
          }
        ]
      })

      console.log(`Email sent successfully to ${to}`)
      return { success: true, data: response.body }
    } catch (error: any) {
      console.error('Mailjet send error:', error.statusCode, error.message)
      return { success: false, error }
    }
  },

  /**
   * Send welcome email to new users (bilingual: FR/EN)
   */
  sendWelcomeEmail: async (userEmail: string, userName: string, locale: string) => {
    const isEnglish = locale === 'en'

    const subject = isEnglish
      ? 'Welcome to Valea Max!'
      : 'Bienvenue chez Valea Max!'

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1A1F36;
      background-color: #F5F3EE;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #1A1F36;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      color: #4A5568;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .footer {
      background: #F5F3EE;
      padding: 30px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
    }
    .features {
      background: #F9FAFB;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .features ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .features li {
      padding: 8px 0;
      color: #4A5568;
    }
    .features li:before {
      content: "✓ ";
      color: #10B981;
      font-weight: bold;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isEnglish ? 'Welcome to Valea Max!' : 'Bienvenue chez Valea Max!'}</h1>
    </div>

    <div class="content">
      <h2>${isEnglish ? `Hello ${userName}!` : `Bonjour ${userName}!`}</h2>

      <p>
        ${isEnglish
          ? 'Thank you for joining Valea Max, the professional real estate appraisal platform powered by artificial intelligence.'
          : 'Merci de rejoindre Valea Max, la plateforme professionnelle d\'évaluation immobilière propulsée par l\'intelligence artificielle.'
        }
      </p>

      <div class="features">
        <strong>${isEnglish ? 'What you can do with Valea Max:' : 'Ce que vous pouvez faire avec Valea Max :'}</strong>
        <ul>
          <li>${isEnglish ? 'Manage your property library' : 'Gérer votre bibliothèque de propriétés'}</li>
          <li>${isEnglish ? 'Perform detailed inspections' : 'Effectuer des inspections détaillées'}</li>
          <li>${isEnglish ? 'Import data from PDF documents with AI' : 'Importer des données depuis des PDF avec l\'IA'}</li>
          <li>${isEnglish ? 'Create CUSPAP/OEAQ compliant appraisals' : 'Créer des évaluations conformes CUSPAP/OEAQ'}</li>
          <li>${isEnglish ? 'Generate professional reports' : 'Générer des rapports professionnels'}</li>
        </ul>
      </div>

      <p>
        ${isEnglish
          ? 'Get started by creating your first property or importing data from existing documents.'
          : 'Commencez dès maintenant en créant votre première propriété ou en important des données depuis vos documents existants.'
        }
      </p>

      <center>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">
          ${isEnglish ? 'Go to Dashboard' : 'Accéder au tableau de bord'}
        </a>
      </center>

      <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">
        ${isEnglish
          ? 'Need help? Reply to this email or visit our support center.'
          : 'Besoin d\'aide ? Répondez à cet e-mail ou visitez notre centre d\'aide.'
        }
      </p>
    </div>

    <div class="footer">
      <p>
        © ${new Date().getFullYear()} Valea Max<br>
        ${isEnglish ? 'Professional Real Estate Appraisal Platform' : 'Plateforme professionnelle d\'évaluation immobilière'}
      </p>
    </div>
  </div>
</body>
</html>
    `

    const textContent = isEnglish
      ? `Welcome to Valea Max!\n\nHello ${userName}!\n\nThank you for joining Valea Max. Get started by visiting your dashboard at ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
      : `Bienvenue chez Valea Max!\n\nBonjour ${userName}!\n\nMerci de rejoindre Valea Max. Commencez dès maintenant en visitant votre tableau de bord : ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`

    return emailService.sendEmail({
      to: userEmail,
      toName: userName,
      subject,
      htmlContent,
      textContent
    })
  },

  /**
   * Send password reset email (bilingual: FR/EN)
   */
  sendPasswordResetEmail: async (userEmail: string, resetLink: string, locale: string) => {
    const isEnglish = locale === 'en'

    const subject = isEnglish
      ? 'Reset Your Password - Valea Max'
      : 'Réinitialisez votre mot de passe - Valea Max'

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1A1F36;
      background-color: #F5F3EE;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      color: #4A5568;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .warning {
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 16px;
      margin: 20px 0;
      border-radius: 8px;
      font-size: 14px;
      color: #92400E;
    }
    .footer {
      background: #F5F3EE;
      padding: 30px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isEnglish ? 'Password Reset Request' : 'Demande de réinitialisation du mot de passe'}</h1>
    </div>

    <div class="content">
      <p>
        ${isEnglish
          ? 'You recently requested to reset your password for your Valea Max account.'
          : 'Vous avez récemment demandé la réinitialisation de votre mot de passe pour votre compte Valea Max.'
        }
      </p>

      <p>
        ${isEnglish
          ? 'Click the button below to reset your password. This link will expire in 1 hour.'
          : 'Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. Ce lien expirera dans 1 heure.'
        }
      </p>

      <center>
        <a href="${resetLink}" class="button">
          ${isEnglish ? 'Reset Password' : 'Réinitialiser le mot de passe'}
        </a>
      </center>

      <div class="warning">
        <strong>${isEnglish ? '⚠️ Security Notice' : '⚠️ Avis de sécurité'}</strong><br>
        ${isEnglish
          ? 'If you didn\'t request this password reset, please ignore this email. Your password will remain unchanged.'
          : 'Si vous n\'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail. Votre mot de passe restera inchangé.'
        }
      </div>

      <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
        ${isEnglish
          ? 'If the button doesn\'t work, copy and paste this link into your browser:'
          : 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :'
        }<br>
        <a href="${resetLink}" style="color: #10B981; word-break: break-all;">${resetLink}</a>
      </p>
    </div>

    <div class="footer">
      <p>
        © ${new Date().getFullYear()} Valea Max<br>
        ${isEnglish ? 'Professional Real Estate Appraisal Platform' : 'Plateforme professionnelle d\'évaluation immobilière'}
      </p>
    </div>
  </div>
</body>
</html>
    `

    const textContent = isEnglish
      ? `Password Reset Request\n\nClick this link to reset your password: ${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`
      : `Demande de réinitialisation du mot de passe\n\nCliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}\n\nCe lien expire dans 1 heure.\n\nSi vous n'avez pas demandé cela, veuillez ignorer cet e-mail.`

    return emailService.sendEmail({
      to: userEmail,
      subject,
      htmlContent,
      textContent
    })
  },

  /**
   * Add email to waitlist (for landing page)
   */
  addToWaitlist: async (email: string, name: string, locale: string) => {
    const isEnglish = locale === 'en'

    const subject = isEnglish
      ? 'You\'re on the Valea Max Waitlist!'
      : 'Vous êtes sur la liste d\'attente Valea Max!'

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1A1F36;
      background-color: #F5F3EE;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .footer {
      background: #F5F3EE;
      padding: 30px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isEnglish ? 'You\'re In!' : 'Vous êtes inscrit !'}</h1>
    </div>

    <div class="content">
      <h2>${isEnglish ? `Thank you, ${name}!` : `Merci, ${name}!`}</h2>
      <p>
        ${isEnglish
          ? 'You\'ve been added to the Valea Max waitlist. We\'ll notify you as soon as we launch!'
          : 'Vous avez été ajouté à la liste d\'attente Valea Max. Nous vous informerons dès le lancement !'
        }
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Valea Max</p>
    </div>
  </div>
</body>
</html>
    `

    const textContent = isEnglish
      ? `Thank you, ${name}!\n\nYou've been added to the Valea Max waitlist. We'll notify you as soon as we launch!\n\n© ${new Date().getFullYear()} Valea Max`
      : `Merci, ${name}!\n\nVous avez été ajouté à la liste d'attente Valea Max. Nous vous informerons dès le lancement !\n\n© ${new Date().getFullYear()} Valea Max`

    return emailService.sendEmail({
      to: email,
      toName: name,
      subject,
      htmlContent,
      textContent
    })
  },

  /**
   * Send email verification link (bilingual: FR/EN)
   */
  sendEmailVerification: async (userEmail: string, userName: string, verificationLink: string, locale: string) => {
    const isEnglish = locale === 'en'

    const subject = isEnglish
      ? 'Verify Your Email - Valea Max'
      : 'Vérifiez votre adresse e-mail - Valea Max'

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1A1F36;
      background-color: #F5F3EE;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #1A1F36;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      color: #4A5568;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .info-box {
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 16px;
      margin: 20px 0;
      border-radius: 8px;
      font-size: 14px;
      color: #92400E;
    }
    .footer {
      background: #F5F3EE;
      padding: 30px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isEnglish ? 'Verify Your Email' : 'Vérifiez votre adresse e-mail'}</h1>
    </div>

    <div class="content">
      <h2>${isEnglish ? `Hello ${userName}!` : `Bonjour ${userName}!`}</h2>

      <p>
        ${isEnglish
          ? 'Thank you for signing up for Valea Max! To complete your registration and access your account, please verify your email address by clicking the button below.'
          : 'Merci de vous être inscrit à Valea Max ! Pour compléter votre inscription et accéder à votre compte, veuillez vérifier votre adresse e-mail en cliquant sur le bouton ci-dessous.'
        }
      </p>

      <center>
        <a href="${verificationLink}" class="button">
          ${isEnglish ? 'Verify Email Address' : 'Vérifier l\'adresse e-mail'}
        </a>
      </center>

      <div class="info-box">
        <strong>${isEnglish ? '⏱️ This link expires in 30 minutes' : '⏱️ Ce lien expire dans 30 minutes'}</strong><br>
        ${isEnglish
          ? 'For security reasons, this verification link will expire in 30 minutes. If it expires, you can request a new one.'
          : 'Pour des raisons de sécurité, ce lien de vérification expirera dans 30 minutes. S\'il expire, vous pouvez en demander un nouveau.'
        }
      </div>

      <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
        ${isEnglish
          ? 'If the button doesn\'t work, copy and paste this link into your browser:'
          : 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :'
        }<br>
        <a href="${verificationLink}" style="color: #10B981; word-break: break-all;">${verificationLink}</a>
      </p>

      <p style="font-size: 14px; color: #6B7280; margin-top: 20px;">
        ${isEnglish
          ? 'If you didn\'t create an account with Valea Max, you can safely ignore this email.'
          : 'Si vous n\'avez pas créé de compte avec Valea Max, vous pouvez ignorer cet e-mail en toute sécurité.'
        }
      </p>
    </div>

    <div class="footer">
      <p>
        © ${new Date().getFullYear()} Valea Max<br>
        ${isEnglish ? 'Professional Real Estate Appraisal Platform' : 'Plateforme professionnelle d\'évaluation immobilière'}
      </p>
    </div>
  </div>
</body>
</html>
    `

    const textContent = isEnglish
      ? `Verify Your Email - Valea Max\n\nHello ${userName}!\n\nThank you for signing up! Please verify your email address by clicking this link:\n\n${verificationLink}\n\nThis link expires in 30 minutes.\n\nIf you didn't create an account, please ignore this email.\n\n© ${new Date().getFullYear()} Valea Max`
      : `Vérifiez votre adresse e-mail - Valea Max\n\nBonjour ${userName}!\n\nMerci de vous être inscrit ! Veuillez vérifier votre adresse e-mail en cliquant sur ce lien :\n\n${verificationLink}\n\nCe lien expire dans 30 minutes.\n\nSi vous n'avez pas créé de compte, veuillez ignorer cet e-mail.\n\n© ${new Date().getFullYear()} Valea Max`

    return emailService.sendEmail({
      to: userEmail,
      toName: userName,
      subject,
      htmlContent,
      textContent
    })
  },

  /**
   * Send demo request confirmation email (bilingual: FR/EN)
   */
  sendDemoRequest: async (email: string, name: string, company: string | null, phone: string | null, message: string | null, locale: string) => {
    const isEnglish = locale === 'en'

    const subject = isEnglish
      ? 'Demo Request Received - Valea Max'
      : 'Demande de démo reçue - Valea Max'

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1A1F36;
      background-color: #F5F3EE;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #1A1F36;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      color: #4A5568;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .info-box {
      background: #F9FAFB;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-box p {
      margin: 8px 0;
      color: #1A1F36;
      font-size: 14px;
    }
    .footer {
      background: #F5F3EE;
      padding: 30px;
      text-align: center;
      color: #6B7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isEnglish ? 'Demo Request Received' : 'Demande de démo reçue'}</h1>
    </div>

    <div class="content">
      <h2>${isEnglish ? `Thank you, ${name}!` : `Merci, ${name}!`}</h2>

      <p>
        ${isEnglish
          ? 'We\'ve received your demo request for Valea Max. Our team will review your information and contact you within 24 hours to schedule a personalized demo.'
          : 'Nous avons bien reçu votre demande de démo pour Valea Max. Notre équipe examinera vos informations et vous contactera dans les 24 heures pour planifier une démo personnalisée.'
        }
      </p>

      <div class="info-box">
        <strong>${isEnglish ? 'Your Request Details:' : 'Détails de votre demande :'}</strong>
        <p><strong>${isEnglish ? 'Name:' : 'Nom :'}</strong> ${name}</p>
        <p><strong>${isEnglish ? 'Email:' : 'Courriel :'}</strong> ${email}</p>
        ${company ? `<p><strong>${isEnglish ? 'Company:' : 'Entreprise :'}</strong> ${company}</p>` : ''}
        ${phone ? `<p><strong>${isEnglish ? 'Phone:' : 'Téléphone :'}</strong> ${phone}</p>` : ''}
        ${message ? `<p><strong>${isEnglish ? 'Message:' : 'Message :'}</strong> ${message}</p>` : ''}
      </div>

      <p>
        ${isEnglish
          ? 'During your demo, you\'ll discover how Valea Max can help you manage your real estate appraisals with precision and efficiency.'
          : 'Lors de votre démo, vous découvrirez comment Valea Max peut vous aider à gérer vos évaluations immobilières avec précision et efficacité.'
        }
      </p>

      <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">
        ${isEnglish
          ? 'Questions? Reply to this email and we\'ll be happy to help.'
          : 'Des questions ? Répondez à cet e-mail et nous serons ravis de vous aider.'
        }
      </p>
    </div>

    <div class="footer">
      <p>
        © ${new Date().getFullYear()} Valea Max<br>
        ${isEnglish ? 'Professional Real Estate Appraisal Platform' : 'Plateforme professionnelle d\'évaluation immobilière'}
      </p>
    </div>
  </div>
</body>
</html>
    `

    const textContent = isEnglish
      ? `Demo Request Received - Valea Max\n\nThank you, ${name}!\n\nWe've received your demo request. Our team will contact you within 24 hours to schedule a personalized demo.\n\nYour Details:\nName: ${name}\nEmail: ${email}${company ? `\nCompany: ${company}` : ''}${phone ? `\nPhone: ${phone}` : ''}${message ? `\nMessage: ${message}` : ''}\n\n© ${new Date().getFullYear()} Valea Max`
      : `Demande de démo reçue - Valea Max\n\nMerci, ${name}!\n\nNous avons bien reçu votre demande de démo. Notre équipe vous contactera dans les 24 heures pour planifier une démo personnalisée.\n\nVos informations:\nNom: ${name}\nCourriel: ${email}${company ? `\nEntreprise: ${company}` : ''}${phone ? `\nTéléphone: ${phone}` : ''}${message ? `\nMessage: ${message}` : ''}\n\n© ${new Date().getFullYear()} Valea Max`

    return emailService.sendEmail({
      to: email,
      toName: name,
      subject,
      htmlContent,
      textContent
    })
  }
}
