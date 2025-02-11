"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonrepair = jsonrepair;
var _JSONRepairError = require("./JSONRepairError.js");
var _stringUtils = require("./stringUtils.js");
var controlCharacters = {
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t'
};

// map with all escape characters
var escapeCharacters = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t'
  // note that \u is handled separately in parseString()
};

/**
 * Repair a string containing an invalid JSON document.
 * For example changes JavaScript notation into JSON notation.
 *
 * Example:
 *
 *     try {
 *       const json = "{name: 'John'}"
 *       const repaired = jsonrepair(json)
 *       console.log(repaired)
 *       // '{"name": "John"}'
 *     } catch (err) {
 *       console.error(err)
 *     }
 *
 */
function jsonrepair(text) {
  var i = 0; // current index in text
  var output = ''; // generated output

  var processed = parseValue();
  if (!processed) {
    throwUnexpectedEnd();
  }
  var processedComma = parseCharacter(_stringUtils.codeComma);
  if (processedComma) {
    parseWhitespaceAndSkipComments();
  }
  if ((0, _stringUtils.isStartOfValue)(text[i]) && (0, _stringUtils.endsWithCommaOrNewline)(output)) {
    // start of a new value after end of the root level object: looks like
    // newline delimited JSON -> turn into a root level array
    if (!processedComma) {
      // repair missing comma
      output = (0, _stringUtils.insertBeforeLastWhitespace)(output, ',');
    }
    parseNewlineDelimitedJSON();
  } else if (processedComma) {
    // repair: remove trailing comma
    output = (0, _stringUtils.stripLastOccurrence)(output, ',');
  }
  if (i >= text.length) {
    // reached the end of the document properly
    return output;
  }
  throwUnexpectedCharacter();
  function parseValue() {
    parseWhitespaceAndSkipComments();
    var processed = parseObject() || parseArray() || parseString() || parseNumber() || parseKeywords() || parseUnquotedString();
    parseWhitespaceAndSkipComments();
    return processed;
  }
  function parseWhitespaceAndSkipComments() {
    var start = i;
    var changed = parseWhitespace();
    do {
      changed = parseComment();
      if (changed) {
        changed = parseWhitespace();
      }
    } while (changed);
    return i > start;
  }
  function parseWhitespace() {
    var whitespace = '';
    var normal;
    while ((normal = (0, _stringUtils.isWhitespace)(text.charCodeAt(i))) || (0, _stringUtils.isSpecialWhitespace)(text.charCodeAt(i))) {
      if (normal) {
        whitespace += text[i];
      } else {
        // repair special whitespace
        whitespace += ' ';
      }
      i++;
    }
    if (whitespace.length > 0) {
      output += whitespace;
      return true;
    }
    return false;
  }
  function parseComment() {
    // find a block comment '/* ... */'
    if (text.charCodeAt(i) === _stringUtils.codeSlash && text.charCodeAt(i + 1) === _stringUtils.codeAsterisk) {
      // repair block comment by skipping it
      while (i < text.length && !atEndOfBlockComment(text, i)) {
        i++;
      }
      i += 2;
      return true;
    }

    // find a line comment '// ...'
    if (text.charCodeAt(i) === _stringUtils.codeSlash && text.charCodeAt(i + 1) === _stringUtils.codeSlash) {
      // repair line comment by skipping it
      while (i < text.length && text.charCodeAt(i) !== _stringUtils.codeNewline) {
        i++;
      }
      return true;
    }
    return false;
  }
  function parseCharacter(code) {
    if (text.charCodeAt(i) === code) {
      output += text[i];
      i++;
      return true;
    }
    return false;
  }
  function skipCharacter(code) {
    if (text.charCodeAt(i) === code) {
      i++;
      return true;
    }
    return false;
  }
  function skipEscapeCharacter() {
    return skipCharacter(_stringUtils.codeBackslash);
  }

  /**
   * Parse an object like '{"key": "value"}'
   */
  function parseObject() {
    if (text.charCodeAt(i) === _stringUtils.codeOpeningBrace) {
      output += '{';
      i++;
      parseWhitespaceAndSkipComments();
      var initial = true;
      while (i < text.length && text.charCodeAt(i) !== _stringUtils.codeClosingBrace) {
        var _processedComma = void 0;
        if (!initial) {
          _processedComma = parseCharacter(_stringUtils.codeComma);
          if (!_processedComma) {
            // repair missing comma
            output = (0, _stringUtils.insertBeforeLastWhitespace)(output, ',');
          }
          parseWhitespaceAndSkipComments();
        } else {
          _processedComma = true;
          initial = false;
        }
        var processedKey = parseString() || parseUnquotedString();
        if (!processedKey) {
          if (text.charCodeAt(i) === _stringUtils.codeClosingBrace || text.charCodeAt(i) === _stringUtils.codeOpeningBrace || text.charCodeAt(i) === _stringUtils.codeClosingBracket || text.charCodeAt(i) === _stringUtils.codeOpeningBracket || text[i] === undefined) {
            // repair trailing comma
            output = (0, _stringUtils.stripLastOccurrence)(output, ',');
          } else {
            throwObjectKeyExpected();
          }
          break;
        }
        parseWhitespaceAndSkipComments();
        var processedColon = parseCharacter(_stringUtils.codeColon);
        if (!processedColon) {
          if ((0, _stringUtils.isStartOfValue)(text[i])) {
            // repair missing colon
            output = (0, _stringUtils.insertBeforeLastWhitespace)(output, ':');
          } else {
            throwColonExpected();
          }
        }
        var processedValue = parseValue();
        if (!processedValue) {
          if (processedColon) {
            throwObjectValueExpected();
          } else {
            throwColonExpected();
          }
        }
      }
      if (text.charCodeAt(i) === _stringUtils.codeClosingBrace) {
        output += '}';
        i++;
      } else {
        // repair missing end bracket
        output = (0, _stringUtils.insertBeforeLastWhitespace)(output, '}');
      }
      return true;
    }
    return false;
  }

  /**
   * Parse an array like '["item1", "item2", ...]'
   */
  function parseArray() {
    if (text.charCodeAt(i) === _stringUtils.codeOpeningBracket) {
      output += '[';
      i++;
      parseWhitespaceAndSkipComments();
      var initial = true;
      while (i < text.length && text.charCodeAt(i) !== _stringUtils.codeClosingBracket) {
        if (!initial) {
          var _processedComma2 = parseCharacter(_stringUtils.codeComma);
          if (!_processedComma2) {
            // repair missing comma
            output = (0, _stringUtils.insertBeforeLastWhitespace)(output, ',');
          }
        } else {
          initial = false;
        }
        var processedValue = parseValue();
        if (!processedValue) {
          // repair trailing comma
          output = (0, _stringUtils.stripLastOccurrence)(output, ',');
          break;
        }
      }
      if (text.charCodeAt(i) === _stringUtils.codeClosingBracket) {
        output += ']';
        i++;
      } else {
        // repair missing closing array bracket
        output = (0, _stringUtils.insertBeforeLastWhitespace)(output, ']');
      }
      return true;
    }
    return false;
  }

  /**
   * Parse and repair Newline Delimited JSON (NDJSON):
   * multiple JSON objects separated by a newline character
   */
  function parseNewlineDelimitedJSON() {
    // repair NDJSON
    var initial = true;
    var processedValue = true;
    while (processedValue) {
      if (!initial) {
        // parse optional comma, insert when missing
        var _processedComma3 = parseCharacter(_stringUtils.codeComma);
        if (!_processedComma3) {
          // repair: add missing comma
          output = (0, _stringUtils.insertBeforeLastWhitespace)(output, ',');
        }
      } else {
        initial = false;
      }
      processedValue = parseValue();
    }
    if (!processedValue) {
      // repair: remove trailing comma
      output = (0, _stringUtils.stripLastOccurrence)(output, ',');
    }

    // repair: wrap the output inside array brackets
    output = "[\n".concat(output, "\n]");
  }

  /**
   * Parse a string enclosed by double quotes "...". Can contain escaped quotes
   * Repair strings enclosed in single quotes or special quotes
   * Repair an escaped string
   */
  function parseString() {
    var skipEscapeChars = text.charCodeAt(i) === _stringUtils.codeBackslash;
    if (skipEscapeChars) {
      // repair: remove the first escape character
      i++;
      skipEscapeChars = true;
    }
    if ((0, _stringUtils.isQuote)(text.charCodeAt(i))) {
      var isEndQuote = (0, _stringUtils.isSingleQuote)(text.charCodeAt(i)) ? _stringUtils.isSingleQuote : _stringUtils.isDoubleQuote;
      if (text.charCodeAt(i) !== _stringUtils.codeDoubleQuote) {
        // repair non-normalized quote
      }
      output += '"';
      i++;
      while (i < text.length && !isEndQuote(text.charCodeAt(i))) {
        if (text.charCodeAt(i) === _stringUtils.codeBackslash) {
          var char = text[i + 1];
          var escapeChar = escapeCharacters[char];
          if (escapeChar !== undefined) {
            output += text.slice(i, i + 2);
            i += 2;
          } else if (char === 'u') {
            if ((0, _stringUtils.isHex)(text.charCodeAt(i + 2)) && (0, _stringUtils.isHex)(text.charCodeAt(i + 3)) && (0, _stringUtils.isHex)(text.charCodeAt(i + 4)) && (0, _stringUtils.isHex)(text.charCodeAt(i + 5))) {
              output += text.slice(i, i + 6);
              i += 6;
            } else {
              throwInvalidUnicodeCharacter(i);
            }
          } else {
            // repair invalid escape character: remove it
            output += char;
            i += 2;
          }
        } else {
          var _char = text[i];
          var code = text.charCodeAt(i);
          if (code === _stringUtils.codeDoubleQuote && text.charCodeAt(i - 1) !== _stringUtils.codeBackslash) {
            // repair unescaped double quote
            output += '\\' + _char;
            i++;
          } else if ((0, _stringUtils.isControlCharacter)(code)) {
            // unescaped control character
            output += controlCharacters[_char];
            i++;
          } else {
            if (!(0, _stringUtils.isValidStringCharacter)(code)) {
              throwInvalidCharacter(_char);
            }
            output += _char;
            i++;
          }
        }
        if (skipEscapeChars) {
          var _processed = skipEscapeCharacter();
          if (_processed) {
            // repair: skipped escape character (nothing to do)
          }
        }
      }
      if ((0, _stringUtils.isQuote)(text.charCodeAt(i))) {
        if (text.charCodeAt(i) !== _stringUtils.codeDoubleQuote) {
          // repair non-normalized quote
        }
        output += '"';
        i++;
      } else {
        // repair missing end quote
        output += '"';
      }
      parseConcatenatedString();
      return true;
    }
    return false;
  }

  /**
   * Repair concatenated strings like "hello" + "world", change this into "helloworld"
   */
  function parseConcatenatedString() {
    var processed = false;
    parseWhitespaceAndSkipComments();
    while (text.charCodeAt(i) === _stringUtils.codePlus) {
      processed = true;
      i++;
      parseWhitespaceAndSkipComments();

      // repair: remove the end quote of the first string
      output = (0, _stringUtils.stripLastOccurrence)(output, '"', true);
      var start = output.length;
      parseString();

      // repair: remove the start quote of the second string
      output = (0, _stringUtils.removeAtIndex)(output, start, 1);
    }
    return processed;
  }

  /**
   * Parse a number like 2.4 or 2.4e6
   */
  function parseNumber() {
    var start = i;
    if (text.charCodeAt(i) === _stringUtils.codeMinus) {
      i++;
      expectDigit(start);
    }
    if (text.charCodeAt(i) === _stringUtils.codeZero) {
      i++;
    } else if ((0, _stringUtils.isNonZeroDigit)(text.charCodeAt(i))) {
      i++;
      while ((0, _stringUtils.isDigit)(text.charCodeAt(i))) {
        i++;
      }
    }
    if (text.charCodeAt(i) === _stringUtils.codeDot) {
      i++;
      expectDigit(start);
      while ((0, _stringUtils.isDigit)(text.charCodeAt(i))) {
        i++;
      }
    }
    if (text.charCodeAt(i) === _stringUtils.codeLowercaseE || text.charCodeAt(i) === _stringUtils.codeUppercaseE) {
      i++;
      if (text.charCodeAt(i) === _stringUtils.codeMinus || text.charCodeAt(i) === _stringUtils.codePlus) {
        i++;
      }
      expectDigit(start);
      while ((0, _stringUtils.isDigit)(text.charCodeAt(i))) {
        i++;
      }
    }
    if (i > start) {
      output += text.slice(start, i);
      return true;
    }
    return false;
  }

  /**
   * Parse keywords true, false, null
   * Repair Python keywords True, False, None
   */
  function parseKeywords() {
    return parseKeyword('true', 'true') || parseKeyword('false', 'false') || parseKeyword('null', 'null') ||
    // repair Python keywords True, False, None
    parseKeyword('True', 'true') || parseKeyword('False', 'false') || parseKeyword('None', 'null');
  }
  function parseKeyword(name, value) {
    if (text.slice(i, i + name.length) === name) {
      output += value;
      i += name.length;
      return true;
    }
    return false;
  }

  /**
   * Repair and unquoted string by adding quotes around it
   * Repair a MongoDB function call like NumberLong("2")
   * Repair a JSONP function call like callback({...});
   */
  function parseUnquotedString() {
    // note that the symbol can end with whitespaces: we stop at the next delimiter
    var start = i;
    while (i < text.length && !(0, _stringUtils.isDelimiter)(text[i])) {
      i++;
    }
    if (i > start) {
      if (text.charCodeAt(i) === _stringUtils.codeOpenParenthesis) {
        // repair a MongoDB function call like NumberLong("2")
        // repair a JSONP function call like callback({...});
        i++;
        parseValue();
        if (text.charCodeAt(i) === _stringUtils.codeCloseParenthesis) {
          // repair: skip close bracket of function call
          i++;
          if (text.charCodeAt(i) === _stringUtils.codeSemicolon) {
            // repair: skip semicolon after JSONP call
            i++;
          }
        }
        return true;
      } else {
        // repair unquoted string

        // first, go back to prevent getting trailing whitespaces in the string
        while ((0, _stringUtils.isWhitespace)(text.charCodeAt(i - 1)) && i > 0) {
          i--;
        }
        var symbol = text.slice(start, i);
        output += JSON.stringify(symbol);
        return true;
      }
    }
  }
  function expectDigit(start) {
    if (!(0, _stringUtils.isDigit)(text.charCodeAt(i))) {
      var numSoFar = text.slice(start, i);
      throw new _JSONRepairError.JSONRepairError("Invalid number '".concat(numSoFar, "', expecting a digit ").concat(got()), 2);
    }
  }
  function throwInvalidCharacter(char) {
    throw new _JSONRepairError.JSONRepairError('Invalid character ' + JSON.stringify(char), i);
  }
  function throwUnexpectedCharacter() {
    throw new _JSONRepairError.JSONRepairError('Unexpected character ' + JSON.stringify(text[i]), i);
  }
  function throwUnexpectedEnd() {
    throw new _JSONRepairError.JSONRepairError('Unexpected end of json string', text.length);
  }
  function throwObjectKeyExpected() {
    throw new _JSONRepairError.JSONRepairError('Object key expected', i);
  }
  function throwObjectValueExpected() {
    throw new _JSONRepairError.JSONRepairError('Object value expected', i);
  }
  function throwColonExpected() {
    throw new _JSONRepairError.JSONRepairError('Colon expected', i);
  }
  function throwInvalidUnicodeCharacter(start) {
    var end = start + 2;
    while (/\w/.test(text[end])) {
      end++;
    }
    var chars = text.slice(start, end);
    throw new _JSONRepairError.JSONRepairError("Invalid unicode character \"".concat(chars, "\""), i);
  }
  function got() {
    return text[i] ? "but got '".concat(text[i], "'") : 'but reached end of input';
  }
}
function atEndOfBlockComment(text, i) {
  return text[i] === '*' && text[i + 1] === '/';
}
//# sourceMappingURL=jsonrepair.js.map