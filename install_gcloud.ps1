Write-Host "Downloading Google Cloud SDK Installer..."
$installerPath = "$env:Temp\GoogleCloudSDKInstaller.exe"
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", $installerPath)

Write-Host "Running Google Cloud SDK Installer..."
Write-Host "IMPORTANT: Make sure the 'Update PATH' option is checked during installation!"
Start-Process -FilePath $installerPath -Wait

Write-Host "Installation complete."
Write-Host "Please RESTART your PowerShell or Command Prompt window for 'gcloud' to be recognized."
Write-Host "Then, run: gcloud auth login"
pause
