const queryVariables = require(`../_lib/get-query-vars`)
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
    console.log(`getting today's activity`)

    const query = queryVariables({ parent_project_id: id, limit: 100 })
    const response = await fetch(`https://api.todoist.com/sync/v8/activity/get${query}`, {
        method: `GET`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

    const _activity = await response.json()

    let { events } = _activity

    const foundEventIds = []

    events = events.filter((event) => {
      const id = `${event.object_id}.${event.event_type}`
      if (foundEventIds.includes(id)) {
        return false
      }

      foundEventIds.push(id)
      return true
    })

    return res.json(events)
  } catch (e) {
    console.log(`failed to get tasks`, e)

    return res.status(500).send()
  }
}

module.exports = (req, res) => {
  return authCheck(CLAIMS.todoist.dump)(req, res, handler)
}

