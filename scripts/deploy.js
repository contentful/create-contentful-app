#! /usr/bin/env node

const fs = require('fs')
const childProcess = require('child_process')

const PACKAGES = ['@contentful/create-contentful-app', 'create-contentful-app', '@contentful/cra-template-create-contentful-app']
const ORIGINAL_PACKAGE_JSON = require('../package.json')

if (!process.env.NPM_TOKEN) {
  throw new Error('Missing NPM_TOKEN!')
}

for (const package of PACKAGES) {
  console.log('')
  console.log('📦 Deploying package:', package)
  const packageJson = {...ORIGINAL_PACKAGE_JSON, name: package}

  console.log(` > 📝 Updating package.json with name: ${package}...`)
  fs.writeFileSync('../package.json', JSON.stringify(packageJson))

  console.log(` > ⚙️  Updating package-lock.json by means of "npm i"...`)
  childProcess.execSync('npm i', {cwd: '../'})

  console.log(` > 📚 Publishing on the registry...`)
  childProcess.execSync('npm publish', {cwd: '../'})

  console.log(`✅ Successfully published ${package}@${ORIGINAL_PACKAGE_JSON.version}!`)
  console.log('')
}

// Restore original package.json
fs.writeFileSync('../package.json', JSON.stringify(ORIGINAL_PACKAGE_JSON, null, 2))