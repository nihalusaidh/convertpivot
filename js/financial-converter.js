(function () {
  'use strict';

  // ============================================================
  // OFX / QFX / QBO PARSER
  // ============================================================
  function parseOFX(text) {
    var result = {
      header: {},
      accounts: [],
      transactions: []
    };

    // Split header from body
    var bodyStart = text.indexOf('<OFX>');
    var headerText = bodyStart >= 0 ? text.substring(0, bodyStart) : '';
    var body = bodyStart >= 0 ? text.substring(bodyStart) : text;

    // Parse headers
    headerText.split('\n').forEach(function (line) {
      line = line.trim();
      var colon = line.indexOf(':');
      if (colon > 0) {
        result.header[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
      }
    });

    // Clean up SGML: normalize tags (some are <TAG>value, some are <TAG>value</TAG>)
    // Remove XML closing tags
    body = body.replace(/<\/(\w+)>/g, '');

    // Extract account info
    var acctMatch = body.match(/<BANKACCTFROM>([\s\S]*?)<\/BANKACCTFROM>/i);
    if (acctMatch) {
      var acctText = acctMatch[1];
      var bankId = extractTag(acctText, 'BANKID');
      var acctId = extractTag(acctText, 'ACCTID');
      var acctType = extractTag(acctText, 'ACCTTYPE');
      result.accounts.push({ bankId: bankId, acctId: acctId, type: acctType });
    }

    // Also try CC account
    var ccMatch = body.match(/<CCACCTFROM>([\s\S]*?)<\/CCACCTFROM>/i);
    if (ccMatch) {
      var ccText = ccMatch[1];
      result.accounts.push({ bankId: '', acctId: extractTag(ccText, 'ACCTID'), type: 'CREDITCARD' });
    }

    // Extract transactions
    var txnBlocks = body.split('<STMTTRN>');
    for (var i = 1; i < txnBlocks.length; i++) {
      var block = txnBlocks[i];
      var endIdx = block.indexOf('</STMTTRN>');
      if (endIdx >= 0) block = block.substring(0, endIdx);

      var txn = {
        type: extractTag(block, 'TRNTYPE'),
        date: extractTag(block, 'DTPOSTED') || extractTag(block, 'DTUSER'),
        amount: extractTag(block, 'TRNAMT'),
        id: extractTag(block, 'FITID'),
        name: extractTag(block, 'NAME'),
        memo: extractTag(block, 'MEMO'),
        checkNum: extractTag(block, 'CHECKNUM')
      };

      // Format date: YYYYMMDD -> YYYY-MM-DD
      if (txn.date && txn.date.length >= 8) {
        txn.dateFormatted = txn.date.substring(0, 4) + '-' + txn.date.substring(4, 6) + '-' + txn.date.substring(6, 8);
      } else {
        txn.dateFormatted = txn.date || '';
      }

      result.transactions.push(txn);
    }

    return result;
  }

  function extractTag(text, tagName) {
    var re = new RegExp('<' + tagName + '>([^<]*)', 'i');
    var match = text.match(re);
    return match ? match[1].trim() : '';
  }

  // ============================================================
  // OFX TO CSV
  // ============================================================
  function ofxToCSV(ofxResult) {
    var headers = ['Date', 'Description', 'Amount', 'Type', 'Memo', 'Check Number', 'Transaction ID'];
    if (ofxResult.accounts.length > 0) {
      var acct = ofxResult.accounts[0];
      headers.unshift('Account');
    }
    var rows = [headers];

    for (var i = 0; i < ofxResult.transactions.length; i++) {
      var t = ofxResult.transactions[i];
      var desc = t.name || t.memo || '';
      var row = [t.dateFormatted, desc, t.amount, t.type, t.memo || '', t.checkNum || '', t.id || ''];
      if (ofxResult.accounts.length > 0) {
        row.unshift(ofxResult.accounts[0].acctId || '');
      }
      rows.push(row);
    }

    return rows.map(function (row) {
      return row.map(function (cell) {
        var str = String(cell || '');
        if (str.indexOf(',') >= 0 || str.indexOf('"') >= 0 || str.indexOf('\n') >= 0) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }).join(',');
    }).join('\n');
  }

  // ============================================================
  // CSV TO QBO (generate QBO/OFX format)
  // ============================================================
  function csvToQBO(csvText, bankName, acctId) {
    var lines = csvText.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length < 2) return '';

    var header = parseCSVLine(lines[0]);
    var dateIdx = -1, descIdx = -1, amountIdx = -1;
    for (var i = 0; i < header.length; i++) {
      var h = header[i].toLowerCase().replace(/[^a-z]/g, '');
      if (h === 'date' || h === 'dateposted' || h === 'posteddate') dateIdx = i;
      if (h === 'description' || h === 'name' || h === 'desc' || h === 'memo' || h === 'payee') descIdx = i;
      if (h === 'amount' || h === 'trnamt' || h === 'value' || h === 'transactionamount') amountIdx = i;
    }

    // Generate QBO
    var qbo = '';
    // Headers
    qbo += 'OFXHEADER:100\nDATA:OFXSGML\nVERSION:102\nSECURITY:NONE\nENCODING:USASCII\nCHARSET:1252\nCOMPRESSION:NONE\nOLDFILEUID:NONE\nNEWFILEUID:NONE\n\n';
    qbo += '<OFX>\n<SIGNONMSGSRSV1>\n<SONRS>\n<STATUS>\n<CODE>0\n<SEVERITY>INFO\n</STATUS>\n<DTSERVER>' + getOFXDate() + '\n<LANGUAGE>ENG\n</SONRS>\n</SIGNONMSGSRSV1>\n';
    qbo += '<BANKMSGSRSV1>\n<STMTTRNRS>\n<TRNUID>0\n<STATUS>\n<CODE>0\n<SEVERITY>INFO\n</STATUS>\n<STMTRS>\n<CURDEF>USD\n';
    qbo += '<BANKACCTFROM>\n<BANKID>' + (bankName || 'UNKNOWN') + '\n<ACCTID>' + (acctId || 'UNKNOWN') + '\n<ACCTTYPE>CHECKING\n</BANKACCTFROM>\n';
    qbo += '<BANKTRANLIST>\n<DTSTART>19700101000000\n<DTEND>' + getOFXDate() + '\n';

    for (var r = 1; r < lines.length; r++) {
      var row = parseCSVLine(lines[r]);
      var txnDate = dateIdx >= 0 && dateIdx < row.length ? row[dateIdx].trim() : '';
      var desc = descIdx >= 0 && descIdx < row.length ? row[descIdx].trim() : '';
      var amount = amountIdx >= 0 && amountIdx < row.length ? row[amountIdx].trim() : '0';

      // Normalize date
      var ofxDate = normalizeDate(txnDate);
      // Determine type
      var txnType = parseFloat(amount) < 0 ? 'DEBIT' : 'CREDIT';
      var absAmount = Math.abs(parseFloat(amount)).toFixed(2);

      qbo += '<STMTTRN>\n<TRNTYPE>' + txnType + '\n<DTPOSTED>' + ofxDate + '\n<TRNAMT>' + (txnType === 'DEBIT' ? '-' : '') + absAmount + '\n<FITID>' + ofxDate + '-' + r + '\n<NAME>' + desc + '\n<MEMO>' + desc + '\n</STMTTRN>\n';
    }

    qbo += '</BANKTRANLIST>\n<LEDGERBAL>\n<BALAMT>0.00\n<DTASOF>' + getOFXDate() + '\n</LEDGERBAL>\n</STMTRS>\n</STMTTRNRS>\n</BANKMSGSRSV1>\n</OFX>\n';

    return qbo;
  }

  function normalizeDate(dateStr) {
    if (!dateStr) return getOFXDate();
    // Already YYYYMMDD
    if (/^\d{8}$/.test(dateStr)) return dateStr;
    // YYYY-MM-DD
    var m = dateStr.match(/^(\d{4})-?(\d{2})-?(\d{2})/);
    if (m) return m[1] + m[2] + m[3];
    // MM/DD/YYYY or DD/MM/YYYY
    var m2 = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m2) return m2[3] + m2[1] + m2[2];
    return getOFXDate();
  }

  function getOFXDate() {
    var d = new Date();
    return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '000000';
  }

  function parseCSVLine(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
      else { current += ch; }
    }
    result.push(current);
    return result;
  }

  // ============================================================
  // SIMPLE PDF TEXT EXTRACTION (via PDF.js loaded from CDN)
  // ============================================================
  // This is a helper that extracts text from PDF using pdf.js
  // Actual usage is in the PDF bank statement page

  async function extractPDFText(pdfData) {
    // pdf.js should be loaded as a global script: pdfjsLib
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.js library not loaded. Please check your internet connection.');
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    var pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    var fullText = '';
    for (var i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i);
      var content = await page.getTextContent();
      var pageText = content.items.map(function (item) { return item.str; }).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  }

  // ============================================================
  // BASIC BANK STATEMENT PARSER (best-effort)
  // ============================================================
  function parseBankStatementText(text) {
    // Try to find date-amount-description patterns
    // Common patterns:
    // YYYY-MM-DD or MM/DD/YYYY or DD/MM/YYYY followed by description followed by amount
    var transactions = [];

    // Pattern: date (various formats) + text + number
    var lines = text.split('\n');
    var lastDate = '';

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      // Find dates
      var dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
      if (dateMatch) {
        lastDate = dateMatch[0];
      }

      // Find amounts
      var amountMatch = line.match(/[-+]?\s*[\$£€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
      if (amountMatch && lastDate) {
        // Filter out unreasonable amounts
        for (var a = 0; a < amountMatch.length; a++) {
          var amt = parseFloat(amountMatch[a].replace(/[^0-9.\-]/g, ''));
          if (!isNaN(amt) && Math.abs(amt) > 0.01 && Math.abs(amt) < 10000000) {
            transactions.push({
              date: lastDate,
              description: line.substring(0, Math.min(line.length, 60)),
              amount: amt
            });
            break;
          }
        }
      }
    }

    return transactions;
  }

  // ============================================================
  // EXPORT
  // ============================================================
  window.FinancialConverter = {
    parseOFX: parseOFX,
    ofxToCSV: ofxToCSV,
    csvToQBO: csvToQBO,
    extractPDFText: extractPDFText,
    parseBankStatementText: parseBankStatementText
  };

})();
