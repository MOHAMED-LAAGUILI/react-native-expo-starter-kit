#!/usr/bin/env bash
# Runs inside reactivecircus/android-emulator-runner (see .github/workflows/e2e.yml).
# Installs the APK, records logcat and the screen while the suite runs, and
# leaves everything needed to debug a failure in $MAESTRO_OUT.
set -euo pipefail

: "${APK:?APK is not set}"
: "${MAESTRO_OUT:?MAESTRO_OUT is not set}"

# Keep in sync with EXPO_PUBLIC_PACKAGE (src/config/env.ts) and the e2e:* scripts in package.json.
APP_ID='com.rntemplate.app'

mkdir -p "$MAESTRO_OUT/recordings"

adb wait-for-device
adb install -r "$APK"

adb logcat -c
adb logcat -v time > "$MAESTRO_OUT/logcat.txt" 2>&1 &
logcat_pid=$!

# screenrecord stops after 180 s, so record in back-to-back chunks.
(
  i=0
  while [ ! -f "$MAESTRO_OUT/.stop-recording" ]; do
    adb shell screenrecord --time-limit 170 "/sdcard/maestro-rec-$(printf '%03d' "$i").mp4" || true
    i=$((i + 1))
  done
) &
recorder_pid=$!

finish() {
  touch "$MAESTRO_OUT/.stop-recording"
  adb shell pkill -INT screenrecord || true # SIGINT finalises the mp4
  wait "$recorder_pid" || true
  for file in $(adb shell 'ls /sdcard/maestro-rec-*.mp4 2>/dev/null' | tr -d '\r'); do
    adb pull "$file" "$MAESTRO_OUT/recordings/" > /dev/null || true
  done
  kill "$logcat_pid" 2> /dev/null || true
  rm -f "$MAESTRO_OUT/.stop-recording"
}
trap finish EXIT

maestro test --platform android -e "APP_ID=$APP_ID" \
  --format junit --output "$MAESTRO_OUT/junit.xml" \
  --test-output-dir "$MAESTRO_OUT/test-output" \
  --debug-output "$MAESTRO_OUT/debug" --flatten-debug-output \
  .maestro
