(function () {
  'use strict';

  // ============================================================
  // VCF PARSER
  // ============================================================
  function parseVCF(text) {
    var contacts = [];
    // Normalize line endings and unfold lines (folded lines start with space/tab)
    var unfolded = text.replace(/\r\n?/g, '\n').replace(/\n /g, '').replace(/\n\t/g, '');
    // Split by BEGIN:VCARD
    var blocks = unfolded.split(/BEGIN:VCARD/i);
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b].trim();
      var endIdx = block.search(/END:VCARD/i);
      if (endIdx < 0) continue;
      block = block.substring(0, endIdx).trim();
      if (!block) continue;

      var contact = {
        fullName: '',
        firstName: '',
        lastName: '',
        emails: [],
        phones: [],
        company: '',
        title: '',
        address: '',
        website: '',
        birthday: '',
        notes: '',
        raw: {}
      };

      var lines = block.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) continue;

        // Decode quoted-printable if present
        if (line.indexOf('ENCODING=QUOTED-PRINTABLE') >= 0 || line.indexOf('ENCODING=QUOTED-PRINTABLE') >= 0) {
          line = decodeQuotedPrintable(line);
        }

        // Parse the vCard line
        var colonIdx = line.indexOf(':');
        if (colonIdx < 0) continue;
        var keyPart = line.substring(0, colonIdx).toUpperCase();
        var value = line.substring(colonIdx + 1).trim();

        // Extract main property name
        var propName = keyPart.split(';')[0];

        // Extract params (TYPE=HOME, TYPE=WORK, etc.)
        var params = {};
        var paramParts = keyPart.split(';');
        for (var p = 1; p < paramParts.length; p++) {
          var pp = paramParts[p];
          var eqIdx = pp.indexOf('=');
          if (eqIdx >= 0) {
            var pk = pp.substring(0, eqIdx).toUpperCase();
            var pv = pp.substring(eqIdx + 1);
            params[pk] = pv;
          } else {
            params.TYPE = pp;
          }
        }

        switch (propName) {
          case 'FN':
            contact.fullName = value;
            break;
          case 'N':
            var nParts = value.split(';');
            contact.lastName = (nParts[0] || '').trim();
            contact.firstName = (nParts[1] || '').trim();
            if (!contact.fullName) {
              contact.fullName = (contact.firstName + ' ' + contact.lastName).trim();
            }
            break;
          case 'EMAIL':
            contact.emails.push({ value: value, type: params.TYPE || 'INTERNET' });
            break;
          case 'TEL':
            contact.phones.push({ value: value, type: params.TYPE || 'VOICE' });
            break;
          case 'ORG':
            contact.company = value.replace(/;/g, ', ');
            break;
          case 'TITLE':
            contact.title = value;
            break;
          case 'ADR':
            if (!contact.address) contact.address = value.replace(/;/g, ', ');
            break;
          case 'URL':
            if (!contact.website) contact.website = value;
            break;
          case 'BDAY':
            contact.birthday = value;
            break;
          case 'NOTE':
            contact.notes = (contact.notes ? contact.notes + '\n' : '') + value;
            break;
        }
        contact.raw[keyPart] = value;
      }
      contacts.push(contact);
    }
    return contacts;
  }

  function decodeQuotedPrintable(text) {
    // Remove the QP encoding header
    text = text.replace(/.*ENCODING=QUOTED-PRINTABLE;?/i, '');
    // Decode =XX sequences
    try {
      return text.replace(/=([0-9A-F]{2})/gi, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
      }).replace(/=\n/g, '').replace(/=\r/g, '');
    } catch (e) {
      return text;
    }
  }

  // ============================================================
  // VCF TO CSV
  // ============================================================
  function contactsToCSV(contacts) {
    var headers = ['Full Name', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Address', 'Website', 'Birthday', 'Notes'];
    var rows = [headers];

    for (var i = 0; i < contacts.length; i++) {
      var c = contacts[i];
      var email = c.emails.map(function(e) { return e.value; }).join('; ');
      var phone = c.phones.map(function(p) { return p.value; }).join('; ');
      rows.push([
        c.fullName,
        c.firstName,
        c.lastName,
        email,
        phone,
        c.company,
        c.title,
        c.address,
        c.website,
        c.birthday,
        c.notes
      ]);
    }

    return rows.map(function(row) {
      return row.map(function(cell) {
        var str = String(cell || '');
        if (str.indexOf(',') >= 0 || str.indexOf('"') >= 0 || str.indexOf('\n') >= 0) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }).join(',');
    }).join('\n');
  }

  // ============================================================
  // CSV TO VCF
  // ============================================================
  function csvToContacts(csvText) {
    var lines = csvText.split(/\r?\n/).filter(function(l) { return l.trim(); });
    if (lines.length < 2) return [];

    // Parse header
    var header = parseCSVLine(lines[0]);
    var contacts = [];

    for (var i = 1; i < lines.length; i++) {
      var row = parseCSVLine(lines[i]);
      var contact = {
        fullName: '',
        firstName: '',
        lastName: '',
        emails: [],
        phones: [],
        company: '',
        title: '',
        address: '',
        website: '',
        birthday: '',
        notes: ''
      };

      for (var j = 0; j < header.length && j < row.length; j++) {
        var h = header[j].toLowerCase().replace(/[^a-z]/g, '');
        var val = row[j].trim();
        switch (h) {
          case 'fullname':
          case 'full name':
            contact.fullName = val;
            break;
          case 'firstname':
          case 'first name':
            contact.firstName = val;
            break;
          case 'lastname':
          case 'last name':
            contact.lastName = val;
            break;
          case 'email':
            contact.emails.push({ value: val, type: 'INTERNET' });
            break;
          case 'phone':
          case 'phone1':
          case 'mobile phone':
          case 'telephone':
            contact.phones.push({ value: val, type: 'VOICE' });
            break;
          case 'company':
            contact.company = val;
            break;
          case 'jobtitle':
          case 'job title':
          case 'title':
            contact.title = val;
            break;
          case 'address':
            contact.address = val;
            break;
          case 'website':
          case 'url':
          case 'web':
            contact.website = val;
            break;
          case 'birthday':
          case 'bday':
          case 'birth day':
            contact.birthday = val;
            break;
          case 'notes':
          case 'note':
            contact.notes = val;
            break;
        }
      }
      contacts.push(contact);
    }
    return contacts;
  }

  function parseCSVLine(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  // ============================================================
  // CONTACTS TO VCF
  // ============================================================
  function contactsToVCF(contacts) {
    var lines = [];
    for (var i = 0; i < contacts.length; i++) {
      var c = contacts[i];
      lines.push('BEGIN:VCARD');
      lines.push('VERSION:3.0');
      lines.push('FN:' + (c.fullName || (c.firstName + ' ' + c.lastName).trim() || 'Unknown'));

      if (c.lastName || c.firstName) {
        lines.push('N:' + c.lastName + ';' + c.firstName + ';;;');
      }

      if (c.emails.length > 0) {
        for (var e = 0; e < c.emails.length; e++) {
          var emailType = c.emails[e].type || 'INTERNET';
          lines.push('EMAIL;TYPE=' + emailType + ':' + c.emails[e].value);
        }
      }

      if (c.phones.length > 0) {
        for (var p = 0; p < c.phones.length; p++) {
          var phoneType = c.phones[p].type || 'VOICE';
          lines.push('TEL;TYPE=' + phoneType + ':' + c.phones[p].value);
        }
      }

      if (c.company) lines.push('ORG:' + c.company);
      if (c.title) lines.push('TITLE:' + c.title);
      if (c.address) lines.push('ADR;TYPE=HOME:;;' + c.address.replace(/,/g, ';'));
      if (c.website) lines.push('URL:' + c.website);
      if (c.birthday) lines.push('BDAY:' + c.birthday);
      if (c.notes) lines.push('NOTE:' + c.notes);
      lines.push('END:VCARD');
    }
    return lines.join('\n');
  }

  // ============================================================
  // EXPORT
  // ============================================================
  window.VCFConverter = {
    parseVCF: parseVCF,
    contactsToCSV: contactsToCSV,
    csvToContacts: csvToContacts,
    contactsToVCF: contactsToVCF
  };

})();
