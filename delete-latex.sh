#!/bin/bash

# delete-latex.sh - Complete uninstall script for MacTeX
# This script removes MacTeX and all associated files

set -e

echo "=========================================="
echo "MacTeX Complete Uninstall Script"
echo "=========================================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "Error: This script is for macOS only."
    exit 1
fi

# Function to check if directory/file exists and remove it
remove_if_exists() {
    local path="$1"
    local description="$2"
    if [ -e "$path" ]; then
        echo "Removing: $description ($path)"
        sudo rm -rf "$path"
        echo "  ✓ Removed"
    else
        echo "Not found: $description ($path)"
    fi
}

# Show what will be removed
echo "The following will be removed:"
echo ""
echo "1. Homebrew cask entry (if installed via brew)"
echo "2. /Library/TeX (main TeX installation)"
echo "3. /usr/local/texlive (TeX Live distribution)"
echo "4. ~/Library/texlive (user texmf)"
echo "5. ~/Library/TeXShop (TeXShop preferences)"
echo "6. ~/Library/Preferences/TeXShop.plist"
echo "7. /Applications/TeX (TeX applications folder)"
echo "8. Applications: TeXShop, BibDesk, LaTeXiT, TeX Live Utility"
echo ""

# Ask for confirmation
read -p "Are you sure you want to proceed? (yes/no): " confirm
if [[ "$confirm" != "yes" ]]; then
    echo "Aborted. No files were removed."
    exit 0
fi

echo ""
echo "Starting removal..."
echo ""

# 1. Remove Homebrew cask if installed
if command -v brew &> /dev/null; then
    if brew list --cask mactex &> /dev/null; then
        echo "Removing MacTeX from Homebrew..."
        brew uninstall --cask mactex
        echo "  ✓ Homebrew cask removed"
    else
        echo "MacTeX not found in Homebrew casks"
    fi
else
    echo "Homebrew not installed, skipping cask removal"
fi

echo ""

# 2. Remove main directories
echo "Removing system directories (requires sudo)..."
remove_if_exists "/Library/TeX" "Main TeX installation"
remove_if_exists "/usr/local/texlive" "TeX Live distribution"
remove_if_exists "/Applications/TeX" "TeX Applications folder"
remove_if_exists "/etc/paths.d/TeX" "TeX PATH configuration"

echo ""

# 3. Remove user directories
echo "Removing user directories..."
remove_if_exists "$HOME/Library/texlive" "User texmf directory"
remove_if_exists "$HOME/Library/TeXShop" "TeXShop user data"
remove_if_exists "$HOME/Library/Preferences/TeXShop.plist" "TeXShop preferences"
remove_if_exists "$HOME/Library/Preferences/com.bobsoft.TeXShop.plist" "TeXShop preferences (alt)"
remove_if_exists "$HOME/Library/Application Support/TeXShop" "TeXShop support files"
remove_if_exists "$HOME/Library/Caches/TeXShop" "TeXShop cache"
remove_if_exists "$HOME/.texlive*" "User TeX Live config"

echo ""

# 4. Remove individual applications
echo "Removing TeX applications..."
remove_if_exists "/Applications/TeXShop.app" "TeXShop"
remove_if_exists "/Applications/BibDesk.app" "BibDesk"
remove_if_exists "/Applications/LaTeXiT.app" "LaTeXiT"
remove_if_exists "/Applications/TeX Live Utility.app" "TeX Live Utility"
remove_if_exists "/Applications/TeXworks.app" "TeXworks"

echo ""

# 5. Clean up PATH if needed
echo "Cleaning up shell configuration..."

# Check for TeX references in common shell configs
for config in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
    if [ -f "$config" ]; then
        if grep -q "/Library/TeX" "$config" 2>/dev/null || \
           grep -q "texlive" "$config" 2>/dev/null || \
           grep -q "path_helper" "$config" 2>/dev/null; then
            echo "Found TeX references in $config"
            echo "  You may want to manually review and remove TeX-related lines"
        fi
    fi
done

echo ""
echo "=========================================="
echo "Removal Complete!"
echo "=========================================="
echo ""
echo "MacTeX has been removed from your system."
echo ""
echo "Please restart your terminal or run:"
echo "  source ~/.zshrc"
echo ""
echo "To verify removal, run:"
echo "  which pdflatex    # Should return nothing"
echo "  ls /Library/TeX   # Should return 'No such file or directory'"
