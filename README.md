# Projekt: Entwicklung einer Morphologischen Kasten Webapp mit Drag-and-Drop und rollenbasierter Authentifizierung

Entwickle eine webbasierte Anwendung zur Erstellung und Verwaltung morphologischer Kästen mit folgenden Kernfunktionalitäten:

Implementiere ein rollenbasiertes Authentifizierungssystem mit mindestens zwei Benutzerrollen: Benutzer und Administrator. Beide Rollentypen sollen sich registrieren und anmelden können sowie ihr Profil verwalten können. Administratoren benötigen zusätzlich die Möglichkeit, alle Benutzerkonten zu verwalten, einschließlich des Erstellens, Bearbeitens und Deaktivierens von Konten.

Der Kern der Anwendung ist die Erstellung und Verwaltung morphologischer Kästen. Diese sollen eine intuitive Benutzeroberfläche bieten, die es ermöglicht, Parameter und deren Ausprägungen zu definieren, zu strukturieren und zu bearbeiten. Benutzer sollen ihre morphologischen Kästen speichern, laden und in gängige Formate wie PDF, Excel oder CSV exportieren können.

Eine zentrale Anforderung ist die Drag-and-Drop-Funktionalität. Parameter und Ausprägungen sollen per Drag-and-Drop neu angeordnet, gruppiert und kombiniert werden können. Das Interface soll ein intuitives Hinzufügen neuer Elemente durch Ziehen ermöglichen und visuell ansprechend gestaltet sein, einschließlich Farbkodierung für eine bessere Übersicht.

Sowohl Benutzer als auch Administratoren sollen eigene Datenbanken für ihre morphologischen Kästen erstellen können. Diese Datenbanken sollen erweiterbar, editierbar und zwischen Benutzern teilbar sein. Implementiere eine leistungsfähige Suchfunktion sowie Möglichkeiten zur Kategorisierung und zum Tagging für eine bessere Organisation.

Die Anwendung soll Kollaborationsfunktionen bieten, die es Benutzern ermöglichen, morphologische Kästen mit anderen zu teilen und gemeinsam in Echtzeit zu bearbeiten. Integriere eine Versionskontrolle zur Nachverfolgung von Änderungen sowie eine Kommentarfunktion für Diskussionen.

Auf technischer Ebene sollte das Frontend als responsive Single-Page-Application mit einem modernen Framework wie React, Vue.js oder Angular umgesetzt werden. Die Benutzeroberfläche muss benutzerfreundlich und intuitiv sein, mit besonderem Fokus auf eine optimale Benutzererfahrung. Verwende eine geeignete Drag-and-Drop-Bibliothek wie React DnD oder SortableJS und stelle sicher, dass die Anwendung auf verschiedenen Geräten und Bildschirmgrößen funktioniert.

Das Backend sollte eine RESTful API oder GraphQL für die Kommunikation mit dem Frontend bereitstellen und ein sicheres Authentifizierungssystem mit JWT oder ähnlichen Technologien implementieren. Die Datenbankanbindung kann je nach Anforderungen SQL oder NoSQL sein, muss jedoch eine flexible Struktur für die Speicherung morphologischer Kästen bieten und performante Abfragen auch bei größeren Datenmengen ermöglichen.

Lege besonderen Wert auf Sicherheitsaspekte wie die Verschlüsselung sensibler Daten, HTTPS-Verbindungen, Schutz vor gängigen Angriffen und datenschutzkonforme Speicherung von Benutzerdaten gemäß DSGVO.

Die Anwendung sollte mehrsprachig sein (mindestens Deutsch und Englisch), barrierefrei nach WCAG-Richtlinien und eine Offline-Funktionalität für grundlegende Operationen bieten. Achte auf eine leichte Erweiterbarkeit für zukünftige Funktionen.

Das erwartete Endergebnis ist eine voll funktionsfähige Webanwendung, die es Benutzern ermöglicht, morphologische Kästen zu erstellen, zu bearbeiten, zu teilen und zu verwalten, mit einem intuitiven Drag-and-Drop-Interface und einem rollenbasierten Authentifizierungssystem.​​​​​​​​​​​​​​​​