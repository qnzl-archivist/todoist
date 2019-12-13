const fetch = require(`node-fetch`)
const auth = require(`@qnzl/auth`)

const { CLAIMS } = auth

const todoistKey = process.env.TODOIST_KEY

module.exports = async (req, res) => {
  const {
    authorization
  } = req.headers

  const isTokenValid = auth.checkJWT(authorization, CLAIMS.todoist.get.tasks, `watchers`, process.env.ISSUER)

  if (!isTokenValid) {
    return res.status(401).send()
  }

  let tasks
  try {
    console.log(`getting tasks`)

    const response = await fetch(`https://api.todoist.com/rest/v1/tasks`, {
        method: `GET`,
        headers: {
          'Authorization': `Bearer ${todoistKey}`
        }
      })

    tasks = await response.json()

    return res.json(tasks)
  } catch (e) {
    console.log(`failed to get tasks`, e)

    return res.status(500).send()
  }
}


