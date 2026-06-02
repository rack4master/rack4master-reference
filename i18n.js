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
    'footer.terms':   { en: 'Terms',      es: 'T\u00e9rminos', ca: 'Termes' },

    /* EXPORT DIALOG */
    'export.title':      { en: 'Export WAV',    es: 'Exportar WAV',          ca: 'Exportar WAV' },
    'export.bitdepth':   { en: 'Bit depth',     es: 'Profundidad de bits',   ca: 'Profunditat de bits' },
    'export.samplerate': { en: 'Sample rate',   es: 'Frecuencia de muestreo', ca: 'Frequ\u00e8ncia de mostratge' },
    'export.original':   { en: 'Original',      es: 'Original',              ca: 'Original' },
    'export.cancel':     { en: 'Cancel',        es: 'Cancelar',              ca: 'Cancel\u00b7lar' },
    'export.download':   { en: 'Download',      es: 'Descargar',             ca: 'Descarregar' },

    /* SYNC BUTTON */
    'btn.sync': { en: 'SYNC', es: 'SINC', ca: 'SINC' },

    /* HELP POPUPS \u2014 rendered via data-i18n-html (supports HTML markup) */
    'help.eq.body': {
      en: '<p class="hp-intro">Shapes the frequency balance of the target to match the reference. SUB and AIR are shelf filters; the 5 middle bands are bell-shaped (\u00b112\u00a0dB).</p><dl><dt>SUB \u2013 50\u00a0Hz (shelf)</dt><dd>Sub-bass weight and rumble. Boost adds depth; cut cleans up low-end mud.</dd><dt>BASS \u2013 100\u00a0Hz</dt><dd>Body and punch. The warmth foundation of the mix.</dd><dt>LO-MID \u2013 300\u00a0Hz</dt><dd>Warmth vs. muddiness zone. Often cut slightly for clarity.</dd><dt>MID \u2013 1\u00a0kHz</dt><dd>Presence and forward character. Defines attack and intelligibility.</dd><dt>HI-MID \u2013 3\u00a0kHz</dt><dd>Clarity, edge and harshness. Handle carefully \u2014 very audible range.</dd><dt>PRESENCE \u2013 8\u00a0kHz</dt><dd>Brilliance, definition and consonant detail.</dd><dt>AIR \u2013 16\u00a0kHz (shelf)</dt><dd>Open, airy shimmer. Subtle boost lifts the top end.</dd></dl>',
      es: '<p class="hp-intro">Da forma al balance frecuencial del objetivo para coincidir con la referencia. SUB y AIR son filtros shelving; las 5 bandas centrales son campanas (\u00b112\u00a0dB).</p><dl><dt>SUB \u2013 50\u00a0Hz (shelf)</dt><dd>Peso y rumble del sub-bajo. Boostar a\u00f1ade profundidad; cortar limpia el barro.</dd><dt>BASS \u2013 100\u00a0Hz</dt><dd>Cuerpo y punch. La base de calidez del mix.</dd><dt>LO-MID \u2013 300\u00a0Hz</dt><dd>Zona calidez vs. empaste. Suele cortarse ligeramente para mayor claridad.</dd><dt>MID \u2013 1\u00a0kHz</dt><dd>Presencia y car\u00e1cter frontal. Define el ataque e inteligibilidad.</dd><dt>HI-MID \u2013 3\u00a0kHz</dt><dd>Claridad, filo y dureza. Usar con cuidado \u2014 zona muy audible.</dd><dt>PRESENCE \u2013 8\u00a0kHz</dt><dd>Brillantez, definici\u00f3n y detalle consonante.</dd><dt>AIR \u2013 16\u00a0kHz (shelf)</dt><dd>Brillo a\u00e9reo y apertura. Un boost sutil eleva la cima.</dd></dl>',
      ca: '<p class="hp-intro">Modela el balan\u00e7 freqüencial de l\u2019objectiu per fer-lo coincidir amb la refer\u00e8ncia. SUB i AIR s\u00f3n filtres shelving; les 5 bandes centrals s\u00f3n campanes (\u00b112\u00a0dB).</p><dl><dt>SUB \u2013 50\u00a0Hz (shelf)</dt><dd>Pes i rumble del sub-baix. Boostar afegeix profunditat; tallar neteja el fang.</dd><dt>BASS \u2013 100\u00a0Hz</dt><dd>Cos i punch. La base de calidesa del mix.</dd><dt>LO-MID \u2013 300\u00a0Hz</dt><dd>Zona calidesa vs. embotament. Sol tallar-se lleugerament per major claredat.</dd><dt>MID \u2013 1\u00a0kHz</dt><dd>Pres\u00e8ncia i car\u00e0cter frontal. Defineix l\u2019atac i la intel\u00b7ligibilitat.</dd><dt>HI-MID \u2013 3\u00a0kHz</dt><dd>Claredat, tall i duresa. Usar amb cura \u2014 zona molt audible.</dd><dt>PRESENCE \u2013 8\u00a0kHz</dt><dd>Brillantor, definici\u00f3 i detall consonant.</dd><dt>AIR \u2013 16\u00a0kHz (shelf)</dt><dd>Brillantor a\u00e8ria i apertura. Un boost subtil eleva el cim.</dd></dl>'
    },
    'help.dyn.body': {
      en: '<p class="hp-intro">Feed-forward compressor that reduces dynamic range to match the reference crest factor and perceived density.</p><dl><dt>Threshold</dt><dd>Level above which gain reduction begins. Lower = more compression, starting earlier.</dd><dt>Ratio</dt><dd>Compression intensity: 2:1 gentle, 8:1 heavy, 20:1 near-limiting.</dd><dt>Attack</dt><dd>How fast compression engages after a transient. Slower = punchier transients pass through.</dd><dt>Release</dt><dd>How fast gain returns after signal drops. Too fast causes audible pumping.</dd><dt>Makeup Gain</dt><dd>Compensates volume lost through compression. Keep output near 0\u00a0dBFS.</dd></dl>',
      es: '<p class="hp-intro">Compresor feed-forward que reduce el rango din\u00e1mico para ajustarlo al factor de cresta y densidad percibida de la referencia.</p><dl><dt>Threshold (Umbral)</dt><dd>Nivel a partir del cual comienza la reducci\u00f3n de ganancia. M\u00e1s bajo = m\u00e1s compresi\u00f3n.</dd><dt>Ratio</dt><dd>Intensidad: 2:1 suave, 8:1 fuerte, 20:1 casi limitaci\u00f3n.</dd><dt>Attack (Ataque)</dt><dd>Velocidad de actuaci\u00f3n tras un transitorio. Lento = los transitorios pasan (m\u00e1s punch).</dd><dt>Release</dt><dd>Velocidad de recuperaci\u00f3n. Demasiado r\u00e1pido provoca pumping.</dd><dt>Makeup Gain</dt><dd>Compensa el volumen perdido. Mant\u00e9n la salida cerca de 0\u00a0dBFS.</dd></dl>',
      ca: '<p class="hp-intro">Compressor feed-forward que redueix el rang din\u00e0mic per ajustar-lo al factor de cresta i densitat percebuda de la refer\u00e8ncia.</p><dl><dt>Threshold (Llindar)</dt><dd>Nivell a partir del qual comen\u00e7a la reducci\u00f3 de guany. M\u00e9s baix = m\u00e9s compressi\u00f3.</dd><dt>Ratio</dt><dd>Intensitat: 2:1 suau, 8:1 fort, 20:1 quasi limitaci\u00f3.</dd><dt>Attack (Atac)</dt><dd>Velocitat d\u2019actuaci\u00f3 despr\u00e9s d\u2019un transitori. Lent = els transitoris passen (m\u00e9s punch).</dd><dt>Release</dt><dd>Velocitat de recuperaci\u00f3. Massa r\u00e0pid provoca pumping.</dd><dt>Makeup Gain</dt><dd>Compensa el volum perdut. Mant\u00e9 la sortida propera a 0\u00a0dBFS.</dd></dl>'
    },
    'help.hpf.body': {
      en: '<p class="hp-intro">High-pass filter removes low-frequency rumble. Saturation adds harmonic coloration. Both run before the dynamics stage.</p><dl><dt>HPF Frequency</dt><dd>Cutoff point. Everything below is rolled off at 24\u00a0dB/oct (4th-order \u2014 twice as steep as typical). Derived from sub-bass energy delta vs.\u00a0reference.</dd><dt>HPF Resonance (Q)</dt><dd>Slight resonant emphasis just before cutoff. Q\u00a0&gt;\u00a01 adds a subtle bump \u2014 useful to compensate for the filter\u2019s energy loss.</dd><dt>Saturation</dt><dd>Soft-clip waveshaper at 4\u00d7 oversampling. Adds even + odd harmonics for analog warmth. 0\u00a0% = transparent; 100\u00a0% = heavy coloration. Derived from spectral flatness difference.</dd></dl>',
      es: '<p class="hp-intro">El filtro paso alto elimina el rumble de bajas frecuencias. La saturaci\u00f3n a\u00f1ade coloraci\u00f3n arm\u00f3nica. Ambos act\u00faan antes de la etapa din\u00e1mica.</p><dl><dt>Frecuencia HPF</dt><dd>Punto de corte. Todo lo de abajo rueda a 24\u00a0dB/oct (4.\u00ba orden). Derivado del delta de energ\u00eda sub vs.\u00a0referencia.</dd><dt>Resonancia HPF (Q)</dt><dd>\u00c9nfasis resonante antes del corte. Q\u00a0&gt;\u00a01 a\u00f1ade un bump sutil \u2014 \u00fatil para compensar la p\u00e9rdida del filtro.</dd><dt>Saturaci\u00f3n</dt><dd>Waveshaper suave a 4\u00d7 oversampling. A\u00f1ade arm\u00f3nicos pares e impares para calidez anal\u00f3gica. 0\u00a0% = transparente; 100\u00a0% = coloraci\u00f3n intensa.</dd></dl>',
      ca: '<p class="hp-intro">El filtre passa-alt elimina el rumble de baixes freq\u00fc\u00e8ncies. La saturaci\u00f3 afegeix coloraci\u00f3 harm\u00f2nica. Tots dos actuen abans de l\u2019etapa din\u00e0mica.</p><dl><dt>Freq\u00fc\u00e8ncia HPF</dt><dd>Punt de tall. Tot el de sota passa a 24\u00a0dB/oct (4t ordre). Derivat del delta d\u2019energia sub vs.\u00a0refer\u00e8ncia.</dd><dt>Resson\u00e0ncia HPF (Q)</dt><dd>\u00c8mfasi resonant just abans del tall. Q\u00a0&gt;\u00a01 afegeix un bump subtil \u2014 \u00fatil per compensar la p\u00e8rdua del filtre.</dd><dt>Saturaci\u00f3</dt><dd>Waveshaper suau a 4\u00d7 oversampling. Afegeix harm\u00f2nics parells i imparells per a calidesa anal\u00f2gica. 0\u00a0% = transparent; 100\u00a0% = coloraci\u00f3 intensa.</dd></dl>'
    },
    'help.out.body': {
      en: '<p class="hp-intro">M/S matrix adjusts stereo width and center balance. The limiter ensures the signal never exceeds the ceiling. Output Gain sets the final export level.</p><dl><dt>Mid Gain</dt><dd>Adjusts the center (mono-compatible) component \u2014 kick, bass, lead vocals. Boost pushes center elements forward.</dd><dt>Side Gain</dt><dd>Adjusts stereo width. Boost to widen; cut to focus. Negative values narrow toward mono.</dd><dt>Limiter Ceiling</dt><dd>Absolute peak ceiling (brick wall, 20:1, 1\u00a0ms attack, 150\u00a0ms release). No sample exceeds this value after processing.</dd><dt>Output Gain</dt><dd>Final level trim applied after the limiter, before export. Use to match target loudness or create headroom.</dd></dl>',
      es: '<p class="hp-intro">La matriz M/S ajusta la imagen est\u00e9reo. El limitador garantiza que la se\u00f1al no supere el techo. El Output Gain ajusta el nivel de exportaci\u00f3n.</p><dl><dt>Mid Gain</dt><dd>Ajusta el componente central (compatible mono) \u2014 kick, bajo, voces. Boostar empuja el centro.</dd><dt>Side Gain</dt><dd>Ajusta la amplitud est\u00e9reo. Boostar ensancha; cortar focaliza. Valores negativos acercan al mono.</dd><dt>Limiter Ceiling</dt><dd>Techo absoluto de pico (brick wall, 20:1, 1\u00a0ms ataque, 150\u00a0ms release). Ninguna muestra lo supera.</dd><dt>Output Gain</dt><dd>Ajuste de nivel final tras el limitador. Usa para ajustar la sonoridad o crear headroom.</dd></dl>',
      ca: '<p class="hp-intro">La matriu M/S ajusta la imatge est\u00e8reo. El limitador garanteix que el senyal no superi el sostre. El Output Gain ajusta el nivell d\u2019exportaci\u00f3.</p><dl><dt>Mid Gain</dt><dd>Ajusta el component central (compatible mono) \u2014 kick, baix, veus. Boostar empeny el centre.</dd><dt>Side Gain</dt><dd>Ajusta l\u2019amplada est\u00e8reo. Boostar eixampla; tallar focalitza. Valors negatius apropen al mono.</dd><dt>Limiter Ceiling</dt><dd>Sostre absolut de pic (brick wall, 20:1, 1\u00a0ms atac, 150\u00a0ms release). Cap mostra el supera.</dd><dt>Output Gain</dt><dd>Ajust de nivell final despr\u00e9s del limitador. Usa per ajustar la sonoritat o crear headroom.</dd></dl>'
    }
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
