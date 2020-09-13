const { CLAIMS } = require(`@qnzl/auth`)
const authCheck = require(`../_lib/auth`)
const fetch = require(`node-fetch`)

const todoistKey = process.env.TODOIST_KEY

const handler = async (req, res) => {
  let tasks
  try {
    console.log(`getting tasks`)

    const response = await fetch(`https://api.todoist.com/rest/v1/tasks/${req.query.id}`, {
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

module.exports = (req, res) => {
  return authCheck(CLAIMS.todoist.get.tasks)(req, res, handler)
}

