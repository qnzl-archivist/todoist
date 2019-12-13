const fetch = require(`node-fetch`)
const auth = require(`@qnzl/auth`)

const { CLAIMS } = auth

const clientId = process.env.TODOIST_CLIENT_ID

module.exports = async (req, res) => {
  const {
    authorization
  } = req.headers

  const {
    projectId = ''
  } = req.query

  const isTokenValid = auth.checkJWT(authorization, CLAIMS.todoist.get.oauthRoute, `watchers`, process.env.ISSUER)

  if (!isTokenValid) {
    return res.status(401).send()
  }

  const requestUrl = `https://todoist.com/oauth/authorize?client_id=${clientId}&scope=data:read,data:delete&state=${Number(new Date())}`

  return res.send(requestUrl)
}

