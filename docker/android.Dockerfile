# Android build image: Node + pnpm + JDK 17 + the exact Android SDK pieces this
# project compiles against. Used by the `android-build` and `installer`
# services in compose.yaml (`pnpm run docker:build` / `pnpm run docker:emulator`).
#
# Versions mirror the app: compile SDK / build-tools 37 (app.config.ts →
# expo-build-properties), NDK 27.1 (React Native 0.88), CMake 3.22.1 (RN's
# default). Bump them together with an Expo SDK upgrade.
FROM node:22-bookworm

ARG ANDROID_CMDLINE_TOOLS=13114758
ARG ANDROID_PLATFORM=android-37
ARG ANDROID_BUILD_TOOLS=37.0.0
ARG ANDROID_NDK=27.1.12297006
ARG ANDROID_CMAKE=3.22.1

ENV ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    GRADLE_USER_HOME=/root/.gradle \
    CI=true \
    EXPO_NO_TELEMETRY=1
ENV PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}"

RUN apt-get update \
 && apt-get install -y --no-install-recommends openjdk-17-jdk-headless unzip curl git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir -p "${ANDROID_HOME}/cmdline-tools" \
 && curl -fsSL -o /tmp/cmdline-tools.zip "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_CMDLINE_TOOLS}_latest.zip" \
 && unzip -q /tmp/cmdline-tools.zip -d "${ANDROID_HOME}/cmdline-tools" \
 && mv "${ANDROID_HOME}/cmdline-tools/cmdline-tools" "${ANDROID_HOME}/cmdline-tools/latest" \
 && rm /tmp/cmdline-tools.zip \
 && yes | sdkmanager --licenses > /dev/null \
 && sdkmanager --install \
      "platform-tools" \
      "platforms;${ANDROID_PLATFORM}" \
      "build-tools;${ANDROID_BUILD_TOOLS}" \
      "ndk;${ANDROID_NDK}" \
      "cmake;${ANDROID_CMAKE}" > /dev/null

RUN corepack enable

WORKDIR /app
