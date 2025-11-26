
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$Path,
        [int]$Width,
        [int]$Height
    )

    if (-not (Test-Path $Path)) {
        Write-Host "File not found: $Path"
        return
    }

    try {
        $image = [System.Drawing.Image]::FromFile($Path)
        $size = New-Object System.Drawing.Size($Width, $Height)
        $resized = New-Object System.Drawing.Bitmap($image, $size)
        $image.Dispose()
        
        $newPath = $Path.Replace(".png", "_small.png")
        $resized.Save($newPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $resized.Dispose()
        
        # Replace original
        Remove-Item $Path
        Rename-Item $newPath $Path
        
        Write-Host "Resized $Path to ${Width}x${Height}"
    } catch {
        Write-Error "Failed to resize $Path : $_"
    }
}

$basePath = "c:\Hackathon\my_first_dapp\frontend-react\public\assets\animation_frames"

Resize-Image -Path "$basePath\Heal\Heal.png" -Width 512 -Height 512
Resize-Image -Path "$basePath\Nuke\Nuke.png" -Width 512 -Height 512
Resize-Image -Path "$basePath\Freeze\Freeze.png" -Width 512 -Height 512
Resize-Image -Path "$basePath\Poison\Poison.png" -Width 512 -Height 512
