# PowerShell wrapper to run the dev server using the Node/npm installed at D:\node
Set-Location -Path $PSScriptRoot
& "D:\node\npm.cmd" run dev @args
