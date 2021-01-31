const fetch = require(`node-fetch`)
const auth = require(`@qnzl/auth`)

const { CLAIMS } = auth

const {
  TODOIST_CLIENT_ID,
  ISSUER,
} = process.env

module.exports = async (req, res) => {
  const {
    authorization
  } = req.headers

  const {
    projectId = ''
  } = req.query

  if (!authorization) {
    return res.status(401).send()
  }

  const isTokenValid = auth.checkJWT(authorization, CLAIMS.todoist.get.oauthRoute, `watchers`, ISSUER)

  if (!isTokenValid) {
    return res.status(401).send()
  }

  const requestUrl = `https://todoist.com/oauth/authorize?client_id=${TODOIST_CLIENT_ID}&scope=data:read,data:delete&state=${Number(new Date())}`

  return res.send(requestUrl)
}

