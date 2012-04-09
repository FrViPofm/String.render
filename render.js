// Add the U (ungreedy) flag from PCRE and RE2, which reverses greedy and lazy quantifiers
XRegExp.addToken(
    /([?*+]|{\d+(?:,\d*)?})(\??)/,
    function (match) {return match[1] + (match[2] ? "" : "?")},
    XRegExp.OUTSIDE_CLASS,
    function () {return this.hasFlag("U")}
);
String.prototype.render = function(){
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
* r : RexExp
* t : template
* v : value
* requires XRegExp.js library
* requires dateutils.js library
* minification insctructions
* [substitutions]
* _extract : _E
* _replace : _R
* _forloop : _L
* _ifcond : _I
* _include : _Y
* _parse : _P
* _variable : _V
* _is_function : _f
* _is_undefined : _u
* contextParent : C
* context : c
* key : k
* matches : m
* node : n
* out : o
* string : s
* template : t
* word : w
*/
  var N=[
    {f:_L,i:3,r:"{% for (?<c>\\w+) in (?<C>[^\\}]+) %}(?<t>.+?){% endfor %}",}, // loop
    {f:_I, i:2,r:"{% if (?<c>[^\\}]+) %}(?<t>[^%]+?)(?:{% else %}(?<T>[^\\{]*))?{% endif %}",}, // if
    {f:_V,i:1,r:"{{ ?(?<c>[^ }]+) ?}}",}, // var
//    {f:_Y,i:1,r:"{% include (?<C>[^\\}]+) %}",}, // include, not yet implemented
  ];
  var t = String(this);
  if(typeof arguments[0] == 'string'){
    eval('var c ='+arguments[0]);
  } else {var c = arguments[0];}
  /* API functions 
  common String methods remain available
  */
  // string -> String
  function capfirst(s){return upper(s.substr(0,1))+lower(s.substr(1))};
  // this is a title -> This Is A Title
  function title(s){var w=s.split(' ');for(var i in w){w[i]=capfirst(w[i]);}return w.join(' ')};// bad method
  function lower(s){return s.toLowerCase()};
  function upper(s){return s.toUpperCase()};
  function _just(s,n){var r='',n=parseInt(n),s=s.toString();while(n-s.length>0){r+=" ";n--;}return r};
  function ljust(s,n){return s+_just(s,n)};
  function rjust(s,n){return _just(s,n)+s};
  // for objects,, makes a sortable array of members values
  function dictsort(a,k){var o=[];if(a.slice){o=a.slice()}else{for(var k in a){o.push(a[k])}}
      return o.sort(function(a,b){return a[k]==b[k]?0:a[k]>b[k]?1:-1})};
  function floatformat(s,n){var x=Math.pow(10,n);return Math.round(x*s)/x};
  // "-2.2" -> 2.2
  function abs(i){return Math.abs(parseFloat(i))};

  /* --- utils --- */
  /* is function */
  function _f(c){return typeof c == 'function'}
  /* is undefined */
  function _u(c){return typeof c == 'undefined'}

  /* --- core functions --- */
  /* extract */
  function _E(t,c){
    // extract a variable from a context
    // e.g. from "{{ obj.sub|func }}" extracts obj.sub from {obj:{sub:"foo"}}
    // e.g. from '{{ obj.sub|func:"foo" }}' extracts obj.sub from {obj:{sub:"bar"}}
    //      and applies bar.func("foo") or func(bar,"foo")
    // return the obj
    var A=t.split('|'),C=_u(c._)?false:c._,V=A[0].split('.');
    for(var k in V){
      if(_u(c[V[k]])){return C ? _E(t,C) : '';} // search parent context
      else{c=c[V[k]];} // dig
    }
    return _u(c)?'':(A[1]?_F(c,A[1],c):c);
  };
  /* replace */
  function _R(t,c,m){return t.substring(0,m.index)+c+t.substring(m.index + m[0].length);};
  /* function */
  function _F(n, f, c){
    // apply a function to an object
    // e.g. with "{{ n|f }}" f(n) or n.f()
    // with "{{ n|f:foo }}" n.f.(foo)
    var o="";
    if(f.match(/\w+:/)){
      var B = f.split(':'),F=B.shift(),A=B.join(':');
      if(A && A[0]=='"'){
        A=A.replace(/"/g,'')
      } else {
        A=_E(A,c) || A
      }
      if(_f_(n[F])){o=n[F](A)} // method n.f(A)
      else if(_f_(eval(F))){o=eval(F)(n,A)} // function f(n,A)
    }
    else if(_f_(n[f])){o=n[f]()} // method n.f()
    else if (_f_(eval(f))){o=eval(f)(n)} // function f(n)
    return o || '';
  }
  /* parse */
  function _P(t,c,n){
    // parse the string to get nodes
    // z : avoid inf. loops
    var z=20,m=XRegExp(n.r,'gsU').exec(t);
    while(m && z-- >= 0){
      t=_R(t, n.f(m.t, c, m), m);
      m=XRegExp(n.r,'gs').exec(t);
    }
    return t;
  }
  /* node functions */
  /* for loop */
  function _L(t,c,m){
    var i=0,o='',C=c,A=_E(m.C,c);
    for(var j in A){
      var c={'_':C,'forloop':{"counter":i+1,"counter0":i,"first":!i,"last":i==A.length-1}}; c[m.c]=A[j]; // new context
      o += t.render(c);
      i++;
    }
    return o;
  }
  /* if condition*/
  function _I(t,c,m){
    var C = _E(m.c, c);
    if (C){return t.render(c);}
    else {return m.T ? m.T.render(c) : '';}
  }
  /* include */
  /* vars */
  function _V(t,c,m){
    var a,A=m.c.split('|'),o=_E(A.shift(),c);
    while(a = A.shift()){ // pipe
      if(a && a.match(/\w+:/)){o=_F(o,a,c)}
      else if(!_f_(o[a]) && !_u(o[a])){o = o[a];} // property
      else if(_f_(o[a])){o = o[a]();} // method
      else if(_f_(eval(a))){o=eval(a)(o);} // function
    }
    return o;
  }
  for(var i in N){
    var n = N[i]
    t=_P(t,c,N[i]);
    var toto = t
    }
  return t;
}
String.prototype.render.version = "201202170057"
