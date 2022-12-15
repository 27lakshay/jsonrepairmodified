import JSONRepairError from './JSONRepairError'
import {
  endsWithCommaOrNewline,
  insertBeforeLastWhitespace,
  isDelimiter,
  isDigit,
  isDoubleQuote,
  isHex,
  isNonZeroDigit,
  isQuote,
  isSingleQuote,
  isSpecialWhitespace,
  isStartOfValue,
  isValidStringCharacter,
  isWhitespace,
  removeAtIndex,
  stripLastOccurrence
} from './stringUtils.js'

const controlCharacters: { [key: string]: string } = {
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t'
}

// map with all escape characters
const escapeCharacters: { [key: string]: string } = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t'
  // note that \u is handled separately in parseString()
}

const pythonConstants: { [key: string]: string } = {
  None: 'null',
  True: 'true',
  False: 'false'
}

/**
 * Repair a string containing an invalid JSON document.
 * For example changes JavaScript notation into JSON notation.
 *
 * Example:
 *
 *     jsonrepair('{name: \'John\'}") // '{"name": "John"}'
 *
 */
export default function jsonrepair(text: string): string {
  let i = 0 // current index in text
  let output = '' // generated output

  const processed = parseValue()
  if (!processed) {
    throwUnexpectedEnd()
  }

  const processedComma = parseCharacter(',')
  if (processedComma) {
    parseWhitespaceAndSkipComments()
  }

  if (isStartOfValue(text[i]) && endsWithCommaOrNewline(output)) {
    // start of a new value after end of the root level object: looks like
    // newline delimited JSON -> turn into a root level array
    if (!processedComma) {
      // repair missing comma
      output = insertBeforeLastWhitespace(output, ',')
    }

    parseNewlineDelimitedJSON()
  } else if (processedComma) {
    // repair: remove trailing comma
    output = stripLastOccurrence(output, ',')
  }

  if (text[i] === undefined) {
    // reached the end of the document properly
    return output
  }

  throwUnexpectedCharacter()

  function parseValue(): boolean {
    parseWhitespaceAndSkipComments()
    const processed =
      parseObject() ||
      parseArray() ||
      parseString() ||
      parseNumber() ||
      parseBooleanAndNull() ||
      parseUnquotedString()
    parseWhitespaceAndSkipComments()

    return processed
  }

  function parseWhitespaceAndSkipComments(): boolean {
    const start = i

    let changed = parseWhitespace()
    do {
      changed = parseComment()
      if (changed) {
        changed = parseWhitespace()
      }
    } while (changed)

    return i > start
  }

  function parseWhitespace(): boolean {
    let whitespace = ''
    let normal: boolean
    while ((normal = isWhitespace(text.charCodeAt(i))) || isSpecialWhitespace(text.charCodeAt(i))) {
      if (normal) {
        whitespace += text[i]
      } else {
        // repair special whitespace
        whitespace += ' '
      }

      i++
    }

    if (whitespace.length > 0) {
      output += whitespace
      return true
    }

    return false
  }

  function parseComment(): boolean {
    // find a block comment '/* ... */'
    if (text[i] === '/' && text[i + 1] === '*') {
      // repair block comment by skipping it
      while (i < text.length && !atEndOfBlockComment(text, i)) {
        i++
      }
      i += 2

      return true
    }

    // find a line comment '// ...'
    if (text[i] === '/' && text[i + 1] === '/') {
      // repair line comment by skipping it
      while (i < text.length && text[i] !== '\n') {
        i++
      }

      return true
    }

    return false
  }

  function parseCharacter(char: string): boolean {
    if (text[i] === char) {
      output += char
      i++
      return true
    }

    return false
  }

  function skipCharacter(char: string): boolean {
    if (text[i] === char) {
      i++
      return true
    }

    return false
  }

  function skipEscapeCharacter(): boolean {
    return skipCharacter('\\')
  }

  /**
   * Parse an object like '{"key": "value"}'
   */
  function parseObject(): boolean {
    if (text[i] === '{') {
      output += '{'
      i++
      parseWhitespaceAndSkipComments()

      let initial = true
      while (i < text.length && text[i] !== '}') {
        let processedComma
        if (!initial) {
          processedComma = parseCharacter(',')
          if (!processedComma) {
            // repair missing comma
            output = insertBeforeLastWhitespace(output, ',')
          }
          parseWhitespaceAndSkipComments()
        } else {
          processedComma = true
          initial = false
        }

        const processedKey = parseString() || parseUnquotedString()
        if (!processedKey) {
          if (
            text[i] === '}' ||
            text[i] === '{' ||
            text[i] === ']' ||
            text[i] === '[' ||
            text[i] === undefined
          ) {
            // repair trailing comma
            output = stripLastOccurrence(output, ',')
          } else {
            throwObjectKeyExpected()
          }
          break
        }

        parseWhitespaceAndSkipComments()
        const processedColon = parseCharacter(':')
        if (!processedColon) {
          if (isStartOfValue(text[i])) {
            // repair missing colon
            output = insertBeforeLastWhitespace(output, ':')
          } else {
            throwColonExpected()
          }
        }
        const processedValue = parseValue()
        if (!processedValue) {
          if (processedColon) {
            throwObjectValueExpected()
          } else {
            throwColonExpected()
          }
        }
      }

      if (text[i] === '}') {
        output += '}'
        i++
      } else {
        // repair missing end bracket
        output = insertBeforeLastWhitespace(output, '}')
      }

      return true
    }

    return false
  }

  /**
   * Parse an array like '["item1", "item2", ...]'
   */
  function parseArray(): boolean {
    if (text[i] === '[') {
      output += '['
      i++
      parseWhitespaceAndSkipComments()

      let initial = true
      while (i < text.length && text[i] !== ']') {
        if (!initial) {
          const processedComma = parseCharacter(',')
          if (!processedComma) {
            // repair missing comma
            output = insertBeforeLastWhitespace(output, ',')
          }
        } else {
          initial = false
        }

        const processedValue = parseValue()
        if (!processedValue) {
          // repair trailing comma
          output = stripLastOccurrence(output, ',')
          break
        }
      }

      if (text[i] === ']') {
        output += ']'
        i++
      } else {
        // repair missing closing array bracket
        output = insertBeforeLastWhitespace(output, ']')
      }

      return true
    }

    return false
  }

  /**
   * Parse and repair Newline Delimited JSON (NDJSON):
   * multiple JSON objects separated by a newline character
   */
  function parseNewlineDelimitedJSON() {
    // repair NDJSON
    let initial = true
    let processedValue = true
    while (processedValue) {
      if (!initial) {
        // parse optional comma, insert when missing
        const processedComma = parseCharacter(',')
        if (!processedComma) {
          // repair: add missing comma
          output = insertBeforeLastWhitespace(output, ',')
        }
      } else {
        initial = false
      }

      processedValue = parseValue()
    }

    if (!processedValue) {
      // repair: remove trailing comma
      output = stripLastOccurrence(output, ',')
    }

    // repair: wrap the output inside array brackets
    output = `[\n${output}\n]`
  }

  /**
   * Parse a string enclosed by double quotes "...". Can contain escaped quotes
   * Repair strings enclosed in single quotes or special quotes
   * Repair an escaped string
   */
  function parseString(): boolean {
    let skipEscapeChars = text[i] === '\\'
    if (skipEscapeChars) {
      // repair: remove the first escape character
      i++
      skipEscapeChars = true
    }

    if (isQuote(text.charCodeAt(i))) {
      const isEndQuote = isSingleQuote(text.charCodeAt(i)) ? isSingleQuote : isDoubleQuote

      if (text[i] !== '"') {
        // repair non-normalized quote
      }
      output += '"'
      i++

      while (i < text.length && !isEndQuote(text.charCodeAt(i))) {
        if (text[i] === '\\') {
          const char = text[i + 1]
          const escapeChar = escapeCharacters[char]
          if (escapeChar !== undefined) {
            output += text.slice(i, i + 2)
            i += 2
          } else if (char === 'u') {
            if (
              isHex(text[i + 2]) &&
              isHex(text[i + 3]) &&
              isHex(text[i + 4]) &&
              isHex(text[i + 5])
            ) {
              output += text.slice(i, i + 6)
              i += 6
            } else {
              throwInvalidUnicodeCharacter(i)
            }
          } else {
            // repair invalid escape character: remove it
            output += char
            i += 2
          }
        } else {
          const char = text[i]

          if (char === '"' && text[i - 1] !== '\\') {
            // repair unescaped double quote
            output += '\\' + char
            i++
          } else if (controlCharacters[char] !== undefined) {
            // unescaped control character
            output += controlCharacters[char]
            i++
          } else {
            if (!isValidStringCharacter(char)) {
              throwInvalidCharacter(char)
            }
            output += char
            i++
          }
        }

        if (skipEscapeChars) {
          const processed = skipEscapeCharacter()
          if (processed) {
            // repair: skipped escape character (nothing to do)
          }
        }
      }

      if (isQuote(text.charCodeAt(i))) {
        if (text[i] !== '"') {
          // repair non-normalized quote
        }
        output += '"'
        i++
      } else {
        // repair missing end quote
        output += '"'
      }

      parseConcatenatedString()

      return true
    }

    return false
  }

  /**
   * Repair concatenated strings like "hello" + "world", change this into "helloworld"
   */
  function parseConcatenatedString(): boolean {
    let processed = false

    parseWhitespaceAndSkipComments()
    while (text[i] === '+') {
      processed = true
      i++
      parseWhitespaceAndSkipComments()

      // repair: remove the end quote of the first string
      output = stripLastOccurrence(output, '"', true)
      const start = output.length
      parseString()

      // repair: remove the start quote of the second string
      output = removeAtIndex(output, start, 1)
    }

    return processed
  }

  /**
   * Parse a number like 2.4 or 2.4e6
   */
  function parseNumber(): boolean {
    const start = i
    if (text[i] === '-') {
      i++
      expectDigit(start)
    }

    if (text[i] === '0') {
      i++
    } else if (isNonZeroDigit(text.charCodeAt(i))) {
      i++
      while (isDigit(text.charCodeAt(i))) {
        i++
      }
    }

    if (text[i] === '.') {
      i++
      expectDigit(start)
      while (isDigit(text.charCodeAt(i))) {
        i++
      }
    }

    if (text[i] === 'e' || text[i] === 'E') {
      i++
      if (text[i] === '-' || text[i] === '+') {
        i++
      }
      expectDigit(start)
      while (isDigit(text.charCodeAt(i))) {
        i++
      }
    }

    if (i > start) {
      output += text.slice(start, i)
      return true
    }

    return false
  }

  /**
   * Parse keywords true, false, null
   * Repair Python keywords True, False, None
   */
  function parseBooleanAndNull(): boolean {
    const keywords = ['true', 'false', 'null']

    // TODO: is it faster to just first collect the symbol and then lookup SYMBOLS?
    for (const keyword of keywords) {
      if (text.slice(i, i + keyword.length) === keyword) {
        output += keyword
        i += keyword.length
        return true
      }
    }

    // repair python keywords True, False, None
    for (const keyword in pythonConstants) {
      if (Object.hasOwnProperty.call(pythonConstants, keyword)) {
        if (text.slice(i, i + keyword.length) === keyword) {
          output += pythonConstants[keyword]
          i += keyword.length
          return true
        }
      }
    }

    return false
  }

  /**
   * Repair and unquoted string by adding quotes around it
   * Repair a MongoDB function call like NumberLong("2")
   * Repair a JSONP function call like callback({...});
   */
  function parseUnquotedString() {
    // note that the symbol can end with whitespaces: we stop at the next delimiter
    const start = i
    while (i < text.length && !isDelimiter(text[i])) {
      i++
    }

    if (i > start) {
      const symbol = text.slice(start, i)

      if (text[i] === '(') {
        // repair a MongoDB function call like NumberLong("2")
        // repair a JSONP function call like callback({...});
        i++

        parseValue()

        if (text[i] === ')') {
          // repair: skip close bracket of function call
          i++
          if (text[i] === ';') {
            // repair: skip semicolon after JSONP call
            i++
          }
        }

        return true
      } else {
        // repair unquoted string
        output += JSON.stringify(symbol)

        return true
      }
    }
  }

  function expectDigit(start: number) {
    if (!isDigit(text.charCodeAt(i))) {
      const numSoFar = text.slice(start, i)
      throw new JSONRepairError(`Invalid number '${numSoFar}', expecting a digit ${got()}`, 2)
    }
  }

  function throwInvalidCharacter(char: string) {
    throw new JSONRepairError('Invalid character ' + JSON.stringify(char), i)
  }

  function throwUnexpectedCharacter() {
    throw new JSONRepairError('Unexpected character ' + JSON.stringify(text[i]), i)
  }

  function throwUnexpectedEnd() {
    throw new JSONRepairError('Unexpected end of json string', text.length)
  }

  function throwObjectKeyExpected() {
    throw new JSONRepairError('Object key expected', i)
  }

  function throwObjectValueExpected() {
    throw new JSONRepairError('Object value expected', i)
  }

  function throwColonExpected() {
    throw new JSONRepairError('Colon expected', i)
  }

  function throwInvalidUnicodeCharacter(start: number) {
    let end = start + 2
    while (/\w/.test(text[end])) {
      end++
    }
    const chars = text.slice(start, end)
    throw new JSONRepairError(`Invalid unicode character "${chars}"`, i)
  }

  function got(): string {
    return text[i] ? `but got '${text[i]}'` : 'but reached end of input'
  }
}

function atEndOfBlockComment(text: string, i: number) {
  return text[i] === '*' && text[i + 1] === '/'
}
