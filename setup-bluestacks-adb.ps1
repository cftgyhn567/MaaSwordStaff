[CmdletBinding()]
param(
    [string]$BlueStacksDirectory = (Join-Path $env:ProgramFiles "BlueStacks_nxt"),
    [switch]$Remove
)

$ErrorActionPreference = "Stop"
$localAppData = [Environment]::GetFolderPath("LocalApplicationData")
if ([string]::IsNullOrWhiteSpace($localAppData)) {
    throw "Unable to resolve the current user's LocalApplicationData directory."
}

$compatRoot = [IO.Path]::GetFullPath((Join-Path $localAppData "MaaSwordStaff"))
$compatDirectory = [IO.Path]::GetFullPath((Join-Path $compatRoot "adb-compat"))
$compatParent = [IO.Directory]::GetParent($compatDirectory).FullName
if ($compatParent -ne $compatRoot) {
    throw "Refusing to use an unexpected compatibility directory: $compatDirectory"
}

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$pathEntries = @($userPath -split ";" | Where-Object { $_ -and $_ -ne $compatDirectory })

function Set-UserPath {
    param(
        [Parameter(Mandatory)]
        [string]$Value
    )

    if ($userPath -eq $Value) {
        return $false
    }

    $environmentKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey("Environment", $true)
    if ($null -eq $environmentKey) {
        throw "Unable to open the current user's Environment registry key."
    }

    try {
        $environmentKey.SetValue("Path", $Value, [Microsoft.Win32.RegistryValueKind]::ExpandString)
    }
    finally {
        $environmentKey.Dispose()
    }

    return $true
}

function Publish-EnvironmentChange {
    if (-not ("MaaSwordStaff.NativeMethods" -as [type])) {
        Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

namespace MaaSwordStaff {
    public static class NativeMethods {
        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        public static extern IntPtr FindWindow(string className, string windowName);

        [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        public static extern IntPtr SendMessageTimeout(
            IntPtr hWnd,
            uint message,
            UIntPtr wParam,
            string lParam,
            uint flags,
            uint timeout,
            out UIntPtr result
        );
    }
}
"@
    }

    $shellWindow = [MaaSwordStaff.NativeMethods]::FindWindow("Shell_TrayWnd", $null)
    if ($shellWindow -eq [IntPtr]::Zero) {
        return
    }

    $messageResult = [UIntPtr]::Zero
    [void][MaaSwordStaff.NativeMethods]::SendMessageTimeout(
        $shellWindow,
        0x001A,
        [UIntPtr]::Zero,
        "Environment",
        0x0002,
        2000,
        [ref]$messageResult
    )
}

if ($Remove) {
    if (Set-UserPath -Value ($pathEntries -join ";")) {
        Publish-EnvironmentChange
    }

    foreach ($fileName in @("adb.exe", "AdbWinApi.dll")) {
        $compatFile = Join-Path $compatDirectory $fileName
        if (Test-Path -LiteralPath $compatFile -PathType Leaf) {
            Remove-Item -LiteralPath $compatFile -Force
        }
    }
    if ((Test-Path -LiteralPath $compatDirectory -PathType Container) -and
        -not (Get-ChildItem -LiteralPath $compatDirectory -Force)) {
        Remove-Item -LiteralPath $compatDirectory -Force
    }
    Write-Output "BlueStacks ADB compatibility entry removed."
    exit 0
}

$sourceAdb = Join-Path $BlueStacksDirectory "HD-Adb.exe"
$sourceApi = Join-Path $BlueStacksDirectory "AdbWinApi.dll"

foreach ($source in @($sourceAdb, $sourceApi)) {
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw "Required BlueStacks ADB file not found: $source"
    }
}

function Install-CompatibilityFile {
    param(
        [Parameter(Mandatory)]
        [string]$Source,
        [Parameter(Mandatory)]
        [string]$Destination
    )

    if (Test-Path -LiteralPath $Destination -PathType Leaf) {
        $sourceHash = (Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash
        $destinationHash = (Get-FileHash -LiteralPath $Destination -Algorithm SHA256).Hash
        if ($sourceHash -eq $destinationHash) {
            return
        }
    }

    try {
        Copy-Item -LiteralPath $Source -Destination $Destination -Force
    }
    catch {
        throw "Unable to update '$Destination'. Fully exit MXU and run this script again. $($_.Exception.Message)"
    }
}

New-Item -ItemType Directory -Path $compatDirectory -Force | Out-Null
Install-CompatibilityFile -Source $sourceAdb -Destination (Join-Path $compatDirectory "adb.exe")
Install-CompatibilityFile -Source $sourceApi -Destination (Join-Path $compatDirectory "AdbWinApi.dll")

$updatedPathEntries = @($compatDirectory) + $pathEntries
if (Set-UserPath -Value ($updatedPathEntries -join ";")) {
    Publish-EnvironmentChange
}
$env:Path = "$compatDirectory;$env:Path"

$devices = & (Join-Path $compatDirectory "adb.exe") devices -l
if ($LASTEXITCODE -ne 0) {
    throw "BlueStacks ADB compatibility check failed with exit code $LASTEXITCODE."
}

Write-Output "BlueStacks ADB compatibility entry installed: $compatDirectory"
$devices
Write-Output "Restart MXU before refreshing the device list."
