const { CLAIMS } = require(`@qnzl/auth`)
const authCheck = require(`../../_lib/auth`)
const fetch = require(`node-fetch`)

const todoistKey = process.env.TODOIST_KEY

const handler = async (req, res) => {
  const {
    projectId = ''
  } = req.query

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

module.exports = (req, res) => {
  const claim = CLAIMS.todoist.get.tasks + (projectId && `.${projectId}`) || ``

  return authCheck(claim)(req, res, handler)
}

