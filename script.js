// ============================================================
// RACK4MASTER-REFERENCE
// Pure 7-bit ASCII in JS. var + callbacks throughout.
// ============================================================

var audioCtx     = null;
var refBuffer    = null;
var targetBuffer = null;
var currentTargetFileName = ''; // nombre base sin extensión

// Waveform peak caches
var refPeaks     = null;
var targetPeaks  = null;
var resultPeaks  = null;

// Spectrum data: {mag:Float32Array, sr, binHz}
var refSpecData     = null;
var targetSpecData  = null;
var resultSpecData  = null; // preview computed after analysis

// Player state objects
var refPlayer  = { src:null, fade:null, startTime:0, offset:0, playing:false };
var tgtPlayer  = { src:null, fade:null, startTime:0, offset:0, playing:false };

// Live chain
var liveNodes   = { active:false, source:null, eqNodes:null, fadeGain:null, analyser:null, bypassGain:null, bypassAnalyser:null, inputAnalyser:null };
var livePlaying = false;
var liveOffset  = 0;
var liveStart   = 0;
var syncRafId   = null;
var abMode      = 'B'; // 'A' = dry target, 'B' = processed

// EQ parameters
var ISO30 = [25,31.5,40,50,63,80,100,125,160,200,250,315,400,500,630,800,
             1000,1250,1600,2000,2500,3150,4000,5000,6300,8000,10000,12500,16000,20000];
var EQ_GROUPS = [[0,1,2,3,4,5],[6,7,8],[9,10,11,12,13],[14,15,16,17],[18,19,20,21],[22,23,24,25],[26,27,28,29]];
var EQ_FREQS  = [50,100,300,1000,3000,8000,16000];
var EQ_QS     = [0.7,1.0,1.0,1.0,1.0,1.0,0.7];
var EQ_KEYS   = ['eq50','eq100','eq300','eq1k','eq3k','eq8k','eq16k'];

// DOM refs
var canvasRef    = document.getElementById('waveRef');
var canvasTarget = document.getElementById('waveTarget');
var canvasResult = document.getElementById('waveResult');
var canvasSpecRef    = document.getElementById('specRef');
var canvasSpecTarget = document.getElementById('specTarget');
var canvasSpecResult = document.getElementById('specResult');
var canvasCompSpec   = document.getElementById('compSpec');
var dropRef      = document.getElementById('dropRef');
var dropTarget   = document.getElementById('dropTarget');
var fileRef      = document.getElementById('fileRef');
var fileTarget   = document.getElementById('fileTarget');
var ledRef       = document.getElementById('ledRef');
var ledTarget    = document.getElementById('ledTarget');
var ledResult    = document.getElementById('ledResult');
var infoRef      = document.getElementById('infoRef');
var infoTarget   = document.getElementById('infoTarget');
var sLed         = document.getElementById('sLed');
var sText        = document.getElementById('sText');
var meydaBadge   = document.getElementById('meydaBadge');
var analyzeBtn   = document.getElementById('analyzeBtn');
var analysisPanel    = document.getElementById('analysisPanel');
var analysisContent  = document.getElementById('analysisContent');
var resultSection    = document.getElementById('resultSection');
var fxSection        = document.getElementById('fxSection');
var compPanel        = document.getElementById('compPanel');
var actionRow        = document.getElementById('actionRow');
var playRef    = document.getElementById('playRef');
var stopRef    = document.getElementById('stopRef');
var playTarget = document.getElementById('playTarget');
var stopTarget = document.getElementById('stopTarget');
var playResult = document.getElementById('playResult');
var stopResult = document.getElementById('stopResult');
var downloadBtn = document.getElementById('downloadBtn');
var resetBtn    = document.getElementById('resetBtn');
var loopRefBtn    = document.getElementById('loopRef');
var loopTargetBtn = document.getElementById('loopTarget');
var loopResultBtn = document.getElementById('loopResultBtn');
var loopSyncBtn   = document.getElementById('loopSyncBtn');
var confirmModal  = document.getElementById('confirmModal');
var confirmOk     = document.getElementById('confirmOk');
var confirmCancel = document.getElementById('confirmCancel');

// Loop state: start/end as 0..1 fraction of duration
var refLoop    = { enabled:false, start:0.2, end:0.8, dragging:null };
var tgtLoop    = { enabled:false, start:0.2, end:0.8, dragging:null };
var resultLoop = { enabled:false, start:0.2, end:0.8 };
var loopSync   = true; // sync result loop with target loop

if (window.Meyda) meydaBadge.classList.add('on');

// ============================================================
// COLLAPSIBLE ANALYSIS PANEL
// ============================================================
var analysisPanelHeader = document.getElementById('analysisPanelHeader');
analysisPanelHeader.addEventListener('click', function() {
    analysisPanel.classList.toggle('is-open');
});
function showAnalysisPanelCollapsed() {
    analysisPanel.style.display = '';
    analysisPanel.classList.remove('is-open');
}

function setStatus(msg, st) {
    sText.textContent = msg;
    sLed.className = 's-led' + (st===1?' on':st===2?' ok':'');
}
function initCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

// ============================================================
// FFT + SPECTRUM UTILITIES
// ============================================================

function computeFFTMag(slice) {
    // slice: Float32Array, length must be power of 2
    var n  = slice.length;
    var re = new Float32Array(n), im = new Float32Array(n);
    for (var i = 0; i < n; i++) re[i] = slice[i];
    // Bit-reversal
    for (var i = 1, j = 0; i < n; i++) {
        var bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) { var t=re[i];re[i]=re[j];re[j]=t; t=im[i];im[i]=im[j];im[j]=t; }
    }
    // Butterfly
    for (var len = 2; len <= n; len <<= 1) {
        var ang = 2*Math.PI/len, wR = Math.cos(ang), wI = -Math.sin(ang);
        for (var ii = 0; ii < n; ii += len) {
            var cR = 1, cI = 0, half = len >> 1;
            for (var jj = 0; jj < half; jj++) {
                var uR=re[ii+jj], uI=im[ii+jj];
                var vR=re[ii+jj+half]*cR - im[ii+jj+half]*cI;
                var vI=re[ii+jj+half]*cI + im[ii+jj+half]*cR;
                re[ii+jj]=uR+vR; im[ii+jj]=uI+vI;
                re[ii+jj+half]=uR-vR; im[ii+jj+half]=uI-vI;
                var nR=cR*wR-cI*wI; cI=cR*wI+cI*wR; cR=nR;
            }
        }
    }
    var mag = new Float32Array(n >> 1);
    for (var i = 0; i < (n>>1); i++) mag[i] = Math.sqrt(re[i]*re[i] + im[i]*im[i]);
    return mag;
}

function computeSpectrumFromBuffer(buf) {
    var SR = buf.sampleRate, FRAME = 2048, nBins = FRAME >> 1;
    var MAX = Math.min(buf.length, Math.floor(SR * 30));
    var mono = new Float32Array(MAX);
    for (var ch = 0; ch < buf.numberOfChannels; ch++) {
        var d = buf.getChannelData(ch);
        for (var i = 0; i < MAX; i++) mono[i] += d[i] / buf.numberOfChannels;
    }
    var hann = new Float32Array(FRAME);
    for (var i = 0; i < FRAME; i++) hann[i] = 0.5*(1-Math.cos(2*Math.PI*i/FRAME));
    var avg = new Float64Array(nBins), n = 0;
    for (var s = 0; s + FRAME <= mono.length; s += FRAME) {
        var sl = new Float32Array(FRAME);
        for (var i = 0; i < FRAME; i++) sl[i] = mono[s+i] * hann[i];
        var mag = computeFFTMag(sl);
        for (var i = 0; i < nBins; i++) avg[i] += mag[i];
        n++;
    }
    var result = new Float32Array(nBins);
    if (n > 0) for (var i = 0; i < nBins; i++) result[i] = avg[i] / n;
    return { mag:result, sr:SR, binHz:SR/FRAME };
}

var MIN_F = 20, MAX_F = 20000, MIN_DB = -80, MAX_DB = 0;

function fToX(f, W) { return Math.log(f/MIN_F) / Math.log(MAX_F/MIN_F) * W; }
function mToY(m, H) {
    var db = 20*Math.log10(m + 1e-9);
    db = Math.max(MIN_DB, Math.min(MAX_DB, db));
    return ((MAX_DB - db) / (MAX_DB - MIN_DB)) * H;
}
function dbToY(db, H) {
    db = Math.max(MIN_DB, Math.min(MAX_DB, db));
    return ((MAX_DB - db) / (MAX_DB - MIN_DB)) * H;
}

function drawSpecGrid(ctx, W, H) {
    var freqs = [50,100,200,500,1000,2000,5000,10000,20000];
    var lbls  = ['50','100','200','500','1k','2k','5k','10k','20k'];
    ctx.lineWidth = 1;
    ctx.font = '8px Share Tech Mono, monospace';
    for (var fi = 0; fi < freqs.length; fi++) {
        var x = fToX(freqs[fi], W);
        ctx.strokeStyle = 'rgba(255,255,255,.04)';
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
        if (x > 8 && x < W-18) {
            ctx.fillStyle = 'rgba(90,95,140,.9)';
            ctx.fillText(lbls[fi], x+2, H-3);
        }
    }
    var dbs = [-20,-40,-60];
    dbs.forEach(function(db) {
        var y = dbToY(db, H);
        ctx.strokeStyle = 'rgba(255,255,255,.03)';
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
        ctx.fillStyle = 'rgba(90,95,140,.7)';
        ctx.fillText(db+'dB', 2, y-2);
    });
}

function buildSpecPath(canvas, specData, ctx) {
    var W = canvas.width, H = canvas.height, binHz = specData.binHz;
    var path = [];
    for (var px = 0; px < W; px++) {
        var fLo = MIN_F * Math.pow(MAX_F/MIN_F, px/W);
        var fHi = MIN_F * Math.pow(MAX_F/MIN_F, (px+1)/W);
        var bLo = Math.max(1, Math.floor(fLo/binHz));
        var bHi = Math.min(specData.mag.length-1, Math.ceil(fHi/binHz));
        var sum = 0, cnt = 0;
        for (var b = bLo; b <= bHi; b++) { sum += specData.mag[b]; cnt++; }
        path.push(mToY(cnt > 0 ? sum/cnt : 0, H));
    }
    return path;
}

function drawSpecCurve(canvas, specData, stroke, fill) {
    var W = canvas.width, H = canvas.height;
    if (!specData) return;
    var path = buildSpecPath(canvas, specData, null);
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (var i = 0; i < path.length; i++) ctx.lineTo(i, path[i]);
    ctx.lineTo(W-1, H); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, path[0]);
    for (var i = 1; i < path.length; i++) ctx.lineTo(i, path[i]);
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke();
}

function drawSpecFromAnalyser(canvas, analyser, stroke, fill) {
    var fbc = analyser.frequencyBinCount;
    var sr  = analyser.context.sampleRate;
    var binHz = sr / analyser.fftSize;
    var data  = new Float32Array(fbc);
    analyser.getFloatFrequencyData(data);
    var W = canvas.width, H = canvas.height;
    var path = [];
    for (var px = 0; px < W; px++) {
        var fLo = MIN_F * Math.pow(MAX_F/MIN_F, px/W);
        var fHi = MIN_F * Math.pow(MAX_F/MIN_F, (px+1)/W);
        var bLo = Math.max(1, Math.floor(fLo/binHz));
        var bHi = Math.min(fbc-1, Math.ceil(fHi/binHz));
        var sum = 0, cnt = 0;
        for (var b = bLo; b <= bHi; b++) { if (data[b]>-150){sum+=data[b];cnt++;} }
        path.push(dbToY(cnt>0?sum/cnt:-80, H));
    }
    var ctx = canvas.getContext('2d');
    ctx.beginPath(); ctx.moveTo(0,H);
    for (var i = 0; i < path.length; i++) ctx.lineTo(i, path[i]);
    ctx.lineTo(W-1,H); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, path[0]);
    for (var i = 1; i < path.length; i++) ctx.lineTo(i, path[i]);
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke();
}

function clearSpec(canvas) {
    var W = canvas.offsetWidth || 800, H = canvas.height;
    if (canvas.width !== W) canvas.width = W;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#040508'; ctx.fillRect(0,0,W,H);
    drawSpecGrid(ctx, W, H);
}

function redrawRefSpec() {
    clearSpec(canvasSpecRef);
    if (refSpecData) drawSpecCurve(canvasSpecRef, refSpecData, '#ffaa00', 'rgba(255,170,0,.12)');
}
function redrawTargetSpec() {
    clearSpec(canvasSpecTarget);
    if (targetSpecData) drawSpecCurve(canvasSpecTarget, targetSpecData, '#4499ff', 'rgba(68,153,255,.12)');
}
function redrawResultSpec() {
    clearSpec(canvasSpecResult);
    if (liveNodes.analyser && livePlaying) {
        drawSpecFromAnalyser(canvasSpecResult, liveNodes.analyser, '#00ffa3', 'rgba(0,255,163,.14)');
    } else if (resultSpecData) {
        drawSpecCurve(canvasSpecResult, resultSpecData, '#00ffa3', 'rgba(0,255,163,.10)');
    }
}

function drawComparativeSpec() {
    var W = canvasCompSpec.offsetWidth || 800, H = canvasCompSpec.height;
    if (canvasCompSpec.width !== W) canvasCompSpec.width = W;
    var ctx = canvasCompSpec.getContext('2d');
    ctx.fillStyle = '#040508'; ctx.fillRect(0,0,W,H);
    drawSpecGrid(ctx, W, H);
    if (refSpecData)    drawSpecCurve(canvasCompSpec, refSpecData, '#ffaa00', 'rgba(255,170,0,.07)');
    if (targetSpecData) drawSpecCurve(canvasCompSpec, targetSpecData, '#4499ff', 'rgba(68,153,255,.07)');
    if (liveNodes.analyser && livePlaying) {
        drawSpecFromAnalyser(canvasCompSpec, liveNodes.analyser, '#00ffa3', 'rgba(0,255,163,.1)');
    } else if (resultSpecData) {
        drawSpecCurve(canvasCompSpec, resultSpecData, '#00ffa3', 'rgba(0,255,163,.07)');
    }
}

// Compute result spectrum preview: target spectrum with HPF+EQ applied mathematically
function computeResultSpecPreview() {
    if (!targetSpecData) return null;
    var hpfF = parseFloat(sliders.hpfFreq.el.value);
    var hpfQv = parseFloat(sliders.hpfQ.el.value);
    var mag = new Float32Array(targetSpecData.mag.length);
    for (var b = 0; b < mag.length; b++) {
        var freq = b * targetSpecData.binHz;
        if (freq < 1) continue;
        var gain = 1;
        // HPF 2nd-order response
        if (hpfF > 21) {
            var r = freq/hpfF, r2 = r*r;
            var denom = Math.sqrt(Math.pow(1-r2,2) + r2/(hpfQv*hpfQv));
            gain *= r2 / (denom + 1e-12);
        }
        // EQ peaking bands (bell approximation)
        for (var ei = 0; ei < EQ_FREQS.length; ei++) {
            var gDb = parseFloat(sliders[EQ_KEYS[ei]].el.value);
            if (Math.abs(gDb) > 0.05) {
                var fc = EQ_FREQS[ei], Q = EQ_QS[ei];
                var lr = Math.log(freq/fc);
                var bell = Math.exp(-0.5 * lr*lr * Q*Q);
                gain *= Math.pow(10, gDb/20 * bell);
            }
        }
        mag[b] = targetSpecData.mag[b] * Math.max(0, gain);
    }
    return { mag:mag, sr:targetSpecData.sr, binHz:targetSpecData.binHz };
}

// ============================================================
// WAVEFORM CANVAS
// ============================================================
function computePeaks(buf, W) {
    var len=buf.length, nCh=buf.numberOfChannels;
    var mx=new Float32Array(W), mn=new Float32Array(W);
    for (var x=0; x<W; x++) {
        var s=Math.floor(x/W*len), e=Math.min(Math.floor((x+1)/W*len),len);
        var hi=0, lo=0;
        for (var i=s; i<e; i++) {
            var v=0;
            for (var ch=0;ch<nCh;ch++) v+=buf.getChannelData(ch)[i];
            v/=nCh;
            if(v>hi)hi=v; if(v<lo)lo=v;
        }
        mx[x]=hi; mn[x]=lo;
    }
    return {max:mx,min:mn};
}

function drawWave(canvas, peaks, pos, bright, dim2, loop) {
    var W=canvas.offsetWidth||800, H=canvas.height;
    if (canvas.width!==W) canvas.width=W;
    var ctx=canvas.getContext('2d');
    ctx.fillStyle='#060609'; ctx.fillRect(0,0,W,H);

    // Loop background shading
    if (loop && loop.enabled) {
        var lx1=Math.round(loop.start*W), lx2=Math.round(loop.end*W);
        ctx.fillStyle='rgba(255,170,0,.07)';
        ctx.fillRect(lx1,0,lx2-lx1,H);
    }

    if (peaks) {
        var mid=H*0.5, px=Math.round((pos||0)*W), pw=Math.min(peaks.max.length,W);
        for (var x=0; x<pw; x++) {
            var hi=peaks.max[x]*mid*0.88, lo=-peaks.min[x]*mid*0.88;
            ctx.fillStyle=(x<=px)?bright:dim2;
            if(hi>0.5) ctx.fillRect(x,mid-hi,1,hi);
            if(lo>0.5) ctx.fillRect(x,mid,1,lo);
        }
        ctx.fillStyle='rgba(255,255,255,.04)'; ctx.fillRect(0,mid-.5,W,1);
        if (pos>0&&pos<1) {
            ctx.fillStyle='rgba(255,255,255,.75)'; ctx.fillRect(px,0,1,H);
            ctx.fillStyle='rgba(255,255,255,.1)';  ctx.fillRect(px-2,0,5,H);
        }
    }

    // Loop handles on top
    if (loop && loop.enabled) {
        var lx1=Math.round(loop.start*W), lx2=Math.round(loop.end*W);
        // Region border
        ctx.strokeStyle='rgba(255,170,0,.35)'; ctx.lineWidth=1;
        ctx.strokeRect(lx1+1,0,lx2-lx1-2,H);
        // Start handle line + grip tab
        ctx.fillStyle='#ffaa00';
        ctx.fillRect(lx1-1,0,3,H);
        ctx.fillRect(lx1-5,0,13,14);
        ctx.fillStyle='#000'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
        ctx.fillText('◁',lx1+1,10);
        // End handle line + grip tab
        ctx.fillStyle='#ffaa00';
        ctx.fillRect(lx2-1,0,3,H);
        ctx.fillRect(lx2-7,0,13,14);
        ctx.fillStyle='#000';
        ctx.fillText('▷',lx2+1,10);
        ctx.textAlign='left';
    }
}

function rRef(p)  { drawWave(canvasRef,    refPeaks,    p, '#ffaa00','#2a1800', refLoop); }
function rTgt(p)  { drawWave(canvasTarget, targetPeaks, p, '#4499ff','#051c38', tgtLoop); }
function rRes(p)  { drawWave(canvasResult, resultPeaks, p, '#00ffa3','#003320', resultLoop); }

window.addEventListener('resize', function() {
    var rp = refPlayer.playing&&audioCtx&&refBuffer ? Math.min(1,(audioCtx.currentTime-refPlayer.startTime)/refBuffer.duration) : 0;
    var tp = tgtPlayer.playing&&audioCtx&&targetBuffer ? Math.min(1,(audioCtx.currentTime-tgtPlayer.startTime)/targetBuffer.duration) : 0;
    var lp = livePlaying&&audioCtx&&targetBuffer ? Math.min(1,(audioCtx.currentTime-liveStart)/targetBuffer.duration) : 0;
    if(refPeaks)    rRef(rp);
    if(targetPeaks) rTgt(tp);
    if(resultPeaks) rRes(lp);
    redrawRefSpec(); redrawTargetSpec(); redrawResultSpec(); drawComparativeSpec();
});

// ============================================================
// FILE LOADING
// ============================================================
function setupDrop(div, inp, isRef) {
    inp.style.display = 'none';
    div.addEventListener('click',    function(){if(!div.classList.contains('loaded'))inp.click();});
    div.addEventListener('dragover', function(e){e.preventDefault();div.classList.add('drag-over');});
    div.addEventListener('dragleave',function(){div.classList.remove('drag-over');});
    div.addEventListener('drop',     function(e){e.preventDefault();div.classList.remove('drag-over');var f=e.dataTransfer.files[0];if(f)loadAudio(f,isRef);});
    inp.addEventListener('change',   function(){if(inp.files[0])loadAudio(inp.files[0],isRef);});
}

function loadAudio(file, isRef) {
    initCtx();
    setStatus('LOADING...',1);
    // Stop playback of this channel before replacing the buffer
    if (isRef) {
        if (refPlayer.playing) { simpleStop(refPlayer, ledRef, playRef, true); refPlayer.offset = 0; }
    } else {
        if (tgtPlayer.playing) { simpleStop(tgtPlayer, ledTarget, playTarget, true); tgtPlayer.offset = 0; }
        if (livePlaying) { stopLive(); liveOffset = 0; }
    }
    var reader = new FileReader();
    reader.onload = function(ev) {
        audioCtx.decodeAudioData(ev.target.result, function(buf) {
            var m=Math.floor(buf.duration/60), s=Math.floor(buf.duration%60).toString();
            while(s.length<2) s='0'+s;
            var info = file.name+'  |  '+m+':'+s+'  |  '+(buf.sampleRate/1000).toFixed(1)+' kHz  |  '+buf.numberOfChannels+'ch';
            if (isRef) {
                refBuffer = buf;
                refPeaks = computePeaks(buf, canvasRef.offsetWidth||800);
                rRef(0);
                dropRef.classList.add('loaded');
                infoRef.textContent = info;
                ledRef.className = 'led loaded';
                // Compute spectrum async (FFT can take ~100ms)
                setTimeout(function(){
                    refSpecData = computeSpectrumFromBuffer(buf);
                    redrawRefSpec();
                    if (targetSpecData) drawComparativeSpec();
                }, 60);
            } else {
                targetBuffer = buf;
                currentTargetFileName = file.name.replace(/\.[^.]+$/, ''); // guardar nombre base sin extensión
                targetPeaks = computePeaks(buf, canvasTarget.offsetWidth||800);
                rTgt(0);
                dropTarget.classList.add('loaded');
                infoTarget.textContent = info;
                ledTarget.className = 'led loaded';
                setTimeout(function(){
                    targetSpecData = computeSpectrumFromBuffer(buf);
                    redrawTargetSpec();
                    if (refSpecData) drawComparativeSpec();
                }, 60);
            }
            setStatus('READY',0);
        }, function(){setStatus('DECODE ERROR',0);});
    };
    reader.readAsArrayBuffer(file);
}

setupDrop(dropRef,    fileRef,    true);
setupDrop(dropTarget, fileTarget, false);
document.getElementById('loadRef').addEventListener('click',    function(){fileRef.click();});
document.getElementById('loadTarget').addEventListener('click', function(){fileTarget.click();});

// ============================================================
// SIMPLE PLAYBACK (ref + target)
// ============================================================
function simplePlay(buf, player, led, btn, loop) {
    if (!buf||!audioCtx) return;
    initCtx();
    if (player.src) { player.src.onended=null; try{player.src.stop();}catch(e){} player.src=null; }
    var src  = audioCtx.createBufferSource(); src.buffer = buf;
    var fade = audioCtx.createGain();
    fade.gain.setValueAtTime(0, audioCtx.currentTime);
    fade.gain.linearRampToValueAtTime(1, audioCtx.currentTime+0.006);
    src.connect(fade); fade.connect(audioCtx.destination);

    var loopActive = loop && loop.enabled;
    var off;
    if (loopActive) {
        var lsec = loop.start * buf.duration;
        var lend = loop.end   * buf.duration;
        src.loop = true; src.loopStart = lsec; src.loopEnd = lend;
        // Use player.offset for seek; fall back to loop start only if outside the loop region
        var seekPos = Math.max(0, Math.min(player.offset, buf.duration - 0.01));
        off = (seekPos >= lsec && seekPos < lend) ? seekPos : lsec;
    } else {
        off = Math.max(0, Math.min(player.offset, buf.duration-0.01));
    }
    src.start(0, off);
    player.src=src; player.fade=fade; player.startTime=audioCtx.currentTime-off; player.playing=true;
    btn.textContent='\u23F8 PAUSE';
    if(led) led.className='led playing';
    src.onended=function(){if(player.playing&&player.src===src){player.playing=false;player.offset=0;btn.textContent='\u25B6 PLAY';if(led)led.className='led loaded';}};
}

function simpleStop(player, led, btn, immed) {
    if (player.fade&&audioCtx&&!immed) {
        var now=audioCtx.currentTime;
        player.fade.gain.cancelScheduledValues(now);
        player.fade.gain.setValueAtTime(player.fade.gain.value,now);
        player.fade.gain.linearRampToValueAtTime(0,now+0.012);
    }
    var s2=player.src;
    setTimeout(function(){if(s2){s2.onended=null;try{s2.stop();}catch(e){}}},immed?0:16);
    player.src=null; player.playing=false; btn.textContent='\u25B6 PLAY';
    if(led) led.className='led loaded';
}

playRef.addEventListener('click',function(){
    if(!refBuffer){fileRef.click();return;}
    if(refPlayer.playing){refPlayer.offset=audioCtx.currentTime-refPlayer.startTime;simpleStop(refPlayer,ledRef,playRef);}
    else simplePlay(refBuffer,refPlayer,ledRef,playRef,refLoop);
});
stopRef.addEventListener('click',function(){simpleStop(refPlayer,ledRef,playRef);refPlayer.offset=0;rRef(0);});

playTarget.addEventListener('click',function(){
    if(!targetBuffer){fileTarget.click();return;}
    if(tgtPlayer.playing){tgtPlayer.offset=audioCtx.currentTime-tgtPlayer.startTime;simpleStop(tgtPlayer,ledTarget,playTarget);}
    else simplePlay(targetBuffer,tgtPlayer,ledTarget,playTarget,tgtLoop);
});
stopTarget.addEventListener('click',function(){simpleStop(tgtPlayer,ledTarget,playTarget);tgtPlayer.offset=0;rTgt(0);});

// Playhead RAF loop
(function rafH(){
    requestAnimationFrame(rafH);
    if(refPlayer.playing&&audioCtx&&refBuffer) {
        var elapsed = audioCtx.currentTime - refPlayer.startTime;
        var p;
        if (refLoop.enabled) {
            var lsec=refLoop.start*refBuffer.duration, ldur=(refLoop.end-refLoop.start)*refBuffer.duration;
            if(ldur>0) p=refLoop.start+((elapsed-lsec+ldur*10)%ldur)/refBuffer.duration; else p=elapsed/refBuffer.duration;
        } else { p=elapsed/refBuffer.duration; }
        rRef(Math.min(1,p));
    }
    if(tgtPlayer.playing&&audioCtx&&targetBuffer) {
        var elapsed2 = audioCtx.currentTime - tgtPlayer.startTime;
        var p2;
        if (tgtLoop.enabled) {
            var lsec2=tgtLoop.start*targetBuffer.duration, ldur2=(tgtLoop.end-tgtLoop.start)*targetBuffer.duration;
            if(ldur2>0) p2=tgtLoop.start+((elapsed2-lsec2+ldur2*10)%ldur2)/targetBuffer.duration; else p2=elapsed2/targetBuffer.duration;
        } else { p2=elapsed2/targetBuffer.duration; }
        rTgt(Math.min(1,p2));
    }
})();

// ============================================================
// LOOP HANDLE DRAG + SEEK
// ============================================================
var HANDLE_HIT = 9; // px hit zone half-width for handles

function getLoopHandleHit(canvas, loop, ex) {
    if (!loop.enabled) return null;
    var W = canvas.offsetWidth || 800;
    var lx1 = Math.round(loop.start * W);
    var lx2 = Math.round(loop.end   * W);
    if (Math.abs(ex - lx1) <= HANDLE_HIT) return 'start';
    if (Math.abs(ex - lx2) <= HANDLE_HIT) return 'end';
    return null;
}

function setupLoopDragLazy(canvas, loop, getBuf, redraw, getPlayer, led, playBtn, onChanged) {
    var dragging = null;
    canvas.addEventListener('mousedown', function(e) {
        var buf = getBuf(); if (!buf) return;
        var r = canvas.getBoundingClientRect();
        var ex = e.clientX - r.left;
        var hit = getLoopHandleHit(canvas, loop, ex);
        if (hit) { dragging = hit; e.preventDefault(); return; }
        // Not a handle — seek
        var p = ex / canvas.offsetWidth;
        var player = getPlayer();
        if (player.playing) {
            simpleStop(player, led, playBtn, true);
            player.offset = p * buf.duration;
            simplePlay(buf, player, led, playBtn, loop);
        } else { player.offset = p * buf.duration; redraw(p); }
    });
    window.addEventListener('mousemove', function(e) {
        var buf = getBuf(); if (!dragging || !buf) return;
        var player = getPlayer();
        var r = canvas.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (e.clientX - r.left) / canvas.offsetWidth));
        if (dragging === 'start') loop.start = Math.min(p, loop.end - 0.02);
        else loop.end = Math.max(p, loop.start + 0.02);
        redraw(player.playing ? 0 : (player.offset / (buf.duration||1)));
        canvas.style.cursor = 'ew-resize';
        if (onChanged) onChanged();
    });
    window.addEventListener('mouseup', function() {
        if (!dragging) return;
        dragging = null;
        canvas.style.cursor = '';
        var buf = getBuf(); var player = getPlayer();
        if (loop.enabled && player.playing && buf) {
            simpleStop(player, led, playBtn, true);
            simplePlay(buf, player, led, playBtn, loop);
        }
        if (onChanged) onChanged();
    });
    canvas.addEventListener('mousemove', function(e) {
        if (dragging) return;
        var r = canvas.getBoundingClientRect();
        canvas.style.cursor = getLoopHandleHit(canvas, loop, e.clientX - r.left) ? 'ew-resize' : '';
    });
}

setupLoopDragLazy(canvasRef,    refLoop,
    function(){return refBuffer;},   function(p){rRef(p);},
    function(){return refPlayer;},   ledRef,    playRef);

function propagateToResult() {
    if (!loopSync) return;
    resultLoop.start = tgtLoop.start;
    resultLoop.end   = tgtLoop.end;
    if (targetBuffer && resultPeaks) {
        var rp = livePlaying && audioCtx ? (audioCtx.currentTime - liveStart) / targetBuffer.duration : liveOffset / (targetBuffer.duration || 1);
        rRes(Math.max(0, Math.min(1, rp)));
    }
}

setupLoopDragLazy(canvasTarget, tgtLoop,
    function(){return targetBuffer;},function(p){rTgt(p);},
    function(){return tgtPlayer;},   ledTarget, playTarget,
    propagateToResult);

// Result canvas: seek + loop handle drag
// When sync ON: dragging result handles also moves target handles (bidirectional)
// When sync OFF: result loop region is fully independent
(function() {
    var dragging = null;
    canvasResult.addEventListener('mousedown', function(e) {
        if (!targetBuffer) return;
        var r = canvasResult.getBoundingClientRect();
        var ex = e.clientX - r.left;
        // Handles are always hittable (sync ON = bidirectional, sync OFF = independent)
        if (resultLoop.enabled) {
            var hit = getLoopHandleHit(canvasResult, resultLoop, ex);
            if (hit) { dragging = hit; e.preventDefault(); return; }
        }
        var p = ex / canvasResult.offsetWidth;
        if (livePlaying) startLive(p * targetBuffer.duration, true);
        else { liveOffset = p * targetBuffer.duration; rRes(p); }
    });
    window.addEventListener('mousemove', function(e) {
        if (!dragging || !targetBuffer) return;
        var r = canvasResult.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (e.clientX - r.left) / canvasResult.offsetWidth));
        if (dragging === 'start') resultLoop.start = Math.min(p, resultLoop.end - 0.02);
        else                       resultLoop.end   = Math.max(p, resultLoop.start + 0.02);
        // Bidirectional: if synced, propagate to target loop too
        if (loopSync) {
            tgtLoop.start = resultLoop.start;
            tgtLoop.end   = resultLoop.end;
            rTgt(tgtPlayer.playing ? 0 : tgtPlayer.offset / (targetBuffer.duration || 1));
        }
        rRes(livePlaying ? 0 : liveOffset / (targetBuffer.duration || 1));
        canvasResult.style.cursor = 'ew-resize';
    });
    window.addEventListener('mouseup', function() {
        if (!dragging) return;
        dragging = null;
        canvasResult.style.cursor = '';
        if (resultLoop.enabled && livePlaying && targetBuffer) startLive(liveOffset, true);
        // Restart target player if it was looping and synced
        if (loopSync && tgtLoop.enabled && tgtPlayer.playing && targetBuffer) {
            simpleStop(tgtPlayer, ledTarget, playTarget, true);
            simplePlay(targetBuffer, tgtPlayer, ledTarget, playTarget, tgtLoop);
        }
    });
    canvasResult.addEventListener('mousemove', function(e) {
        if (dragging) return;
        var r = canvasResult.getBoundingClientRect();
        canvasResult.style.cursor = (resultLoop.enabled && getLoopHandleHit(canvasResult, resultLoop, e.clientX - r.left)) ? 'ew-resize' : '';
    });
})();

// ============================================================
// ANALYSIS ENGINE
// ============================================================
function analyzeAudio(refBuf, tgtBuf) {
    var SR=refBuf.sampleRate, MAX=Math.floor(SR*30);
    var cl=function(v,lo,hi){return Math.max(lo,Math.min(hi,v));};
    var r1=function(v){return Math.round(v*10)/10;};

    function toMono(buf){
        var len=Math.min(buf.length,MAX), mono=new Float32Array(len);
        for(var ch=0;ch<buf.numberOfChannels;ch++){var d=buf.getChannelData(ch);for(var i=0;i<len;i++)mono[i]+=d[i]/buf.numberOfChannels;}
        return mono;
    }
    function rmsDb(s){var ss=0;for(var i=0;i<s.length;i++)ss+=s[i]*s[i];return 20*Math.log10(Math.sqrt(ss/s.length)+1e-12);}
    function peakDb(s){var pk=0;for(var i=0;i<s.length;i++){var a=Math.abs(s[i]);if(a>pk)pk=a;}return 20*Math.log10(pk+1e-12);}
    function truePeak(s){
        var pk=0;
        for(var i=1;i<s.length-2;i++){
            var p=0.5*s[i]+0.5*s[i+1]-0.0625*(s[i+2]-s[i-1])+0.0625*(s[i+1]-s[i]);
            var a=Math.abs(p); if(a>pk)pk=a; a=Math.abs(s[i]); if(a>pk)pk=a;
        }
        return 20*Math.log10(pk+1e-12);
    }
    function lufs(s){
        var Kf=Math.tan(Math.PI*1500/SR),Vh=Math.pow(10,4/20);
        var d1=1+Math.sqrt(2)*Kf+Kf*Kf;
        var b0=(Vh+Math.sqrt(2*Vh)*Kf+Kf*Kf)/d1,b1=2*(Kf*Kf-Vh)/d1,b2=(Vh-Math.sqrt(2*Vh)*Kf+Kf*Kf)/d1;
        var a1=2*(Kf*Kf-1)/d1,a2=(1-Math.sqrt(2)*Kf+Kf*Kf)/d1;
        var p=new Float32Array(s.length),x1=0,x2=0,y1=0,y2=0;
        for(var i=0;i<s.length;i++){var y=b0*s[i]+b1*x1+b2*x2-a1*y1-a2*y2;x2=x1;x1=s[i];y2=y1;y1=y;p[i]=y;}
        var w=2*Math.PI*38/SR,sW=Math.sin(w),cW=Math.cos(w),al=sW/(2*0.5);
        var bh=(1+cW)/2,bh1=-(1+cW),a0=1+al,a1h=-2*cW,a2h=1-al;
        var hx1=0,hx2=0,hy1=0,hy2=0,hs=0;
        for(var j=0;j<p.length;j++){var y2=(bh*p[j]+bh1*hx1+bh*hx2-a1h*hy1-a2h*hy2)/a0;hx2=hx1;hx1=p[j];hy2=hy1;hy1=y2;hs+=y2*y2;}
        return -0.691+10*Math.log10(hs/p.length+1e-24);
    }
    function lra(s){
        // EBU R128: 3-second blocks, 75% overlap (hop = 0.75s)
        var bl=Math.floor(SR*3),st=Math.floor(SR*0.75),bks=[];
        for(var i=0;i+bl<=s.length;i+=st){var ss=0;for(var j=i;j<i+bl;j++)ss+=s[j]*s[j];var lk=10*Math.log10(ss/bl+1e-24);if(lk>-70)bks.push(lk);}
        if(bks.length<4)return 0;
        bks.sort(function(a,b){return a-b;});
        return bks[Math.floor(bks.length*0.90)]-bks[Math.floor(bks.length*0.10)];
    }
    function stereoR(buf){
        if(buf.numberOfChannels<2)return 0.5;
        var len=Math.min(buf.length,MAX),L=buf.getChannelData(0),R=buf.getChannelData(1),mp=0,sp=0;
        for(var i=0;i<len;i++){var m=(L[i]+R[i])*.5,s=(L[i]-R[i])*.5;mp+=m*m;sp+=s*s;}
        return Math.sqrt(sp/(mp+1e-12));
    }
    function phaseC(buf){
        if(buf.numberOfChannels<2)return 1;
        var len=Math.min(buf.length,MAX),L=buf.getChannelData(0),R=buf.getChannelData(1),lr=0,ll=0,rr=0;
        for(var i=0;i<len;i++){lr+=L[i]*R[i];ll+=L[i]*L[i];rr+=R[i]*R[i];}
        return lr/(Math.sqrt(ll*rr)+1e-12);
    }
    function bandIIR(s,freq,Q){
        var w=2*Math.PI*freq/SR,sw=Math.sin(w),cw=Math.cos(w),al=sw/(2*Q);
        var b0=sw/2,b2=-b0,a0=1+al,a1=-2*cw,a2=1-al,x1=0,x2=0,y1=0,y2=0,ss=0;
        for(var i=0;i<s.length;i++){var y=(b0*s[i]+b2*x2-a1*y1-a2*y2)/a0;x2=x1;x1=s[i];y2=y1;y1=y;ss+=y*y;}
        return 20*Math.log10(Math.sqrt(ss/s.length)+1e-12);
    }

    // Meyda analysis
    function meydaAna(mono,sr){
        if(!window.Meyda)return null;
        Meyda.sampleRate=sr; Meyda.bufferSize=2048; Meyda.numberOfMFCCCoefficients=13;
        var FRAME=2048,nBins=FRAME>>1,binHz=sr/FRAME;
        var avgPS=new Float64Array(nBins),mfccSum=[];
        for(var i=0;i<13;i++)mfccSum.push(0);
        var centSum=0,rollSum=0,flatSum=0,zcrSum=0,spreadSum=0,skewSum=0,kurtSum=0,sharpSum=0,spreadPSum=0,n=0;
        var fl=['powerSpectrum','mfcc','spectralCentroid','spectralRolloff','spectralFlatness','zcr','spectralSpread','spectralSkewness','spectralKurtosis','perceptualSharpness','perceptualSpread'];
        for(var i=0;i+FRAME<=mono.length;i+=FRAME){
            var fr=mono.slice(i,i+FRAME),ft=null;
            try{ft=Meyda.extract(fl,fr);}catch(ex){}
            if(!ft)continue;
            if(ft.powerSpectrum)for(var j=0;j<nBins;j++)avgPS[j]+=ft.powerSpectrum[j];
            if(ft.mfcc)for(var k=0;k<13;k++)mfccSum[k]+=(ft.mfcc[k]||0);
            if(ft.spectralCentroid!=null)centSum+=ft.spectralCentroid;
            if(ft.spectralRolloff!=null)rollSum+=ft.spectralRolloff;
            if(ft.spectralFlatness!=null)flatSum+=ft.spectralFlatness;
            if(ft.zcr!=null)zcrSum+=ft.zcr;
            if(ft.spectralSpread!=null)spreadSum+=ft.spectralSpread;
            if(ft.spectralSkewness!=null)skewSum+=ft.spectralSkewness;
            if(ft.spectralKurtosis!=null)kurtSum+=ft.spectralKurtosis;
            if(ft.perceptualSharpness!=null)sharpSum+=ft.perceptualSharpness;
            if(ft.perceptualSpread!=null)spreadPSum+=ft.perceptualSpread;
            n++;
        }
        if(n===0)return null;
        for(var i=0;i<nBins;i++)avgPS[i]/=n;
        for(var i=0;i<13;i++)mfccSum[i]/=n;
        centSum/=n;rollSum/=n;flatSum/=n;zcrSum/=n;spreadSum/=n;skewSum/=n;kurtSum/=n;sharpSum/=n;spreadPSum/=n;
        var iso=[];
        for(var b=0;b<30;b++){
            var fc=ISO30[b],fLo=fc/Math.pow(2,1/6),fHi=fc*Math.pow(2,1/6);
            var bLo=Math.max(0,Math.round(fLo/binHz)),bHi=Math.min(nBins-1,Math.round(fHi/binHz));
            var sum=0,cnt=0;
            for(var jj=bLo;jj<=bHi;jj++){sum+=avgPS[jj];cnt++;}
            iso.push(cnt>0?10*Math.log10(sum/cnt+1e-24):-90);
        }
        return{iso:iso,mfcc:mfccSum,frames:n,centroid:centSum*binHz,rolloff:rollSum*binHz,
               flatness:flatSum,zcr:zcrSum,spread:spreadSum*binHz,skewness:skewSum,kurtosis:kurtSum,
               sharpness:sharpSum,spreadP:spreadPSum};
    }
    function iso2eq7(r,t){
        var g=[];
        for(var i=0;i<7;i++){var idxs=EQ_GROUPS[i],ra=0,ta=0;for(var j=0;j<idxs.length;j++){ra+=r[idxs[j]];ta+=t[idxs[j]];}ra/=idxs.length;ta/=idxs.length;g.push(r1(cl(ra-ta,-12,12)));}
        return g;
    }

    var refMono=toMono(refBuf), tgtMono=toMono(tgtBuf);
    var refRMS=rmsDb(refMono),  tgtRMS=rmsDb(tgtMono);
    var refPk=peakDb(refMono),  tgtPk=peakDb(tgtMono);
    var refTP=truePeak(refMono),tgtTP=truePeak(tgtMono);
    var refCr=refPk-refRMS,     tgtCr=tgtPk-tgtRMS, crD=tgtCr-refCr;
    var refLU=lufs(refMono),    tgtLU=lufs(tgtMono);
    var refLR=lra(refMono),     tgtLR=lra(tgtMono);
    var refSR=stereoR(refBuf),  tgtSR=stereoR(tgtBuf);
    var refPC=phaseC(refBuf),   tgtPC=phaseC(tgtBuf);

    var rM=meydaAna(refMono,SR), tM=meydaAna(tgtMono,SR);
    var useM=!!(rM&&tM);

    var eqG, ref7, tgt7;
    if (useM) {
        eqG=iso2eq7(rM.iso,tM.iso);
        ref7=EQ_GROUPS.map(function(idxs){var s=0;idxs.forEach(function(i){s+=rM.iso[i];});return s/idxs.length;});
        tgt7=EQ_GROUPS.map(function(idxs){var s=0;idxs.forEach(function(i){s+=tM.iso[i];});return s/idxs.length;});
    } else {
        eqG=EQ_FREQS.map(function(f,ii){return r1(cl(bandIIR(refMono,f,EQ_QS[ii])-bandIIR(tgtMono,f,EQ_QS[ii]),-12,12));});
        ref7=EQ_FREQS.map(function(f,ii){return bandIIR(refMono,f,EQ_QS[ii]);});
        tgt7=EQ_FREQS.map(function(f,ii){return bandIIR(tgtMono,f,EQ_QS[ii]);});
    }

    // HPF from sub energy
    var subR, subT;
    if (useM) {
        subR=(rM.iso[0]+rM.iso[1]+rM.iso[2]+rM.iso[3])/4;
        subT=(tM.iso[0]+tM.iso[1]+tM.iso[2]+tM.iso[3])/4;
    } else {
        subR=bandIIR(refMono,40,0.7); subT=bandIIR(tgtMono,40,0.7);
    }
    var hpfCalc = Math.round(cl(20 + Math.max(0, subT-subR)*2.5, 20, 160));

    // Saturation from flatness delta
    var satCalc = 0;
    if (useM && rM.flatness!=null && tM.flatness!=null) {
        satCalc = Math.round(cl((rM.flatness - tM.flatness)*120, 0, 65));
    }

    // Mid/Side
    var midGCalc  = r1(cl((refPC - tgtPC)*4, -4, 4));
    var sideGCalc = r1(cl(20*Math.log10(Math.max(0.01,refSR)/Math.max(0.01,tgtSR)), -8, 8));

    return {
        useM:useM, rM:rM, tM:tM,
        rms:{ref:refRMS,tgt:tgtRMS}, peak:{ref:refPk,tgt:tgtPk},
        trueP:{ref:refTP,tgt:tgtTP}, crest:{ref:refCr,tgt:tgtCr},
        lufs:{ref:refLU,tgt:tgtLU}, lra:{ref:refLR,tgt:tgtLR},
        stereo:{ref:refSR,tgt:tgtSR}, phase:{ref:refPC,tgt:tgtPC},
        eq7:{ref:ref7,tgt:tgt7}, eq:eqG,
        gain:r1(cl(refRMS-tgtRMS,-12,12)),
        comp:{thr:r1(cl(-24+crD*0.6,-48,-6)),rat:r1(cl(2.5+crD*0.25,1,12)),atk:r1(cl(3+crD*0.4,0.5,30)),rel:r1(cl(200+crD*15,50,600))},
        hpfFreq:hpfCalc, saturation:satCalc, midGain:midGCalc, sideGain:sideGCalc
    };
}

// ============================================================
// ANALYSIS TABLE
// ============================================================
function renderAnalysis(p) {
    var f1=function(v){return typeof v==='number'?v.toFixed(1):'--';};
    var f3=function(v){return typeof v==='number'?v.toFixed(3):'--';};
    var fD=function(v,u){
        if(typeof v!=='number')return '<span class="vu">--</span>';
        if(!u)u=' dB';
        var s=(v>=0?'+':'')+v.toFixed(1)+u;
        return '<span class="'+(Math.abs(v)<0.3?'vu':v>0?'vp':'vn')+'">'+s+'</span>';
    };
    var bN=['SUB 50 Hz','BASS 100 Hz','LO-MID 300 Hz','MID 1 kHz','HI-MID 3 kHz','PRESENCE 8 kHz','AIR 16 kHz'];
    var mLbl=p.useM?('ISO 1/3-oct via Meyda.js ('+p.tM.frames+' frames)'):('IIR biquad fallback');

    var h='<table class="atbl"><thead><tr><th>PARAMETER</th><th>TARGET</th><th>REFERENCE</th><th>DELTA</th><th>ADJUSTMENT</th></tr></thead><tbody>';

    h+='<tr class="cat-row"><td colspan="5">FREQUENCY SPECTRUM &mdash; '+mLbl+'</td></tr>';
    for(var i=0;i<7;i++){
        var d=p.eq7.ref[i]-p.eq7.tgt[i];
        h+='<tr><td>'+bN[i]+'</td><td>'+f1(p.eq7.tgt[i])+' dBFS</td><td>'+f1(p.eq7.ref[i])+' dBFS</td><td>'+fD(d)+'</td><td>'+fD(p.eq[i])+'</td></tr>';
    }

    h+='<tr class="cat-row"><td colspan="5">DYNAMICS &amp; LOUDNESS</td></tr>';
    h+='<tr><td>RMS Loudness</td><td>'+f1(p.rms.tgt)+' dBFS</td><td>'+f1(p.rms.ref)+' dBFS</td><td>'+fD(p.rms.ref-p.rms.tgt)+'</td><td>'+fD(p.gain)+'</td></tr>';
    h+='<tr><td>LUFS (K-weight approx.)</td><td>'+f1(p.lufs.tgt)+' LUFS</td><td>'+f1(p.lufs.ref)+' LUFS</td><td>'+fD(p.lufs.ref-p.lufs.tgt)+'</td><td><span class="vu">-&gt; Gain</span></td></tr>';
    h+='<tr><td>Sample Peak</td><td>'+f1(p.peak.tgt)+' dBFS</td><td>'+f1(p.peak.ref)+' dBFS</td><td>'+fD(p.peak.ref-p.peak.tgt)+'</td><td><span class="vu">Limiter</span></td></tr>';
    h+='<tr><td>True Peak (4x cubic)</td><td>'+f1(p.trueP.tgt)+' dBFS</td><td>'+f1(p.trueP.ref)+' dBFS</td><td>'+fD(p.trueP.ref-p.trueP.tgt)+'</td><td><span class="vu">Limiter</span></td></tr>';
    var cD=p.crest.tgt-p.crest.ref, cCl=Math.abs(cD)<1?'vu':cD>0?'vw':'vn';
    h+='<tr><td>Crest Factor</td><td>'+f1(p.crest.tgt)+' dB</td><td>'+f1(p.crest.ref)+' dB</td><td><span class="'+cCl+'">'+(cD>=0?'+':'')+f1(cD)+' dB</span></td><td><span class="vu">Thr '+p.comp.thr+' | '+p.comp.rat+':1</span></td></tr>';
    var lD=p.lra.ref-p.lra.tgt, lCl=Math.abs(lD)<1?'vu':lD>0?'vp':'vn';
    h+='<tr><td>Loudness Range (LRA)</td><td>'+f1(p.lra.tgt)+' LU</td><td>'+f1(p.lra.ref)+' LU</td><td><span class="'+lCl+'">'+(lD>=0?'+':'')+f1(lD)+' LU</span></td><td><span class="vu">Comp</span></td></tr>';
    h+='<tr><td>Comp Attack</td><td colspan="3" style="color:var(--dim)">derived from crest factor</td><td><span class="vu">'+p.comp.atk.toFixed(1)+' ms</span></td></tr>';
    h+='<tr><td>Comp Release</td><td colspan="3" style="color:var(--dim)">derived from crest factor</td><td><span class="vu">'+p.comp.rel.toFixed(0)+' ms</span></td></tr>';

    h+='<tr class="cat-row"><td colspan="5">FILTER &amp; HARMONICS</td></tr>';
    h+='<tr><td>HPF Frequency</td><td colspan="3" style="color:var(--dim)">sub-bass energy delta (ref vs target)</td><td><span class="vu">'+p.hpfFreq+' Hz</span></td></tr>';
    var satCl=p.saturation>40?'vn':p.saturation>15?'vw':'vu';
    h+='<tr><td>Saturation</td><td colspan="3" style="color:var(--dim)">spectral flatness delta</td><td><span class="'+satCl+'">'+p.saturation+'%</span></td></tr>';

    h+='<tr class="cat-row"><td colspan="5">STEREO IMAGE</td></tr>';
    var wD=p.stereo.ref-p.stereo.tgt, wCl=Math.abs(wD)<0.02?'vu':wD>0?'vp':'vn';
    h+='<tr><td>Stereo Width (S/M)</td><td>'+(p.stereo.tgt*100).toFixed(0)+'%</td><td>'+(p.stereo.ref*100).toFixed(0)+'%</td><td><span class="'+wCl+'">'+(wD>=0?'+':'')+(wD*100).toFixed(0)+'%</span></td><td><span class="vu">M/S</span></td></tr>';
    var pCl=p.phase.tgt>0.6?'vp':p.phase.tgt>0.2?'vu':'vn';
    h+='<tr><td>Phase Correlation L/R</td><td class="'+pCl+'">'+f3(p.phase.tgt)+'</td><td class="vu">'+f3(p.phase.ref)+'</td><td class="vu">'+((p.phase.ref-p.phase.tgt)>=0?'+':'')+f3(p.phase.ref-p.phase.tgt)+'</td><td><span class="vu">-&gt; Mid Gain '+fD(p.midGain)+'</span></td></tr>';
    h+='<tr><td>Side/Mid Ratio</td><td colspan="3" style="color:var(--dim)">stereo width difference</td><td>'+fD(p.sideGain)+'</td></tr>';

    if (p.useM&&p.rM&&p.tM) {
        var rM=p.rM, tM=p.tM;
        h+='<tr class="cat-row"><td colspan="5">SPECTRAL DESCRIPTORS (Meyda.js)</td></tr>';
        var cHD=rM.centroid-tM.centroid, cHCl=Math.abs(cHD)<50?'vu':cHD>0?'vp':'vn';
        h+='<tr><td>Spectral Centroid</td><td>'+Math.round(tM.centroid)+' Hz</td><td>'+Math.round(rM.centroid)+' Hz</td><td class="'+cHCl+'">'+(cHD>=0?'+':'')+Math.round(cHD)+' Hz</td><td class="vu">-&gt; EQ</td></tr>';
        h+='<tr><td>Spectral Rolloff (85%)</td><td>'+Math.round(tM.rolloff)+' Hz</td><td>'+Math.round(rM.rolloff)+' Hz</td><td class="vu">'+(rM.rolloff-tM.rolloff>=0?'+':'')+Math.round(rM.rolloff-tM.rolloff)+' Hz</td><td class="vu">EQ High shelf</td></tr>';
        h+='<tr><td>Spectral Spread</td><td>'+Math.round(tM.spread)+' Hz</td><td>'+Math.round(rM.spread)+' Hz</td><td class="vu">'+(rM.spread-tM.spread>=0?'+':'')+Math.round(rM.spread-tM.spread)+' Hz</td><td class="vu">bandwidth</td></tr>';
        var fD2=rM.flatness-tM.flatness, fCl=Math.abs(fD2)<0.02?'vu':fD2>0?'vw':'vp';
        h+='<tr><td>Spectral Flatness (0=tonal,1=noise)</td><td>'+tM.flatness.toFixed(4)+'</td><td>'+rM.flatness.toFixed(4)+'</td><td class="'+fCl+'">'+(fD2>=0?'+':'')+fD2.toFixed(4)+'</td><td><span class="vu">-&gt; Sat '+p.saturation+'%</span></td></tr>';
        h+='<tr><td>Spectral Skewness</td><td>'+tM.skewness.toFixed(3)+'</td><td>'+rM.skewness.toFixed(3)+'</td><td class="vu">'+(rM.skewness-tM.skewness>=0?'+':'')+(rM.skewness-tM.skewness).toFixed(3)+'</td><td class="vu">shape</td></tr>';
        h+='<tr><td>Spectral Kurtosis</td><td>'+tM.kurtosis.toFixed(3)+'</td><td>'+rM.kurtosis.toFixed(3)+'</td><td class="vu">'+(rM.kurtosis-tM.kurtosis>=0?'+':'')+(rM.kurtosis-tM.kurtosis).toFixed(3)+'</td><td class="vu">peakiness</td></tr>';
        var zD=rM.zcr-tM.zcr, zCl=Math.abs(zD)<10?'vu':zD>0?'vw':'vp';
        h+='<tr><td>Zero Crossing Rate</td><td>'+tM.zcr.toFixed(1)+'/f</td><td>'+rM.zcr.toFixed(1)+'/f</td><td class="'+zCl+'">'+(zD>=0?'+':'')+zD.toFixed(1)+'</td><td class="vu">-&gt; Attack</td></tr>';
        h+='<tr><td>Perceptual Sharpness</td><td>'+tM.sharpness.toFixed(4)+'</td><td>'+rM.sharpness.toFixed(4)+'</td><td class="vu">'+(rM.sharpness-tM.sharpness>=0?'+':'')+(rM.sharpness-tM.sharpness).toFixed(4)+'</td><td class="vu">Zwicker</td></tr>';
        h+='<tr><td>Perceptual Spread</td><td>'+tM.spreadP.toFixed(4)+'</td><td>'+rM.spreadP.toFixed(4)+'</td><td class="vu">'+(rM.spreadP-tM.spreadP>=0?'+':'')+(rM.spreadP-tM.spreadP).toFixed(4)+'</td><td class="vu">Zwicker</td></tr>';
        h+='<tr class="cat-row"><td colspan="5">MFCCs (13 coeff.) &mdash; Timbral Fingerprint</td></tr>';
        var mL=['MFCC-0 (Energy)','MFCC-1','MFCC-2','MFCC-3','MFCC-4','MFCC-5','MFCC-6','MFCC-7','MFCC-8','MFCC-9','MFCC-10','MFCC-11','MFCC-12'];
        for(var mm=0;mm<13;mm++){
            var mv=rM.mfcc[mm]-tM.mfcc[mm], mCl=Math.abs(mv)<1?'vu':Math.abs(mv)<5?'vw':'vn';
            h+='<tr><td>'+mL[mm]+'</td><td>'+tM.mfcc[mm].toFixed(2)+'</td><td>'+rM.mfcc[mm].toFixed(2)+'</td><td class="'+mCl+'">'+(mv>=0?'+':'')+mv.toFixed(2)+'</td><td class="vu">timbral</td></tr>';
        }
    }
    h+='</tbody></table>';
    h+='<p class="analysis-note">'+
       (p.useM?'EQ via Meyda.js FFT 2048, 30 ISO 1/3-oct bands -> 7 sliders. ':'EQ via IIR biquad. ')+
       'LUFS: K-weighting approx. (EBU R128). True Peak: cubic 4x. LRA: 10th-90th pct. of 3s gated blocks (EBU R128). '+
       'HPF: derived from sub-bass energy delta. Saturation: spectral flatness delta. Phase: +1=mono, 0=wide, negative=polarity.</p>';
    analysisContent.innerHTML = h;
}

// ============================================================
// SLIDERS
// ============================================================
var sliders = {
    eq50:    {el:document.getElementById('eq50'),    sp:document.getElementById('eq50v'),    fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}},
    eq100:   {el:document.getElementById('eq100'),   sp:document.getElementById('eq100v'),   fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}},
    eq300:   {el:document.getElementById('eq300'),   sp:document.getElementById('eq300v'),   fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}},
    eq1k:    {el:document.getElementById('eq1k'),    sp:document.getElementById('eq1kv'),    fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}},
    eq3k:    {el:document.getElementById('eq3k'),    sp:document.getElementById('eq3kv'),    fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}},
    eq8k:    {el:document.getElementById('eq8k'),    sp:document.getElementById('eq8kv'),    fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}},
    eq16k:   {el:document.getElementById('eq16k'),   sp:document.getElementById('eq16kv'),   fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}},
    compThr: {el:document.getElementById('compThr'), sp:document.getElementById('compThrV'), fmt:function(v){return v.toFixed(1)+' dB';}},
    compRat: {el:document.getElementById('compRat'), sp:document.getElementById('compRatV'), fmt:function(v){return v.toFixed(1)+':1';}},
    compAtk: {el:document.getElementById('compAtk'), sp:document.getElementById('compAtkV'), fmt:function(v){return v.toFixed(1)+' ms';}},
    compRel: {el:document.getElementById('compRel'), sp:document.getElementById('compRelV'), fmt:function(v){return v.toFixed(0)+' ms';}},
    compMkp: {el:document.getElementById('compMkp'), sp:document.getElementById('compMkpV'), fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}},
    hpfFreq: {el:document.getElementById('hpfFreq'), sp:document.getElementById('hpfFreqV'), fmt:function(v){return Math.round(v)+' Hz';}},
    hpfQ:    {el:document.getElementById('hpfQ'),    sp:document.getElementById('hpfQV'),    fmt:function(v){return v.toFixed(1)+' Q';}},
    satAmt:  {el:document.getElementById('satAmt'),  sp:document.getElementById('satAmtV'),  fmt:function(v){return Math.round(v)+'%';}},
    midGain: {el:document.getElementById('midGain'), sp:document.getElementById('midGainV'), fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}},
    sideGain:{el:document.getElementById('sideGain'),sp:document.getElementById('sideGainV'),fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}},
    limCeil: {el:document.getElementById('limCeil'), sp:document.getElementById('limCeilV'), fmt:function(v){return v.toFixed(1)+' dB';}},
    outGain: {el:document.getElementById('outGain'), sp:document.getElementById('outGainV'), fmt:function(v){return(v>=0?'+':'')+v.toFixed(1)+' dB';}}
};

function updateSpans() {
    var ks=Object.keys(sliders);
    for(var i=0;i<ks.length;i++){var s=sliders[ks[i]];s.sp.textContent=s.fmt(parseFloat(s.el.value));}
}
var _sk=Object.keys(sliders);
for(var _i=0;_i<_sk.length;_i++){
    (function(k){sliders[k].el.addEventListener('input',function(){updateSpans();if(liveNodes.active)updateLiveEffects();});}(_sk[_i]));
}
updateSpans();

// ============================================================
// WAVESHAPER SATURATION CURVE
// ============================================================
function makeSatCurve(amt) {
    var k = amt / 100 * 80, n = 512, curve = new Float32Array(n), maxV = 0;
    for (var i = 0; i < n; i++) {
        var x = (i*2)/n - 1;
        curve[i] = k < 0.5 ? x : (1+k/100)*x / (1 + (k/100)*Math.abs(x));
        if(Math.abs(curve[i])>maxV) maxV=Math.abs(curve[i]);
    }
    if(maxV>0) for(var i=0;i<n;i++) curve[i]/=maxV;
    return curve;
}

// ============================================================
// ANALYZE BUTTON
// ============================================================
analyzeBtn.addEventListener('click', function() {
    if (!refBuffer||!targetBuffer) { alert('Load both Reference and Target tracks first.'); return; }
    setStatus('ANALYZING...',1);
    analyzeBtn.disabled = true;
    setTimeout(function() {
        var p = analyzeAudio(refBuffer, targetBuffer);
        EQ_KEYS.forEach(function(k,i){sliders[k].el.value=p.eq[i];});
        sliders.compThr.el.value = p.comp.thr;
        sliders.compRat.el.value = p.comp.rat;
        sliders.compAtk.el.value = p.comp.atk;
        sliders.compRel.el.value = p.comp.rel;
        sliders.compMkp.el.value = p.gain;
        sliders.hpfFreq.el.value = p.hpfFreq;
        sliders.hpfQ.el.value    = 0.7;
        sliders.satAmt.el.value  = p.saturation;
        sliders.midGain.el.value = p.midGain;
        sliders.sideGain.el.value= p.sideGain;
        updateSpans();
        renderAnalysis(p);
        showAnalysisPanelCollapsed();
        resultSection.style.display = '';
        compPanel.style.display     = '';
        fxSection.style.display     = '';
        actionRow.style.display     = '';
        loopResultBtn.disabled = false;
        loopSyncBtn.disabled   = false;
        setTimeout(function() {
            resultPeaks = computePeaks(targetBuffer, canvasResult.offsetWidth||800);
            rRes(0);
            resultSpecData = computeResultSpecPreview();
            redrawResultSpec();
            drawComparativeSpec();
            buildLiveChain();
            analyzeBtn.disabled = false;
            setStatus('DONE  |  '+(p.useM?'Meyda 31-band ISO':'IIR fallback')+'  |  PLAY TO LISTEN', 2);
        }, 60);
    }, 30);
});

// ============================================================
// VU METERS — IN / GR / OUT
// ============================================================
function analyserPeakDb(analyser) {
    if (!analyser) return -90;
    var data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);
    var pk = 0;
    for (var i = 0; i < data.length; i++) { var a = Math.abs(data[i]); if (a > pk) pk = a; }
    return 20 * Math.log10(pk + 1e-12);
}

// Smoothed peak holders for ballistic decay
var _vuInPeak = -90, _vuOutPeak = -90;

function drawVuBar(canvas, dbVal, mode) {
    // mode: 'level' (IN/OUT) | 'gr' (gain reduction, positive = reduction amount)
    var W = canvas.offsetWidth || 500, H = canvas.height;
    if (canvas.width !== W) canvas.width = W;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#060609'; ctx.fillRect(0, 0, W, H);
    var pct, col;
    if (mode === 'gr') {
        var gr = Math.min(20, Math.max(0, -dbVal));
        pct = gr / 20;
        col = '#f0c040';
    } else {
        var db = Math.max(-72, Math.min(0, dbVal));
        pct = (db + 72) / 72;
        col = db > -3 ? '#ff3355' : db > -9 ? '#f0c040' : '#00ffa3';
    }
    var bW = Math.round(pct * W);
    if (bW > 0) { ctx.fillStyle = col; ctx.fillRect(0, 2, bW, H - 4); }
    // Reference markers at -6 and -3 dBFS (level) or 6/12 dB GR
    var m1 = Math.round((mode === 'gr' ? 6/20 : 66/72) * W);
    var m2 = Math.round((mode === 'gr' ? 12/20 : 69/72) * W);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.fillRect(m1, 0, 1, H); ctx.fillRect(m2, 0, 1, H);
}

function updateVuMeters() {
    var cIn  = document.getElementById('vuIn');
    var cGr  = document.getElementById('vuGr');
    var cOut = document.getElementById('vuOut');
    var vIn  = document.getElementById('vuInVal');
    var vGr  = document.getElementById('vuGrVal');
    var vOut = document.getElementById('vuOutVal');
    if (!cIn || !liveNodes.active) return;

    var rawIn  = analyserPeakDb(liveNodes.inputAnalyser);
    var rawOut = analyserPeakDb(abMode === 'A' ? liveNodes.bypassAnalyser : liveNodes.analyser);
    var gr     = liveNodes.comp ? liveNodes.comp.reduction : 0;

    // Ballistic: fast attack, 12 dB/s decay
    var decay = 12 / 60;
    _vuInPeak  = rawIn  > _vuInPeak  ? rawIn  : Math.max(rawIn,  _vuInPeak  - decay);
    _vuOutPeak = rawOut > _vuOutPeak ? rawOut : Math.max(rawOut, _vuOutPeak - decay);

    drawVuBar(cIn,  _vuInPeak,  'level');
    drawVuBar(cGr,  gr,         'gr');
    drawVuBar(cOut, _vuOutPeak, 'level');

    var fmt = function(v) { return v > -80 ? (v >= 0 ? '+' : '') + v.toFixed(1) + ' dB' : '—'; };
    vIn.textContent  = fmt(_vuInPeak);
    vGr.textContent  = gr < -0.2 ? gr.toFixed(1) + ' dB' : '—';
    vOut.textContent = fmt(_vuOutPeak);
}

function clearVuMeters() {
    _vuInPeak = -90; _vuOutPeak = -90;
    ['vuIn','vuGr','vuOut'].forEach(function(id) {
        var c = document.getElementById(id);
        if (c) { var cx = c.getContext('2d'); cx.fillStyle='#060609'; cx.fillRect(0,0,c.width,c.height); }
    });
    var ids = ['vuInVal','vuGrVal','vuOutVal'];
    ids.forEach(function(id){ var el=document.getElementById(id); if(el) el.textContent='\u2014'; });
}

// ============================================================
// LIVE DSP CHAIN: HPF(x2) -> EQ7 -> Saturation -> Comp -> M/S -> Lim -> Out -> Analyser -> Fade
// ============================================================
function buildLiveChain() {
    if (!audioCtx||!targetBuffer) return;
    destroyLive();
    var ctx=audioCtx, numCh=targetBuffer.numberOfChannels, n=liveNodes;

    // Input analyser (taps raw signal for VU IN meter)
    n.inputAnalyser = ctx.createAnalyser();
    n.inputAnalyser.fftSize = 2048;
    n.inputAnalyser.smoothingTimeConstant = 0.55;

    // HPF — order 4 (two cascaded 2nd-order highpass = 24 dB/oct)
    n.hpf = ctx.createBiquadFilter();
    n.hpf.type = 'highpass';
    n.hpf.frequency.value = parseFloat(sliders.hpfFreq.el.value);
    n.hpf.Q.value         = parseFloat(sliders.hpfQ.el.value);
    n.hpf2 = ctx.createBiquadFilter();
    n.hpf2.type = 'highpass';
    n.hpf2.frequency.value = parseFloat(sliders.hpfFreq.el.value);
    n.hpf2.Q.value         = parseFloat(sliders.hpfQ.el.value);

    // 7-band EQ — low/high extremes as shelves for musical response
    n.eqNodes = EQ_FREQS.map(function(freq,ii){
        var f=ctx.createBiquadFilter();
        if(ii===0) f.type='lowshelf';
        else if(ii===6) f.type='highshelf';
        else f.type='peaking';
        f.frequency.value=freq; f.Q.value=EQ_QS[ii];
        f.gain.value=parseFloat(sliders[EQ_KEYS[ii]].el.value);
        return f;
    });
    for(var i=0;i<6;i++) n.eqNodes[i].connect(n.eqNodes[i+1]);

    // Saturation (WaveShaperNode — 4x oversampling for lower aliasing)
    n.shaper = ctx.createWaveShaper();
    n.shaper.curve = makeSatCurve(parseFloat(sliders.satAmt.el.value));
    n.shaper.oversample = '4x';

    // Compressor
    n.comp = ctx.createDynamicsCompressor(); n.comp.knee.value = 8;

    // Makeup gain
    n.mkp = ctx.createGain();

    // M/S matrix (stereo only)
    if (numCh === 2) {
        n.spl=ctx.createChannelSplitter(2); n.mrg=ctx.createChannelMerger(2);
        n.midG=ctx.createGain(); n.sideG=ctx.createGain();
        n.inv=ctx.createGain(); n.inv.gain.value=-1;
        n.lM=ctx.createGain(); n.rM=ctx.createGain();
        n.sI=ctx.createGain(); n.sI.gain.value=-1;
    }

    // Limiter — 150ms release avoids pumping on dense transients
    n.lim=ctx.createDynamicsCompressor();
    n.lim.ratio.value=20; n.lim.attack.value=0.001; n.lim.release.value=0.15; n.lim.knee.value=0;

    // Output gain
    n.outG = ctx.createGain();

    // Analyser (output — real-time spectrum + VU OUT)
    n.analyser = ctx.createAnalyser();
    n.analyser.fftSize = 2048;
    n.analyser.smoothingTimeConstant = 0.82;

    // Fade gain (click-free) for processed path
    n.fadeGain = ctx.createGain(); n.fadeGain.gain.value = 0;

    // Bypass path — dry signal routed directly to output for A mode
    n.bypassAnalyser = ctx.createAnalyser();
    n.bypassAnalyser.fftSize = 2048; n.bypassAnalyser.smoothingTimeConstant = 0.55;
    n.bypassGain = ctx.createGain(); n.bypassGain.gain.value = 0;
    n.bypassGain.connect(n.bypassAnalyser);
    n.bypassAnalyser.connect(ctx.destination);

    // Wire chain: HPF -> HPF2 -> EQ[0..6] -> Shaper -> Comp -> Mkp -> [M/S] -> Lim -> OutG -> Analyser -> FadeGain -> Dest
    n.hpf.connect(n.hpf2);
    n.hpf2.connect(n.eqNodes[0]);
    n.eqNodes[6].connect(n.shaper);
    n.shaper.connect(n.comp);
    n.comp.connect(n.mkp);

    if (numCh === 2) {
        n.mkp.connect(n.spl);
        n.spl.connect(n.midG,0); n.spl.connect(n.midG,1);
        n.spl.connect(n.sideG,0); n.spl.connect(n.inv,1); n.inv.connect(n.sideG);
        n.midG.connect(n.lM); n.sideG.connect(n.lM);
        n.midG.connect(n.rM); n.sideG.connect(n.sI); n.sI.connect(n.rM);
        n.lM.connect(n.mrg,0,0); n.rM.connect(n.mrg,0,1);
        n.mrg.connect(n.lim);
    } else {
        n.mkp.connect(n.lim);
    }
    n.lim.connect(n.outG);
    n.outG.connect(n.analyser);
    n.analyser.connect(n.fadeGain);
    n.fadeGain.connect(ctx.destination);

    n.active = true;
    updateLiveEffects();
}

function updateLiveEffects() {
    if (!liveNodes.active) return;
    var n=liveNodes;
    n.hpf.frequency.value = parseFloat(sliders.hpfFreq.el.value);
    n.hpf.Q.value         = parseFloat(sliders.hpfQ.el.value);
    if(n.hpf2) { n.hpf2.frequency.value = n.hpf.frequency.value; n.hpf2.Q.value = n.hpf.Q.value; }
    for(var i=0;i<EQ_KEYS.length;i++) if(n.eqNodes&&n.eqNodes[i]) n.eqNodes[i].gain.value=parseFloat(sliders[EQ_KEYS[i]].el.value);
    if(n.shaper) n.shaper.curve = makeSatCurve(parseFloat(sliders.satAmt.el.value));
    n.comp.threshold.value = parseFloat(sliders.compThr.el.value);
    n.comp.ratio.value     = parseFloat(sliders.compRat.el.value);
    n.comp.attack.value    = parseFloat(sliders.compAtk.el.value)/1000;
    n.comp.release.value   = parseFloat(sliders.compRel.el.value)/1000;
    n.mkp.gain.value       = Math.pow(10, parseFloat(sliders.compMkp.el.value)/20);
    n.outG.gain.value      = Math.pow(10, parseFloat(sliders.outGain.el.value)/20);
    n.lim.threshold.value  = parseFloat(sliders.limCeil.el.value);
    if (targetBuffer&&targetBuffer.numberOfChannels===2&&n.midG) {
        var mLin = Math.pow(10, parseFloat(sliders.midGain.el.value)/20);
        var sLin = Math.pow(10, parseFloat(sliders.sideGain.el.value)/20);
        n.midG.gain.value  = 0.5 * mLin;
        n.sideG.gain.value = 0.5 * sLin;
    }
}

function destroyLive() {
    var n=liveNodes;
    ['inputAnalyser','bypassAnalyser','bypassGain','hpf','hpf2','comp','mkp','shaper','spl','mrg','midG','sideG','inv','lM','rM','sI','lim','outG','analyser','fadeGain'].forEach(function(k){
        if(n[k]){try{n[k].disconnect();}catch(e){}n[k]=null;}
    });
    if(n.eqNodes){n.eqNodes.forEach(function(f){try{f.disconnect();}catch(e){}});n.eqNodes=null;}
    n.active=false; n.analyser=null;
}

function startLive(off, keep) {
    if (!targetBuffer||!audioCtx) return;
    initCtx();
    if(liveNodes.source){liveNodes.source.onended=null;try{liveNodes.source.stop();}catch(e){}liveNodes.source=null;}
    if(syncRafId){cancelAnimationFrame(syncRafId);syncRafId=null;}
    if(!keep||!liveNodes.active) buildLiveChain();
    var dur=targetBuffer.duration;          // declare FIRST — used by loop calc below
    var src=audioCtx.createBufferSource(); src.buffer=targetBuffer;
    // Support result loop
    if (resultLoop.enabled) {
        var lsec = resultLoop.start * dur;
        var lend = resultLoop.end   * dur;
        src.loop = true; src.loopStart = lsec; src.loopEnd = lend;
        // Clamp offset to loop region
        if (off < lsec || off >= lend) off = lsec;
    }
    off=Math.max(0,Math.min(off,dur-0.01));
    // Tap input BEFORE chain for VU IN meter
    src.connect(liveNodes.inputAnalyser);
    src.connect(liveNodes.hpf);
    src.connect(liveNodes.bypassGain);
    var fg=liveNodes.fadeGain, bg=liveNodes.bypassGain;
    fg.gain.cancelScheduledValues(audioCtx.currentTime);
    bg.gain.cancelScheduledValues(audioCtx.currentTime);
    fg.gain.setValueAtTime(0, audioCtx.currentTime);
    bg.gain.setValueAtTime(0, audioCtx.currentTime);
    // Apply current A/B mode
    if (abMode === 'A') {
        bg.gain.linearRampToValueAtTime(1, audioCtx.currentTime+0.006);
    } else {
        fg.gain.linearRampToValueAtTime(1, audioCtx.currentTime+0.006);
    }
    src.start(0,off);
    liveNodes.source=src; liveStart=audioCtx.currentTime-off; livePlaying=true; liveOffset=off;
    playResult.textContent='\u23F8 PAUSE'; ledResult.className='led playing';
    abBtn.disabled = false;
    var vuStrip=document.getElementById('vuStrip');
    if(vuStrip) vuStrip.style.display='';
    function sync(){
        if(!livePlaying)return;
        var prog;
        if (resultLoop.enabled) {
            var lsec2 = resultLoop.start * dur, ldur2 = (resultLoop.end - resultLoop.start) * dur;
            var elapsed2 = audioCtx.currentTime - liveStart;
            prog = ldur2 > 0 ? resultLoop.start + ((elapsed2 - lsec2 + ldur2*10) % ldur2) / dur : (audioCtx.currentTime - liveStart) / dur;
            prog = Math.max(0, Math.min(1, prog));
        } else {
            prog=(audioCtx.currentTime-liveStart)/dur;
            if(prog>=1){liveOffset=0;stopLive();return;}
        }
        rRes(prog);
        // Keep target waveform playhead in sync during A/B (same audio, same position)
        if (!tgtPlayer.playing) rTgt(prog);
        redrawResultSpec();
        drawComparativeSpec();
        updateVuMeters();
        syncRafId=requestAnimationFrame(sync);
    }
    syncRafId=requestAnimationFrame(sync);
    src.onended=function(){if(livePlaying&&liveNodes.source===src){liveOffset=0;stopLive();}};
}

function stopLive() {
    if(liveNodes.fadeGain&&audioCtx){
        var now=audioCtx.currentTime;
        liveNodes.fadeGain.gain.cancelScheduledValues(now);
        liveNodes.fadeGain.gain.setValueAtTime(liveNodes.fadeGain.gain.value,now);
        liveNodes.fadeGain.gain.linearRampToValueAtTime(0,now+0.012);
    }
    var s3=liveNodes.source;
    if(s3){s3.onended=null;setTimeout(function(){try{s3.stop();}catch(e){}},16);liveNodes.source=null;}
    if(syncRafId){cancelAnimationFrame(syncRafId);syncRafId=null;}
    livePlaying=false; playResult.textContent='\u25B6 PLAY'; ledResult.className='led loaded';
    abBtn.disabled = true;
    clearVuMeters();
    // Redraw spectra in static mode
    redrawResultSpec(); drawComparativeSpec();
}

// ============================================================
// A/B COMPARE — seamless crossfade between dry and processed
// ============================================================
var abBtn   = document.getElementById('abBtn');
var abState = document.getElementById('abState');
var liveBadge = document.getElementById('liveBadge');

function switchAB() {
    if (!liveNodes.active) return;
    abMode = (abMode === 'B') ? 'A' : 'B';
    var toA = (abMode === 'A');
    var now = audioCtx ? audioCtx.currentTime : 0, dur = 0.04;
    if (audioCtx) {
        liveNodes.fadeGain.gain.cancelScheduledValues(now);
        liveNodes.fadeGain.gain.setValueAtTime(liveNodes.fadeGain.gain.value, now);
        liveNodes.fadeGain.gain.linearRampToValueAtTime(toA ? 0 : 1, now + dur);
        liveNodes.bypassGain.gain.cancelScheduledValues(now);
        liveNodes.bypassGain.gain.setValueAtTime(liveNodes.bypassGain.gain.value, now);
        liveNodes.bypassGain.gain.linearRampToValueAtTime(toA ? 1 : 0, now + dur);
    }
    abBtn.classList.toggle('mode-a', toA);
    abState.textContent = toA ? '\u25c4A' : 'B\u25ba';
    if (liveBadge) liveBadge.textContent = toA ? 'A \u2014 DRY BYPASS' : 'B \u2014 LIVE DSP CHAIN';
}

abBtn.addEventListener('click', switchAB);

// Keyboard shortcut: press W to toggle A/B while result is visible
document.addEventListener('keydown', function(e) {
    if (e.key === 'w' || e.key === 'W') {
        if (liveNodes.active && !abBtn.disabled) switchAB();
    }
});

playResult.addEventListener('click',function(){
    if(livePlaying){liveOffset=audioCtx.currentTime-liveStart;stopLive();}
    else startLive(liveOffset,true);
});
stopResult.addEventListener('click',function(){stopLive();liveOffset=0;rRes(0);});

// ============================================================
// OFFLINE RENDER + EXPORT (con soporte para 24 bits y 48 kHz)
// ============================================================
function renderOffline(srcBuf, targetSampleRate) {
    var srcSR = srcBuf.sampleRate;
    var outSR = (targetSampleRate && targetSampleRate > 0) ? targetSampleRate : srcSR;
    var numCh = srcBuf.numberOfChannels;
    var len = (outSR === srcSR) ? srcBuf.length : Math.ceil(srcBuf.duration * outSR);
    var oc = new OfflineAudioContext(numCh, len, outSR);
    var src = oc.createBufferSource(); src.buffer = srcBuf;

    // HPF — order 4 (two cascaded 2nd-order = 24 dB/oct)
    var hpf = oc.createBiquadFilter();
    hpf.type = 'highpass'; hpf.frequency.value = parseFloat(sliders.hpfFreq.el.value); hpf.Q.value = parseFloat(sliders.hpfQ.el.value);
    var hpf2 = oc.createBiquadFilter();
    hpf2.type = 'highpass'; hpf2.frequency.value = hpf.frequency.value; hpf2.Q.value = hpf.Q.value;

    // 7-band EQ — shelf filters at extremes
    var eqs = EQ_FREQS.map(function(freq, ii) {
        var f = oc.createBiquadFilter();
        if(ii===0) f.type='lowshelf';
        else if(ii===6) f.type='highshelf';
        else f.type='peaking';
        f.frequency.value = freq; f.Q.value = EQ_QS[ii];
        f.gain.value = parseFloat(sliders[EQ_KEYS[ii]].el.value); return f;
    });
    for (var i = 0; i < 6; i++) eqs[i].connect(eqs[i + 1]);

    // Saturation — 4x oversampling
    var shaper = oc.createWaveShaper();
    shaper.curve = makeSatCurve(parseFloat(sliders.satAmt.el.value)); shaper.oversample = '4x';

    var comp = oc.createDynamicsCompressor();
    comp.threshold.value = parseFloat(sliders.compThr.el.value); comp.ratio.value = parseFloat(sliders.compRat.el.value);
    comp.attack.value = parseFloat(sliders.compAtk.el.value) / 1000; comp.release.value = parseFloat(sliders.compRel.el.value) / 1000; comp.knee.value = 8;

    var mkp = oc.createGain(); mkp.gain.value = Math.pow(10, parseFloat(sliders.compMkp.el.value) / 20);

    // Limiter — 150ms release
    var lim = oc.createDynamicsCompressor();
    lim.threshold.value = parseFloat(sliders.limCeil.el.value); lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.15; lim.knee.value = 0;
    var outG = oc.createGain(); outG.gain.value = Math.pow(10, parseFloat(sliders.outGain.el.value) / 20);

    hpf.connect(hpf2); hpf2.connect(eqs[0]); eqs[6].connect(shaper); shaper.connect(comp); comp.connect(mkp);

    if (numCh === 2) {
        var spl = oc.createChannelSplitter(2), mrg = oc.createChannelMerger(2);
        var mG = oc.createGain(), sG = oc.createGain();
        var inv = oc.createGain(); inv.gain.value = -1;
        var lM = oc.createGain(), rM = oc.createGain();
        var sI = oc.createGain(); sI.gain.value = -1;
        var mLin = Math.pow(10, parseFloat(sliders.midGain.el.value) / 20);
        var sLin = Math.pow(10, parseFloat(sliders.sideGain.el.value) / 20);
        mG.gain.value = 0.5 * mLin; sG.gain.value = 0.5 * sLin;
        mkp.connect(spl);
        spl.connect(mG, 0); spl.connect(mG, 1); spl.connect(sG, 0); spl.connect(inv, 1); inv.connect(sG);
        mG.connect(lM); sG.connect(lM); mG.connect(rM); sG.connect(sI); sI.connect(rM);
        lM.connect(mrg, 0, 0); rM.connect(mrg, 0, 1); mrg.connect(lim);
    } else {
        mkp.connect(lim);
    }
    lim.connect(outG); outG.connect(oc.destination);
    src.connect(hpf); src.start(0);
    return oc.startRendering();
}

// Export format variables
var _exportBitDepth = 16;
var _exportSampleRate = 0; // 0 = original

function showExportDialog() {
    var dlg = document.getElementById('exportFmtDialog');
    if (!dlg) return;
    // Sync button states
    var efmt16 = document.getElementById('efmt16');
    var efmt24 = document.getElementById('efmt24');
    var efmtOrig = document.getElementById('efmtOrig');
    var efmt48 = document.getElementById('efmt48');
    if (efmt16 && efmt24 && efmtOrig && efmt48) {
        efmt16.classList.toggle('sel', _exportBitDepth !== 24);
        efmt24.classList.toggle('sel', _exportBitDepth === 24);
        efmtOrig.classList.toggle('sel', _exportSampleRate !== 48000);
        efmt48.classList.toggle('sel', _exportSampleRate === 48000);
    }
    dlg.style.display = 'flex';
}

function bindExportDialog() {
    var dlg = document.getElementById('exportFmtDialog');
    if (!dlg) return;
    var efmt16 = document.getElementById('efmt16');
    var efmt24 = document.getElementById('efmt24');
    var efmtOrig = document.getElementById('efmtOrig');
    var efmt48 = document.getElementById('efmt48');
    var efmtCancel = document.getElementById('efmtCancel');
    var efmtGo = document.getElementById('efmtGo');
    if (!efmt16 || !efmt24 || !efmtOrig || !efmt48 || !efmtCancel || !efmtGo) return;
    efmt16.onclick = function() { _exportBitDepth = 16; efmt16.classList.add('sel'); efmt24.classList.remove('sel'); };
    efmt24.onclick = function() { _exportBitDepth = 24; efmt24.classList.add('sel'); efmt16.classList.remove('sel'); };
    efmtOrig.onclick = function() { _exportSampleRate = 0; efmtOrig.classList.add('sel'); efmt48.classList.remove('sel'); };
    efmt48.onclick = function() { _exportSampleRate = 48000; efmt48.classList.add('sel'); efmtOrig.classList.remove('sel'); };
    efmtCancel.onclick = function() { dlg.style.display = 'none'; };
    dlg.onclick = function(e) { if (e.target === dlg) dlg.style.display = 'none'; };
    efmtGo.onclick = function() {
        dlg.style.display = 'none';
        doExport(_exportBitDepth, _exportSampleRate);
    };
}

bindExportDialog(); // bind once on init

downloadBtn.addEventListener('click', function() {
    if (!targetBuffer) { alert('No target audio loaded.'); return; }
    showExportDialog();
});

function doExport(bitDepth, sampleRate) {
    setStatus('RENDERING...', 1);
    downloadBtn.disabled = true;
    var srOpt = (sampleRate === 48000) ? 48000 : null;
    renderOffline(targetBuffer, srOpt).then(function(proc) {
        var blob = bufferToWav(proc, bitDepth);
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        // Nombre del archivo: nombre del target + etiqueta de formato
        var baseName = currentTargetFileName && currentTargetFileName.length ? currentTargetFileName : 'rack4master';
        var label = bitDepth + 'bit' + (srOpt ? '_48k' : '');
        a.download = baseName + '_' + label + '.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus('EXPORT COMPLETE (' + bitDepth + ' bits' + (srOpt ? ' / 48kHz' : '') + ')', 2);
        downloadBtn.disabled = false;
    }).catch(function(err) {
        setStatus('RENDER ERROR: ' + err.message, 0);
        downloadBtn.disabled = false;
    });
}

function bufferToWav(buf, bitDepth) {
    bitDepth = (bitDepth === 24) ? 24 : 16;
    var numCh = buf.numberOfChannels, sr = buf.sampleRate, len = buf.length;
    var bytesPerSample = (bitDepth === 24) ? 3 : 2;
    var blockAlign = numCh * bytesPerSample;
    var dataSize = len * blockAlign;
    var wav = new ArrayBuffer(44 + dataSize);
    var v = new DataView(wav);
    var pos = 0;
    function writeString(s) {
        for (var i = 0; i < s.length; i++) v.setUint8(pos + i, s.charCodeAt(i));
        pos += s.length;
    }
    function writeU32(vv) { v.setUint32(pos, vv, true); pos += 4; }
    function writeU16(vv) { v.setUint16(pos, vv, true); pos += 2; }
    writeString('RIFF');
    writeU32(36 + dataSize);
    writeString('WAVE');
    writeString('fmt ');
    writeU32(16);
    writeU16(1);
    writeU16(numCh);
    writeU32(sr);
    writeU32(sr * blockAlign);
    writeU16(blockAlign);
    writeU16(bitDepth);
    writeString('data');
    writeU32(dataSize);
    var off = pos;
    for (var i = 0; i < len; i++) {
        for (var ch = 0; ch < numCh; ch++) {
            var s = Math.max(-1, Math.min(1, buf.getChannelData(ch)[i]));
            if (bitDepth === 24) {
                var v24;
                if (s < 0) v24 = Math.round(s * 8388608);
                else v24 = Math.round(s * 8388607);
                v24 = Math.max(-8388608, Math.min(8388607, v24));
                v.setUint8(off,      v24 & 0xFF);
                v.setUint8(off + 1, (v24 >> 8) & 0xFF);
                v.setUint8(off + 2, (v24 >> 16) & 0xFF);
                off += 3;
            } else {
                var v16 = s < 0 ? Math.round(s * 32768) : Math.round(s * 32767);
                v.setInt16(off, v16, true);
                off += 2;
            }
        }
    }
    return new Blob([wav], { type: 'audio/wav' });
}

// ============================================================
// FULL RESET — with confirmation modal
// ============================================================
function doFullReset() {
    stopLive(); destroyLive();
    simpleStop(refPlayer,ledRef,playRef,true);
    simpleStop(tgtPlayer,ledTarget,playTarget,true);
    refBuffer=null; targetBuffer=null;
    currentTargetFileName = '';
    refPeaks=null; targetPeaks=null; resultPeaks=null;
    refSpecData=null; targetSpecData=null; resultSpecData=null;
    refPlayer.offset=0; tgtPlayer.offset=0; liveOffset=0;
    // Reset loop state
    refLoop.enabled=false; refLoop.start=0.2; refLoop.end=0.8;
    tgtLoop.enabled=false; tgtLoop.start=0.2; tgtLoop.end=0.8;
    resultLoop.enabled=false; resultLoop.start=0.2; resultLoop.end=0.8;
    loopSync = true;
    loopRefBtn.classList.remove('btn-loop-active');
    loopTargetBtn.classList.remove('btn-loop-active');
    loopResultBtn.classList.remove('btn-loop-active');
    loopResultBtn.disabled = true;
    loopSyncBtn.disabled   = true;
    loopSyncBtn.classList.add('synced');
    [canvasRef,canvasTarget,canvasResult].forEach(function(c){
        var cx=c.getContext('2d');cx.fillStyle='#060609';cx.fillRect(0,0,c.width,c.height);
    });
    [canvasSpecRef,canvasSpecTarget,canvasSpecResult,canvasCompSpec].forEach(function(c){
        var cx=c.getContext('2d');cx.fillStyle='#040508';cx.fillRect(0,0,c.width,c.height);
    });
    dropRef.classList.remove('loaded'); dropTarget.classList.remove('loaded');
    ledRef.className='led'; ledTarget.className='led';
    infoRef.textContent='NO FILE LOADED'; infoTarget.textContent='NO FILE LOADED';
    analysisPanel.style.display='none'; analysisPanel.classList.remove('is-open'); resultSection.style.display='none';
    compPanel.style.display='none'; fxSection.style.display='none'; actionRow.style.display='none';
    analyzeBtn.disabled=false;
    abMode = 'B';
    if(abBtn){ abBtn.disabled=true; abBtn.classList.remove('mode-a'); }
    if(abState) abState.textContent='B\u25ba';
    if(liveBadge) liveBadge.textContent='LIVE DSP CHAIN ACTIVE';
    var def={eq50:0,eq100:0,eq300:0,eq1k:0,eq3k:0,eq8k:0,eq16k:0,
             compThr:-24,compRat:3,compAtk:3,compRel:250,compMkp:0,
             hpfFreq:20,hpfQ:0.7,satAmt:0,midGain:0,sideGain:0,limCeil:-0.3,outGain:0};
    var dk=Object.keys(def);
    for(var i=0;i<dk.length;i++) if(sliders[dk[i]]) sliders[dk[i]].el.value=def[dk[i]];
    updateSpans(); setStatus('RESET',0);
}

// ============================================================
// MODULE HELP POPUPS
// ============================================================
document.querySelectorAll('.mod-help-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var targetId = btn.getAttribute('data-help');
        var popup = document.getElementById(targetId);
        if (!popup) return;
        var isOpen = popup.classList.contains('open');
        // Close all popups
        document.querySelectorAll('.help-popup.open').forEach(function(p){ p.classList.remove('open'); });
        // Toggle the clicked one
        if (!isOpen) popup.classList.add('open');
    });
});
// Close popups on outside click
document.addEventListener('click', function() {
    document.querySelectorAll('.help-popup.open').forEach(function(p){ p.classList.remove('open'); });
});

resetBtn.addEventListener('click', function() {
    confirmModal.classList.remove('hidden');
});
confirmOk.addEventListener('click', function() {
    confirmModal.classList.add('hidden');
    doFullReset();
});
confirmCancel.addEventListener('click', function() {
    confirmModal.classList.add('hidden');
});
// Close on backdrop click
confirmModal.addEventListener('click', function(e) {
    if (e.target === confirmModal) confirmModal.classList.add('hidden');
});
// Close on Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') confirmModal.classList.add('hidden');
});

// ============================================================
// LOOP BUTTON TOGGLES
// ============================================================
loopRefBtn.addEventListener('click', function() {
    refLoop.enabled = !refLoop.enabled;
    loopRefBtn.classList.toggle('btn-loop-active', refLoop.enabled);
    rRef(refPlayer.playing ? 0 : (refPlayer.offset / (refBuffer ? refBuffer.duration : 1)));
    // If playing, restart with/without loop
    if (refPlayer.playing && refBuffer) {
        simpleStop(refPlayer, ledRef, playRef, true);
        simplePlay(refBuffer, refPlayer, ledRef, playRef, refLoop);
    }
});

loopTargetBtn.addEventListener('click', function() {
    tgtLoop.enabled = !tgtLoop.enabled;
    loopTargetBtn.classList.toggle('btn-loop-active', tgtLoop.enabled);
    rTgt(tgtPlayer.playing ? 0 : (tgtPlayer.offset / (targetBuffer ? targetBuffer.duration : 1)));
    if (tgtPlayer.playing && targetBuffer) {
        simpleStop(tgtPlayer, ledTarget, playTarget, true);
        simplePlay(targetBuffer, tgtPlayer, ledTarget, playTarget, tgtLoop);
    }
    // Propagate to result if synced
    if (loopSync) {
        resultLoop.enabled = tgtLoop.enabled;
        loopResultBtn.classList.toggle('btn-loop-active', resultLoop.enabled);
        if (resultPeaks) rRes(livePlaying && audioCtx ? (audioCtx.currentTime-liveStart)/(targetBuffer.duration||1) : liveOffset/(targetBuffer?targetBuffer.duration:1));
        if (livePlaying && targetBuffer) startLive(liveOffset, true);
    }
});

loopResultBtn.addEventListener('click', function() {
    if (loopSync) {
        // When synced, result loop button acts on target (which propagates back)
        loopTargetBtn.click();
    } else {
        resultLoop.enabled = !resultLoop.enabled;
        loopResultBtn.classList.toggle('btn-loop-active', resultLoop.enabled);
        if (resultPeaks) rRes(livePlaying && audioCtx ? (audioCtx.currentTime-liveStart)/(targetBuffer?targetBuffer.duration:1) : liveOffset/(targetBuffer?targetBuffer.duration:1));
        if (livePlaying && targetBuffer) startLive(liveOffset, true);
    }
});

loopSyncBtn.addEventListener('click', function() {
    loopSync = !loopSync;
    loopSyncBtn.classList.toggle('synced', loopSync);
    if (loopSync) {
        // Immediately mirror current target loop state
        resultLoop.enabled = tgtLoop.enabled;
        resultLoop.start   = tgtLoop.start;
        resultLoop.end     = tgtLoop.end;
        loopResultBtn.classList.toggle('btn-loop-active', resultLoop.enabled);
        if (resultPeaks) rRes(livePlaying && audioCtx ? (audioCtx.currentTime-liveStart)/(targetBuffer?targetBuffer.duration:1) : liveOffset/(targetBuffer?targetBuffer.duration:1));
        if (livePlaying && resultLoop.enabled && targetBuffer) startLive(liveOffset, true);
    }
});


// ============================================================
// HAMBURGER MENU
// ============================================================
var menuBtn = document.getElementById('menuBtn');
var hmenu   = document.getElementById('hamburgerMenu');

menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    hmenu.classList.toggle('hidden');
});
document.addEventListener('click', function() { hmenu.classList.add('hidden'); });
hmenu.addEventListener('click', function(e) { e.stopPropagation(); });

document.querySelectorAll('.hmenu-lang').forEach(function(btn) {
    btn.addEventListener('click', function() {
        i18n.setLang(btn.getAttribute('data-lang'));
        hmenu.classList.add('hidden');
    });
});

function updateLangChecks(lang) {
    ['en','es','ca'].forEach(function(l) {
        var el = document.getElementById('chk-' + l);
        if (el) el.style.visibility = (l === lang) ? 'visible' : 'hidden';
    });
}

// ============================================================
// INFO MODAL (Privacy / Legal / Terms)
// ============================================================
var infoModal      = document.getElementById('infoModal');
var infoModalTitle = document.getElementById('infoModalTitle');
var infoModalBody  = document.getElementById('infoModalBody');
var infoModalClose = document.getElementById('infoModalClose');

document.querySelectorAll('[data-modal]').forEach(function(el) {
    el.addEventListener('click', function(e) {
        e.preventDefault();
        var key = el.getAttribute('data-modal');
        var c   = i18n.getModal(key);
        if (!c) return;
        infoModalTitle.textContent = c.title;
        infoModalBody.innerHTML    = c.body;
        infoModal.classList.remove('hidden');
    });
});
infoModalClose.addEventListener('click', function() { infoModal.classList.add('hidden'); });
infoModal.addEventListener('click', function(e) { if (e.target === infoModal) infoModal.classList.add('hidden'); });
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') infoModal.classList.add('hidden');
});

// ============================================================
// I18N INIT
// ============================================================
i18n.init('en', function(lang) {
    updateLangChecks(lang);
});
