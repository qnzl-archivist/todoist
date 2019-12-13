const fetch = require(`node-fetch`)
const auth = require(`@qnzl/auth`)

const { CLAIMS } = auth

const todoistKey = process.env.TODOIST_KEY

module.exports = async (req, res) => {
  const {
    authorization
  } = req.headers

  const {
    projectId = ''
  } = req.query

  const claim = CLAIMS.todoist.get.tasks + (projectId && `.${projectId}`) || ``

  const isTokenValid = auth.checkJWT(authorization, claim, `watchers`, process.env.ISSUER)

  if (!isTokenValid) {
    return res.status(401).send()
  }

  let tasks
  try {
    console.log(`getting tasks (project: ${projectId})`)
    const query = projectId ? `?project_id=${projectId}` : ``

    const response = await fetch(`https://api.todoist.com/rest/v1/tasks${query}`, {
        method: `GET`,
        headers: {
          'Authorization': `Bearer ${todoistKey}`
        }
      })

    tasks = await response.json()

    return res.json({ tasks })
  } catch (e) {
    console.log(`failed to get tasks`, e)
    return res.status(500).send()
  }
}



