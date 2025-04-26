FROM node:20-bullseye

# Arbeitsverzeichnis festlegen
WORKDIR /workspace

# SQLite-Abhängigkeiten installieren
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install sqlite3 libsqlite3-dev \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Installation von globalen npm-Paketen
RUN npm install -g pnpm typescript@latest

# Standard-Umgebungsvariablen
ENV NODE_ENV=development

# Benutzereinstellungen für nicht-root-Betrieb
USER node

# Startbefehl
CMD ["sleep", "infinity"]
