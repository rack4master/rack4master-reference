/* ============================================================
   i18n.js — Rack4Master / Reference  v7
   Languages: en (default) · es · ca
   ============================================================ */
(function (global) {
  'use strict';

  var STRINGS = {
    /* APP */
    'app.sub':       { en: 'Spectral Reference Matching Processor',
                       es: 'Procesador de Referencia Espectral',
                       ca: 'Processador de Refer\u00e8ncia Espectral' },
    'status.ready':  { en: 'READY', es: 'LISTO', ca: 'LLEST' },

    /* TRACKS */
    'track.ref':     { en: 'REFERENCE TRACK', es: 'PISTA DE REFERENCIA', ca: 'PISTA DE REFER\u00c8NCIA' },
    'track.target':  { en: 'TARGET TRACK',    es: 'PISTA OBJETIVO',      ca: 'PISTA OBJECTIU' },
    'track.nofile':  { en: 'NO FILE LOADED',  es: 'SIN ARCHIVO',         ca: 'SENSE FITXER' },

    /* WAVE HINTS */
    'wave.hint.ref':    { en: '\u25b6\u00a0\u00a0DROP REFERENCE TRACK HERE \u2014 OR CLICK TO BROWSE',
                          es: '\u25b6\u00a0\u00a0SUELTA LA PISTA DE REFERENCIA AQU\u00cd \u2014 O HAZ CLIC PARA BUSCAR',
                          ca: '\u25b6\u00a0\u00a0DEIXA LA PISTA DE REFER\u00c8NCIA AQU\u00cd \u2014 O FES CLIC PER CERCAR' },
    'wave.hint.target': { en: '\u25b6\u00a0\u00a0DROP TARGET TRACK HERE \u2014 OR CLICK TO BROWSE',
                          es: '\u25b6\u00a0\u00a0SUELTA LA PISTA OBJETIVO AQU\u00cd \u2014 O HAZ CLIC PARA BUSCAR',
                          ca: '\u25b6\u00a0\u00a0DEIXA LA PISTA OBJECTIU AQU\u00cd \u2014 O FES CLIC PER CERCAR' },

    /* TRANSPORT BUTTONS */
    'btn.load':  { en: 'LOAD',  es: 'CARGAR',     ca: 'CARREGAR' },
    'btn.play':  { en: 'PLAY',  es: 'REPRODUCIR', ca: 'REPRODUIR' },
    'btn.stop':  { en: 'STOP',  es: 'DETENER',    ca: 'ATURAR' },
    'btn.loop':  { en: 'LOOP',  es: 'BUCLE',      ca: 'BUCLE' },
    'btn.pause': { en: 'PAUSE', es: 'PAUSA',      ca: 'PAUSA' },

    /* ANALYZE */
    'btn.analyze': { en: 'ANALYZE &amp; APPLY REFERENCE MATCHING',
                     es: 'ANALIZAR Y APLICAR REFERENCIA ESPECTRAL',
                     ca: 'ANALITZA I APLICA REFER\u00c8NCIA ESPECTRAL' },

    /* PANELS */
    'panel.analysis':   { en: 'SPECTRAL ANALYSIS REPORT',
                          es: 'INFORME DE AN\u00c1LISIS ESPECTRAL',
                          ca: 'INFORME D\'AN\u00c0LISI ESPECTRAL' },
    'panel.output':     { en: 'PROCESSED OUTPUT',      es: 'SALIDA PROCESADA',    ca: 'SORTIDA PROCESSADA' },
    'badge.live':       { en: 'LIVE DSP CHAIN ACTIVE', es: 'CADENA DSP ACTIVA',   ca: 'CADENA DSP ACTIVA' },
    'panel.comparison': { en: 'SPECTRAL COMPARISON',   es: 'COMPARACI\u00d3N ESPECTRAL', ca: 'COMPARACI\u00d3 ESPECTRAL' },
    'panel.fx':         { en: 'PROCESSING CHAIN \u00a0|\u00a0 HPF \u2192 EQ7 \u2192 SATURATION \u2192 DYNAMICS \u2192 M/S \u2192 LIMITER \u2192 OUT',
                          es: 'CADENA DE PROCESO \u00a0|\u00a0 HPF \u2192 EQ7 \u2192 SATURACI\u00d3N \u2192 DIN\u00c1MICA \u2192 M/S \u2192 LIMITADOR \u2192 SAL',
                          ca: 'CADENA DE PROC\u00c9S \u00a0|\u00a0 HPF \u2192 EQ7 \u2192 SATURACI\u00d3 \u2192 DIN\u00c0MICA \u2192 M/S \u2192 LIMITADOR \u2192 SOR' },

    /* LEGEND */
    'legend.ref':    { en: 'REFERENCE', es: 'REFERENCIA', ca: 'REFER\u00c8NCIA' },
    'legend.target': { en: 'TARGET',    es: 'OBJETIVO',   ca: 'OBJECTIU' },
    'legend.result': { en: 'RESULT (LIVE)', es: 'RESULTADO (VIVO)', ca: 'RESULTAT (VIVO)' },

    /* FX MODULE TITLES */
    'mod.eq':        { en: '7-Band Parametric EQ',  es: 'EQ Param\u00e9trico 7 Bandas', ca: 'EQ Param\u00e8tric 7 Bandes' },
    'mod.dynamics':  { en: 'Dynamics Processor',    es: 'Procesador Din\u00e1mico',      ca: 'Processador Din\u00e0mic' },
    'mod.harmonics': { en: 'Harmonics & Filter',    es: 'Arm\u00f3nicos y Filtro',       ca: 'Harm\u00f2nics i Filtre' },
    'mod.output':    { en: 'Output Stage',          es: 'Etapa de Salida',              ca: 'Etapa de Sortida' },

    /* EQ LABELS */
    'eq.sub':      { en: 'SUB \u2013 50 Hz',        es: 'SUB \u2013 50 Hz',           ca: 'SUB \u2013 50 Hz' },
    'eq.bass':     { en: 'BASS \u2013 100 Hz',       es: 'GRAVES \u2013 100 Hz',       ca: 'GREUS \u2013 100 Hz' },
    'eq.lomid':    { en: 'LO-MID \u2013 300 Hz',     es: 'MEDIO-BAJO \u2013 300 Hz',   ca: 'MIG-BAIX \u2013 300 Hz' },
    'eq.mid':      { en: 'MID \u2013 1 kHz',         es: 'MEDIO \u2013 1 kHz',         ca: 'MIG \u2013 1 kHz' },
    'eq.himid':    { en: 'HI-MID \u2013 3 kHz',      es: 'MEDIO-ALTO \u2013 3 kHz',    ca: 'MIG-AGUT \u2013 3 kHz' },
    'eq.presence': { en: 'PRESENCE \u2013 8 kHz',    es: 'PRESENCIA \u2013 8 kHz',     ca: 'PRES\u00c8NCIA \u2013 8 kHz' },
    'eq.air':      { en: 'AIR \u2013 16 kHz',        es: 'AIRE \u2013 16 kHz',         ca: 'AIRE \u2013 16 kHz' },

    /* DYNAMICS LABELS */
    'dyn.thr': { en: 'THRESHOLD',   es: 'UMBRAL',          ca: 'LLINDAR' },
    'dyn.rat': { en: 'RATIO',       es: 'RATIO',           ca: 'RATIO' },
    'dyn.atk': { en: 'ATTACK',      es: 'ATAQUE',          ca: 'ATAC' },
    'dyn.rel': { en: 'RELEASE',     es: 'RELEASE',         ca: 'RELEASE' },
    'dyn.mkp': { en: 'MAKEUP GAIN', es: 'GANANCIA MAKEUP', ca: 'GUANY MAKEUP' },

    /* FILTER/SAT LABELS */
    'hpf.freq': { en: 'HPF FREQUENCY', es: 'FRECUENCIA HPF',  ca: 'FREQ\u00dc\u00c8NCIA HPF' },
    'hpf.q':    { en: 'HPF RESONANCE', es: 'RESONANCIA HPF',  ca: 'RESSON\u00c0NCIA HPF' },
    'hpf.sat':  { en: 'SATURATION',    es: 'SATURACI\u00d3N', ca: 'SATURACI\u00d3' },

    /* OUTPUT LABELS */
    'out.mid':  { en: 'MID GAIN',        es: 'GANANCIA MID',    ca: 'GUANY MID' },
    'out.side': { en: 'SIDE GAIN',       es: 'GANANCIA SIDE',   ca: 'GUANY SIDE' },
    'out.lim':  { en: 'LIMITER CEILING', es: 'TECHO LIMITADOR', ca: 'SOSTRE LIMITADOR' },
    'out.gain': { en: 'OUTPUT GAIN',     es: 'GANANCIA SALIDA', ca: 'GUANY SORTIDA' },

    /* ACTION BUTTONS */
    'btn.export': { en: 'EXPORT WAV',   es: 'EXPORTAR WAV',  ca: 'EXPORTA WAV' },
    'btn.reset':  { en: 'FULL RESET',   es: 'RESETEAR TODO', ca: 'RESTABLIR TOT' },

    /* CONFIRM MODAL */
    'modal.reset.title':   { en: 'FULL RESET',  es: 'RESETEAR TODO', ca: 'RESTABLIR TOT' },
    'modal.reset.msg':     { en: 'All loaded files, analysis data and processing settings will be permanently cleared.<br><br>This action cannot be undone.',
                             es: 'Todos los archivos cargados, datos de an\u00e1lisis y ajustes de procesamiento se eliminar\u00e1n permanentemente.<br><br>Esta acci\u00f3n no se puede deshacer.',
                             ca: 'Tots els fitxers carregats, dades d\'an\u00e0lisi i ajustos de processament s\'eliminaran permanentment.<br><br>Aquesta acci\u00f3 no es pot desfer.' },
    'modal.reset.cancel':  { en: 'CANCEL',        es: 'CANCELAR',   ca: 'CANCEL\u00b7LAR' },
    'modal.reset.confirm': { en: 'CONFIRM RESET', es: 'CONFIRMAR',  ca: 'CONFIRMAR' },

    /* MENU */
    'menu.language': { en: 'Language', es: 'Idioma', ca: 'Idioma' },
    'menu.help':     { en: 'Help',     es: 'Ayuda',  ca: 'Ajuda' },

    /* FOOTER */
    'footer.rights':  { en: '\u00a9 2026 Rack4Master. Francesc Llorens. All rights reserved.',
                        es: '\u00a9 2026 Rack4Master. Francesc Llorens. Todos los derechos reservados.',
                        ca: '\u00a9 2026 Rack4Master. Francesc Llorens. Tots els drets reservats.' },
    'footer.local':   { en: 'Runs locally in your browser. No data stored or tracked.',
                        es: 'Se ejecuta localmente. No se almacenan ni rastrean datos.',
                        ca: 'S\'executa localment. No s\'emmagatzemen ni es rastregen dades.' },
    'footer.privacy': { en: 'Privacy',    es: 'Privacidad',   ca: 'Privadesa' },
    'footer.legal':   { en: 'Legal',      es: 'Legal',        ca: 'Legal' },
    'footer.terms':   { en: 'Terms',      es: 'T\u00e9rminos', ca: 'Termes' }
  };

  /* ── MODALS ─────────────────────────────────────────────── */
  var MODALS = {
    privacy: {
      en: { title: 'PRIVACY POLICY',
            body:  '<h3>DATA WE DO NOT COLLECT</h3><p>Rack4Master / Reference runs entirely in your browser. We do not collect, store or transmit your audio files, analysis data or any personal information.</p><h3>LOCAL PROCESSING</h3><p>All spectral analysis and DSP processing happens locally using the Web Audio API. Your files never leave your device.</p><h3>COOKIES &amp; TRACKING</h3><p>No cookies, analytics, tracking pixels or third-party scripts are used beyond fonts loaded from Google Fonts CDN.</p><h3>CONTACT</h3><p><a href="mailto:rack4master@proton.me">rack4master@proton.me/a></p>' },
      es: { title: 'POL\u00cdTICA DE PRIVACIDAD',
            body:  '<h3>DATOS QUE NO RECOPILAMOS</h3><p>Rack4Master / Reference se ejecuta \u00edntegramente en tu navegador. No recopilamos, almacenamos ni transmitimos tus archivos de audio, datos de an\u00e1lisis ni ning\u00fan dato personal.</p><h3>PROCESAMIENTO LOCAL</h3><p>Todo el an\u00e1lisis espectral y el procesamiento DSP ocurren localmente mediante la Web Audio API. Tus archivos nunca salen de tu dispositivo.</p><h3>COOKIES Y RASTREO</h3><p>No usamos cookies, anal\u00edticas ni scripts de terceros salvo las fuentes de Google Fonts CDN.</p><h3>CONTACTO</h3><p><a href="mailto:rack4master@proton.me">rack4master@proton.me</a></p>' },
      ca: { title: 'POL\u00cdTICA DE PRIVADESA',
            body:  '<h3>DADES QUE NO RECOLLIM</h3><p>Rack4Master / Reference s\'executa \u00edntegrament al teu navegador. No recollim, emmagatzemem ni transmetem els teus fitxers d\'audio, dades d\'an\u00e0lisi ni cap informaci\u00f3 personal.</p><h3>PROCESSAMENT LOCAL</h3><p>Tota l\'an\u00e0lisi espectral i el processament DSP ocorren localment mitjan\u00e7ant la Web Audio API. Els teus fitxers mai surten del teu dispositiu.</p><h3>GALETES I SEGUIMENT</h3><p>No fem servir galetes, anal\u00edtiques ni scripts de tercers m\u00e9s enll\u00e0 de les fonts de Google Fonts CDN.</p><h3>CONTACTE</h3><p><a href="mailto:rack4master@proton.me">rack4master@proton.me</a></p>' }
    },
    legal: {
      en: { title: 'LEGAL NOTICE',
            body:  '<h3>OWNERSHIP</h3><p>Rack4Master / Reference is developed and maintained by Rack4Master. All intellectual property rights reserved.</p><h3>LIMITATION OF LIABILITY</h3><p>Provided "as is" without warranty of any kind. Rack4Master is not liable for any damages arising from use, including loss of audio or project data.</p><h3>THIRD-PARTY LIBRARIES</h3><p>Uses Meyda.js (MIT licence). All libraries governed by their respective licences.</p><h3>JURISDICTION</h3><p>Disputes governed by the laws of Spain.</p>' },
      es: { title: 'AVISO LEGAL',
            body:  '<h3>TITULARIDAD</h3><p>Rack4Master / Reference es desarrollado y mantenido por Rack4Master. Todos los derechos de propiedad intelectual reservados.</p><h3>LIMITACI\u00d3N DE RESPONSABILIDAD</h3><p>Proporcionado "tal cual" sin garant\u00eda de ning\u00fan tipo. Rack4Master no es responsable de da\u00f1os derivados del uso, incluyendo p\u00e9rdida de datos de audio o proyecto.</p><h3>LIBRER\u00cdAS DE TERCEROS</h3><p>Usa Meyda.js (licencia MIT). Cada librer\u00eda se rige por su licencia respectiva.</p><h3>JURISDICCI\u00d3N</h3><p>Las disputas se rigen por la legislaci\u00f3n espa\u00f1ola.</p>' },
      ca: { title: 'AV\u00cdS LEGAL',
            body:  '<h3>TITULARITAT</h3><p>Rack4Master / Reference \u00e9s desenvolupat i mantingut per Rack4Master. Tots els drets de propietat intel\u00b7lectual reservats.</p><h3>LIMITACI\u00d3 DE RESPONSABILITAT</h3><p>Proporcionat "tal com \u00e9s" sense cap garantia. Rack4Master no \u00e9s responsable de danys derivats de l\'\u00fas, incloent-hi p\u00e8rdua de dades d\'audio o de projecte.</p><h3>BIBLIOTEQUES DE TERCERS</h3><p>Utilitza Meyda.js (llic\u00e8ncia MIT). Cada biblioteca es regeix per la seva llic\u00e8ncia respectiva.</p><h3>JURISDICCI\u00d3</h3><p>Les disputes es regeixen per la legislaci\u00f3 espanyola.</p>' }
    },
    terms: {
      en: { title: 'TERMS OF USE',
            body:  '<h3>PERMITTED USE</h3><p>Free for personal and commercial use. The processed audio output may be used in any project without restriction.</p><h3>PROHIBITED USES</h3><p>You may not reverse-engineer, decompile, resell or redistribute the application itself without written permission from Rack4Master.</p><h3>AUDIO CONTENT</h3><p>You are solely responsible for ensuring you hold the necessary rights over any audio files processed with this tool.</p><h3>CHANGES</h3><p>We reserve the right to update these terms at any time. Continued use implies acceptance of the current terms.</p>' },
      es: { title: 'T\u00c9RMINOS DE USO',
            body:  '<h3>USO PERMITIDO</h3><p>Gratuito para uso personal y comercial. El audio procesado puede usarse en cualquier proyecto sin restricciones.</p><h3>USOS PROHIBIDOS</h3><p>No puedes realizar ingenier\u00eda inversa, descompilar, revender ni redistribuir la aplicaci\u00f3n sin permiso escrito de Rack4Master.</p><h3>CONTENIDO DE AUDIO</h3><p>Eres el \u00fanico responsable de garantizar que posees los derechos necesarios sobre los archivos de audio que procesas.</p><h3>CAMBIOS</h3><p>Nos reservamos el derecho de actualizar estos t\u00e9rminos en cualquier momento. El uso continuado implica aceptaci\u00f3n.</p>' },
      ca: { title: 'TERMES D\'\u00daS',
            body:  '<h3>\u00daS PERM\u00c8S</h3><p>Gratu\u00eft per a \u00fas personal i comercial. L\'audio processat pot usar-se en qualsevol projecte sense restriccions.</p><h3>USOS PROHIBITS</h3><p>No pots fer enginyeria inversa, descompilar, revendre ni redistribuir l\'aplicaci\u00f3 sense perm\u00eds escrit de Rack4Master.</p><h3>CONTINGUT D\'AUDIO</h3><p>Ets l\'\u00fanic responsable de garantir que posseixes els drets necessaris sobre els fitxers d\'audio que processes.</p><h3>CANVIS</h3><p>Ens reservem el dret d\'actualitzar aquests termes en qualsevol moment. L\'\u00fas continuat implica acceptaci\u00f3.</p>' }
    }
  };

  /* ── ENGINE ─────────────────────────────────────────────── */
  var _lang = 'en';
  var _cb   = null;

  function t(key, lang) {
    var l = lang || _lang;
    var e = STRINGS[key];
    if (!e) return key;
    return e[l] || e['en'] || key;
  }

  function apply(lang) {
    var l = lang || _lang;
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      el.textContent = t(el.getAttribute('data-i18n'), l);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'), l);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(function(el) {
      el.textContent = t(el.getAttribute('data-i18n-label'), l);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title'), l));
    });
    document.documentElement.setAttribute('lang', l);
  }

  /* ── PUBLIC API ─────────────────────────────────────────── */
  var i18n = {
    init:     function(lang, cb) { _lang = lang||'en'; _cb = cb||null; apply(_lang); if(_cb) _cb(_lang); },
    setLang:  function(lang)     { if(['en','es','ca'].indexOf(lang)<0) return; _lang=lang; apply(_lang); if(_cb) _cb(_lang); },
    getLang:  function()         { return _lang; },
    t:        function(key)      { return t(key); },
    getModal: function(key)      { var m=MODALS[key]; if(!m) return null; return m[_lang]||m['en']; },
    apply:    function()         { apply(_lang); }
  };

  global.i18n = i18n;

}(window));
