import Mailjet from 'node-mailjet';

import { IUserModelWithId } from '@/models/user';

const ALL_USERS_LIST_ID = 73996;
const FROM_EMAIL = 'admin@batarienergy.com';
const FROM_NAME = 'Ardhi from Batari';
const TEMPLATES = {
  WELCOME: {
    id: 4743287,
    subject: () => '[Batari] Welcome to Batari'
  },
  FORGOT_PASSWORD: {
    id: 5102686,
    subject: () => '[Batari] Reset your password'
  },
  RESET_PASSWORD: {
    id: 5102711,
    subject: () => '[Batari] Your password successfully reset'
  },
  INVITATION_SIGNUP: {
    id: 5102734,
    subject: (companyName: string) =>
      `[Batari] Signup and join ${companyName}`
  },
  WORKSPACE_OWNERSHIP: {
    id: 5102787,
    subject: (workspaceName: string) =>
      `[Batari] You are now the manager of ${workspaceName}`
  }
};

const initMailjet = () => {
  return new Mailjet({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_API_SECRET
  });
};

const sendEmail = async (data: any) => {
  const mailjet = initMailjet();

  await mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: FROM_EMAIL,
          Name: FROM_NAME
        },
        TemplateLanguage: true,
        ...data
      }
    ]
  });
};

export const addContact = async (user: IUserModelWithId) => {
  const mailjet = initMailjet();
  const contact = await mailjet.post('contact', { version: 'v3' }).request({
    Name: user.name,
    Email: user.email
  });

  // @ts-ignore
  const contactId = contact.body.Data[0].ID;

  await mailjet.post('listrecipient', { version: 'v3' }).request({
    IsUnsubscribed: 'true',
    ContactID: contactId,
    ListID: ALL_USERS_LIST_ID
  });
};

export const sendWelcomeEmail = async (user: IUserModelWithId) => {
  await sendEmail({
    To: [
      {
        Email: user.email,
        Name: user.name
      }
    ],
    TemplateID: TEMPLATES.WELCOME.id,
    Subject: TEMPLATES.WELCOME.subject(),
    Variables: { name: user.name }
  });
};

export const sendForgotPasswordEmail = async (
  user: IUserModelWithId,
  token?: string
) => {
  const link = `${process.env.MAILJET_BASE_URL}/reset-password/${token}`;
  await sendEmail({
    To: [
      {
        // Email: 'support+2666316@mailjet.com',
        Email: user.email,
        Name: user.name
      }
    ],
    TemplateID: TEMPLATES.FORGOT_PASSWORD.id,
    Subject: TEMPLATES.FORGOT_PASSWORD.subject(),
    Variables: { name: user.name, link }
  });
};

export const sendSuccesfullResetPasswordEmail = async (
  user: IUserModelWithId
) => {
  await sendEmail({
    To: [
      {
        Email: user.email,
        Name: user.name
      }
    ],
    TemplateID: TEMPLATES.RESET_PASSWORD.id,
    Subject: TEMPLATES.RESET_PASSWORD.subject(),
    Variables: { name: user.name }
  });
};

export const sendInvitationSignUpEmail = async (
  email: string,
  companyName = 'Your Company',
  token: string
) => {
  const link = `${process.env.MAILJET_BASE_URL}/invitation/${token}`;
  await sendEmail({
    To: [
      {
        Email: email
      }
    ],
    TemplateID: TEMPLATES.INVITATION_SIGNUP.id,
    Subject: TEMPLATES.INVITATION_SIGNUP.subject(companyName),
    Variables: { link, companyName }
  });
};

export const sendOwnershipEmail = async (
  newOwnerEmail: string | undefined,
  newOwnerName: string | undefined,
  workspaceName: string
) => {
  if (!newOwnerEmail) {
    return;
  }

  await sendEmail({
    To: [
      {
        Email: newOwnerEmail
      }
    ],
    TemplateID: TEMPLATES.WORKSPACE_OWNERSHIP.id,
    Subject: TEMPLATES.WORKSPACE_OWNERSHIP.subject(workspaceName),
    Variables: {
      name: newOwnerName,
      workspace: workspaceName
    }
  });
};
