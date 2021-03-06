#!/usr/bin/node env

const { URLSearchParams } = require('url')
const { promisify } = require('util')
const fetch = require('node-fetch')
const { Command } = require('commander')
const fs = require('fs')
const dayjs = require('dayjs')
const { resolve } = require('path')
const server = require('server')

const program = new Command()

const { get } = server.router
const { send, status } = server.reply

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
  .option('--port [port]', 'Server port', 3000)
  .option('--client-id [id]', 'Todoist client ID')
  .option('--client-secret [secret]', 'Todoist client secret')
  .option('--redirect-url [url]', 'OAuth redirect URL', `${TODOIST_BASE_REDIRECT_URL}/api/oauth-callback`)
  .action(exchangeToken)

program
  .command('dump')
  .description('Dump to file')
  .option('-t, --token [token]', 'OAuth access token')
  .option('--export-format <format>', 'Export file format', '{date}-todoist.json')
  .option('--export-path [path]', 'Export file path')
  .action(dump)

program.parseAsync(process.argv)

function getOAuthUrl({
  clientId,
}) {
  const nonce = Number(new Date())

  process.stdout.write(`https://todoist.com/oauth/authorize?client_id=${clientId}&scope=data:read,data:delete&state=${nonce}`)
}

async function exchangeToken({
  port,
  clientId,
  clientSecret,
  redirectUrl,
}) {
  console.log(`Waiting to exchange token at ${redirectUrl} on port ${port}...`)

  return new Promise((resolve, reject) => {
    server({ port: Number(port) }, [
      get('/', async ctx => {
        console.log('Received exchange token request...')
        const code = ctx.query.code

        const body = new URLSearchParams()

        body.append('code', code)
        body.append('grant_type', 'authorization_code')
        body.append('client_id', clientId)
        body.append('client_secret', clientSecret)
        body.append('redirect_uri', redirectUrl)

        try {
          const res = await fetch('https://todoist.com/oauth/access_token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
              },
              body
            })

          const {
            access_token,
          } = await res.json()

          console.log(access_token)

          return process.exit(0)
        } catch (e) {
          return onfatal(e)
        }
      })
    ])
  })
}

async function dump({
  token,
  exportPath,
  exportFormat
}) {
  let tasks

  const filledExportFormat = exportFormat
    .replace('{date}', dayjs().format('YYYY-MM-DD'))

  const EXPORT_PATH = resolve(exportPath, filledExportFormat)

  try {
    console.log('getting tasks')

    const response = await fetch('https://api.todoist.com/rest/v1/tasks', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

    tasks = await response.json()
  } catch (e) {
    return onfatal(e)
  }

  let projects
  try {
    console.log('getting projects')

    const response = await fetch('https://api.todoist.com/rest/v1/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

    projects = await response.json()
  } catch (e) {
    return onfatal(e)
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
