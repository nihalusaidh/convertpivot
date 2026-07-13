var GPSConverter = {};

GPSConverter.parseGPX = function(text) {
  var parser = new DOMParser();
  var xml = parser.parseFromString(text, 'text/xml');
  var gpx = xml.documentElement;
  if (!gpx || gpx.tagName !== 'gpx') throw new Error('Invalid GPX file');

  var data = { waypoints: [], tracks: [], routes: [], metadata: {} };
  var metaEl = gpx.querySelector('metadata');
  if (metaEl) {
    var nameEl = metaEl.querySelector('name');
    if (nameEl) data.metadata.name = nameEl.textContent;
    var descEl = metaEl.querySelector('desc');
    if (descEl) data.metadata.desc = descEl.textContent;
  }

  gpx.querySelectorAll('wpt').forEach(function(wpt) {
    data.waypoints.push(GPSConverter.parsePoint(wpt, 'waypoint'));
  });

  gpx.querySelectorAll('trk').forEach(function(trk) {
    var track = { name: '', desc: '', segments: [] };
    var n = trk.querySelector('name');
    if (n) track.name = n.textContent;
    var d = trk.querySelector('desc');
    if (d) track.desc = d.textContent;
    trk.querySelectorAll('trkseg').forEach(function(seg) {
      var points = [];
      seg.querySelectorAll('trkpt').forEach(function(pt) {
        points.push(GPSConverter.parsePoint(pt, 'trackpoint'));
      });
      track.segments.push(points);
    });
    data.tracks.push(track);
  });

  gpx.querySelectorAll('rte').forEach(function(rte) {
    var route = { name: '', desc: '', points: [] };
    var n = rte.querySelector('name');
    if (n) route.name = n.textContent;
    var d = rte.querySelector('desc');
    if (d) route.desc = d.textContent;
    rte.querySelectorAll('rtept').forEach(function(pt) {
      route.points.push(GPSConverter.parsePoint(pt, 'routepoint'));
    });
    data.routes.push(route);
  });

  return data;
};

GPSConverter.parsePoint = function(el, type) {
  var pt = { type: type, lat: parseFloat(el.getAttribute('lat')), lon: parseFloat(el.getAttribute('lon')), ele: null, time: null, name: null, desc: null, sym: null };
  var ele = el.querySelector('ele');
  if (ele) pt.ele = parseFloat(ele.textContent);
  var time = el.querySelector('time');
  if (time) pt.time = time.textContent;
  var name = el.querySelector('name');
  if (name) pt.name = name.textContent;
  var desc = el.querySelector('desc');
  if (desc) pt.desc = desc.textContent;
  var sym = el.querySelector('sym');
  if (sym) pt.sym = sym.textContent;
  return pt;
};

GPSConverter.parseKML = function(text) {
  var parser = new DOMParser();
  var xml = parser.parseFromString(text, 'text/xml');
  var kml = xml.documentElement;
  if (!kml || kml.tagName !== 'kml') throw new Error('Invalid KML file');

  var data = { placemarks: [], tracks: [] };

  kml.querySelectorAll('Placemark').forEach(function(pm) {
    var placemark = { name: '', desc: '', geometry: null };
    var n = pm.querySelector('name');
    if (n) placemark.name = n.textContent;
    var d = pm.querySelector('description');
    if (d) placemark.desc = d.textContent;

    var pt = pm.querySelector('Point');
    if (pt) {
      var coords = pt.querySelector('coordinates');
      if (coords) placemark.geometry = { type: 'point', coordinates: GPSConverter.parseCoords(coords.textContent) };
    }

    var line = pm.querySelector('LineString');
    if (line) {
      var coords2 = line.querySelector('coordinates');
      if (coords2) placemark.geometry = { type: 'linestring', coordinates: GPSConverter.parseCoordsList(coords2.textContent) };
    }

    var poly = pm.querySelector('Polygon');
    if (poly) {
      var outer = poly.querySelector('outerBoundaryIs coordinates');
      if (outer) placemark.geometry = { type: 'polygon', coordinates: GPSConverter.parseCoordsList(outer.textContent) };
    }

    data.placemarks.push(placemark);
  });

  return data;
};

GPSConverter.parseCoords = function(text) {
  var parts = text.trim().split(',');
  return { lon: parseFloat(parts[0]), lat: parseFloat(parts[1]), alt: parts[2] ? parseFloat(parts[2]) : null };
};

GPSConverter.parseCoordsList = function(text) {
  return text.trim().split(/\s+/).filter(function(s) { return s.length > 0; }).map(function(s) {
    return GPSConverter.parseCoords(s);
  });
};

GPSConverter.gpxToKML = function(gpxData) {
  var lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<kml xmlns="http://www.opengis.net/kml/2.2">');
  lines.push('<Document>');

  gpxData.waypoints.forEach(function(wpt) {
    lines.push('<Placemark>');
    if (wpt.name) lines.push('<name>' + GPSConverter.escapeXML(wpt.name) + '</name>');
    if (wpt.desc) lines.push('<description>' + GPSConverter.escapeXML(wpt.desc) + '</description>');
    lines.push('<Point><coordinates>' + wpt.lon + ',' + wpt.lat + (wpt.ele !== null ? ',' + wpt.ele : '') + '</coordinates></Point>');
    lines.push('</Placemark>');
  });

  gpxData.tracks.forEach(function(trk) {
    lines.push('<Placemark>');
    if (trk.name) lines.push('<name>' + GPSConverter.escapeXML(trk.name) + '</name>');
    if (trk.desc) lines.push('<description>' + GPSConverter.escapeXML(trk.desc) + '</description>');
    lines.push('<LineString><coordinates>');
    trk.segments.forEach(function(seg) {
      seg.forEach(function(pt) {
        lines.push(pt.lon + ',' + pt.lat + (pt.ele !== null ? ',' + pt.ele : ''));
      });
    });
    lines.push('</coordinates></LineString>');
    lines.push('</Placemark>');
  });

  gpxData.routes.forEach(function(rte) {
    lines.push('<Placemark>');
    if (rte.name) lines.push('<name>' + GPSConverter.escapeXML(rte.name) + '</name>');
    if (rte.desc) lines.push('<description>' + GPSConverter.escapeXML(rte.desc) + '</description>');
    lines.push('<LineString><coordinates>');
    rte.points.forEach(function(pt) {
      lines.push(pt.lon + ',' + pt.lat + (pt.ele !== null ? ',' + pt.ele : ''));
    });
    lines.push('</coordinates></LineString>');
    lines.push('</Placemark>');
  });

  lines.push('</Document></kml>');
  return lines.join('\n');
};

GPSConverter.kmlToGPX = function(kmlData) {
  var lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<gpx version="1.1" creator="ConvertPivot" xmlns="http://www.topografix.com/GPX/1/1">');

  kmlData.placemarks.forEach(function(pm) {
    if (!pm.geometry) return;
    if (pm.geometry.type === 'point') {
      var pt = pm.geometry.coordinates;
      lines.push('<wpt lat="' + pt.lat + '" lon="' + pt.lon + '">');
      if (pm.name) lines.push('<name>' + GPSConverter.escapeXML(pm.name) + '</name>');
      if (pm.desc) lines.push('<desc>' + GPSConverter.escapeXML(pm.desc) + '</desc>');
      if (pt.alt !== null) lines.push('<ele>' + pt.alt + '</ele>');
      lines.push('</wpt>');
    } else if (pm.geometry.type === 'linestring') {
      lines.push('<trk><trkseg>');
      pm.geometry.coordinates.forEach(function(pt) {
        lines.push('<trkpt lat="' + pt.lat + '" lon="' + pt.lon + '">');
        if (pt.alt !== null) lines.push('<ele>' + pt.alt + '</ele>');
        lines.push('</trkpt>');
      });
      lines.push('</trkseg></trk>');
    }
  });

  lines.push('</gpx>');
  return lines.join('\n');
};

GPSConverter.gpxToCSV = function(gpxData) {
  var lines = ['lat,lon,elevation,time,name,desc,type'];
  gpxData.waypoints.forEach(function(pt) {
    lines.push([pt.lat, pt.lon, pt.ele || '', pt.time || '', '"' + (pt.name || '') + '"', '"' + (pt.desc || '') + '"', 'waypoint'].join(','));
  });
  gpxData.tracks.forEach(function(trk) {
    trk.segments.forEach(function(seg) {
      seg.forEach(function(pt) {
        lines.push([pt.lat, pt.lon, pt.ele || '', pt.time || '', '"' + (trk.name || '') + '"', '"' + (trk.desc || '') + '"', 'trackpoint'].join(','));
      });
    });
  });
  gpxData.routes.forEach(function(rte) {
    rte.points.forEach(function(pt) {
      lines.push([pt.lat, pt.lon, pt.ele || '', pt.time || '', '"' + (rte.name || '') + '"', '"' + (rte.desc || '') + '"', 'routepoint'].join(','));
    });
  });
  return lines.join('\n');
};

GPSConverter.parseFIT = function(buffer) {
  var dv = new DataView(buffer);
  var data = { records: [], sessions: [], laps: [] };
  var pos = 12;
  if (pos > buffer.byteLength) return data;
  while (pos + 2 <= buffer.byteLength) {
    var header = dv.getUint8(pos);
    var isDef = (header & 0x80) === 0x80;
    var hasDev = (header & 0x20) === 0x20;
    var msgType = header & 0x0F;
    var bodyLen = isDef ? (header & 0x60) === 0x60 ? (hasDev ? 6 : 4) : (hasDev ? 3 : 1) : (header & 0x40) === 0x40 ? 2 : 1;
    var recLen = isDef ? bodyLen : header & 0x0F;
    if (pos + 1 + recLen > buffer.byteLength) break;
    if (isDef) {
      pos += 1 + recLen;
    } else {
      pos += 1;
    }
    if (msgType === 20) {
      var lat = null, lon = null, alt = null, ts = null, hr = null, cad = null, dist = null, spd = null;
      data.records.push({ lat: lat, lon: lon, altitude: alt, timestamp: ts, heart_rate: hr, cadence: cad, distance: dist, speed: spd });
    }
  }
  return data;
};

GPSConverter.fitToGPX = function(fitData) {
  var lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<gpx version="1.1" creator="ConvertPivot" xmlns="http://www.topografix.com/GPX/1/1">');
  lines.push('<trk><trkseg>');
  fitData.records.forEach(function(rec) {
    if (rec.lat !== null && rec.lon !== null) {
      lines.push('<trkpt lat="' + rec.lat + '" lon="' + rec.lon + '">');
      if (rec.altitude !== null) lines.push('<ele>' + rec.altitude + '</ele>');
      if (rec.timestamp !== null) lines.push('<time>' + rec.timestamp + '</time>');
      if (rec.heart_rate !== null) lines.push('<extensions><hr>' + rec.heart_rate + '</hr></extensions>');
      lines.push('</trkpt>');
    }
  });
  lines.push('</trkseg></trk>');
  lines.push('</gpx>');
  return lines.join('\n');
};

GPSConverter.fitToCSV = function(fitData) {
  var lines = ['timestamp,lat,lon,altitude,heart_rate,cadence,distance,speed'];
  fitData.records.forEach(function(rec) {
    lines.push([rec.timestamp || '', rec.lat !== null ? rec.lat : '', rec.lon !== null ? rec.lon : '', rec.altitude !== null ? rec.altitude : '', rec.heart_rate !== null ? rec.heart_rate : '', rec.cadence !== null ? rec.cadence : '', rec.distance !== null ? rec.distance : '', rec.speed !== null ? rec.speed : ''].join(','));
  });
  return lines.join('\n');
};

GPSConverter.escapeXML = function(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
};
