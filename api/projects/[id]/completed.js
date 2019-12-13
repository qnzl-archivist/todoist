const queryVariables = require(`./_lib/get-query-vars`)
const fetch = require(`node-fetch`)
const auth = require(`@qnzl/auth`)

const { CLAIMS } = auth

const todoistKey = process.env.TODOIST_KEY

module.exports = async (req, res) => {
  const {
    authorization,
  } = req.headers

  const accessToken = req.headers[`x-todoist-access-token`]

  const {
    id
  } = req.query

  const isTokenValid = auth.checkJWT(authorization, CLAIMS.todoist.dump, `watchers`, process.env.ISSUER)

  if (!isTokenValid) {
    return res.status(401).send()
  }

  let tasks
  try {
    console.log(`getting completed activity`)

    const query = queryVariables(Object.assign({ project_id: id }, req.query))
    const response = await fetch(`https://api.todoist.com/sync/v8/completed/get_all${query}`, {
        method: `GET`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

    const { items } = await response.json()

    return res.json(items)
  } catch (e) {
    console.log(`failed to get tasks`, e)

    return res.status(500).send()
  }
}



