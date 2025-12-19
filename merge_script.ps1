$branches = @(
    "Cloud_Jumper_Marouane_Naciri",
    "Color_Climb_Marwane_Traiki",
    "Pddle_Pitch",
    "TapTenpo_abdelmoughitTAFtaF",
    "X-O_Houssam_El_Morabiti",
    "headbot-mohammed-elhassani",
    "main",
    "quiz_bouchra_elamri"
)

foreach ($branch in $branches) {
    Write-Host "Processing $branch..."
    git checkout $branch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to checkout $branch"
        continue
    }

    # Create directory
    $dirName = $branch
    if (-not (Test-Path $dirName)) {
        New-Item -ItemType Directory -Force -Path $dirName
    }
    
    # Move items
    # We need to be careful not to move the .git folder or the script itself if it's in the root
    $items = Get-ChildItem -Path . -Exclude ".git", $dirName, "merge_script.ps1"
    
    if ($items.Count -gt 0) {
        foreach ($item in $items) {
            Move-Item -Path $item.FullName -Destination $dirName
        }
        
        # Commit
        git add .
        git commit -m "Move $branch content to folder $dirName"
    } else {
        Write-Host "No items to move in $branch"
    }
    
    # Merge
    git checkout master
    git merge $branch --no-edit
}
