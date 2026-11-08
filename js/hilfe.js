// Hilfeseite: Inhalt aus js/hilfe-daten.js, Aufbau aus lib/common/js/hilfe-seite.js, Inhaltsverzeichnis
// und Querstriche wie im Skript (lib/common/js/skript-kern.js).

import { hilfeSeite } from '../lib/common/js/hilfe-seite.js';
import { inhaltsverzeichnis } from '../lib/common/js/skript-kern.js';
import { versionEintragen, $ } from '../lib/common/js/seite.js';
import { HILFE } from './hilfe-daten.js';
import { VERSION } from './version.js';

versionEintragen(VERSION);
hilfeSeite($('hilfe'), HILFE, $('hilfe-inhalt'));
inhaltsverzeichnis();
