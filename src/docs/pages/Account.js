const generator = require('../generator')

exports.title = 'Account'
exports.description =
  'This page covers everything related to authentication'

exports.content = [
  generator(
    'Get an OTP to verify your email',
    'post',
    '/account/request-email-verify',
    {
      body: [
        {
          key: 'email',
          required: true,
          type: String,
        },
      ],
    }
  ),

  generator('Signup', 'post', '/account/signup', {
    body: [
      {
        key: 'email',
        required: true,
        type: String,
      },
      {
        key: 'username',
        required: true,
        type: String,
      },
      {
        key: 'name',
        required: true,
        type: String,
      },
      {
        key: 'image',
        type: String,
      },
      {
        key: 'password',
        required: true,
        type: String,
      },
      {
        key: 'code',
        required: true,
        type: String,
      },
    ],
  }),

  generator('Login', 'post', '/account/login', {
    body: [
      {
        key: 'login',
        required: true,
        type: String,
        des: 'login should contain `email` or `username`',
      },
      {
        key: 'password',
        required: true,
        type: String,
      },
    ],
  }),

  generator('Forget Password', 'post', '/account/password-forget', {
    body: [
      {
        key: 'login',
        required: true,
        type: String,
        des: 'login should contain `email` or `username`',
      },
    ],
  }),

  generator('Reset Password', 'post', '/account/password-reset', {
    body: [
      {
        key: 'login',
        required: true,
        type: String,
        des: 'login should contain `email` or `username`',
      },
      {
        key: 'code',
        required: true,
        type: String,
        des: 'The code you received in the email',
      },
      {
        key: 'new_password',
        required: true,
        type: String,
      },
    ],
  }),

  generator('Update Email', 'patch', '/account/change-email', {
    body: [
      {
        key: 'password',
        required: true,
        type: String,
      },
      {
        key: 'new_email',
        required: true,
        type: String,
        des: 'new email',
      },
      {
        key: 'code',
        required: true,
        type: String,
        des: 'The code you received in the email',
      },
    ],
  }),

  generator('Update Username', 'patch', '/account/change-username', {
    body: [
      {
        key: 'password',
        required: true,
        type: String,
        des: 'current password',
      },
      {
        key: 'new_username',
        required: true,
        type: String,
        des: 'new username',
      },
    ],
  }),

  generator('Update Password', 'patch', '/account/change-password', {
    body: [
      {
        key: 'password',
        required: true,
        type: String,
        des: 'current password',
      },
      {
        key: 'new_password',
        required: true,
        type: String,
        des: 'new password',
      },
    ],
  }),
]