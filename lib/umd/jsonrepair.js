(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.JSONRepair = {}));
})(this, (function (exports) { 'use strict';

  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
  function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
  function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
  var JSONRepairError = /*#__PURE__*/function (_Error) {
    _inherits(JSONRepairError, _Error);
    var _super = _createSuper(JSONRepairError);
    function JSONRepairError(message, position) {
      var _this;
      _classCallCheck(this, JSONRepairError);
      _this = _super.call(this, message + ' at position ' + position);
      _this.position = position;
      return _this;
    }
    return _createClass(JSONRepairError);
  }( /*#__PURE__*/_wrapNativeSuper(Error));

  // TODO: sort the codes
  var codeBackslash = 0x5c; // "\"
  var codeSlash = 0x2f; // "/"
  var codeAsterisk = 0x2a; // "*"
  var codeOpeningBrace = 0x7b; // "{"
  var codeClosingBrace = 0x7d; // "}"
  var codeOpeningBracket = 0x5b; // "["
  var codeClosingBracket = 0x5d; // "]"
  var codeOpenParenthesis = 0x28; // "("
  var codeCloseParenthesis = 0x29; // ")"
  var codeSpace = 0x20; // " "
  var codeNewline = 0xa; // "\n"
  var codeTab = 0x9; // "\t"
  var codeReturn = 0xd; // "\r"
  var codeBackspace = 0x08; // "\b"
  var codeFormFeed = 0x0c; // "\f"
  var codeDoubleQuote = 0x0022; // "
  var codePlus = 0x2b; // "+"
  var codeMinus = 0x2d; // "-"
  var codeQuote = 0x27; // "'"
  var codeZero = 0x30;
  var codeOne = 0x31;
  var codeNine = 0x39;
  var codeComma = 0x2c; // ","
  var codeDot = 0x2e; // "." (dot, period)
  var codeColon = 0x3a; // ":"
  var codeSemicolon = 0x3b; // ";"
  var codeUppercaseA = 0x41; // "A"
  var codeLowercaseA = 0x61; // "a"
  var codeUppercaseE = 0x45; // "E"
  var codeLowercaseE = 0x65; // "e"
  var codeUppercaseF = 0x46; // "F"
  var codeLowercaseF = 0x66; // "f"
  var codeNonBreakingSpace = 0xa0;
  var codeEnQuad = 0x2000;
  var codeHairSpace = 0x200a;
  var codeNarrowNoBreakSpace = 0x202f;
  var codeMediumMathematicalSpace = 0x205f;
  var codeIdeographicSpace = 0x3000;
  var codeDoubleQuoteLeft = 0x201c; // “
  var codeDoubleQuoteRight = 0x201d; // ”
  var codeQuoteLeft = 0x2018; // ‘
  var codeQuoteRight = 0x2019; // ’
  var codeGraveAccent = 0x0060; // `
  var codeAcuteAccent = 0x00b4; // ´

  function isHex(code) {
    return code >= codeZero && code <= codeNine || code >= codeUppercaseA && code <= codeUppercaseF || code >= codeLowercaseA && code <= codeLowercaseF;
  }
  function isDigit(code) {
    return code >= codeZero && code <= codeNine;
  }
  function isNonZeroDigit(code) {
    return code >= codeOne && code <= codeNine;
  }
  function isValidStringCharacter(code) {
    return code >= 0x20 && code <= 0x10ffff;
  }
  function isDelimiter(char) {
    return regexDelimiter.test(char) || char && isQuote(char.charCodeAt(0));
  }
  var regexDelimiter = /^[,:[\]{}()\n]$/;
  function isStartOfValue(char) {
    return regexStartOfValue.test(char) || char && isQuote(char.charCodeAt(0));
  }

  // alpha, number, minus, or opening bracket or brace
  var regexStartOfValue = /^[[{\w-]$/;
  function isControlCharacter(code) {
    return code === codeNewline || code === codeReturn || code === codeTab || code === codeBackspace || code === codeFormFeed;
  }

  /**
   * Check if the given character is a whitespace character like space, tab, or
   * newline
   */
  function isWhitespace(code) {
    return code === codeSpace || code === codeNewline || code === codeTab || code === codeReturn;
  }

  /**
   * Check if the given character is a special whitespace character, some
   * unicode variant
   */
  function isSpecialWhitespace(code) {
    return code === codeNonBreakingSpace || code >= codeEnQuad && code <= codeHairSpace || code === codeNarrowNoBreakSpace || code === codeMediumMathematicalSpace || code === codeIdeographicSpace;
  }

  /**
   * Test whether the given character is a quote or double quote character.
   * Also tests for special variants of quotes.
   */
  function isQuote(code) {
    // the first check double quotes, since that occurs most often
    return isDoubleQuote(code) || isSingleQuote(code);
  }

  /**
   * Test whether the given character is a double quote character.
   * Also tests for special variants of double quotes.
   */
  function isDoubleQuote(code) {
    // the first check double quotes, since that occurs most often
    return code === codeDoubleQuote || code === codeDoubleQuoteLeft || code === codeDoubleQuoteRight;
  }

  /**
   * Test whether the given character is a single quote character.
   * Also tests for special variants of single quotes.
   */
  function isSingleQuote(code) {
    return code === codeQuote || code === codeQuoteLeft || code === codeQuoteRight || code === codeGraveAccent || code === codeAcuteAccent;
  }

  /**
   * Strip last occurrence of textToStrip from text
   */
  function stripLastOccurrence(text, textToStrip) {
    var stripRemainingText = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var index = text.lastIndexOf(textToStrip);
    return index !== -1 ? text.substring(0, index) + (stripRemainingText ? '' : text.substring(index + 1)) : text;
  }
  function insertBeforeLastWhitespace(text, textToInsert) {
    var index = text.length;
    if (!isWhitespace(text.charCodeAt(index - 1))) {
      // no trailing whitespaces
      return text + textToInsert;
    }
    while (isWhitespace(text.charCodeAt(index - 1))) {
      index--;
    }
    return text.substring(0, index) + textToInsert + text.substring(index);
  }
  function removeAtIndex(text, start, count) {
    return text.substring(0, start) + text.substring(start + count);
  }

  /**
   * Test whether a string ends with a newline or comma character and optional whitespace
   */
  function endsWithCommaOrNewline(text) {
    return /[,\n][ \t\r]*$/.test(text);
  }

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
    var processedComma = parseCharacter(codeComma);
    if (processedComma) {
      parseWhitespaceAndSkipComments();
    }
    if (isStartOfValue(text[i]) && endsWithCommaOrNewline(output)) {
      // start of a new value after end of the root level object: looks like
      // newline delimited JSON -> turn into a root level array
      if (!processedComma) {
        // repair missing comma
        output = insertBeforeLastWhitespace(output, ',');
      }
      parseNewlineDelimitedJSON();
    } else if (processedComma) {
      // repair: remove trailing comma
      output = stripLastOccurrence(output, ',');
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
      while ((normal = isWhitespace(text.charCodeAt(i))) || isSpecialWhitespace(text.charCodeAt(i))) {
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
      if (text.charCodeAt(i) === codeSlash && text.charCodeAt(i + 1) === codeAsterisk) {
        // repair block comment by skipping it
        while (i < text.length && !atEndOfBlockComment(text, i)) {
          i++;
        }
        i += 2;
        return true;
      }

      // find a line comment '// ...'
      if (text.charCodeAt(i) === codeSlash && text.charCodeAt(i + 1) === codeSlash) {
        // repair line comment by skipping it
        while (i < text.length && text.charCodeAt(i) !== codeNewline) {
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
      return skipCharacter(codeBackslash);
    }

    /**
     * Parse an object like '{"key": "value"}'
     */
    function parseObject() {
      if (text.charCodeAt(i) === codeOpeningBrace) {
        output += '{';
        i++;
        parseWhitespaceAndSkipComments();
        var initial = true;
        while (i < text.length && text.charCodeAt(i) !== codeClosingBrace) {
          var _processedComma = void 0;
          if (!initial) {
            _processedComma = parseCharacter(codeComma);
            if (!_processedComma) {
              // repair missing comma
              output = insertBeforeLastWhitespace(output, ',');
            }
            parseWhitespaceAndSkipComments();
          } else {
            _processedComma = true;
            initial = false;
          }
          var processedKey = parseString() || parseUnquotedString();
          if (!processedKey) {
            if (text.charCodeAt(i) === codeClosingBrace || text.charCodeAt(i) === codeOpeningBrace || text.charCodeAt(i) === codeClosingBracket || text.charCodeAt(i) === codeOpeningBracket || text[i] === undefined) {
              // repair trailing comma
              output = stripLastOccurrence(output, ',');
            } else {
              throwObjectKeyExpected();
            }
            break;
          }
          parseWhitespaceAndSkipComments();
          var processedColon = parseCharacter(codeColon);
          if (!processedColon) {
            if (isStartOfValue(text[i])) {
              // repair missing colon
              output = insertBeforeLastWhitespace(output, ':');
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
        if (text.charCodeAt(i) === codeClosingBrace) {
          output += '}';
          i++;
        } else {
          // repair missing end bracket
          output = insertBeforeLastWhitespace(output, '}');
        }
        return true;
      }
      return false;
    }

    /**
     * Parse an array like '["item1", "item2", ...]'
     */
    function parseArray() {
      if (text.charCodeAt(i) === codeOpeningBracket) {
        output += '[';
        i++;
        parseWhitespaceAndSkipComments();
        var initial = true;
        while (i < text.length && text.charCodeAt(i) !== codeClosingBracket) {
          if (!initial) {
            var _processedComma2 = parseCharacter(codeComma);
            if (!_processedComma2) {
              // repair missing comma
              output = insertBeforeLastWhitespace(output, ',');
            }
          } else {
            initial = false;
          }
          var processedValue = parseValue();
          if (!processedValue) {
            // repair trailing comma
            output = stripLastOccurrence(output, ',');
            break;
          }
        }
        if (text.charCodeAt(i) === codeClosingBracket) {
          output += ']';
          i++;
        } else {
          // repair missing closing array bracket
          output = insertBeforeLastWhitespace(output, ']');
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
          var _processedComma3 = parseCharacter(codeComma);
          if (!_processedComma3) {
            // repair: add missing comma
            output = insertBeforeLastWhitespace(output, ',');
          }
        } else {
          initial = false;
        }
        processedValue = parseValue();
      }
      if (!processedValue) {
        // repair: remove trailing comma
        output = stripLastOccurrence(output, ',');
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
      var skipEscapeChars = text.charCodeAt(i) === codeBackslash;
      if (skipEscapeChars) {
        // repair: remove the first escape character
        i++;
        skipEscapeChars = true;
      }
      if (isQuote(text.charCodeAt(i))) {
        var isEndQuote = isSingleQuote(text.charCodeAt(i)) ? isSingleQuote : isDoubleQuote;
        if (text.charCodeAt(i) !== codeDoubleQuote) ;
        output += '"';
        i++;
        while (i < text.length && !isEndQuote(text.charCodeAt(i))) {
          if (text.charCodeAt(i) === codeBackslash) {
            var char = text[i + 1];
            var escapeChar = escapeCharacters[char];
            if (escapeChar !== undefined) {
              output += text.slice(i, i + 2);
              i += 2;
            } else if (char === 'u') {
              if (isHex(text.charCodeAt(i + 2)) && isHex(text.charCodeAt(i + 3)) && isHex(text.charCodeAt(i + 4)) && isHex(text.charCodeAt(i + 5))) {
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
            if (code === codeDoubleQuote && text.charCodeAt(i - 1) !== codeBackslash) {
              // repair unescaped double quote
              output += '\\' + _char;
              i++;
            } else if (isControlCharacter(code)) {
              // unescaped control character
              output += controlCharacters[_char];
              i++;
            } else {
              if (!isValidStringCharacter(code)) {
                throwInvalidCharacter(_char);
              }
              output += _char;
              i++;
            }
          }
          if (skipEscapeChars) {
            skipEscapeCharacter();
          }
        }
        if (isQuote(text.charCodeAt(i))) {
          if (text.charCodeAt(i) !== codeDoubleQuote) ;
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
      while (text.charCodeAt(i) === codePlus) {
        processed = true;
        i++;
        parseWhitespaceAndSkipComments();

        // repair: remove the end quote of the first string
        output = stripLastOccurrence(output, '"', true);
        var start = output.length;
        parseString();

        // repair: remove the start quote of the second string
        output = removeAtIndex(output, start, 1);
      }
      return processed;
    }

    /**
     * Parse a number like 2.4 or 2.4e6
     */
    function parseNumber() {
      var start = i;
      if (text.charCodeAt(i) === codeMinus) {
        i++;
        expectDigit(start);
      }
      if (text.charCodeAt(i) === codeZero) {
        i++;
      } else if (isNonZeroDigit(text.charCodeAt(i))) {
        i++;
        while (isDigit(text.charCodeAt(i))) {
          i++;
        }
      }
      if (text.charCodeAt(i) === codeDot) {
        i++;
        expectDigit(start);
        while (isDigit(text.charCodeAt(i))) {
          i++;
        }
      }
      if (text.charCodeAt(i) === codeLowercaseE || text.charCodeAt(i) === codeUppercaseE) {
        i++;
        if (text.charCodeAt(i) === codeMinus || text.charCodeAt(i) === codePlus) {
          i++;
        }
        expectDigit(start);
        while (isDigit(text.charCodeAt(i))) {
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
      while (i < text.length && !isDelimiter(text[i])) {
        i++;
      }
      if (i > start) {
        if (text.charCodeAt(i) === codeOpenParenthesis) {
          // repair a MongoDB function call like NumberLong("2")
          // repair a JSONP function call like callback({...});
          i++;
          parseValue();
          if (text.charCodeAt(i) === codeCloseParenthesis) {
            // repair: skip close bracket of function call
            i++;
            if (text.charCodeAt(i) === codeSemicolon) {
              // repair: skip semicolon after JSONP call
              i++;
            }
          }
          return true;
        } else {
          // repair unquoted string

          // first, go back to prevent getting trailing whitespaces in the string
          while (isWhitespace(text.charCodeAt(i - 1)) && i > 0) {
            i--;
          }
          var symbol = text.slice(start, i);
          output += JSON.stringify(symbol);
          return true;
        }
      }
    }
    function expectDigit(start) {
      if (!isDigit(text.charCodeAt(i))) {
        var numSoFar = text.slice(start, i);
        throw new JSONRepairError("Invalid number '".concat(numSoFar, "', expecting a digit ").concat(got()), 2);
      }
    }
    function throwInvalidCharacter(char) {
      throw new JSONRepairError('Invalid character ' + JSON.stringify(char), i);
    }
    function throwUnexpectedCharacter() {
      throw new JSONRepairError('Unexpected character ' + JSON.stringify(text[i]), i);
    }
    function throwUnexpectedEnd() {
      throw new JSONRepairError('Unexpected end of json string', text.length);
    }
    function throwObjectKeyExpected() {
      throw new JSONRepairError('Object key expected', i);
    }
    function throwObjectValueExpected() {
      throw new JSONRepairError('Object value expected', i);
    }
    function throwColonExpected() {
      throw new JSONRepairError('Colon expected', i);
    }
    function throwInvalidUnicodeCharacter(start) {
      var end = start + 2;
      while (/\w/.test(text[end])) {
        end++;
      }
      var chars = text.slice(start, end);
      throw new JSONRepairError("Invalid unicode character \"".concat(chars, "\""), i);
    }
    function got() {
      return text[i] ? "but got '".concat(text[i], "'") : 'but reached end of input';
    }
  }
  function atEndOfBlockComment(text, i) {
    return text[i] === '*' && text[i + 1] === '/';
  }

  exports.JSONRepairError = JSONRepairError;
  exports.jsonrepair = jsonrepair;

}));
//# sourceMappingURL=jsonrepair.js.map
