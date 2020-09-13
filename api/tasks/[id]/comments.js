const { CLAIMS } = require(`@qnzl/auth`)
const authCheck = require(`../_lib/auth`)
const fetch = require(`node-fetch`)

const todoistKey = process.env.TODOIST_KEY

const handler = async (req, res) => {
  const {
    id
  } = req.query

  let tasks
  try {
    console.log(`getting comments (task: ${id})`)

    const response = await fetch(`https://api.todoist.com/rest/v1/comments?task_id=${id}`, {
        method: `GET`,
        headers: {
          'Authorization': `Bearer ${todoistKey}`
        }
      })

    comments = await response.json()

    return res.json(comments)
  } catch (e) {
    console.log(`failed to get tasks`, e)

    return res.status(500).send()
  }
}

module.exports = (req, res) => {
  return authCheck(CLAIMS.todoist.get.comments)(req, res, handler)
}

