const fetch = require(`node-fetch`)
const auth = require(`@qnzl/auth`)

const { CLAIMS } = auth

const todoistKey = process.env.TODOIST_KEY

module.exports = async (req, res) => {
  const {
    authorization
  } = req.headers

  const {
    id
  } = req.query

  const isTokenValid = auth.checkJWT(authorization, CLAIMS.todoist.get.comments, `watchers`, process.env.ISSUER)

  if (!isTokenValid) {
    return res.status(401).send()
  }

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


