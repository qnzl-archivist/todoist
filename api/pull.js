const fetch = require(`node-fetch`)

const getTasks = async (todoistKey) => {
  let tasks = null

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

  let projects = null

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

  return { tasks, projects }
}

const getActivity = async (todoistKey) => {
  let activity = null

  try {
    console.log(`getting tasks`)

    const response = await fetch(`https://api.todoist.com/sync/v8/activity/get`, {
        method: `GET`,
        headers: {
          'Authorization': `Bearer ${todoistKey}`
        }
      })

    activity = await response.json()
  } catch (e) {
    console.log(`failed to get tasks`, e)

    return res.status(500).send()
  }

  return { activity }
}

const getBackups = async (todoistKey) => {
  let backups = null

  try {
    console.log(`getting backups`)

    const response = await fetch(`https://api.todoist.com/sync/v8/backups/get`, {
        method: `GET`,
        headers: {
          'Authorization': `Bearer ${todoistKey}`
        }
      })

    backups = await response.json()
  } catch (e) {
    console.log(`failed to get backups`, e)

    return res.status(500).send()
  }

  return { backups }
}

module.exports = async (req, res) => {
  let tasks

  const {
    scope,
  } = req.query

  const [ type, auth ] = req.headers[`authorization`].split(` `)

  if (!type && !auth) {
    return res.sendStatus(401)
  }

  const [ todoistKey ] = Buffer.from(auth, `base64`).toString(`utf8`).split(`:`)

  if (!todoistKey) {
    return res.sendStatus(401)
  }

  const scopes = scope.split(`,`)

  const entitiesPromise = scopes.map(async (_scope) => {
    let events = null

    switch(_scope) {
      case `activity`:
        events = await getActivity(todoistKey)
        break
      case `backups`:
        events = await getBackups(todoistKey)
        break
      case `tasks`:
        events = await getTasks(todoistKey)
        break
    }

    return events
  })

  const entities = await Promise.all(entitiesPromise)

  const returnValue = Object.assign({}, ...entities)

  return res.json(returnValue)
}
