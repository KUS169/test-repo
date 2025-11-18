// exp7.js — Clean, minimal, compatible version (no tricky syntax)
(function () {
  // DOM refs
  var canvas = document.getElementById('drawCanvas');
  var ctx = canvas.getContext('2d');

  var colorInput = document.getElementById('color');
  var sizeInput = document.getElementById('size');
  var eraserBtn = document.getElementById('eraser');
  var undoBtn = document.getElementById('undo');
  var clearBtn = document.getElementById('clear');
  var savePngBtn = document.getElementById('savePng');
  var exportJsonBtn = document.getElementById('exportJson');
  var importBtn = document.getElementById('importBtn');
  var importFile = document.getElementById('importFile');

  // state
  var strokes = [];
  var currentStroke = null;
  var drawing = false;
  var isEraser = false;

  // Resize canvas to device-pixel ratio for crisp drawing
  function resizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // redraw after resize
    redrawAll();
  }

  // Get mouse/touch coords relative to canvas CSS box
  function getXY(evt) {
    var rect = canvas.getBoundingClientRect();
    var clientX, clientY;
    if (evt.touches && evt.touches.length) {
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    } else {
      clientX = evt.clientX;
      clientY = evt.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startStroke(pt) {
    drawing = true;
    currentStroke = {
      color: isEraser ? '#ffffff' : colorInput.value,
      size: Number(sizeInput.value) || 4,
      mode: isEraser ? 'erase' : 'draw',
      points: [pt]
    };
    strokes.push(currentStroke);
    drawSegmentForStroke(currentStroke);
  }

  function addPoint(pt) {
    if (!drawing || !currentStroke) return;
    currentStroke.points.push(pt);
    drawSegmentForStroke(currentStroke);
  }

  function endStroke() {
    drawing = false;
    currentStroke = null;
  }

  function drawSegmentForStroke(s) {
    if (!s || !s.points || s.points.length === 0) return;
    ctx.save();
    if (s.mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = s.size;
    if (s.points.length === 1) {
      var p = s.points[0];
      ctx.beginPath();
      ctx.arc(p.x, p.y, s.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.closePath();
    } else {
      var a = s.points[s.points.length - 2];
      var b = s.points[s.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = s.color;
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
  }

  function redrawAll() {
    // clear using CSS pixel size
    var rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    for (var i = 0; i < strokes.length; i++) {
      var s = strokes[i];
      ctx.save();
      if (s.mode === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = s.size;
      if (!s.points || s.points.length === 0) { ctx.restore(); continue; }
      if (s.points.length === 1) {
        var p = s.points[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, s.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.closePath();
      } else {
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (var j = 1; j < s.points.length; j++) {
          ctx.lineTo(s.points[j].x, s.points[j].y);
        }
        ctx.strokeStyle = s.color;
        ctx.stroke();
        ctx.closePath();
      }
      ctx.restore();
    }
  }

  function undo() {
    if (strokes.length === 0) return;
    strokes.pop();
    redrawAll();
  }

  function clearAll() {
    if (!confirm('Clear the canvas?')) return;
    strokes = [];
    redrawAll();
  }

  function savePng() {
    var url = canvas.toDataURL('image/png');
    var a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function exportJson() {
    try {
      var blob = new Blob([JSON.stringify(strokes)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'drawing.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + (err && err.message ? err.message : err));
    }
  }

  function importJsonFile(file) {
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var arr = JSON.parse(ev.target.result);
        if (!Array.isArray(arr)) throw new Error('Invalid format');
        strokes = arr;
        redrawAll();
      } catch (e) {
        alert('Failed to import: ' + e.message);
      }
    };
    reader.readAsText(file);
  }

  function toggleEraser() {
    isEraser = !isEraser;
    eraserBtn.textContent = isEraser ? 'Draw' : 'Eraser';
    canvas.style.cursor = isEraser ? 'cell' : 'crosshair';
  }

  // Pointer handlers (mouse + touch)
  function pointerDown(e) {
    e.preventDefault();
    var pt = getXY(e);
    startStroke(pt);
  }
  function pointerMove(e) {
    if (!drawing) return;
    e.preventDefault();
    var pt = getXY(e);
    addPoint(pt);
  }
  function pointerUp() {
    if (!drawing) return;
    endStroke();
  }

  // Wire events
  canvas.addEventListener('mousedown', pointerDown);
  canvas.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);

  canvas.addEventListener('touchstart', pointerDown, { passive: false });
  canvas.addEventListener('touchmove', pointerMove, { passive: false });
  window.addEventListener('touchend', pointerUp);

  eraserBtn.addEventListener('click', toggleEraser);
  undoBtn.addEventListener('click', undo);
  clearBtn.addEventListener('click', clearAll);
  savePngBtn.addEventListener('click', savePng);
  exportJsonBtn.addEventListener('click', exportJson);
  importBtn.addEventListener('click', function () { importFile.click(); });
  importFile.addEventListener('change', function (e) {
    var f = e.target.files[0];
    if (!f) return;
    importJsonFile(f);
    importFile.value = '';
  });

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
    }
  });

  // Resize handler
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 120);
  });

  // initialize
  resizeCanvas();
  console.log('exp7 loaded');
})();
