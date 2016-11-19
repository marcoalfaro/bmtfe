/* */ 
(function(process) {
  exports = module.exports = SemVer;
  var debug;
  if (typeof process === 'object' && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG))
    debug = function() {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift('SEMVER');
      console.log.apply(console, args);
    };
  else
    debug = function() {};
  exports.SEMVER_SPEC_VERSION = '2.0.0';
  var MAX_LENGTH = 256;
  var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
  var re = exports.re = [];
  var src = exports.src = [];
  var R = 0;
  var NUMERICIDENTIFIER = R++;
  src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
  var NUMERICIDENTIFIERLOOSE = R++;
  src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';
  var NONNUMERICIDENTIFIER = R++;
  src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';
  var MAINVERSION = R++;
  src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' + '(' + src[NUMERICIDENTIFIER] + ')\\.' + '(' + src[NUMERICIDENTIFIER] + ')';
  var MAINVERSIONLOOSE = R++;
  src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' + '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' + '(' + src[NUMERICIDENTIFIERLOOSE] + ')';
  var PRERELEASEIDENTIFIER = R++;
  src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] + '|' + src[NONNUMERICIDENTIFIER] + ')';
  var PRERELEASEIDENTIFIERLOOSE = R++;
  src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] + '|' + src[NONNUMERICIDENTIFIER] + ')';
  var PRERELEASE = R++;
  src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] + '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';
  var PRERELEASELOOSE = R++;
  src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] + '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';
  var BUILDIDENTIFIER = R++;
  src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';
  var BUILD = R++;
  src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] + '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';
  var FULL = R++;
  var FULLPLAIN = 'v?' + src[MAINVERSION] + src[PRERELEASE] + '?' + src[BUILD] + '?';
  src[FULL] = '^' + FULLPLAIN + '$';
  var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] + src[PRERELEASELOOSE] + '?' + src[BUILD] + '?';
  var LOOSE = R++;
  src[LOOSE] = '^' + LOOSEPLAIN + '$';
  var GTLT = R++;
  src[GTLT] = '((?:<|>)?=?)';
  var XRANGEIDENTIFIERLOOSE = R++;
  src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
  var XRANGEIDENTIFIER = R++;
  src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';
  var XRANGEPLAIN = R++;
  src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' + '(?:' + src[PRERELEASE] + ')?' + src[BUILD] + '?' + ')?)?';
  var XRANGEPLAINLOOSE = R++;
  src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' + '(?:' + src[PRERELEASELOOSE] + ')?' + src[BUILD] + '?' + ')?)?';
  var XRANGE = R++;
  src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
  var XRANGELOOSE = R++;
  src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';
  var LONETILDE = R++;
  src[LONETILDE] = '(?:~>?)';
  var TILDETRIM = R++;
  src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
  re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
  var tildeTrimReplace = '$1~';
  var TILDE = R++;
  src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
  var TILDELOOSE = R++;
  src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';
  var LONECARET = R++;
  src[LONECARET] = '(?:\\^)';
  var CARETTRIM = R++;
  src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
  re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
  var caretTrimReplace = '$1^';
  var CARET = R++;
  src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
  var CARETLOOSE = R++;
  src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';
  var COMPARATORLOOSE = R++;
  src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
  var COMPARATOR = R++;
  src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';
  var COMPARATORTRIM = R++;
  src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] + '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';
  re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
  var comparatorTrimReplace = '$1$2$3';
  var HYPHENRANGE = R++;
  src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' + '\\s+-\\s+' + '(' + src[XRANGEPLAIN] + ')' + '\\s*$';
  var HYPHENRANGELOOSE = R++;
  src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' + '\\s+-\\s+' + '(' + src[XRANGEPLAINLOOSE] + ')' + '\\s*$';
  var STAR = R++;
  src[STAR] = '(<|>)?=?\\s*\\*';
  for (var i = 0; i < R; i++) {
    debug(i, src[i]);
    if (!re[i])
      re[i] = new RegExp(src[i]);
  }
  exports.parse = parse;
  function parse(version, loose) {
    if (version instanceof SemVer)
      return version;
    if (typeof version !== 'string')
      return null;
    if (version.length > MAX_LENGTH)
      return null;
    var r = loose ? re[LOOSE] : re[FULL];
    if (!r.test(version))
      return null;
    try {
      return new SemVer(version, loose);
    } catch (er) {
      return null;
    }
  }
  exports.valid = valid;
  function valid(version, loose) {
    var v = parse(version, loose);
    return v ? v.version : null;
  }
  exports.clean = clean;
  function clean(version, loose) {
    var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
    return s ? s.version : null;
  }
  exports.SemVer = SemVer;
  function SemVer(version, loose) {
    if (version instanceof SemVer) {
      if (version.loose === loose)
        return version;
      else
        version = version.version;
    } else if (typeof version !== 'string') {
      throw new TypeError('Invalid Version: ' + version);
    }
    if (version.length > MAX_LENGTH)
      throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters');
    if (!(this instanceof SemVer))
      return new SemVer(version, loose);
    debug('SemVer', version, loose);
    this.loose = loose;
    var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);
    if (!m)
      throw new TypeError('Invalid Version: ' + version);
    this.raw = version;
    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];
    if (this.major > MAX_SAFE_INTEGER || this.major < 0)
      throw new TypeError('Invalid major version');
    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
      throw new TypeError('Invalid minor version');
    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
      throw new TypeError('Invalid patch version');
    if (!m[4])
      this.prerelease = [];
    else
      this.prerelease = m[4].split('.').map(function(id) {
        if (/^[0-9]+$/.test(id)) {
          var num = +id;
          if (num >= 0 && num < MAX_SAFE_INTEGER)
            return num;
        }
        return id;
      });
    this.build = m[5] ? m[5].split('.') : [];
    this.format();
  }
  SemVer.prototype.format = function() {
    this.version = this.major + '.' + this.minor + '.' + this.patch;
    if (this.prerelease.length)
      this.version += '-' + this.prerelease.join('.');
    return this.version;
  };
  SemVer.prototype.toString = function() {
    return this.version;
  };
  SemVer.prototype.compare = function(other) {
    debug('SemVer.compare', this.version, this.loose, other);
    if (!(other instanceof SemVer))
      other = new SemVer(other, this.loose);
    return this.compareMain(other) || this.comparePre(other);
  };
  SemVer.prototype.compareMain = function(other) {
    if (!(other instanceof SemVer))
      other = new SemVer(other, this.loose);
    return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
  };
  SemVer.prototype.comparePre = function(other) {
    if (!(other instanceof SemVer))
      other = new SemVer(other, this.loose);
    if (this.prerelease.length && !other.prerelease.length)
      return -1;
    else if (!this.prerelease.length && other.prerelease.length)
      return 1;
    else if (!this.prerelease.length && !other.prerelease.length)
      return 0;
    var i = 0;
    do {
      var a = this.prerelease[i];
      var b = other.prerelease[i];
      debug('prerelease compare', i, a, b);
      if (a === undefined && b === undefined)
        return 0;
      else if (b === undefined)
        return 1;
      else if (a === undefined)
        return -1;
      else if (a === b)
        continue;
      else
        return compareIdentifiers(a, b);
    } while (++i);
  };
  SemVer.prototype.inc = function(release, identifier) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc('pre', identifier);
        break;
      case 'preminor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc('pre', identifier);
        break;
      case 'prepatch':
        this.prerelease.length = 0;
        this.inc('patch', identifier);
        this.inc('pre', identifier);
        break;
      case 'prerelease':
        if (this.prerelease.length === 0)
          this.inc('patch', identifier);
        this.inc('pre', identifier);
        break;
      case 'major':
        if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
          this.major++;
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break;
      case 'minor':
        if (this.patch !== 0 || this.prerelease.length === 0)
          this.minor++;
        this.patch = 0;
        this.prerelease = [];
        break;
      case 'patch':
        if (this.prerelease.length === 0)
          this.patch++;
        this.prerelease = [];
        break;
      case 'pre':
        if (this.prerelease.length === 0)
          this.prerelease = [0];
        else {
          var i = this.prerelease.length;
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++;
              i = -2;
            }
          }
          if (i === -1)
            this.prerelease.push(0);
        }
        if (identifier) {
          if (this.prerelease[0] === identifier) {
            if (isNaN(this.prerelease[1]))
              this.prerelease = [identifier, 0];
          } else
            this.prerelease = [identifier, 0];
        }
        break;
      default:
        throw new Error('invalid increment argument: ' + release);
    }
    this.format();
    this.raw = this.version;
    return this;
  };
  exports.inc = inc;
  function inc(version, release, loose, identifier) {
    if (typeof(loose) === 'string') {
      identifier = loose;
      loose = undefined;
    }
    try {
      return new SemVer(version, loose).inc(release, identifier).version;
    } catch (er) {
      return null;
    }
  }
  exports.diff = diff;
  function diff(version1, version2) {
    if (eq(version1, version2)) {
      return null;
    } else {
      var v1 = parse(version1);
      var v2 = parse(version2);
      if (v1.prerelease.length || v2.prerelease.length) {
        for (var key in v1) {
          if (key === 'major' || key === 'minor' || key === 'patch') {
            if (v1[key] !== v2[key]) {
              return 'pre' + key;
            }
          }
        }
        return 'prerelease';
      }
      for (var key in v1) {
        if (key === 'major' || key === 'minor' || key === 'patch') {
          if (v1[key] !== v2[key]) {
            return key;
          }
        }
      }
    }
  }
  exports.compareIdentifiers = compareIdentifiers;
  var numeric = /^[0-9]+$/;
  function compareIdentifiers(a, b) {
    var anum = numeric.test(a);
    var bnum = numeric.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return (anum && !bnum) ? -1 : (bnum && !anum) ? 1 : a < b ? -1 : a > b ? 1 : 0;
  }
  exports.rcompareIdentifiers = rcompareIdentifiers;
  function rcompareIdentifiers(a, b) {
    return compareIdentifiers(b, a);
  }
  exports.major = major;
  function major(a, loose) {
    return new SemVer(a, loose).major;
  }
  exports.minor = minor;
  function minor(a, loose) {
    return new SemVer(a, loose).minor;
  }
  exports.patch = patch;
  function patch(a, loose) {
    return new SemVer(a, loose).patch;
  }
  exports.compare = compare;
  function compare(a, b, loose) {
    return new SemVer(a, loose).compare(b);
  }
  exports.compareLoose = compareLoose;
  function compareLoose(a, b) {
    return compare(a, b, true);
  }
  exports.rcompare = rcompare;
  function rcompare(a, b, loose) {
    return compare(b, a, loose);
  }
  exports.sort = sort;
  function sort(list, loose) {
    return list.sort(function(a, b) {
      return exports.compare(a, b, loose);
    });
  }
  exports.rsort = rsort;
  function rsort(list, loose) {
    return list.sort(function(a, b) {
      return exports.rcompare(a, b, loose);
    });
  }
  exports.gt = gt;
  function gt(a, b, loose) {
    return compare(a, b, loose) > 0;
  }
  exports.lt = lt;
  function lt(a, b, loose) {
    return compare(a, b, loose) < 0;
  }
  exports.eq = eq;
  function eq(a, b, loose) {
    return compare(a, b, loose) === 0;
  }
  exports.neq = neq;
  function neq(a, b, loose) {
    return compare(a, b, loose) !== 0;
  }
  exports.gte = gte;
  function gte(a, b, loose) {
    return compare(a, b, loose) >= 0;
  }
  exports.lte = lte;
  function lte(a, b, loose) {
    return compare(a, b, loose) <= 0;
  }
  exports.cmp = cmp;
  function cmp(a, op, b, loose) {
    var ret;
    switch (op) {
      case '===':
        if (typeof a === 'object')
          a = a.version;
        if (typeof b === 'object')
          b = b.version;
        ret = a === b;
        break;
      case '!==':
        if (typeof a === 'object')
          a = a.version;
        if (typeof b === 'object')
          b = b.version;
        ret = a !== b;
        break;
      case '':
      case '=':
      case '==':
        ret = eq(a, b, loose);
        break;
      case '!=':
        ret = neq(a, b, loose);
        break;
      case '>':
        ret = gt(a, b, loose);
        break;
      case '>=':
        ret = gte(a, b, loose);
        break;
      case '<':
        ret = lt(a, b, loose);
        break;
      case '<=':
        ret = lte(a, b, loose);
        break;
      default:
        throw new TypeError('Invalid operator: ' + op);
    }
    return ret;
  }
  exports.Comparator = Comparator;
  function Comparator(comp, loose) {
    if (comp instanceof Comparator) {
      if (comp.loose === loose)
        return comp;
      else
        comp = comp.value;
    }
    if (!(this instanceof Comparator))
      return new Comparator(comp, loose);
    debug('comparator', comp, loose);
    this.loose = loose;
    this.parse(comp);
    if (this.semver === ANY)
      this.value = '';
    else
      this.value = this.operator + this.semver.version;
    debug('comp', this);
  }
  var ANY = {};
  Comparator.prototype.parse = function(comp) {
    var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
    var m = comp.match(r);
    if (!m)
      throw new TypeError('Invalid comparator: ' + comp);
    this.operator = m[1];
    if (this.operator === '=')
      this.operator = '';
    if (!m[2])
      this.semver = ANY;
    else
      this.semver = new SemVer(m[2], this.loose);
  };
  Comparator.prototype.toString = function() {
    return this.value;
  };
  Comparator.prototype.test = function(version) {
    debug('Comparator.test', version, this.loose);
    if (this.semver === ANY)
      return true;
    if (typeof version === 'string')
      version = new SemVer(version, this.loose);
    return cmp(version, this.operator, this.semver, this.loose);
  };
  exports.Range = Range;
  function Range(range, loose) {
    if ((range instanceof Range) && range.loose === loose)
      return range;
    if (!(this instanceof Range))
      return new Range(range, loose);
    this.loose = loose;
    this.raw = range;
    this.set = range.split(/\s*\|\|\s*/).map(function(range) {
      return this.parseRange(range.trim());
    }, this).filter(function(c) {
      return c.length;
    });
    if (!this.set.length) {
      throw new TypeError('Invalid SemVer Range: ' + range);
    }
    this.format();
  }
  Range.prototype.format = function() {
    this.range = this.set.map(function(comps) {
      return comps.join(' ').trim();
    }).join('||').trim();
    return this.range;
  };
  Range.prototype.toString = function() {
    return this.range;
  };
  Range.prototype.parseRange = function(range) {
    var loose = this.loose;
    range = range.trim();
    debug('range', range, loose);
    var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
    range = range.replace(hr, hyphenReplace);
    debug('hyphen replace', range);
    range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
    debug('comparator trim', range, re[COMPARATORTRIM]);
    range = range.replace(re[TILDETRIM], tildeTrimReplace);
    range = range.replace(re[CARETTRIM], caretTrimReplace);
    range = range.split(/\s+/).join(' ');
    var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
    var set = range.split(' ').map(function(comp) {
      return parseComparator(comp, loose);
    }).join(' ').split(/\s+/);
    if (this.loose) {
      set = set.filter(function(comp) {
        return !!comp.match(compRe);
      });
    }
    set = set.map(function(comp) {
      return new Comparator(comp, loose);
    });
    return set;
  };
  exports.toComparators = toComparators;
  function toComparators(range, loose) {
    return new Range(range, loose).set.map(function(comp) {
      return comp.map(function(c) {
        return c.value;
      }).join(' ').trim().split(' ');
    });
  }
  function parseComparator(comp, loose) {
    debug('comp', comp);
    comp = replaceCarets(comp, loose);
    debug('caret', comp);
    comp = replaceTildes(comp, loose);
    debug('tildes', comp);
    comp = replaceXRanges(comp, loose);
    debug('xrange', comp);
    comp = replaceStars(comp, loose);
    debug('stars', comp);
    return comp;
  }
  function isX(id) {
    return !id || id.toLowerCase() === 'x' || id === '*';
  }
  function replaceTildes(comp, loose) {
    return comp.trim().split(/\s+/).map(function(comp) {
      return replaceTilde(comp, loose);
    }).join(' ');
  }
  function replaceTilde(comp, loose) {
    var r = loose ? re[TILDELOOSE] : re[TILDE];
    return comp.replace(r, function(_, M, m, p, pr) {
      debug('tilde', comp, _, M, m, p, pr);
      var ret;
      if (isX(M))
        ret = '';
      else if (isX(m))
        ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
      else if (isX(p))
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
      else if (pr) {
        debug('replaceTilde pr', pr);
        if (pr.charAt(0) !== '-')
          pr = '-' + pr;
        ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + M + '.' + (+m + 1) + '.0';
      } else
        ret = '>=' + M + '.' + m + '.' + p + ' <' + M + '.' + (+m + 1) + '.0';
      debug('tilde return', ret);
      return ret;
    });
  }
  function replaceCarets(comp, loose) {
    return comp.trim().split(/\s+/).map(function(comp) {
      return replaceCaret(comp, loose);
    }).join(' ');
  }
  function replaceCaret(comp, loose) {
    debug('caret', comp, loose);
    var r = loose ? re[CARETLOOSE] : re[CARET];
    return comp.replace(r, function(_, M, m, p, pr) {
      debug('caret', comp, _, M, m, p, pr);
      var ret;
      if (isX(M))
        ret = '';
      else if (isX(m))
        ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
      else if (isX(p)) {
        if (M === '0')
          ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
        else
          ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
      } else if (pr) {
        debug('replaceCaret pr', pr);
        if (pr.charAt(0) !== '-')
          pr = '-' + pr;
        if (M === '0') {
          if (m === '0')
            ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + M + '.' + m + '.' + (+p + 1);
          else
            ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + M + '.' + (+m + 1) + '.0';
        } else
          ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + (+M + 1) + '.0.0';
      } else {
        debug('no pr');
        if (M === '0') {
          if (m === '0')
            ret = '>=' + M + '.' + m + '.' + p + ' <' + M + '.' + m + '.' + (+p + 1);
          else
            ret = '>=' + M + '.' + m + '.' + p + ' <' + M + '.' + (+m + 1) + '.0';
        } else
          ret = '>=' + M + '.' + m + '.' + p + ' <' + (+M + 1) + '.0.0';
      }
      debug('caret return', ret);
      return ret;
    });
  }
  function replaceXRanges(comp, loose) {
    debug('replaceXRanges', comp, loose);
    return comp.split(/\s+/).map(function(comp) {
      return replaceXRange(comp, loose);
    }).join(' ');
  }
  function replaceXRange(comp, loose) {
    comp = comp.trim();
    var r = loose ? re[XRANGELOOSE] : re[XRANGE];
    return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
      debug('xRange', comp, ret, gtlt, M, m, p, pr);
      var xM = isX(M);
      var xm = xM || isX(m);
      var xp = xm || isX(p);
      var anyX = xp;
      if (gtlt === '=' && anyX)
        gtlt = '';
      if (xM) {
        if (gtlt === '>' || gtlt === '<') {
          ret = '<0.0.0';
        } else {
          ret = '*';
        }
      } else if (gtlt && anyX) {
        if (xm)
          m = 0;
        if (xp)
          p = 0;
        if (gtlt === '>') {
          gtlt = '>=';
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else if (xp) {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === '<=') {
          gtlt = '<';
          if (xm)
            M = +M + 1;
          else
            m = +m + 1;
        }
        ret = gtlt + M + '.' + m + '.' + p;
      } else if (xm) {
        ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
      } else if (xp) {
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
      }
      debug('xRange return', ret);
      return ret;
    });
  }
  function replaceStars(comp, loose) {
    debug('replaceStars', comp, loose);
    return comp.trim().replace(re[STAR], '');
  }
  function hyphenReplace($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
    if (isX(fM))
      from = '';
    else if (isX(fm))
      from = '>=' + fM + '.0.0';
    else if (isX(fp))
      from = '>=' + fM + '.' + fm + '.0';
    else
      from = '>=' + from;
    if (isX(tM))
      to = '';
    else if (isX(tm))
      to = '<' + (+tM + 1) + '.0.0';
    else if (isX(tp))
      to = '<' + tM + '.' + (+tm + 1) + '.0';
    else if (tpr)
      to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
    else
      to = '<=' + to;
    return (from + ' ' + to).trim();
  }
  Range.prototype.test = function(version) {
    if (!version)
      return false;
    if (typeof version === 'string')
      version = new SemVer(version, this.loose);
    for (var i = 0; i < this.set.length; i++) {
      if (testSet(this.set[i], version))
        return true;
    }
    return false;
  };
  function testSet(set, version) {
    for (var i = 0; i < set.length; i++) {
      if (!set[i].test(version))
        return false;
    }
    if (version.prerelease.length) {
      for (var i = 0; i < set.length; i++) {
        debug(set[i].semver);
        if (set[i].semver === ANY)
          continue;
        if (set[i].semver.prerelease.length > 0) {
          var allowed = set[i].semver;
          if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch)
            return true;
        }
      }
      return false;
    }
    return true;
  }
  exports.satisfies = satisfies;
  function satisfies(version, range, loose) {
    try {
      range = new Range(range, loose);
    } catch (er) {
      return false;
    }
    return range.test(version);
  }
  exports.maxSatisfying = maxSatisfying;
  function maxSatisfying(versions, range, loose) {
    return versions.filter(function(version) {
      return satisfies(version, range, loose);
    }).sort(function(a, b) {
      return rcompare(a, b, loose);
    })[0] || null;
  }
  exports.minSatisfying = minSatisfying;
  function minSatisfying(versions, range, loose) {
    return versions.filter(function(version) {
      return satisfies(version, range, loose);
    }).sort(function(a, b) {
      return compare(a, b, loose);
    })[0] || null;
  }
  exports.validRange = validRange;
  function validRange(range, loose) {
    try {
      return new Range(range, loose).range || '*';
    } catch (er) {
      return null;
    }
  }
  exports.ltr = ltr;
  function ltr(version, range, loose) {
    return outside(version, range, '<', loose);
  }
  exports.gtr = gtr;
  function gtr(version, range, loose) {
    return outside(version, range, '>', loose);
  }
  exports.outside = outside;
  function outside(version, range, hilo, loose) {
    version = new SemVer(version, loose);
    range = new Range(range, loose);
    var gtfn,
        ltefn,
        ltfn,
        comp,
        ecomp;
    switch (hilo) {
      case '>':
        gtfn = gt;
        ltefn = lte;
        ltfn = lt;
        comp = '>';
        ecomp = '>=';
        break;
      case '<':
        gtfn = lt;
        ltefn = gte;
        ltfn = gt;
        comp = '<';
        ecomp = '<=';
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (satisfies(version, range, loose)) {
      return false;
    }
    for (var i = 0; i < range.set.length; ++i) {
      var comparators = range.set[i];
      var high = null;
      var low = null;
      comparators.forEach(function(comparator) {
        if (comparator.semver === ANY) {
          comparator = new Comparator('>=0.0.0');
        }
        high = high || comparator;
        low = low || comparator;
        if (gtfn(comparator.semver, high.semver, loose)) {
          high = comparator;
        } else if (ltfn(comparator.semver, low.semver, loose)) {
          low = comparator;
        }
      });
      if (high.operator === comp || high.operator === ecomp) {
        return false;
      }
      if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
        return false;
      } else if (low.operator === ecomp && ltfn(version, low.semver)) {
        return false;
      }
    }
    return true;
  }
  exports.prerelease = prerelease;
  function prerelease(version, loose) {
    var parsed = parse(version, loose);
    return (parsed && parsed.prerelease.length) ? parsed.prerelease : null;
  }
})(require('process'));
