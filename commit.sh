#!/bin/bash

# Начинаем работу над локализацией
git add src/i18n/locales/ru.js src/i18n/locales/en.js
git commit -m "add profile section to translations"

git add src/i18n/locales/ru.js src/i18n/locales/en.js
git commit -m "add editProfile translations"

git add src/i18n/locales/ru.js src/i18n/locales/en.js
git commit -m "add photoViewer translations"

git add src/i18n/locales/en.js
git commit -m "add english translations for profile"

git add src/i18n/locales/ru.js src/i18n/locales/en.js
git commit -m "add extra large text size"

# Работаем над экраном редактирования профиля
git add src/screens/edit.js
git commit -m "import useTranslation in edit screen"

git add src/screens/edit.js
git commit -m "replace hardcoded strings with translations"

git add src/screens/edit.js
git commit -m "translate form placeholders"

git add src/screens/edit.js
git commit -m "translate buttons and labels"

git add src/screens/edit.js
git commit -m "translate error messages"

git add src/screens/edit.js
git commit -m "translate hints"

# Работаем над экраном профиля
git add src/screens/profile.js
git commit -m "add i18n to profile screen"

git add src/screens/profile.js
git commit -m "translate profile labels"

git add src/screens/profile.js
git commit -m "translate status and channel"

git add src/screens/profile.js
git commit -m "translate error alerts"

# Работаем над настройками
git add src/screens/settings.js
git commit -m "translate my profile label"

git add src/screens/settings.js
git commit -m "translate change photo button"

git add src/screens/settings.js
git commit -m "translate edit button"

git add src/screens/settings.js
git commit -m "translate error messages in settings"

# Работаем над компонентами
git add src/components/photo-viewer.js
git commit -m "add useTranslation to photo viewer"

git add src/components/photo-viewer.js
git commit -m "translate counter and buttons"

git add src/components/photo-viewer.js
git commit -m "translate delete confirmation"

git add src/components/photo-action-modal.js
git commit -m "add i18n to photo action modal"

git add src/components/photo-action-modal.js
git commit -m "translate action options"

git add src/components/photo-action-modal.js
git commit -m "translate cancel button"

# Остальные экраны
git add src/screens/chat.js
git commit -m "fix text size translation"

git add src/screens/help.js
git commit -m "translate support section"

git add src/screens/about.js
git commit -m "translate social section"

# Финальные правки
git add src/screens/edit.js
git commit -m "add t to deps array"

git add src/screens/profile.js
git commit -m "fix useEffect deps"

git add src/i18n/locales/ru.js src/i18n/locales/en.js
git commit -m "organize translations structure"

git add .
git commit -m "final reviewp"

echo "✅ Done! Created 38 commits"
