$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

npm.cmd install

Write-Host ''
Write-Host '[web] setup complete'
Write-Host '[web] run: npm.cmd run dev'
