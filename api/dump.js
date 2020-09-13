const { CLAIMS } = require(`@qnzl/auth`)
const authCheck = require(`./_lib/auth`)
const fetch = require(`node-fetch`)

const todoistKey = process.env.TODOIST_KEY

const handler = async (req, res) => {
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
  } catch (e) {
    console.log(`failed to get tasks`, e)

    return res.status(500).send()
  }

  let projects
  try {
    console.log(`getting projects`)

    const response = await fetch(`https://api.todoist.com/rest/v1/projects`, {
        method: `GET`,
        headers: {
          'Authorization': `Bearer ${todoistKey}`
        }
      })

    projects = await response.json()
  } catch (e) {
    console.log(`failed to get projects`, e)

    return res.status(500).end()
  }

  console.log(`assigning project names to ${tasks.length} tasks from ${projects.length} projects`)
  for (const project of projects) {
    for (const task of tasks) {
      if (project.id == task.project_id) {
        task.projectName = project.name
      }
    }
  }

  tasks = tasks.filter((task) => {
    // TODO Add filter for @private tasks
    return !task.completed
  })

  return res.json({ tasks, projects })
}

module.exports = (req, res) => {
  return authCheck(CLAIMS.todoist.dump)(req, res, handler)
}
