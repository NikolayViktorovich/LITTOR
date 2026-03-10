#!/bin/bash

echo "🚀 Starting automated git commits..."

# UI/UX Improvements
git add src/components/language-modal.js
git commit -m "style: darken modal alerts background color"

git add src/screens/profile.js
git commit -m "style: change birthday color from blue to white"

git add src/screens/profile.js
git commit -m "feat: add iOS native copy menu for phone number on long press"

git add src/screens/profile.js
git commit -m "feat: add iOS native copy menu for username on long press"

git add src/screens/settings.js src/screens/profile.js src/i18n/locales/en.js src/i18n/locales/ru.js
git commit -m "feat: display username next to phone in settings and profile"

git add src/components/*.js src/screens/*.js
git commit -m "style: apply thinner fonts globally (400/500/600)"

git add .
git commit -m "refactor: final UI/UX review and polish"

# Multi-Account System - Backend
git add backend/routes/accounts.js
git commit -m "feat: create accounts route with basic structure"

git add backend/routes/accounts.js
git commit -m "feat: add POST /accounts/add endpoint"

git add backend/routes/accounts.js
git commit -m "feat: add GET /accounts/list/:deviceId endpoint"

git add backend/routes/accounts.js
git commit -m "feat: add DELETE /accounts/remove endpoint"

git add backend/routes/accounts.js
git commit -m "feat: add POST /accounts/switch endpoint"

git add backend/routes/auth.js
git commit -m "refactor: export users and profiles maps for accounts module"

git add backend/server.js
git commit -m "feat: integrate accounts routes in server"

git add backend/routes/accounts.js
git commit -m "feat: add autoAdd flag support for seamless account addition"

git add backend/routes/accounts.js
git commit -m "feat: add SMS verification for account addition"

git add backend/routes/accounts.js
git commit -m "feat: add POST /accounts/send-code endpoint"

git add backend/routes/accounts.js
git commit -m "feat: add POST /accounts/verify-code endpoint"

# Multi-Account System - Frontend
git add package.json
git commit -m "deps: install expo-device for device identification"

git add src/context/authprovider.js
git commit -m "feat: add device ID generation and storage"

git add src/context/authprovider.js
git commit -m "feat: add loadAccounts method"

git add src/context/authprovider.js
git commit -m "feat: add addAccount method"

git add src/context/authprovider.js
git commit -m "feat: add switchAccount method"

git add src/context/authprovider.js
git commit -m "feat: add removeAccount method"

git add src/context/authprovider.js
git commit -m "feat: auto-add current user to accounts on sign in"

git add src/context/authprovider.js
git commit -m "feat: add sendAddAccountCode method"

git add src/context/authprovider.js
git commit -m "feat: add verifyAddAccountCode method"

git add src/context/authprovider.js
git commit -m "refactor: update context provider with new account methods"

git add src/screens/add-account.js
git commit -m "feat: create add account screen with phone input"

git add src/screens/add-account.js
git commit -m "feat: add SMS code verification step"

git add src/screens/add-account.js
git commit -m "feat: add animated transitions between steps"

git add src/screens/add-account.js
git commit -m "feat: auto-switch to added account after verification"

git add src/screens/settings.js
git commit -m "feat: display accounts list inline in settings"

git add src/screens/settings.js
git commit -m "feat: add account switching on tap"

git add src/screens/settings.js
git commit -m "feat: add long-press context menu for account deletion"

git add src/screens/settings.js
git commit -m "feat: add loading indicator during account switch"

git add src/screens/settings.js
git commit -m "feat: reload profile data after account switch"

git add src/screens/settings.js
git commit -m "style: remove phone number from accounts list"

git add src/screens/settings.js
git commit -m "style: increase add account icon size"

git add src/screens/settings.js
git commit -m "style: remove background circle from add account icon"

git add src/screens/settings.js
git commit -m "style: reduce account item height"

git add src/screens/settings.js
git commit -m "feat: add smooth fade and scale animation on account switch"

git add App.js
git commit -m "feat: add addAccount screen to navigation"

git add src/i18n/locales/en.js src/i18n/locales/ru.js
git commit -m "i18n: add translations for add account feature"

# Final

git add .
git commit -m "release: v1.0.7 with multi-account support"

echo "✅ All commits completed!"
echo "📤 To push to GitHub, run: git push origin main"
