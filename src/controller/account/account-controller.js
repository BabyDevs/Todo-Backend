const User = require('../../model/user-model')
const VerifyEmail = require('../../model/otp-verify-email-model')
const ForgetPass = require('../../model/otp-forget-pass-model')
const generateOtp = require('../../utils/generate-otp')
const sendMail = require('../../mail/send-mail')
const errorMessages = require('../../utils/error-messages')
const jwtToken = require('../../utils/jwt-token')
const factory = require('./factory')
const socketStore = require('../../core/socket-store')
const {
  sendUserAndJWT,
  getFindUserQuery,
  createOrUpdateCode,
} = require('../../utils/account')

exports.checkUserMiddleware = async (req, res, next) => {
  const [token] = req.headers.authorization?.match(/\S*$/)
  const tokenInfo = jwtToken.verify(token)
  const user = await User.findById(tokenInfo.id)

  if (!user) {
    throw new ReqError(errorMessages.user.deleted)
  }
  if (user.passwordChangedAfter(token.iat)) {
    throw new ReqError(errorMessages.auth.jwtExpire)
  }

  req.user = user
  next()
}

exports.checkPassAfterSignedinMiddleWare = async (req, res, next) => {
  const ok = await req.user.checkPassword(req.body.password)
  if (!ok) throw new ReqError(errorMessages.password.wrong)
  next()
}

exports.verifyEmailCodeMiddleware = async (req, res, next) => {
  const { email, code } = req.body
  const verifyEmailRequest = await VerifyEmail.findOne({ email })
  if (!verifyEmailRequest) {
    throw new ReqError(errorMessages.otp.notExists)
  }
  if (!(await verifyEmailRequest.checkCode(code))) {
    throw new ReqError(errorMessages.otp.wrong)
  }
  req.otpRequest = verifyEmailRequest
  next()
}

exports.requestEmailVerify = async (req, res) => {
  const { email } = req.body

  if (await User.findOne({ email })) {
    throw new ReqError(errorMessages.email.duplicate)
  }

  const existingRequest = await VerifyEmail.findOne({ email })
  const code = generateOtp(6)
  await createOrUpdateCode(existingRequest, VerifyEmail, { email, code })
  sendMail.verifyEmailCode(email, code).catch(() => {})
  res.success({ email }, 201)
}

exports.signup = async (req, res) => {
  const { name, email, username, image, password } = req.body
  const user = await User.create({ name, email, username, image, password })
  await req.otpRequest.delete()
  sendUserAndJWT(res, user)
}

exports.login = async (req, res) => {
  const { email, username, password } = req.body
  if (!password) {
    throw new ReqError(errorMessages.password.fieldMissing)
  }

  const user = await User.findOne(getFindUserQuery(email, username))
  if (!user || !(await user.checkPassword(password))) {
    throw new ReqError(errorMessages.auth.failed)
  }

  sendUserAndJWT(res, user)
}

exports.forgetPassword = async (req, res) => {
  const { email, username } = req.body
  const user = await User.findOne(getFindUserQuery(email, username)).lean()
  const userId = user?._id

  res.success({
    email,
    message: `Email sent to ${email}, if the any user exists with the email`,
  })

  if (!userId) return

  try {
    const existingRequest = await ForgetPass.findById(userId)
    const code = generateOtp(8)
    await createOrUpdateCode(existingRequest, ForgetPass, { _id: userId, code })
    await sendMail.forgetPassCode(email, code)
  } catch (err) {
    console.warn(err)
  }
}

exports.resetPassword = async (req, res) => {
  const { email, username, code, new_password } = req.body
  const user = await User.findOne(getFindUserQuery(email, username))
  if (!user) throw new ReqError(errorMessages.user.notFound)

  const forgetPassRequest = await ForgetPass.findById(user._id)
  if (!forgetPassRequest) throw new ReqError(errorMessages.otp.notExists)
  if (!(await forgetPassRequest.checkCode(code))) {
    throw new ReqError(errorMessages.otp.wrong)
  }

  user.password = new_password
  await user.save()
  await forgetPassRequest.delete()
  sendUserAndJWT(res, user)
}

exports.changePassword = async (req, res) => {
  const { password, new_password } = req.body

  if (password !== new_password) {
    req.user.password = new_password
    await req.user.save()

    socketStore.disconnectExceptFromReq(req)
    sendUserAndJWT(res, req.user._id)
  } else throw new ReqError(errorMessages.extra.enteredExistingInfo('password'))
}

exports.changeEmail = factory.changeEmailAndUsername('email')
exports.changeUsername = factory.changeEmailAndUsername('username')
