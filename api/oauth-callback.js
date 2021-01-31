const { URLSearchParams } = require(`url`)
const fetch = require(`node-fetch`)

const {
  TODOIST_CLIENT_ID,
  TODOIST_CLIENT_SECRET,
  TODOIST_BASE_REDIRECT_URL,
} = process.env

const REDIRECT_URL = `${TODOIST_BASE_REDIRECT_URL}/api/oauth-callback`

module.exports = async (req, res) => {
  const { code } = req.query

  const body = new URLSearchParams()
  body.append(`code`, code)
  body.append(`grant_type`, `authorization_code`)
  body.append(`client_id`, TODOIST_CLIENT_ID)
  body.append(`client_secret`, TODOIST_CLIENT_SECRET)
  body.append(`redirect_uri`, REDIRECT_URL)

  fetch(`https://todoist.com/oauth/access_token`, {
      method: `POST`,
      headers: {
        'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`
      },
      body
    })
    .then(async (response) => {
      const {
        access_token,
        expires_in,
        refresh_token,
        scope
      } = await response.json()

      return res.status(200).send({ access_token, refresh_token })
    })
}
