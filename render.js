// Add the U (ungreedy) flag from PCRE and RE2, which reverses greedy and lazy quantifiers
XRegExp.install('extensibility');
// Add the U (ungreedy) flag from PCRE and RE2, which reverses greedy and lazy quantifiers
XRegExp.addToken(
  /([?*+]|{\d+(?:,\d*)?})(\??)/,
  function (match) {
    return match[1] + (match[2] ? '' : '?');
  },
  {
    scope: 'default',
    customFlags: 'U',
    trigger: function () {
      return this.hasFlag('U');
    }
  }
);
String.prototype.render = function () {
/*
* render a django-like template against a context
* vars are
* A : Array
* c : context in scope
* C : parent context
* k : key
* m : RegExp matches, m.c:context,m.t:template,m.T:alt template
* N : nodes
* n : node; n.f : function, n.i: index, n.r: RegExp
* o : output string
* O : options
* r : RexExp
* t : template
* v : value
* requires XRegExp.js library
* requires dateutils.js library
** minification insctructions
** [substitutions]
** _extract         : _E
** _isFunction      : _f
** _function        : _F
** _ifcond          : _I
** _forloop         : _L
** _parse           : _P
** _replace         : _R
** _include         : _Y
** _isUndefined     : _u
** _variable        : _V
* contextParent     : C
* context : c
* key : k
* matches : m
* node : n
* out : o
* string : s
* template : t
* templates : T
* word : w
*/
  var c, i, N = [
    {f: _forloop, i: 3, r: "{% for (?<c>\\w+) in (?<C>[^\\}]+) %}(?<t>.+){% endfor %}"}, // loop
    {f: _ifcond, i:2, r: "{% if (?<c>[^\\}]+) %}(?<t>[^%]+?)(?:{% else %}(?<T>[^\\{]*))?{% endif %}"}, // if
    {f: _variable, i:1, r:"{{ ?(?<c>[^ }]+) ?}}"} // var
//    {f:_include,i:1,r:"{% include (?<C>[^\\}]+) %}",}, // include, not yet implemented
  ], t = String(this), O = arguments[1];
  if (O && O.templates) {
    // implementation of include
    var T = O.templates;
    function _include(t, c, m) {
        if (T[m.C]) {
          return T[m.C].render(c, O);
        }
    }
    N.unshift({f: _include, i: 1, r: "{% include (?<C>[^\\}]+) %}"})
  }
  if (typeof arguments[0] === 'string') {
    eval('c =' + arguments[0]);
  } else {c = arguments[0];}
  /* API functions
  *  common String methods remain available
  */
  // string -> String
  function capfirst(s){return upper(s.substr(0,1))+lower(s.substr(1));}
  // this is a title -> This Is A Title
  function title(s){var i,w=s.split(' ');for(i in w){w[i]=capfirst(w[i]);}return w.join(' ');}// bad method
  function lower(s){return s.toLowerCase();}
  function upper(s){return s.toUpperCase();}
  function ljust(s,n){return s+_just(s,n);}
  function rjust(s,n){return _just(s,n)+s;}
  // for objects,, makes a sortable array of members values
  function dictsort(a,k){
    var A = _A_(a), o= [], O = {}, i;
    if(A){
      o=a.slice();
      o.sort(function(a,b){return _N_(a[k]) && _N_(b[k]) ? a[k] - b[k] : a[k]===b[k]?0:a[k]>b[k]?1:-1;})
    }
    else{
      for(i in a){ o.push([i,a[i]]);}
      if(_U_(k)){
        o.sort(function(a,b){return _N_(a[0]) && _N_(b[0]) ? a[0] - b[0] : a[0]===b[0]?0:a[0]>b[0]?1:-1;})
      } else {
        o.sort(function(a,b){return _N_(a[1][k]) && _N_(b[1][k]) ? a[1][k] - b[1][k] : a[1][k]===b[1][k]?0:a[1][k]>b[1][k]?1:-1;})
      }
      for(i in o){ O[o[i][0]] = o[i][1];}
    }
    return A ? o : O;
  }
  function floatformat(s,n){var x=Math.pow(10,n);return Math.round(x*s)/x;}
  // "-2.2" -> 2.2
  function abs(i){return Math.abs(parseFloat(i));}

  /* --- utils --- */
  function _just(s,n){var r='',n=parseInt(n),s=s.toString();while(n-s.length>0){r+=" ";n--;}return r;}
  /* is undefined */
  function _isUndefined(c){return typeof c === 'undefined';}
  /* is array */
  function _isArray(c){return !_isUndefined(c.slice);}
  /* is function */
  function _isFunction(c){return typeof c === 'function';}
  /* is string */
  function _isString(c){return typeof c === 'string';}
  /* is number */
  function _isNumber(c){return typeof c === 'number';}
  /* is integer */
  function _isInteger(c){return _N_(c) && Math.abs(c);}
  /* aliases */
  var _U_ = _isUndefined;
  var _A_ = _isArray;
  var _F_ = _isFunction;
  var _S_ = _isString;
  var _N_ = _isNumber;
  var _I_ = _isInteger;

  /* --- core functions --- */
  /* extract */
  function _extract(t,c){
    // extract a variable from a context
    // e.g. from "{{ obj.sub|func }}" extracts obj.sub from {obj:{sub:"foo"}}
    // e.g. from '{{ obj.sub|func:"foo" }}' extracts obj.sub from {obj:{sub:"bar"}}
    //      and applies bar.func("foo") or func(bar,"foo")
    // return the obj
    var k,A=t.split('|'),C=_isUndefined(c._)?false:c._,V=A[0].split('.');
    for(k in V){
      if(_isUndefined(c[V[k]])){return C ? _extract(t,C) : '';} // search parent context
      else{c=c[V[k]];} // dig
    }
    return _isUndefined(c)?'':(A[1]?_function(c,A[1],c):c);
  }
  /* replace */
  function _replace(t,c,m){return t.substring(0,m.index)+c+t.substring(m.index + m[0].length);}
  /* function */
  function _function(n, f, c){
    // apply a function to an object
    // e.g. with "{{ n|f }}" f(n) or n.f()
    // with "{{ n|f:foo }}" n.f.(foo)
    var o="";
    if(f.match(/\w+:/)){
      var B = f.split(':'),F=B.shift(),A=B.join(':');
      if(A && A[0]==='"'){
        A=A.replace(/"/g,'')
      } else {
        A=_extract(A,c) || A
      }
      if(_isFunction(n[F])){o=n[F](A)} // method n.f(A)
      else if(_isFunction(eval(F))){o=eval(F)(n,A)} // function f(n,A)
    }
    else if(_isFunction(n[f])){o=n[f]()} // method n.f()
    else if (_isFunction(eval(f))){o=eval(f)(n)} // function f(n)
    return o || '';
  }
  /* parse */
  function _parse(t,c,n){
    // parse the string to get nodes
    // z : avoid inf. loops
    var z=20,m=XRegExp(n.r,'gsU').exec(t);
    while(m && z-- >= 0){
//      console.log(m, c)
      t=_replace(t, n.f(m.t, c, m), m);
      m=XRegExp(n.r,'gsU').exec(t);
    }
    return t;
  }
  /* node functions */
  /* for loop */
  function _forloop(t,c,m){
    var j, i=0,o='',C=c,A=_extract(m.C,c);
    for(j in A){
      var c={'_':C,
        'forloop':{
          "counter":i+1,
          "counter0":i,
          "first":!i,
          "key":j,
          "last":i===A.length-1
        }
      };
      c[m.c]=A[j]; // new context
      o += t.render(c,O);
      i++;
    }
    return o;
  }
  /* if condition*/
  function _ifcond(t,c,m){
    var C = _extract(m.c, c);
    if (C){return t.render(c,O);}
    else {return m.T ? m.T.render(c,O) : '';}
  }
  /* include */
  /* vars */
  function _variable(t,c,m){
    var a,A=m.c.split('|');
    var o=_extract(A.shift(),c);
    while(a = A.shift()){ // pipe
      if(a && a.match(/\w+:/)){
        o=_function(o,a,c);
      }
      else if(!_isFunction(o[a]) && !_isUndefined(o[a])){o = o[a];} // property
      else if(_isFunction(o[a])){o = o[a]();} // method
      else if(_isFunction(eval(a))){o=eval(a)(o);} // function
    }
    return o;
  }
  // main loop
  for(i in N){
    t=_parse(t,c,N[i]);
    }
  return t;
};
String.prototype.render.VERSION = 1.03;
