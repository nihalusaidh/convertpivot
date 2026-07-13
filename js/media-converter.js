var MediaConverter = {};

MediaConverter.loadScript = function(url) {
  return new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = url;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
};

MediaConverter.heicToJpeg = async function(file) {
  if (typeof heic2any === 'undefined') {
    await MediaConverter.loadScript('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js');
  }
  var blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
  return Array.isArray(blob) ? blob[0] : blob;
};

MediaConverter.heicToPng = async function(file) {
  if (typeof heic2any === 'undefined') {
    await MediaConverter.loadScript('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js');
  }
  var blob = await heic2any({ blob: file, toType: 'image/png' });
  return Array.isArray(blob) ? blob[0] : blob;
};

MediaConverter.imageToFormat = function(file, format, quality) {
  return new Promise(function(resolve, reject) {
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(function(blob) {
        URL.revokeObjectURL(url);
        if (blob) resolve(blob);
        else reject(new Error('Conversion failed'));
      }, format, quality);
    };
    img.onerror = function() { URL.revokeObjectURL(url); reject(new Error('Could not decode image')); };
    img.src = url;
  });
};

MediaConverter.svgToPng = function(svgText, width, height) {
  return new Promise(function(resolve, reject) {
    var canvas = document.createElement('canvas');
    canvas.width = width || 800;
    canvas.height = height || 600;
    var ctx = canvas.getContext('2d');
    var blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(function(b) {
        if (b) resolve(b);
        else reject(new Error('SVG to PNG conversion failed'));
      }, 'image/png');
    };
    img.onerror = function() { URL.revokeObjectURL(url); reject(new Error('Could not render SVG')); };
    img.src = url;
  });
};

MediaConverter.getSupportedFormats = function() {
  var canvas = document.createElement('canvas');
  var formats = [];
  if (canvas.toBlob) {
    if (canvas.toDataURL('image/webp').indexOf('image/webp') === 5) formats.push('webp');
    if (canvas.toDataURL('image/jpeg').indexOf('image/jpeg') === 5) formats.push('jpeg');
    if (canvas.toDataURL('image/png').indexOf('image/png') === 5) formats.push('png');
  }
  return formats;
};

MediaConverter.createPDFFromImages = function(blobs) {
  if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
    return Promise.reject(new Error('jsPDF not loaded'));
  }
  var doc = new window.jspdf.jsPDF();
  return new Promise(async function(resolve) {
    for (var i = 0; i < blobs.length; i++) {
      if (i > 0) doc.addPage();
      var url = URL.createObjectURL(blobs[i]);
      var img = new Image();
      await new Promise(function(r) { img.onload = r; img.src = url; });
      var w = doc.internal.pageSize.getWidth();
      var h = doc.internal.pageSize.getHeight();
      var ratio = Math.min(w / img.width, h / img.height);
      var dw = img.width * ratio;
      var dh = img.height * ratio;
      doc.addImage(img, 'JPEG', (w - dw) / 2, (h - dh) / 2, dw, dh);
      URL.revokeObjectURL(url);
    }
    resolve(doc.output('blob'));
  });
};
