#!/bin/sh
# Installs the newest APK from dist/ on the containerised emulator and opens it.
# Run by the `installer` service in compose.yaml after the emulator is healthy.
set -eu

APP_ID="${APP_ID:-com.rntemplate.app}"

APK="$(ls -t /app/dist/*.apk 2>/dev/null | head -n 1 || true)"
if [ -z "$APK" ]; then
  echo "No APK in dist/ — run \`pnpm run docker:build\` (or \`pnpm run build:local:android -- --emulator\`) first." >&2
  exit 1
fi

adb connect emulator:5555 > /dev/null
adb -s emulator:5555 wait-for-device
until [ "$(adb -s emulator:5555 shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; do
  sleep 2
done

echo "Installing $(basename "$APK")…"
adb -s emulator:5555 install -r "$APK"
adb -s emulator:5555 shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1 > /dev/null
echo "✔ $APP_ID is running — open http://localhost:6080 to see it."
