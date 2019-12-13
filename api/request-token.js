const { URLSearchParams } = require(`url`)
const fetch = require(`node-fetch`)

module.exports = async (req, res) => {
  const { code } = req.query

  const body = new URLSearchParams()
  body.append(`code`, code)
  body.append(`grant_type`, `authorization_code`)
  body.append(`client_id`, process.env.TODOIST_CLIENT_ID)
  body.append(`client_secret`, process.env.TODOIST_CLIENT_SECRET)
  body.append(`redirect_uri`, `${process.env.TODOIST_REDIRECT_URL}/api/request-token`)

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

      // TODO Do something with the token
      console.log(`got todoist token: ${access_token}`)

      return res.status(200).send({ access_token, refresh_token })
    })
}
