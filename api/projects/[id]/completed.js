const queryVariables = require(`../../_lib/get-query-vars`)
const { CLAIMS } = require(`@qnzl/auth`)
const authCheck = require(`../../_lib/auth`)
const fetch = require(`node-fetch`)

const todoistKey = process.env.TODOIST_KEY

const handler = async (req, res) => {
  const accessToken = req.headers[`x-todoist-access-token`]

  const {
    id
  } = req.query

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

module.exports = (req, res) => {
  return authCheck(CLAIMS.todoist.dump)(req, res, handler)
}

