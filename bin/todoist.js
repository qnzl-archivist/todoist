const { URLSearchParams } = require('url')
const { promisify } = require('util')
const fetch = require('node-fetch')
const { Command } = require('commander')
const fs = require('fs')

const program = new Command()

const {
  TODOIST_BASE_REDIRECT_URL,
} = process.env

process.on('unhandledRejection', onfatal)
process.on('uncaughtException', onfatal)

function onfatal(err) {
  console.log('fatal:', err.message)
  exit(1)
}

function exit(code) {
  process.nextTick(process.exit, code)
}

program
  .command('url')
  .description('Get OAuth first step URL')
  .option('--client-id [id]', 'Todoist client ID')
  .action(getOAuthUrl)

program
  .command('exchange-token')
  .description('Exchange OAuth2 code for access token')
  .option('-c, --code [oauth code]', 'OAuth code from step 1')
  .option('--client-id [id]', 'Todoist client ID')
  .option('--client-secret [secret]', 'Todoist client secret')
  .option('--redirect-url [url]', 'OAuth redirect URL', `${TODOIST_BASE_REDIRECT_URL}/api/oauth-callback`)
  .action(exchangeToken)

program
  .command('dump')
  .description('Dump to file')
  .option('-t, --token', 'OAuth access token')
  .action(dump)

program.parseAsync(process.argv)

function getOAuthUrl({
  clientId,
}) {
  const nonce = Number(new Date())

  process.stdout.write(`https://todoist.com/oauth/authorize?client_id=${clientId}&scope=data:read,data:delete&state=${nonce}`)
}

async function exchangeToken({
  code,
  clientId,
  clientSecret,
  redirectUrl,
}) {
  const body = new URLSearchParams()

  body.append(`code`, code)
  body.append(`grant_type`, `authorization_code`)
  body.append(`client_id`, clientId)
  body.append(`client_secret`, clientSecretj)
  body.append(`redirect_uri`, redirectUrl)

  fetch(`https://todoist.com/oauth/access_token`, {
      method: `POST`,
      headers: {
        'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`
      },
      body
    })
    .then(async (response) => {
      const {
        access_token,
        expires_in,
        refresh_token,
        scope
      } = await response.json()

      return res.status(200).send({ access_token, refresh_token })
    })
}

async function dump(argv) {
  let tasks

  const {
    accessToken,
  } = argv

  try {
    console.log(`getting tasks`)

    const response = await fetch(`https://api.todoist.com/rest/v1/tasks`, {
        method: `GET`,
        headers: {
          'Authorization': `Bearer ${accessToken}`
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
          'Authorization': `Bearer ${accessToken}`
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

  const dump = JSON.stringify({
    projects,
    tasks,
  })

  await promisify(fs.writeFile)(EXPORT_PATH, dump)
}
