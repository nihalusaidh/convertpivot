---
title: URL Encoding Guide — What Every Developer Should Know
slug: url-encoding-guide
description: "Complete URL encoding guide. Learn percent-encoding rules, why spaces become %20, and how to encode/decode URLs safely. Free online URL encoder included."
category: Developer Tools
date: "2026-07-14"
tool1: https://convertpivot.com/url-encoder-decoder
faq1_q: Why do URLs have %20 instead of spaces?
faq1_a: URLs have %20 instead of spaces because spaces are not valid characters in URLs according to RFC 3986. The percent sign followed by 20 is the hexadecimal representation of the ASCII code for a space (32 in decimal, 20 in hex). This process is called percent-encoding, and it allows unsafe ASCII characters to be represented safely in URLs.
faq2_q: What characters need URL encoding?
faq2_a: Characters that must be encoded in URLs include spaces, control characters, non-ASCII characters (like Unicode), and any character that has reserved meaning in a URL. This includes symbols like ?, #, &, =, /, :, and % itself. Safe characters that don't need encoding are unreserved characters: letters A-Z and a-z, digits 0-9, and the symbols hyphen, underscore, period, and tilde.
faq3_q: Is URL encoding the same as HTML encoding?
faq3_a: No, they are different. URL encoding (percent-encoding) is defined in RFC 3986 and uses % followed by two hexadecimal digits to encode characters in URLs. HTML encoding uses &name; or &#number; syntax to represent special characters in HTML documents, like &amp; for ampersand or &lt; for the less-than sign. They serve entirely different purposes.
---

I remember the first time I saw a URL with `%20` in it and thought something was broken. I was probably twelve, trying to download a file whose name had a space, and the browser just mangled it into this cryptic string of percent signs and numbers. It felt like the internet was speaking in code. Turns out it was, and the rules behind that code are surprisingly straightforward once you understand why they exist.

URL encoding, also called percent-encoding, is how we represent characters in a URL that aren't normally allowed. When Tim Berners-Lee designed the web, he specified that URLs could only contain a limited set of characters: letters, digits, and a handful of special symbols like hyphens, underscores, periods, and tildes. Everything else — spaces, punctuation, non-English characters — had to be encoded. The rule is simple: any unsafe character gets replaced with a percent sign followed by its two-digit hexadecimal ASCII code. That's why a space, which is ASCII code 32, or 0x20 in hex, becomes `%20`.

You might wonder why the rules are so strict. It comes down to ambiguity. If you allowed raw spaces in a URL, how would you know where the URL ended and the next part of the sentence began? What about the question mark, which starts the query string, or the ampersand, which separates query parameters? If those characters appeared literally in the path, parsers would misinterpret them. Percent-encoding eliminates that ambiguity by replacing the problematic characters with a representation that can't be confused with syntax.

So which characters actually need encoding? Everything that isn't an unreserved character. The unreserved set is simple: uppercase letters A through Z, lowercase letters a through z, digits 0 through 9, and the symbols hyphen, underscore, period, and tilde. That's it. Everything else — spaces, exclamation marks, quotes, hashes, dollar signs, percent signs themselves, ampersands, plus signs, commas, slashes, colons, semicolons, less-than and greater-than, question marks, at signs, brackets, carets, pipe characters, curly braces — should be encoded if they appear in a URL. In practice, modern browsers handle most of this automatically for the address bar, but if you're building URLs programmatically, you need to handle it yourself.

A common point of confusion is the difference between URL encoding and HTML encoding. They sound similar and sometimes get lumped together, but they're completely different systems. URL encoding uses `%20` and is governed by RFC 3986 for web addresses. HTML encoding uses `&nbsp;` or `&#160;` and is governed by the HTML spec for representing characters in web documents. A URL-encoded space is `%20`; an HTML-encoded non-breaking space is `&nbsp;`. Mixing them up is a rite of passage for new web developers.

These days I reach for a [URL encoder/decoder](https://convertpivot.com/url-encoder-decoder) whenever I'm debugging a messed-up query string or building a URL with special characters. It's one of those tools you don't appreciate until you've wasted twenty minutes tracking down a bug caused by an unencoded ampersand in a redirect URL. Learn the rules once, use the tool forever.
