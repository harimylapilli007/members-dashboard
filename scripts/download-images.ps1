# Resort images download script
$resortImages = @{
    "maldives-resort.jpg" = "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80"
    "swiss-resort.jpg" = "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=1200&q=80"
    "dubai-resort.jpg" = "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80"
    "santorini-resort.jpg" = "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80"
    "bali-resort.jpg" = "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=1200&q=80"
    "kyoto-resort.jpg" = "https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=1200&q=80"
}

$outputPath = "public/resorts"

foreach ($image in $resortImages.GetEnumerator()) {
    $outputFile = Join-Path $outputPath $image.Key
    Write-Host "Downloading $($image.Key)..."
    Invoke-WebRequest -Uri $image.Value -OutFile $outputFile
    Write-Host "Downloaded to $outputFile"
} 