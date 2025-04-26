- Folge den Conventional Commits Spezifikationen (https://www.conventionalcommits.org/).
- Der Commit-Typ muss einer der folgenden sein: feat, fix, build, chore, ci, docs, style, refactor, perf, test.
- Beginne die Betreffzeile mit einem passenden Emoji basierend auf dem Typ:
    - ✨ `feat`: Eine neue Funktion
    - 🐛 `fix`: Ein Bugfix
    - 📝 `docs`: Nur Dokumentationsänderungen
    - 💄 `style`: Änderungen, die die Bedeutung des Codes nicht beeinflussen (Leerraum, Formatierung, fehlende Semikolons usw.)
    - ♻️ `refactor`: Eine Codeänderung, die weder einen Fehler behebt noch eine Funktion hinzufügt
    - ⚡️ `perf`: Eine Codeänderung, die die Leistung verbessert
    - ✅ `test`: Hinzufügen fehlender Tests oder Korrigieren vorhandener Tests
    - 🏗️ `build`: Änderungen, die das Build-System oder externe Abhängigkeiten betreffen (Beispielbereiche: gulp, broccoli, npm)
    - 🤖 `ci`: Änderungen an unseren CI-Konfigurationsdateien und Skripten (Beispielbereiche: Travis, Circle, BrowserStack, SauceLabs)
    - 🧹 `chore`: Andere Änderungen, die den Quellcode oder Testdateien nicht ändern
- Verwende den Imperativ im Präsens für den Rest der Betreffzeile (z.B. "add feature" nicht "added feature" oder "adds feature").
- Beginne den Text der Betreffzeile nicht mit einem Großbuchstaben (nach dem Emoji).
- Füge optional relevante Tags in eckigen Klammern am Ende der Betreffzeile hinzu (z.B. `[UI]`, `[API]`, `[Auth]`).
- Füge optional einen längeren Body nach einer Leerzeile hinzu, wenn zusätzliche Erklärungen notwendig sind.
- Füge optional einen Footer für Breaking Changes oder Referenzen zu Issues hinzu (z.B. `BREAKING CHANGE: ...` oder `Refs: #123`).
- Halte die Betreffzeile (inkl. Emoji und Tags) unter 72 Zeichen, idealerweise unter 50.
- Halte Zeilen im Body und Footer unter 72 Zeichen.
- Sei prägnant und beschreibe klar die Änderung.

Beispiel: `✨ add user login feature [Auth]`
Beispiel: `🐛 fix calculation error in checkout [API]`
Beispiel: `📝 update contribution guidelines`
