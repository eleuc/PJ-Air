param(
    [string]$Challenge,
    [string]$KeyPath,
    [string]$Project,
    [string]$IntelDir,
    [string]$FilePath
)

if ([string]::IsNullOrWhitespace($IntelDir)) {
    $IntelDir = "$PSScriptRoot/../vault/runtime"
}
$SigPath = "$IntelDir/signature.json"

$SecureDefault = "C:\Bunker\Keys\po_private.xml"

# Si no se define KeyPath o es el default de 'root', buscar en Bunker
if ([string]::IsNullOrWhitespace($KeyPath) -or $KeyPath -eq "root" -or $KeyPath.Contains("vault")) {
    $KeyPath = $SecureDefault
}

if (!(Test-Path $KeyPath)) { 
    Write-Error "ERROR: No se encuentra llave privada en $KeyPath"
    Write-Host "[HINT] El PO debe mover su llave a $SecureDefault"
    exit 1 
}

# Bloqueo Activo: Prohibido usar llaves dentro del búnker administrativo
if ($KeyPath.ToLower().Contains("antigravity_dpi")) {
    Write-Error "VIOLACIÓN DE SEGREGACIÓN: No se permite usar llaves dentro del workspace."
    exit 1
}

try {
    $RSA = New-Object System.Security.Cryptography.RSACryptoServiceProvider
    $XML = (Get-Content $KeyPath -Raw).Trim()
    
    if (!$XML.StartsWith("<RSAKeyValue>")) {
        Write-Error "ERROR: El archivo de llave no tiene el formato XML esperado (<RSAKeyValue>). Es posible que esté en formato PEM o dañado."
        Write-Host "[HINT] Si su llave está en formato PEM, debe convertirla a XML para usarla con este script o usar Conext Signer que sí soporta otros formatos."
        exit 1
    }
    
    $RSA.FromXmlString($XML)
    
    $Data = $null
    if (![string]::IsNullOrWhitespace($FilePath)) {
        if (!(Test-Path $FilePath)) { Write-Error "Archivo no encontrado: $FilePath"; exit 1 }
        $Data = [System.IO.File]::ReadAllBytes($FilePath)
        $SigPath = "$FilePath.sig"
        Write-Host "MODO BINARIO: Firmando $FilePath ..."
    } else {
        $ContextString = $Challenge
        $Data = [System.Text.Encoding]::UTF8.GetBytes($ContextString)
    }

    $Signature = $RSA.SignData($Data, "SHA256")
    $B64 = [Convert]::ToBase64String($Signature)
    
    if ([string]::IsNullOrWhitespace($FilePath)) {
        $Payload = @{
            signature = $B64
            challenge = $Challenge
            project   = $Project
            timestamp = (Get-Date).ToString("o")
        } | ConvertTo-Json -Compress
        
        $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($SigPath, $Payload, $Utf8NoBom)
    } else {
        [System.IO.File]::WriteAllBytes($SigPath, $Signature)
    }
    Write-Host "FIRMADO OK: $SigPath"
} catch {
    Write-Error "ERROR AL FIRMAR: $_"
    exit 1
}
