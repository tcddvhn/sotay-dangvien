param(
    [string]$OutputPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Convert-ToBase64Url {
    param([byte[]]$Bytes)

    return [Convert]::ToBase64String($Bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

$curve = [System.Security.Cryptography.ECCurve]::CreateFromFriendlyName('nistP256')
$ecdsa = [System.Security.Cryptography.ECDsa]::Create($curve)

try {
    $parameters = $ecdsa.ExportParameters($true)
    $publicBytes = New-Object byte[] 65
    $publicBytes[0] = 4
    [Array]::Copy($parameters.Q.X, 0, $publicBytes, 1, 32)
    [Array]::Copy($parameters.Q.Y, 0, $publicBytes, 33, 32)

    $result = [pscustomobject]@{
        enabled = $true
        publicKey = Convert-ToBase64Url -Bytes $publicBytes
        privateKey = Convert-ToBase64Url -Bytes $parameters.D
        generatedAtUtc = [DateTime]::UtcNow.ToString('o')
    }

    if (-not [string]::IsNullOrWhiteSpace($OutputPath)) {
        $directory = Split-Path -Parent $OutputPath
        if ($directory) {
            New-Item -ItemType Directory -Force -Path $directory | Out-Null
        }

        $result | ConvertTo-Json -Depth 5 | Set-Content -Path $OutputPath -Encoding UTF8
    }

    $result | ConvertTo-Json -Depth 5
}
finally {
    $ecdsa.Dispose()
}
