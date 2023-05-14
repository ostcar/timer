(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

console.warn('Compiled in DEV mode. Follow the advice at https://elm-lang.org/0.19.1/optimize for better performance and smaller assets.');


// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**_UNUSED/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**_UNUSED/
	if (typeof x.$ === 'undefined')
	//*/
	/**/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0_UNUSED = 0;
var _Utils_Tuple0 = { $: '#0' };

function _Utils_Tuple2_UNUSED(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3_UNUSED(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr_UNUSED(c) { return c; }
function _Utils_chr(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil_UNUSED = { $: 0 };
var _List_Nil = { $: '[]' };

function _List_Cons_UNUSED(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log_UNUSED = F2(function(tag, value)
{
	return value;
});

var _Debug_log = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString_UNUSED(value)
{
	return '<internals>';
}

function _Debug_toString(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash_UNUSED(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.start.line === region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'on lines ' + region.start.line + ' through ' + region.end.line;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap(value) { return { $: 0, a: value }; }
function _Json_unwrap(value) { return value.a; }

function _Json_wrap_UNUSED(value) { return value; }
function _Json_unwrap_UNUSED(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**_UNUSED/
	var node = args['node'];
	//*/
	/**/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS


function _VirtualDom_noScript(tag)
{
	return tag == 'script' ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return /^(on|formAction$)/i.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri_UNUSED(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,'')) ? '' : value;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,''))
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri_UNUSED(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value) ? '' : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value)
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		message: func(record.message),
		stopPropagation: record.stopPropagation,
		preventDefault: record.preventDefault
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.message;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.stopPropagation;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.preventDefault) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var view = impl.view;
			/**_UNUSED/
			var domNode = args['node'];
			//*/
			/**/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.setup && impl.setup(sendToApp)
			var view = impl.view;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.body);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.title) && (_VirtualDom_doc.title = title = doc.title);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.onUrlChange;
	var onUrlRequest = impl.onUrlRequest;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		setup: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.protocol === next.protocol
							&& curr.host === next.host
							&& curr.port_.a === next.port_.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		init: function(flags)
		{
			return A3(impl.init, flags, _Browser_getUrl(), key);
		},
		view: impl.view,
		update: impl.update,
		subscriptions: impl.subscriptions
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { hidden: 'hidden', change: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { hidden: 'mozHidden', change: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { hidden: 'msHidden', change: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { hidden: 'webkitHidden', change: 'webkitvisibilitychange' }
		: { hidden: 'hidden', change: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		scene: _Browser_getScene(),
		viewport: {
			x: _Browser_window.pageXOffset,
			y: _Browser_window.pageYOffset,
			width: _Browser_doc.documentElement.clientWidth,
			height: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		width: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		height: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			scene: {
				width: node.scrollWidth,
				height: node.scrollHeight
			},
			viewport: {
				x: node.scrollLeft,
				y: node.scrollTop,
				width: node.clientWidth,
				height: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			scene: _Browser_getScene(),
			viewport: {
				x: x,
				y: y,
				width: _Browser_doc.documentElement.clientWidth,
				height: _Browser_doc.documentElement.clientHeight
			},
			element: {
				x: x + rect.left,
				y: y + rect.top,
				width: rect.width,
				height: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}


// BYTES

function _Bytes_width(bytes)
{
	return bytes.byteLength;
}

var _Bytes_getHostEndianness = F2(function(le, be)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(new Uint8Array(new Uint32Array([1]))[0] === 1 ? le : be));
	});
});


// ENCODERS

function _Bytes_encode(encoder)
{
	var mutableBytes = new DataView(new ArrayBuffer($elm$bytes$Bytes$Encode$getWidth(encoder)));
	$elm$bytes$Bytes$Encode$write(encoder)(mutableBytes)(0);
	return mutableBytes;
}


// SIGNED INTEGERS

var _Bytes_write_i8  = F3(function(mb, i, n) { mb.setInt8(i, n); return i + 1; });
var _Bytes_write_i16 = F4(function(mb, i, n, isLE) { mb.setInt16(i, n, isLE); return i + 2; });
var _Bytes_write_i32 = F4(function(mb, i, n, isLE) { mb.setInt32(i, n, isLE); return i + 4; });


// UNSIGNED INTEGERS

var _Bytes_write_u8  = F3(function(mb, i, n) { mb.setUint8(i, n); return i + 1 ;});
var _Bytes_write_u16 = F4(function(mb, i, n, isLE) { mb.setUint16(i, n, isLE); return i + 2; });
var _Bytes_write_u32 = F4(function(mb, i, n, isLE) { mb.setUint32(i, n, isLE); return i + 4; });


// FLOATS

var _Bytes_write_f32 = F4(function(mb, i, n, isLE) { mb.setFloat32(i, n, isLE); return i + 4; });
var _Bytes_write_f64 = F4(function(mb, i, n, isLE) { mb.setFloat64(i, n, isLE); return i + 8; });


// BYTES

var _Bytes_write_bytes = F3(function(mb, offset, bytes)
{
	for (var i = 0, len = bytes.byteLength, limit = len - 4; i <= limit; i += 4)
	{
		mb.setUint32(offset + i, bytes.getUint32(i));
	}
	for (; i < len; i++)
	{
		mb.setUint8(offset + i, bytes.getUint8(i));
	}
	return offset + len;
});


// STRINGS

function _Bytes_getStringWidth(string)
{
	for (var width = 0, i = 0; i < string.length; i++)
	{
		var code = string.charCodeAt(i);
		width +=
			(code < 0x80) ? 1 :
			(code < 0x800) ? 2 :
			(code < 0xD800 || 0xDBFF < code) ? 3 : (i++, 4);
	}
	return width;
}

var _Bytes_write_string = F3(function(mb, offset, string)
{
	for (var i = 0; i < string.length; i++)
	{
		var code = string.charCodeAt(i);
		offset +=
			(code < 0x80)
				? (mb.setUint8(offset, code)
				, 1
				)
				:
			(code < 0x800)
				? (mb.setUint16(offset, 0xC080 /* 0b1100000010000000 */
					| (code >>> 6 & 0x1F /* 0b00011111 */) << 8
					| code & 0x3F /* 0b00111111 */)
				, 2
				)
				:
			(code < 0xD800 || 0xDBFF < code)
				? (mb.setUint16(offset, 0xE080 /* 0b1110000010000000 */
					| (code >>> 12 & 0xF /* 0b00001111 */) << 8
					| code >>> 6 & 0x3F /* 0b00111111 */)
				, mb.setUint8(offset + 2, 0x80 /* 0b10000000 */
					| code & 0x3F /* 0b00111111 */)
				, 3
				)
				:
			(code = (code - 0xD800) * 0x400 + string.charCodeAt(++i) - 0xDC00 + 0x10000
			, mb.setUint32(offset, 0xF0808080 /* 0b11110000100000001000000010000000 */
				| (code >>> 18 & 0x7 /* 0b00000111 */) << 24
				| (code >>> 12 & 0x3F /* 0b00111111 */) << 16
				| (code >>> 6 & 0x3F /* 0b00111111 */) << 8
				| code & 0x3F /* 0b00111111 */)
			, 4
			);
	}
	return offset;
});


// DECODER

var _Bytes_decode = F2(function(decoder, bytes)
{
	try {
		return $elm$core$Maybe$Just(A2(decoder, bytes, 0).b);
	} catch(e) {
		return $elm$core$Maybe$Nothing;
	}
});

var _Bytes_read_i8  = F2(function(      bytes, offset) { return _Utils_Tuple2(offset + 1, bytes.getInt8(offset)); });
var _Bytes_read_i16 = F3(function(isLE, bytes, offset) { return _Utils_Tuple2(offset + 2, bytes.getInt16(offset, isLE)); });
var _Bytes_read_i32 = F3(function(isLE, bytes, offset) { return _Utils_Tuple2(offset + 4, bytes.getInt32(offset, isLE)); });
var _Bytes_read_u8  = F2(function(      bytes, offset) { return _Utils_Tuple2(offset + 1, bytes.getUint8(offset)); });
var _Bytes_read_u16 = F3(function(isLE, bytes, offset) { return _Utils_Tuple2(offset + 2, bytes.getUint16(offset, isLE)); });
var _Bytes_read_u32 = F3(function(isLE, bytes, offset) { return _Utils_Tuple2(offset + 4, bytes.getUint32(offset, isLE)); });
var _Bytes_read_f32 = F3(function(isLE, bytes, offset) { return _Utils_Tuple2(offset + 4, bytes.getFloat32(offset, isLE)); });
var _Bytes_read_f64 = F3(function(isLE, bytes, offset) { return _Utils_Tuple2(offset + 8, bytes.getFloat64(offset, isLE)); });

var _Bytes_read_bytes = F3(function(len, bytes, offset)
{
	return _Utils_Tuple2(offset + len, new DataView(bytes.buffer, bytes.byteOffset + offset, len));
});

var _Bytes_read_string = F3(function(len, bytes, offset)
{
	var string = '';
	var end = offset + len;
	for (; offset < end;)
	{
		var byte = bytes.getUint8(offset++);
		string +=
			(byte < 128)
				? String.fromCharCode(byte)
				:
			((byte & 0xE0 /* 0b11100000 */) === 0xC0 /* 0b11000000 */)
				? String.fromCharCode((byte & 0x1F /* 0b00011111 */) << 6 | bytes.getUint8(offset++) & 0x3F /* 0b00111111 */)
				:
			((byte & 0xF0 /* 0b11110000 */) === 0xE0 /* 0b11100000 */)
				? String.fromCharCode(
					(byte & 0xF /* 0b00001111 */) << 12
					| (bytes.getUint8(offset++) & 0x3F /* 0b00111111 */) << 6
					| bytes.getUint8(offset++) & 0x3F /* 0b00111111 */
				)
				:
				(byte =
					((byte & 0x7 /* 0b00000111 */) << 18
						| (bytes.getUint8(offset++) & 0x3F /* 0b00111111 */) << 12
						| (bytes.getUint8(offset++) & 0x3F /* 0b00111111 */) << 6
						| bytes.getUint8(offset++) & 0x3F /* 0b00111111 */
					) - 0x10000
				, String.fromCharCode(Math.floor(byte / 0x400) + 0xD800, byte % 0x400 + 0xDC00)
				);
	}
	return _Utils_Tuple2(offset, string);
});

var _Bytes_decodeFailure = F2(function() { throw 0; });



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});



// SEND REQUEST

var _Http_toTask = F3(function(router, toTask, request)
{
	return _Scheduler_binding(function(callback)
	{
		function done(response) {
			callback(toTask(request.expect.a(response)));
		}

		var xhr = new XMLHttpRequest();
		xhr.addEventListener('error', function() { done($elm$http$Http$NetworkError_); });
		xhr.addEventListener('timeout', function() { done($elm$http$Http$Timeout_); });
		xhr.addEventListener('load', function() { done(_Http_toResponse(request.expect.b, xhr)); });
		$elm$core$Maybe$isJust(request.tracker) && _Http_track(router, xhr, request.tracker.a);

		try {
			xhr.open(request.method, request.url, true);
		} catch (e) {
			return done($elm$http$Http$BadUrl_(request.url));
		}

		_Http_configureRequest(xhr, request);

		request.body.a && xhr.setRequestHeader('Content-Type', request.body.a);
		xhr.send(request.body.b);

		return function() { xhr.c = true; xhr.abort(); };
	});
});


// CONFIGURE

function _Http_configureRequest(xhr, request)
{
	for (var headers = request.headers; headers.b; headers = headers.b) // WHILE_CONS
	{
		xhr.setRequestHeader(headers.a.a, headers.a.b);
	}
	xhr.timeout = request.timeout.a || 0;
	xhr.responseType = request.expect.d;
	xhr.withCredentials = request.allowCookiesFromOtherDomains;
}


// RESPONSES

function _Http_toResponse(toBody, xhr)
{
	return A2(
		200 <= xhr.status && xhr.status < 300 ? $elm$http$Http$GoodStatus_ : $elm$http$Http$BadStatus_,
		_Http_toMetadata(xhr),
		toBody(xhr.response)
	);
}


// METADATA

function _Http_toMetadata(xhr)
{
	return {
		url: xhr.responseURL,
		statusCode: xhr.status,
		statusText: xhr.statusText,
		headers: _Http_parseHeaders(xhr.getAllResponseHeaders())
	};
}


// HEADERS

function _Http_parseHeaders(rawHeaders)
{
	if (!rawHeaders)
	{
		return $elm$core$Dict$empty;
	}

	var headers = $elm$core$Dict$empty;
	var headerPairs = rawHeaders.split('\r\n');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf(': ');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3($elm$core$Dict$update, key, function(oldValue) {
				return $elm$core$Maybe$Just($elm$core$Maybe$isJust(oldValue)
					? value + ', ' + oldValue.a
					: value
				);
			}, headers);
		}
	}
	return headers;
}


// EXPECT

var _Http_expect = F3(function(type, toBody, toValue)
{
	return {
		$: 0,
		d: type,
		b: toBody,
		a: toValue
	};
});

var _Http_mapExpect = F2(function(func, expect)
{
	return {
		$: 0,
		d: expect.d,
		b: expect.b,
		a: function(x) { return func(expect.a(x)); }
	};
});

function _Http_toDataView(arrayBuffer)
{
	return new DataView(arrayBuffer);
}


// BODY and PARTS

var _Http_emptyBody = { $: 0 };
var _Http_pair = F2(function(a, b) { return { $: 0, a: a, b: b }; });

function _Http_toFormData(parts)
{
	for (var formData = new FormData(); parts.b; parts = parts.b) // WHILE_CONS
	{
		var part = parts.a;
		formData.append(part.a, part.b);
	}
	return formData;
}

var _Http_bytesToBlob = F2(function(mime, bytes)
{
	return new Blob([bytes], { type: mime });
});


// PROGRESS

function _Http_track(router, xhr, tracker)
{
	// TODO check out lengthComputable on loadstart event

	xhr.upload.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Sending({
			sent: event.loaded,
			size: event.total
		}))));
	});
	xhr.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Receiving({
			received: event.loaded,
			size: event.lengthComputable ? $elm$core$Maybe$Just(event.total) : $elm$core$Maybe$Nothing
		}))));
	});
}


function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}


// CREATE

var _Regex_never = /.^/;

var _Regex_fromStringWith = F2(function(options, string)
{
	var flags = 'g';
	if (options.multiline) { flags += 'm'; }
	if (options.caseInsensitive) { flags += 'i'; }

	try
	{
		return $elm$core$Maybe$Just(new RegExp(string, flags));
	}
	catch(error)
	{
		return $elm$core$Maybe$Nothing;
	}
});


// USE

var _Regex_contains = F2(function(re, string)
{
	return string.match(re) !== null;
});


var _Regex_findAtMost = F3(function(n, re, str)
{
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex == re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch
				? $elm$core$Maybe$Just(submatch)
				: $elm$core$Maybe$Nothing;
		}
		out.push(A4($elm$regex$Regex$Match, result[0], result.index, number, _List_fromArray(subs)));
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _List_fromArray(out);
});


var _Regex_replaceAtMost = F4(function(n, re, replacer, string)
{
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch
				? $elm$core$Maybe$Just(submatch)
				: $elm$core$Maybe$Nothing;
		}
		return replacer(A4($elm$regex$Regex$Match, match, arguments[arguments.length - 2], count, _List_fromArray(submatches)));
	}
	return string.replace(re, jsReplacer);
});

var _Regex_splitAtMost = F3(function(n, re, str)
{
	var string = str;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		var result = re.exec(string);
		if (!result) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _List_fromArray(out);
});

var _Regex_infinity = Infinity;
var $elm$core$Basics$EQ = {$: 'EQ'};
var $elm$core$Basics$GT = {$: 'GT'};
var $elm$core$Basics$LT = {$: 'LT'};
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0.a;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (node.$ === 'SubTree') {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 'Err', a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 'Failure', a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 'Field', a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 'Index', a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 'Ok', a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 'OneOf', a: a};
};
var $elm$core$Basics$False = {$: 'False'};
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 'Just', a: a};
};
var $elm$core$Maybe$Nothing = {$: 'Nothing'};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 'Field':
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 'Nothing') {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'Index':
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'OneOf':
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 'Array_elm_builtin', a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 'Leaf', a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 'SubTree', a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.nodeListSize) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.tail);
		} else {
			var treeLen = builder.nodeListSize * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.nodeList) : builder.nodeList;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.nodeListSize);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.tail);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{nodeList: nodeList, nodeListSize: (len / $elm$core$Array$branchFactor) | 0, tail: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = {$: 'True'};
var $elm$core$Result$isOk = function (result) {
	if (result.$ === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 'Normal':
			return 0;
		case 'MayStopPropagation':
			return 1;
		case 'MayPreventDefault':
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 'External', a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 'Internal', a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = function (a) {
	return {$: 'NotFound', a: a};
};
var $elm$url$Url$Http = {$: 'Http'};
var $elm$url$Url$Https = {$: 'Https'};
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {fragment: fragment, host: host, path: path, port_: port_, protocol: protocol, query: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 'Nothing') {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Http,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Https,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0.a;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = function (a) {
	return {$: 'Perform', a: a};
};
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(_Utils_Tuple0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0.a;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return _Utils_Tuple0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(_Utils_Tuple0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0.a;
		return $elm$core$Task$Perform(
			A2($elm$core$Task$map, tagger, task));
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			$elm$core$Task$Perform(
				A2($elm$core$Task$map, toMessage, task)));
	});
var $elm$browser$Browser$element = _Browser_element;
var $author$project$YearMonth$All = {$: 'All'};
var $author$project$Periode$Stopped = {$: 'Stopped'};
var $author$project$Main$ViewPeriodes = {$: 'ViewPeriodes'};
var $elm$time$Time$Posix = function (a) {
	return {$: 'Posix', a: a};
};
var $elm$time$Time$millisToPosix = $elm$time$Time$Posix;
var $author$project$Main$PermissionNone = {$: 'PermissionNone'};
var $elm$core$Result$andThen = F2(
	function (callback, result) {
		if (result.$ === 'Ok') {
			var value = result.a;
			return callback(value);
		} else {
			var msg = result.a;
			return $elm$core$Result$Err(msg);
		}
	});
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $simonh1000$elm_jwt$Jwt$TokenDecodeError = function (a) {
	return {$: 'TokenDecodeError', a: a};
};
var $elm$json$Json$Decode$decodeString = _Json_runOnString;
var $simonh1000$elm_jwt$Jwt$TokenHeaderError = {$: 'TokenHeaderError'};
var $simonh1000$elm_jwt$Jwt$TokenProcessingError = function (a) {
	return {$: 'TokenProcessingError', a: a};
};
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $elm$core$Basics$modBy = _Basics_modBy;
var $simonh1000$elm_jwt$Jwt$fixlength = function (s) {
	var _v0 = A2(
		$elm$core$Basics$modBy,
		4,
		$elm$core$String$length(s));
	switch (_v0) {
		case 0:
			return $elm$core$Result$Ok(s);
		case 2:
			return $elm$core$Result$Ok(
				$elm$core$String$concat(
					_List_fromArray(
						[s, '=='])));
		case 3:
			return $elm$core$Result$Ok(
				$elm$core$String$concat(
					_List_fromArray(
						[s, '='])));
		default:
			return $elm$core$Result$Err(
				$simonh1000$elm_jwt$Jwt$TokenProcessingError('Wrong length'));
	}
};
var $elm$core$Result$fromMaybe = F2(
	function (err, maybe) {
		if (maybe.$ === 'Just') {
			var v = maybe.a;
			return $elm$core$Result$Ok(v);
		} else {
			return $elm$core$Result$Err(err);
		}
	});
var $elm$core$Result$map = F2(
	function (func, ra) {
		if (ra.$ === 'Ok') {
			var a = ra.a;
			return $elm$core$Result$Ok(
				func(a));
		} else {
			var e = ra.a;
			return $elm$core$Result$Err(e);
		}
	});
var $elm$core$Result$map2 = F3(
	function (func, ra, rb) {
		if (ra.$ === 'Err') {
			var x = ra.a;
			return $elm$core$Result$Err(x);
		} else {
			var a = ra.a;
			if (rb.$ === 'Err') {
				var x = rb.a;
				return $elm$core$Result$Err(x);
			} else {
				var b = rb.a;
				return $elm$core$Result$Ok(
					A2(func, a, b));
			}
		}
	});
var $elm$core$Result$mapError = F2(
	function (f, result) {
		if (result.$ === 'Ok') {
			var v = result.a;
			return $elm$core$Result$Ok(v);
		} else {
			var e = result.a;
			return $elm$core$Result$Err(
				f(e));
		}
	});
var $elm$bytes$Bytes$Encode$getWidth = function (builder) {
	switch (builder.$) {
		case 'I8':
			return 1;
		case 'I16':
			return 2;
		case 'I32':
			return 4;
		case 'U8':
			return 1;
		case 'U16':
			return 2;
		case 'U32':
			return 4;
		case 'F32':
			return 4;
		case 'F64':
			return 8;
		case 'Seq':
			var w = builder.a;
			return w;
		case 'Utf8':
			var w = builder.a;
			return w;
		default:
			var bs = builder.a;
			return _Bytes_width(bs);
	}
};
var $elm$bytes$Bytes$LE = {$: 'LE'};
var $elm$bytes$Bytes$Encode$write = F3(
	function (builder, mb, offset) {
		switch (builder.$) {
			case 'I8':
				var n = builder.a;
				return A3(_Bytes_write_i8, mb, offset, n);
			case 'I16':
				var e = builder.a;
				var n = builder.b;
				return A4(
					_Bytes_write_i16,
					mb,
					offset,
					n,
					_Utils_eq(e, $elm$bytes$Bytes$LE));
			case 'I32':
				var e = builder.a;
				var n = builder.b;
				return A4(
					_Bytes_write_i32,
					mb,
					offset,
					n,
					_Utils_eq(e, $elm$bytes$Bytes$LE));
			case 'U8':
				var n = builder.a;
				return A3(_Bytes_write_u8, mb, offset, n);
			case 'U16':
				var e = builder.a;
				var n = builder.b;
				return A4(
					_Bytes_write_u16,
					mb,
					offset,
					n,
					_Utils_eq(e, $elm$bytes$Bytes$LE));
			case 'U32':
				var e = builder.a;
				var n = builder.b;
				return A4(
					_Bytes_write_u32,
					mb,
					offset,
					n,
					_Utils_eq(e, $elm$bytes$Bytes$LE));
			case 'F32':
				var e = builder.a;
				var n = builder.b;
				return A4(
					_Bytes_write_f32,
					mb,
					offset,
					n,
					_Utils_eq(e, $elm$bytes$Bytes$LE));
			case 'F64':
				var e = builder.a;
				var n = builder.b;
				return A4(
					_Bytes_write_f64,
					mb,
					offset,
					n,
					_Utils_eq(e, $elm$bytes$Bytes$LE));
			case 'Seq':
				var bs = builder.b;
				return A3($elm$bytes$Bytes$Encode$writeSequence, bs, mb, offset);
			case 'Utf8':
				var s = builder.b;
				return A3(_Bytes_write_string, mb, offset, s);
			default:
				var bs = builder.a;
				return A3(_Bytes_write_bytes, mb, offset, bs);
		}
	});
var $elm$bytes$Bytes$Encode$writeSequence = F3(
	function (builders, mb, offset) {
		writeSequence:
		while (true) {
			if (!builders.b) {
				return offset;
			} else {
				var b = builders.a;
				var bs = builders.b;
				var $temp$builders = bs,
					$temp$mb = mb,
					$temp$offset = A3($elm$bytes$Bytes$Encode$write, b, mb, offset);
				builders = $temp$builders;
				mb = $temp$mb;
				offset = $temp$offset;
				continue writeSequence;
			}
		}
	});
var $elm$bytes$Bytes$Decode$decode = F2(
	function (_v0, bs) {
		var decoder = _v0.a;
		return A2(_Bytes_decode, decoder, bs);
	});
var $elm$bytes$Bytes$Decode$Decoder = function (a) {
	return {$: 'Decoder', a: a};
};
var $elm$bytes$Bytes$Decode$string = function (n) {
	return $elm$bytes$Bytes$Decode$Decoder(
		_Bytes_read_string(n));
};
var $elm$bytes$Bytes$Encode$encode = _Bytes_encode;
var $elm$bytes$Bytes$BE = {$: 'BE'};
var $danfishgold$base64_bytes$Encode$isValidChar = function (c) {
	if ($elm$core$Char$isAlphaNum(c)) {
		return true;
	} else {
		switch (c.valueOf()) {
			case '+':
				return true;
			case '/':
				return true;
			default:
				return false;
		}
	}
};
var $elm$core$Bitwise$or = _Bitwise_or;
var $elm$bytes$Bytes$Encode$Seq = F2(
	function (a, b) {
		return {$: 'Seq', a: a, b: b};
	});
var $elm$bytes$Bytes$Encode$getWidths = F2(
	function (width, builders) {
		getWidths:
		while (true) {
			if (!builders.b) {
				return width;
			} else {
				var b = builders.a;
				var bs = builders.b;
				var $temp$width = width + $elm$bytes$Bytes$Encode$getWidth(b),
					$temp$builders = bs;
				width = $temp$width;
				builders = $temp$builders;
				continue getWidths;
			}
		}
	});
var $elm$bytes$Bytes$Encode$sequence = function (builders) {
	return A2(
		$elm$bytes$Bytes$Encode$Seq,
		A2($elm$bytes$Bytes$Encode$getWidths, 0, builders),
		builders);
};
var $elm$core$Bitwise$shiftLeftBy = _Bitwise_shiftLeftBy;
var $elm$core$Bitwise$shiftRightBy = _Bitwise_shiftRightBy;
var $elm$core$Basics$ge = _Utils_ge;
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $danfishgold$base64_bytes$Encode$unsafeConvertChar = function (_char) {
	var key = $elm$core$Char$toCode(_char);
	if ((key >= 65) && (key <= 90)) {
		return key - 65;
	} else {
		if ((key >= 97) && (key <= 122)) {
			return (key - 97) + 26;
		} else {
			if ((key >= 48) && (key <= 57)) {
				return ((key - 48) + 26) + 26;
			} else {
				switch (_char.valueOf()) {
					case '+':
						return 62;
					case '/':
						return 63;
					default:
						return -1;
				}
			}
		}
	}
};
var $elm$bytes$Bytes$Encode$U16 = F2(
	function (a, b) {
		return {$: 'U16', a: a, b: b};
	});
var $elm$bytes$Bytes$Encode$unsignedInt16 = $elm$bytes$Bytes$Encode$U16;
var $elm$bytes$Bytes$Encode$U8 = function (a) {
	return {$: 'U8', a: a};
};
var $elm$bytes$Bytes$Encode$unsignedInt8 = $elm$bytes$Bytes$Encode$U8;
var $danfishgold$base64_bytes$Encode$encodeCharacters = F4(
	function (a, b, c, d) {
		if ($danfishgold$base64_bytes$Encode$isValidChar(a) && $danfishgold$base64_bytes$Encode$isValidChar(b)) {
			var n2 = $danfishgold$base64_bytes$Encode$unsafeConvertChar(b);
			var n1 = $danfishgold$base64_bytes$Encode$unsafeConvertChar(a);
			if ('=' === d.valueOf()) {
				if ('=' === c.valueOf()) {
					var n = (n1 << 18) | (n2 << 12);
					var b1 = n >> 16;
					return $elm$core$Maybe$Just(
						$elm$bytes$Bytes$Encode$unsignedInt8(b1));
				} else {
					if ($danfishgold$base64_bytes$Encode$isValidChar(c)) {
						var n3 = $danfishgold$base64_bytes$Encode$unsafeConvertChar(c);
						var n = ((n1 << 18) | (n2 << 12)) | (n3 << 6);
						var combined = n >> 8;
						return $elm$core$Maybe$Just(
							A2($elm$bytes$Bytes$Encode$unsignedInt16, $elm$bytes$Bytes$BE, combined));
					} else {
						return $elm$core$Maybe$Nothing;
					}
				}
			} else {
				if ($danfishgold$base64_bytes$Encode$isValidChar(c) && $danfishgold$base64_bytes$Encode$isValidChar(d)) {
					var n4 = $danfishgold$base64_bytes$Encode$unsafeConvertChar(d);
					var n3 = $danfishgold$base64_bytes$Encode$unsafeConvertChar(c);
					var n = ((n1 << 18) | (n2 << 12)) | ((n3 << 6) | n4);
					var combined = n >> 8;
					var b3 = n;
					return $elm$core$Maybe$Just(
						$elm$bytes$Bytes$Encode$sequence(
							_List_fromArray(
								[
									A2($elm$bytes$Bytes$Encode$unsignedInt16, $elm$bytes$Bytes$BE, combined),
									$elm$bytes$Bytes$Encode$unsignedInt8(b3)
								])));
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$String$foldr = _String_foldr;
var $elm$core$String$toList = function (string) {
	return A3($elm$core$String$foldr, $elm$core$List$cons, _List_Nil, string);
};
var $danfishgold$base64_bytes$Encode$encodeChunks = F2(
	function (input, accum) {
		encodeChunks:
		while (true) {
			var _v0 = $elm$core$String$toList(
				A2($elm$core$String$left, 4, input));
			_v0$4:
			while (true) {
				if (!_v0.b) {
					return $elm$core$Maybe$Just(accum);
				} else {
					if (_v0.b.b) {
						if (_v0.b.b.b) {
							if (_v0.b.b.b.b) {
								if (!_v0.b.b.b.b.b) {
									var a = _v0.a;
									var _v1 = _v0.b;
									var b = _v1.a;
									var _v2 = _v1.b;
									var c = _v2.a;
									var _v3 = _v2.b;
									var d = _v3.a;
									var _v4 = A4($danfishgold$base64_bytes$Encode$encodeCharacters, a, b, c, d);
									if (_v4.$ === 'Just') {
										var enc = _v4.a;
										var $temp$input = A2($elm$core$String$dropLeft, 4, input),
											$temp$accum = A2($elm$core$List$cons, enc, accum);
										input = $temp$input;
										accum = $temp$accum;
										continue encodeChunks;
									} else {
										return $elm$core$Maybe$Nothing;
									}
								} else {
									break _v0$4;
								}
							} else {
								var a = _v0.a;
								var _v5 = _v0.b;
								var b = _v5.a;
								var _v6 = _v5.b;
								var c = _v6.a;
								var _v7 = A4(
									$danfishgold$base64_bytes$Encode$encodeCharacters,
									a,
									b,
									c,
									_Utils_chr('='));
								if (_v7.$ === 'Nothing') {
									return $elm$core$Maybe$Nothing;
								} else {
									var enc = _v7.a;
									return $elm$core$Maybe$Just(
										A2($elm$core$List$cons, enc, accum));
								}
							}
						} else {
							var a = _v0.a;
							var _v8 = _v0.b;
							var b = _v8.a;
							var _v9 = A4(
								$danfishgold$base64_bytes$Encode$encodeCharacters,
								a,
								b,
								_Utils_chr('='),
								_Utils_chr('='));
							if (_v9.$ === 'Nothing') {
								return $elm$core$Maybe$Nothing;
							} else {
								var enc = _v9.a;
								return $elm$core$Maybe$Just(
									A2($elm$core$List$cons, enc, accum));
							}
						}
					} else {
						break _v0$4;
					}
				}
			}
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $danfishgold$base64_bytes$Encode$encoder = function (string) {
	return A2(
		$elm$core$Maybe$map,
		A2($elm$core$Basics$composeR, $elm$core$List$reverse, $elm$bytes$Bytes$Encode$sequence),
		A2($danfishgold$base64_bytes$Encode$encodeChunks, string, _List_Nil));
};
var $danfishgold$base64_bytes$Encode$toBytes = function (string) {
	return A2(
		$elm$core$Maybe$map,
		$elm$bytes$Bytes$Encode$encode,
		$danfishgold$base64_bytes$Encode$encoder(string));
};
var $danfishgold$base64_bytes$Base64$toBytes = $danfishgold$base64_bytes$Encode$toBytes;
var $elm$bytes$Bytes$width = _Bytes_width;
var $danfishgold$base64_bytes$Base64$toString = function (b64String) {
	var _v0 = $danfishgold$base64_bytes$Base64$toBytes(b64String);
	if (_v0.$ === 'Nothing') {
		return $elm$core$Maybe$Nothing;
	} else {
		var b64Bytes = _v0.a;
		return A2(
			$elm$bytes$Bytes$Decode$decode,
			$elm$bytes$Bytes$Decode$string(
				$elm$bytes$Bytes$width(b64Bytes)),
			b64Bytes);
	}
};
var $elm$core$String$map = _String_map;
var $simonh1000$elm_jwt$Jwt$unurl = function () {
	var fix = function (c) {
		switch (c.valueOf()) {
			case '-':
				return _Utils_chr('+');
			case '_':
				return _Utils_chr('/');
			default:
				return c;
		}
	};
	return $elm$core$String$map(fix);
}();
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $simonh1000$elm_jwt$Jwt$getTokenParts = function (token) {
	var verifyJson = F2(
		function (errorHandler, str) {
			return A2(
				$elm$core$Result$mapError,
				errorHandler,
				A2(
					$elm$core$Result$map,
					function (_v8) {
						return str;
					},
					A2($elm$json$Json$Decode$decodeString, $elm$json$Json$Decode$value, str)));
		});
	var processor = A2(
		$elm$core$Basics$composeR,
		$simonh1000$elm_jwt$Jwt$unurl,
		A2(
			$elm$core$Basics$composeR,
			$elm$core$String$split('.'),
			$elm$core$List$map($simonh1000$elm_jwt$Jwt$fixlength)));
	var _v0 = processor(token);
	_v0$1:
	while (true) {
		if (((_v0.b && _v0.b.b) && _v0.b.b.b) && (!_v0.b.b.b.b)) {
			if (_v0.a.$ === 'Ok') {
				if (_v0.b.a.$ === 'Ok') {
					var header = _v0.a.a;
					var _v1 = _v0.b;
					var body = _v1.a.a;
					var _v2 = _v1.b;
					var header_ = A2(
						$elm$core$Result$andThen,
						verifyJson(
							function (_v3) {
								return $simonh1000$elm_jwt$Jwt$TokenHeaderError;
							}),
						A2(
							$elm$core$Result$fromMaybe,
							$simonh1000$elm_jwt$Jwt$TokenHeaderError,
							$danfishgold$base64_bytes$Base64$toString(header)));
					var body_ = A2(
						$elm$core$Result$andThen,
						verifyJson($simonh1000$elm_jwt$Jwt$TokenDecodeError),
						A2(
							$elm$core$Result$fromMaybe,
							$simonh1000$elm_jwt$Jwt$TokenProcessingError('Invalid UTF-16'),
							$danfishgold$base64_bytes$Base64$toString(body)));
					return A3(
						$elm$core$Result$map2,
						F2(
							function (a, b) {
								return _Utils_Tuple2(a, b);
							}),
						header_,
						body_);
				} else {
					break _v0$1;
				}
			} else {
				if (_v0.b.a.$ === 'Err') {
					break _v0$1;
				} else {
					var err = _v0.a.a;
					var _v6 = _v0.b;
					var _v7 = _v6.b;
					return $elm$core$Result$Err(err);
				}
			}
		} else {
			return $elm$core$Result$Err(
				$simonh1000$elm_jwt$Jwt$TokenProcessingError('Token has invalid shape'));
		}
	}
	var _v4 = _v0.b;
	var err = _v4.a.a;
	var _v5 = _v4.b;
	return $elm$core$Result$Err(err);
};
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $simonh1000$elm_jwt$Jwt$decodeToken = F2(
	function (dec, token) {
		return A2(
			$elm$core$Result$andThen,
			A2(
				$elm$core$Basics$composeR,
				$elm$json$Json$Decode$decodeString(dec),
				$elm$core$Result$mapError($simonh1000$elm_jwt$Jwt$TokenDecodeError)),
			A2(
				$elm$core$Result$map,
				$elm$core$Tuple$second,
				$simonh1000$elm_jwt$Jwt$getTokenParts(token)));
	});
var $elm$json$Json$Decode$field = _Json_decodeField;
var $author$project$Main$PermissionRead = {$: 'PermissionRead'};
var $author$project$Main$PermissionWrite = {$: 'PermissionWrite'};
var $elm$core$String$trim = _String_trim;
var $author$project$Main$permissionFromString = function (permStr) {
	var _v0 = $elm$core$String$trim(permStr);
	switch (_v0) {
		case 'write':
			return $author$project$Main$PermissionWrite;
		case 'read':
			return $author$project$Main$PermissionRead;
		default:
			return $author$project$Main$PermissionNone;
	}
};
var $elm$json$Json$Decode$string = _Json_decodeString;
var $elm$core$Result$withDefault = F2(
	function (def, result) {
		if (result.$ === 'Ok') {
			var a = result.a;
			return a;
		} else {
			return def;
		}
	});
var $author$project$Main$permissionFromJWT = function (token) {
	var decoder = A2($elm$json$Json$Decode$field, 'level', $elm$json$Json$Decode$string);
	return A2(
		$elm$core$Result$withDefault,
		$author$project$Main$PermissionNone,
		A2(
			$elm$core$Result$andThen,
			A2($elm$core$Basics$composeR, $author$project$Main$permissionFromString, $elm$core$Result$Ok),
			A2($simonh1000$elm_jwt$Jwt$decodeToken, decoder, token)));
};
var $author$project$Main$ReceiveState = function (a) {
	return {$: 'ReceiveState', a: a};
};
var $elm$http$Http$BadStatus_ = F2(
	function (a, b) {
		return {$: 'BadStatus_', a: a, b: b};
	});
var $elm$http$Http$BadUrl_ = function (a) {
	return {$: 'BadUrl_', a: a};
};
var $elm$http$Http$GoodStatus_ = F2(
	function (a, b) {
		return {$: 'GoodStatus_', a: a, b: b};
	});
var $elm$http$Http$NetworkError_ = {$: 'NetworkError_'};
var $elm$http$Http$Receiving = function (a) {
	return {$: 'Receiving', a: a};
};
var $elm$http$Http$Sending = function (a) {
	return {$: 'Sending', a: a};
};
var $elm$http$Http$Timeout_ = {$: 'Timeout_'};
var $elm$core$Dict$RBEmpty_elm_builtin = {$: 'RBEmpty_elm_builtin'};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Maybe$isJust = function (maybe) {
	if (maybe.$ === 'Just') {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1.$) {
					case 'LT':
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 'EQ':
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$Black = {$: 'Black'};
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: 'RBNode_elm_builtin', a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = {$: 'Red'};
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Red')) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) && (left.d.$ === 'RBNode_elm_builtin')) && (left.d.a.$ === 'Red')) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1.$) {
				case 'LT':
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 'EQ':
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === 'RBNode_elm_builtin') && (_v0.a.$ === 'Red')) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.e.d.$ === 'RBNode_elm_builtin') && (dict.e.d.a.$ === 'Red')) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				$elm$core$Dict$Red,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr.$ === 'Black') {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.d.d.$ === 'RBNode_elm_builtin') && (dict.d.d.a.$ === 'Red')) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				$elm$core$Dict$Red,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr.$ === 'Black') {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Black')) {
					if (right.d.$ === 'RBNode_elm_builtin') {
						if (right.d.a.$ === 'Black') {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor.$ === 'Black') {
			if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === 'RBNode_elm_builtin') {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Black')) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === 'RBNode_elm_builtin') {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === 'RBNode_elm_builtin') {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === 'RBNode_elm_builtin') {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === 'RBNode_elm_builtin') && (_v0.a.$ === 'Red')) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (_v0.$ === 'Just') {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $elm$http$Http$expectStringResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'',
			$elm$core$Basics$identity,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $elm$http$Http$BadBody = function (a) {
	return {$: 'BadBody', a: a};
};
var $elm$http$Http$BadStatus = function (a) {
	return {$: 'BadStatus', a: a};
};
var $elm$http$Http$BadUrl = function (a) {
	return {$: 'BadUrl', a: a};
};
var $elm$http$Http$NetworkError = {$: 'NetworkError'};
var $elm$http$Http$Timeout = {$: 'Timeout'};
var $elm$http$Http$resolve = F2(
	function (toResult, response) {
		switch (response.$) {
			case 'BadUrl_':
				var url = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadUrl(url));
			case 'Timeout_':
				return $elm$core$Result$Err($elm$http$Http$Timeout);
			case 'NetworkError_':
				return $elm$core$Result$Err($elm$http$Http$NetworkError);
			case 'BadStatus_':
				var metadata = response.a;
				return $elm$core$Result$Err(
					$elm$http$Http$BadStatus(metadata.statusCode));
			default:
				var body = response.b;
				return A2(
					$elm$core$Result$mapError,
					$elm$http$Http$BadBody,
					toResult(body));
		}
	});
var $elm$http$Http$expectJson = F2(
	function (toMsg, decoder) {
		return A2(
			$elm$http$Http$expectStringResponse,
			toMsg,
			$elm$http$Http$resolve(
				function (string) {
					return A2(
						$elm$core$Result$mapError,
						$elm$json$Json$Decode$errorToString,
						A2($elm$json$Json$Decode$decodeString, decoder, string));
				}));
	});
var $elm$http$Http$emptyBody = _Http_emptyBody;
var $elm$http$Http$Request = function (a) {
	return {$: 'Request', a: a};
};
var $elm$http$Http$State = F2(
	function (reqs, subs) {
		return {reqs: reqs, subs: subs};
	});
var $elm$http$Http$init = $elm$core$Task$succeed(
	A2($elm$http$Http$State, $elm$core$Dict$empty, _List_Nil));
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$http$Http$updateReqs = F3(
	function (router, cmds, reqs) {
		updateReqs:
		while (true) {
			if (!cmds.b) {
				return $elm$core$Task$succeed(reqs);
			} else {
				var cmd = cmds.a;
				var otherCmds = cmds.b;
				if (cmd.$ === 'Cancel') {
					var tracker = cmd.a;
					var _v2 = A2($elm$core$Dict$get, tracker, reqs);
					if (_v2.$ === 'Nothing') {
						var $temp$router = router,
							$temp$cmds = otherCmds,
							$temp$reqs = reqs;
						router = $temp$router;
						cmds = $temp$cmds;
						reqs = $temp$reqs;
						continue updateReqs;
					} else {
						var pid = _v2.a;
						return A2(
							$elm$core$Task$andThen,
							function (_v3) {
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A2($elm$core$Dict$remove, tracker, reqs));
							},
							$elm$core$Process$kill(pid));
					}
				} else {
					var req = cmd.a;
					return A2(
						$elm$core$Task$andThen,
						function (pid) {
							var _v4 = req.tracker;
							if (_v4.$ === 'Nothing') {
								return A3($elm$http$Http$updateReqs, router, otherCmds, reqs);
							} else {
								var tracker = _v4.a;
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A3($elm$core$Dict$insert, tracker, pid, reqs));
							}
						},
						$elm$core$Process$spawn(
							A3(
								_Http_toTask,
								router,
								$elm$core$Platform$sendToApp(router),
								req)));
				}
			}
		}
	});
var $elm$http$Http$onEffects = F4(
	function (router, cmds, subs, state) {
		return A2(
			$elm$core$Task$andThen,
			function (reqs) {
				return $elm$core$Task$succeed(
					A2($elm$http$Http$State, reqs, subs));
			},
			A3($elm$http$Http$updateReqs, router, cmds, state.reqs));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (_v0.$ === 'Just') {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$http$Http$maybeSend = F4(
	function (router, desiredTracker, progress, _v0) {
		var actualTracker = _v0.a;
		var toMsg = _v0.b;
		return _Utils_eq(desiredTracker, actualTracker) ? $elm$core$Maybe$Just(
			A2(
				$elm$core$Platform$sendToApp,
				router,
				toMsg(progress))) : $elm$core$Maybe$Nothing;
	});
var $elm$http$Http$onSelfMsg = F3(
	function (router, _v0, state) {
		var tracker = _v0.a;
		var progress = _v0.b;
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$filterMap,
					A3($elm$http$Http$maybeSend, router, tracker, progress),
					state.subs)));
	});
var $elm$http$Http$Cancel = function (a) {
	return {$: 'Cancel', a: a};
};
var $elm$http$Http$cmdMap = F2(
	function (func, cmd) {
		if (cmd.$ === 'Cancel') {
			var tracker = cmd.a;
			return $elm$http$Http$Cancel(tracker);
		} else {
			var r = cmd.a;
			return $elm$http$Http$Request(
				{
					allowCookiesFromOtherDomains: r.allowCookiesFromOtherDomains,
					body: r.body,
					expect: A2(_Http_mapExpect, func, r.expect),
					headers: r.headers,
					method: r.method,
					timeout: r.timeout,
					tracker: r.tracker,
					url: r.url
				});
		}
	});
var $elm$http$Http$MySub = F2(
	function (a, b) {
		return {$: 'MySub', a: a, b: b};
	});
var $elm$http$Http$subMap = F2(
	function (func, _v0) {
		var tracker = _v0.a;
		var toMsg = _v0.b;
		return A2(
			$elm$http$Http$MySub,
			tracker,
			A2($elm$core$Basics$composeR, toMsg, func));
	});
_Platform_effectManagers['Http'] = _Platform_createManager($elm$http$Http$init, $elm$http$Http$onEffects, $elm$http$Http$onSelfMsg, $elm$http$Http$cmdMap, $elm$http$Http$subMap);
var $elm$http$Http$command = _Platform_leaf('Http');
var $elm$http$Http$subscription = _Platform_leaf('Http');
var $elm$http$Http$request = function (r) {
	return $elm$http$Http$command(
		$elm$http$Http$Request(
			{allowCookiesFromOtherDomains: false, body: r.body, expect: r.expect, headers: r.headers, method: r.method, timeout: r.timeout, tracker: r.tracker, url: r.url}));
};
var $elm$http$Http$get = function (r) {
	return $elm$http$Http$request(
		{body: $elm$http$Http$emptyBody, expect: r.expect, headers: _List_Nil, method: 'GET', timeout: $elm$core$Maybe$Nothing, tracker: $elm$core$Maybe$Nothing, url: r.url});
};
var $author$project$Periode$ServerState = F4(
	function (running, start, comment, periodes) {
		return {comment: comment, periodes: periodes, running: running, start: start};
	});
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$custom = $elm$json$Json$Decode$map2($elm$core$Basics$apR);
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optionalDecoder = F3(
	function (path, valDecoder, fallback) {
		var nullOr = function (decoder) {
			return $elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						decoder,
						$elm$json$Json$Decode$null(fallback)
					]));
		};
		var handleResult = function (input) {
			var _v0 = A2(
				$elm$json$Json$Decode$decodeValue,
				A2($elm$json$Json$Decode$at, path, $elm$json$Json$Decode$value),
				input);
			if (_v0.$ === 'Ok') {
				var rawValue = _v0.a;
				var _v1 = A2(
					$elm$json$Json$Decode$decodeValue,
					nullOr(valDecoder),
					rawValue);
				if (_v1.$ === 'Ok') {
					var finalResult = _v1.a;
					return $elm$json$Json$Decode$succeed(finalResult);
				} else {
					return A2(
						$elm$json$Json$Decode$at,
						path,
						nullOr(valDecoder));
				}
			} else {
				return $elm$json$Json$Decode$succeed(fallback);
			}
		};
		return A2($elm$json$Json$Decode$andThen, handleResult, $elm$json$Json$Decode$value);
	});
var $NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optional = F4(
	function (key, valDecoder, fallback, decoder) {
		return A2(
			$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$custom,
			A3(
				$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optionalDecoder,
				_List_fromArray(
					[key]),
				valDecoder,
				fallback),
			decoder);
	});
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$Periode$Periode = F4(
	function (id, start, duration, comment) {
		return {comment: comment, duration: duration, id: id, start: start};
	});
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $ianmackenzie$elm_units$Quantity$Quantity = function (a) {
	return {$: 'Quantity', a: a};
};
var $ianmackenzie$elm_units$Duration$seconds = function (numSeconds) {
	return $ianmackenzie$elm_units$Quantity$Quantity(numSeconds);
};
var $author$project$Periode$durationDecoder = A2(
	$elm$json$Json$Decode$map,
	function (n) {
		return $ianmackenzie$elm_units$Duration$seconds(n);
	},
	$elm$json$Json$Decode$int);
var $author$project$Periode$ID = function (a) {
	return {$: 'ID', a: a};
};
var $author$project$Periode$idDecoder = A2($elm$json$Json$Decode$map, $author$project$Periode$ID, $elm$json$Json$Decode$int);
var $NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required = F3(
	function (key, valDecoder, decoder) {
		return A2(
			$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$custom,
			A2($elm$json$Json$Decode$field, key, valDecoder),
			decoder);
	});
var $author$project$Periode$timeDecoder = A2(
	$elm$json$Json$Decode$map,
	function (n) {
		return $elm$time$Time$millisToPosix(n * 1000);
	},
	$elm$json$Json$Decode$int);
var $author$project$Periode$periodeDecoder = A4(
	$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optional,
	'comment',
	$elm$json$Json$Decode$string,
	'',
	A3(
		$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
		'duration',
		$author$project$Periode$durationDecoder,
		A3(
			$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
			'start',
			$author$project$Periode$timeDecoder,
			A3(
				$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
				'id',
				$author$project$Periode$idDecoder,
				$elm$json$Json$Decode$succeed($author$project$Periode$Periode)))));
var $author$project$Periode$periodeListDecoder = $elm$json$Json$Decode$list($author$project$Periode$periodeDecoder);
var $author$project$Periode$Started = F2(
	function (a, b) {
		return {$: 'Started', a: a, b: b};
	});
var $author$project$Periode$serverStateToState = function (data) {
	var current = data.running ? A2($author$project$Periode$Started, data.start, data.comment) : $author$project$Periode$Stopped;
	return {current: current, periodes: data.periodes};
};
var $author$project$Periode$stateDecoder = A2(
	$elm$json$Json$Decode$map,
	$author$project$Periode$serverStateToState,
	A3(
		$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
		'periodes',
		$author$project$Periode$periodeListDecoder,
		A4(
			$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optional,
			'comment',
			$elm$json$Json$Decode$string,
			'',
			A3(
				$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
				'start',
				$author$project$Periode$timeDecoder,
				A3(
					$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
					'running',
					$elm$json$Json$Decode$bool,
					$elm$json$Json$Decode$succeed($author$project$Periode$ServerState))))));
var $author$project$Periode$fetch = function (result) {
	return $elm$http$Http$get(
		{
			expect: A2($elm$http$Http$expectJson, result, $author$project$Periode$stateDecoder),
			url: '/api/periode'
		});
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Main$updateStateIfPermission = function (perm) {
	if (perm.$ === 'PermissionNone') {
		return $elm$core$Platform$Cmd$none;
	} else {
		return $author$project$Periode$fetch($author$project$Main$ReceiveState);
	}
};
var $author$project$Main$init = function (token) {
	var permission = $author$project$Main$permissionFromJWT(token);
	return _Utils_Tuple2(
		{
			current: $author$project$Periode$Stopped,
			currentTime: $elm$time$Time$millisToPosix(0),
			errMsg: $elm$core$Maybe$Nothing,
			formComment: '',
			formInsert: $elm$core$Maybe$Nothing,
			formPassword: '',
			formYearMonth: $author$project$YearMonth$All,
			periodes: _List_Nil,
			permission: permission,
			viewBody: $author$project$Main$ViewPeriodes
		},
		$author$project$Main$updateStateIfPermission(permission));
};
var $author$project$Main$BrowserTick = function (a) {
	return {$: 'BrowserTick', a: a};
};
var $author$project$Main$UpdateDatePicker = function (a) {
	return {$: 'UpdateDatePicker', a: a};
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $mercurymedia$elm_datetime_picker$SingleDatePicker$AlwaysVisible = function (a) {
	return {$: 'AlwaysVisible', a: a};
};
var $elm$time$Time$Mon = {$: 'Mon'};
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$dayToNameString = function (day) {
	switch (day.$) {
		case 'Mon':
			return 'Mo';
		case 'Tue':
			return 'Tu';
		case 'Wed':
			return 'We';
		case 'Thu':
			return 'Th';
		case 'Fri':
			return 'Fr';
		case 'Sat':
			return 'Sa';
		default:
			return 'Su';
	}
};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$defaultTimePickerSettings = {
	allowedTimesOfDay: F2(
		function (_v0, _v1) {
			return {endHour: 23, endMinute: 59, startHour: 0, startMinute: 0};
		}),
	timeStringFn: F2(
		function (_v2, _v3) {
			return '';
		})
};
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$monthToNameString = function (month) {
	switch (month.$) {
		case 'Jan':
			return 'Jan';
		case 'Feb':
			return 'Feb';
		case 'Mar':
			return 'Mar';
		case 'Apr':
			return 'Apr';
		case 'May':
			return 'May';
		case 'Jun':
			return 'Jun';
		case 'Jul':
			return 'Jul';
		case 'Aug':
			return 'Aug';
		case 'Sep':
			return 'Sep';
		case 'Oct':
			return 'Oct';
		case 'Nov':
			return 'Nov';
		default:
			return 'Dec';
	}
};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$defaultSettings = F2(
	function (zone, internalMsg) {
		return {
			dateStringFn: F2(
				function (_v0, _v1) {
					return '';
				}),
			firstWeekDay: $elm$time$Time$Mon,
			focusedDate: $elm$core$Maybe$Nothing,
			formattedDay: $mercurymedia$elm_datetime_picker$DatePicker$Utilities$dayToNameString,
			formattedMonth: $mercurymedia$elm_datetime_picker$DatePicker$Utilities$monthToNameString,
			internalMsg: internalMsg,
			isDayDisabled: F2(
				function (_v2, _v3) {
					return false;
				}),
			timePickerVisibility: $mercurymedia$elm_datetime_picker$SingleDatePicker$AlwaysVisible($mercurymedia$elm_datetime_picker$SingleDatePicker$defaultTimePickerSettings),
			zone: zone
		};
	});
var $elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 'Every', a: a, b: b};
	});
var $elm$time$Time$State = F2(
	function (taggers, processes) {
		return {processes: processes, taggers: taggers};
	});
var $elm$time$Time$init = $elm$core$Task$succeed(
	A2($elm$time$Time$State, $elm$core$Dict$empty, $elm$core$Dict$empty));
var $elm$time$Time$addMySub = F2(
	function (_v0, state) {
		var interval = _v0.a;
		var tagger = _v0.b;
		var _v1 = A2($elm$core$Dict$get, interval, state);
		if (_v1.$ === 'Nothing') {
			return A3(
				$elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				interval,
				A2($elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$time$Time$Name = function (a) {
	return {$: 'Name', a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 'Offset', a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 'Zone', a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$setInterval = _Time_setInterval;
var $elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return $elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = $elm$core$Process$spawn(
				A2(
					$elm$time$Time$setInterval,
					interval,
					A2($elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					$elm$time$Time$spawnHelp,
					router,
					rest,
					A3($elm$core$Dict$insert, interval, id, processes));
			};
			return A2($elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var $elm$time$Time$onEffects = F3(
	function (router, subs, _v0) {
		var processes = _v0.processes;
		var rightStep = F3(
			function (_v6, id, _v7) {
				var spawns = _v7.a;
				var existing = _v7.b;
				var kills = _v7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						$elm$core$Task$andThen,
						function (_v5) {
							return kills;
						},
						$elm$core$Process$kill(id)));
			});
		var newTaggers = A3($elm$core$List$foldl, $elm$time$Time$addMySub, $elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _v4) {
				var spawns = _v4.a;
				var existing = _v4.b;
				var kills = _v4.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _v3) {
				var spawns = _v3.a;
				var existing = _v3.b;
				var kills = _v3.c;
				return _Utils_Tuple3(
					spawns,
					A3($elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _v1 = A6(
			$elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				$elm$core$Dict$empty,
				$elm$core$Task$succeed(_Utils_Tuple0)));
		var spawnList = _v1.a;
		var existingDict = _v1.b;
		var killTask = _v1.c;
		return A2(
			$elm$core$Task$andThen,
			function (newProcesses) {
				return $elm$core$Task$succeed(
					A2($elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _v0 = A2($elm$core$Dict$get, interval, state.taggers);
		if (_v0.$ === 'Nothing') {
			return $elm$core$Task$succeed(state);
		} else {
			var taggers = _v0.a;
			var tellTaggers = function (time) {
				return $elm$core$Task$sequence(
					A2(
						$elm$core$List$map,
						function (tagger) {
							return A2(
								$elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$succeed(state);
				},
				A2($elm$core$Task$andThen, tellTaggers, $elm$time$Time$now));
		}
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$time$Time$subMap = F2(
	function (f, _v0) {
		var interval = _v0.a;
		var tagger = _v0.b;
		return A2(
			$elm$time$Time$Every,
			interval,
			A2($elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager($elm$time$Time$init, $elm$time$Time$onEffects, $elm$time$Time$onSelfMsg, 0, $elm$time$Time$subMap);
var $elm$time$Time$subscription = _Platform_leaf('Time');
var $elm$time$Time$every = F2(
	function (interval, tagger) {
		return $elm$time$Time$subscription(
			A2($elm$time$Time$Every, interval, tagger));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$Closed = {$: 'Closed'};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker = function (a) {
	return {$: 'DatePicker', a: a};
};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$init = $mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
	{hovered: $elm$core$Maybe$Nothing, selectionTuple: $elm$core$Maybe$Nothing, status: $mercurymedia$elm_datetime_picker$SingleDatePicker$Closed, viewOffset: 0});
var $author$project$Main$emptyInsert = function (currentTime) {
	return {error: $elm$core$Maybe$Nothing, formComment: '', formDuration: '', picker: $mercurymedia$elm_datetime_picker$SingleDatePicker$init, start: currentTime};
};
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Main$insertForm = function (model) {
	return A2(
		$elm$core$Maybe$withDefault,
		$author$project$Main$emptyInsert(model.currentTime),
		model.formInsert);
};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$Close = {$: 'Close'};
var $elm$json$Json$Decode$fail = _Json_fail;
var $elm$json$Json$Decode$lazy = function (thunk) {
	return A2(
		$elm$json$Json$Decode$andThen,
		thunk,
		$elm$json$Json$Decode$succeed(_Utils_Tuple0));
};
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$eventIsOutsideComponent = function (componentId) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$andThen,
				function (id) {
					return _Utils_eq(componentId, id) ? $elm$json$Json$Decode$succeed(false) : $elm$json$Json$Decode$fail('check parent node');
				},
				A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string)),
				$elm$json$Json$Decode$lazy(
				function (_v0) {
					return A2(
						$elm$json$Json$Decode$field,
						'parentNode',
						$mercurymedia$elm_datetime_picker$DatePicker$Utilities$eventIsOutsideComponent(componentId));
				}),
				$elm$json$Json$Decode$succeed(true)
			]));
};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$Open = F2(
	function (a, b) {
		return {$: 'Open', a: a, b: b};
	});
var $elm$core$Basics$not = _Basics_not;
var $elm$time$Time$flooredDiv = F2(
	function (numerator, denominator) {
		return $elm$core$Basics$floor(numerator / denominator);
	});
var $elm$time$Time$posixToMillis = function (_v0) {
	var millis = _v0.a;
	return millis;
};
var $elm$time$Time$toAdjustedMinutesHelp = F3(
	function (defaultOffset, posixMinutes, eras) {
		toAdjustedMinutesHelp:
		while (true) {
			if (!eras.b) {
				return posixMinutes + defaultOffset;
			} else {
				var era = eras.a;
				var olderEras = eras.b;
				if (_Utils_cmp(era.start, posixMinutes) < 0) {
					return posixMinutes + era.offset;
				} else {
					var $temp$defaultOffset = defaultOffset,
						$temp$posixMinutes = posixMinutes,
						$temp$eras = olderEras;
					defaultOffset = $temp$defaultOffset;
					posixMinutes = $temp$posixMinutes;
					eras = $temp$eras;
					continue toAdjustedMinutesHelp;
				}
			}
		}
	});
var $elm$time$Time$toAdjustedMinutes = F2(
	function (_v0, time) {
		var defaultOffset = _v0.a;
		var eras = _v0.b;
		return A3(
			$elm$time$Time$toAdjustedMinutesHelp,
			defaultOffset,
			A2(
				$elm$time$Time$flooredDiv,
				$elm$time$Time$posixToMillis(time),
				60000),
			eras);
	});
var $elm$time$Time$toHour = F2(
	function (zone, time) {
		return A2(
			$elm$core$Basics$modBy,
			24,
			A2(
				$elm$time$Time$flooredDiv,
				A2($elm$time$Time$toAdjustedMinutes, zone, time),
				60));
	});
var $elm$time$Time$toMinute = F2(
	function (zone, time) {
		return A2(
			$elm$core$Basics$modBy,
			60,
			A2($elm$time$Time$toAdjustedMinutes, zone, time));
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$timeOfDayFromPosix = F2(
	function (zone, posix) {
		return _Utils_Tuple2(
			A2($elm$time$Time$toHour, zone, posix),
			A2($elm$time$Time$toMinute, zone, posix));
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$posixWithinPickerDayBoundaries = F3(
	function (zone, pickerDay, selection) {
		var _v0 = A2($mercurymedia$elm_datetime_picker$DatePicker$Utilities$timeOfDayFromPosix, zone, pickerDay.start);
		var startHour = _v0.a;
		var startMinute = _v0.b;
		var _v1 = A2($mercurymedia$elm_datetime_picker$DatePicker$Utilities$timeOfDayFromPosix, zone, selection);
		var selectionHour = _v1.a;
		var selectionMinute = _v1.b;
		var _v2 = A2($mercurymedia$elm_datetime_picker$DatePicker$Utilities$timeOfDayFromPosix, zone, pickerDay.end);
		var endHour = _v2.a;
		var endMinute = _v2.b;
		return (_Utils_eq(startHour, selectionHour) && (_Utils_cmp(startMinute, selectionMinute) < 1)) || (((_Utils_cmp(startHour, selectionHour) < 0) && (_Utils_cmp(selectionHour, endHour) < 0)) || (_Utils_eq(selectionHour, endHour) && (_Utils_cmp(selectionMinute, endMinute) < 1)));
	});
var $elm$core$Basics$clamp = F3(
	function (low, high, number) {
		return (_Utils_cmp(number, low) < 0) ? low : ((_Utils_cmp(number, high) > 0) ? high : number);
	});
var $justinmimbs$date$Date$RD = function (a) {
	return {$: 'RD', a: a};
};
var $elm$core$Basics$neq = _Utils_notEqual;
var $justinmimbs$date$Date$isLeapYear = function (y) {
	return ((!A2($elm$core$Basics$modBy, 4, y)) && (!(!A2($elm$core$Basics$modBy, 100, y)))) || (!A2($elm$core$Basics$modBy, 400, y));
};
var $justinmimbs$date$Date$daysBeforeMonth = F2(
	function (y, m) {
		var leapDays = $justinmimbs$date$Date$isLeapYear(y) ? 1 : 0;
		switch (m.$) {
			case 'Jan':
				return 0;
			case 'Feb':
				return 31;
			case 'Mar':
				return 59 + leapDays;
			case 'Apr':
				return 90 + leapDays;
			case 'May':
				return 120 + leapDays;
			case 'Jun':
				return 151 + leapDays;
			case 'Jul':
				return 181 + leapDays;
			case 'Aug':
				return 212 + leapDays;
			case 'Sep':
				return 243 + leapDays;
			case 'Oct':
				return 273 + leapDays;
			case 'Nov':
				return 304 + leapDays;
			default:
				return 334 + leapDays;
		}
	});
var $justinmimbs$date$Date$floorDiv = F2(
	function (a, b) {
		return $elm$core$Basics$floor(a / b);
	});
var $justinmimbs$date$Date$daysBeforeYear = function (y1) {
	var y = y1 - 1;
	var leapYears = (A2($justinmimbs$date$Date$floorDiv, y, 4) - A2($justinmimbs$date$Date$floorDiv, y, 100)) + A2($justinmimbs$date$Date$floorDiv, y, 400);
	return (365 * y) + leapYears;
};
var $justinmimbs$date$Date$daysInMonth = F2(
	function (y, m) {
		switch (m.$) {
			case 'Jan':
				return 31;
			case 'Feb':
				return $justinmimbs$date$Date$isLeapYear(y) ? 29 : 28;
			case 'Mar':
				return 31;
			case 'Apr':
				return 30;
			case 'May':
				return 31;
			case 'Jun':
				return 30;
			case 'Jul':
				return 31;
			case 'Aug':
				return 31;
			case 'Sep':
				return 30;
			case 'Oct':
				return 31;
			case 'Nov':
				return 30;
			default:
				return 31;
		}
	});
var $justinmimbs$date$Date$fromCalendarDate = F3(
	function (y, m, d) {
		return $justinmimbs$date$Date$RD(
			($justinmimbs$date$Date$daysBeforeYear(y) + A2($justinmimbs$date$Date$daysBeforeMonth, y, m)) + A3(
				$elm$core$Basics$clamp,
				1,
				A2($justinmimbs$date$Date$daysInMonth, y, m),
				d));
	});
var $justinmimbs$date$Date$toRataDie = function (_v0) {
	var rd = _v0.a;
	return rd;
};
var $justinmimbs$time_extra$Time$Extra$dateToMillis = function (date) {
	var daysSinceEpoch = $justinmimbs$date$Date$toRataDie(date) - 719163;
	return daysSinceEpoch * 86400000;
};
var $elm$time$Time$toCivil = function (minutes) {
	var rawDay = A2($elm$time$Time$flooredDiv, minutes, 60 * 24) + 719468;
	var era = (((rawDay >= 0) ? rawDay : (rawDay - 146096)) / 146097) | 0;
	var dayOfEra = rawDay - (era * 146097);
	var yearOfEra = ((((dayOfEra - ((dayOfEra / 1460) | 0)) + ((dayOfEra / 36524) | 0)) - ((dayOfEra / 146096) | 0)) / 365) | 0;
	var dayOfYear = dayOfEra - (((365 * yearOfEra) + ((yearOfEra / 4) | 0)) - ((yearOfEra / 100) | 0));
	var mp = (((5 * dayOfYear) + 2) / 153) | 0;
	var month = mp + ((mp < 10) ? 3 : (-9));
	var year = yearOfEra + (era * 400);
	return {
		day: (dayOfYear - ((((153 * mp) + 2) / 5) | 0)) + 1,
		month: month,
		year: year + ((month <= 2) ? 1 : 0)
	};
};
var $elm$time$Time$toDay = F2(
	function (zone, time) {
		return $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).day;
	});
var $elm$time$Time$Apr = {$: 'Apr'};
var $elm$time$Time$Aug = {$: 'Aug'};
var $elm$time$Time$Dec = {$: 'Dec'};
var $elm$time$Time$Feb = {$: 'Feb'};
var $elm$time$Time$Jan = {$: 'Jan'};
var $elm$time$Time$Jul = {$: 'Jul'};
var $elm$time$Time$Jun = {$: 'Jun'};
var $elm$time$Time$Mar = {$: 'Mar'};
var $elm$time$Time$May = {$: 'May'};
var $elm$time$Time$Nov = {$: 'Nov'};
var $elm$time$Time$Oct = {$: 'Oct'};
var $elm$time$Time$Sep = {$: 'Sep'};
var $elm$time$Time$toMonth = F2(
	function (zone, time) {
		var _v0 = $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).month;
		switch (_v0) {
			case 1:
				return $elm$time$Time$Jan;
			case 2:
				return $elm$time$Time$Feb;
			case 3:
				return $elm$time$Time$Mar;
			case 4:
				return $elm$time$Time$Apr;
			case 5:
				return $elm$time$Time$May;
			case 6:
				return $elm$time$Time$Jun;
			case 7:
				return $elm$time$Time$Jul;
			case 8:
				return $elm$time$Time$Aug;
			case 9:
				return $elm$time$Time$Sep;
			case 10:
				return $elm$time$Time$Oct;
			case 11:
				return $elm$time$Time$Nov;
			default:
				return $elm$time$Time$Dec;
		}
	});
var $elm$time$Time$toYear = F2(
	function (zone, time) {
		return $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).year;
	});
var $justinmimbs$date$Date$fromPosix = F2(
	function (zone, posix) {
		return A3(
			$justinmimbs$date$Date$fromCalendarDate,
			A2($elm$time$Time$toYear, zone, posix),
			A2($elm$time$Time$toMonth, zone, posix),
			A2($elm$time$Time$toDay, zone, posix));
	});
var $justinmimbs$time_extra$Time$Extra$timeFromClock = F4(
	function (hour, minute, second, millisecond) {
		return (((hour * 3600000) + (minute * 60000)) + (second * 1000)) + millisecond;
	});
var $elm$time$Time$toMillis = F2(
	function (_v0, time) {
		return A2(
			$elm$core$Basics$modBy,
			1000,
			$elm$time$Time$posixToMillis(time));
	});
var $elm$time$Time$toSecond = F2(
	function (_v0, time) {
		return A2(
			$elm$core$Basics$modBy,
			60,
			A2(
				$elm$time$Time$flooredDiv,
				$elm$time$Time$posixToMillis(time),
				1000));
	});
var $justinmimbs$time_extra$Time$Extra$timeFromPosix = F2(
	function (zone, posix) {
		return A4(
			$justinmimbs$time_extra$Time$Extra$timeFromClock,
			A2($elm$time$Time$toHour, zone, posix),
			A2($elm$time$Time$toMinute, zone, posix),
			A2($elm$time$Time$toSecond, zone, posix),
			A2($elm$time$Time$toMillis, zone, posix));
	});
var $justinmimbs$time_extra$Time$Extra$toOffset = F2(
	function (zone, posix) {
		var millis = $elm$time$Time$posixToMillis(posix);
		var localMillis = $justinmimbs$time_extra$Time$Extra$dateToMillis(
			A2($justinmimbs$date$Date$fromPosix, zone, posix)) + A2($justinmimbs$time_extra$Time$Extra$timeFromPosix, zone, posix);
		return ((localMillis - millis) / 60000) | 0;
	});
var $justinmimbs$time_extra$Time$Extra$posixFromDateTime = F3(
	function (zone, date, time) {
		var millis = $justinmimbs$time_extra$Time$Extra$dateToMillis(date) + time;
		var offset0 = A2(
			$justinmimbs$time_extra$Time$Extra$toOffset,
			zone,
			$elm$time$Time$millisToPosix(millis));
		var posix1 = $elm$time$Time$millisToPosix(millis - (offset0 * 60000));
		var offset1 = A2($justinmimbs$time_extra$Time$Extra$toOffset, zone, posix1);
		if (_Utils_eq(offset0, offset1)) {
			return posix1;
		} else {
			var posix2 = $elm$time$Time$millisToPosix(millis - (offset1 * 60000));
			var offset2 = A2($justinmimbs$time_extra$Time$Extra$toOffset, zone, posix2);
			return _Utils_eq(offset1, offset2) ? posix2 : posix1;
		}
	});
var $justinmimbs$time_extra$Time$Extra$partsToPosix = F2(
	function (zone, _v0) {
		var year = _v0.year;
		var month = _v0.month;
		var day = _v0.day;
		var hour = _v0.hour;
		var minute = _v0.minute;
		var second = _v0.second;
		var millisecond = _v0.millisecond;
		return A3(
			$justinmimbs$time_extra$Time$Extra$posixFromDateTime,
			zone,
			A3($justinmimbs$date$Date$fromCalendarDate, year, month, day),
			A4(
				$justinmimbs$time_extra$Time$Extra$timeFromClock,
				A3($elm$core$Basics$clamp, 0, 23, hour),
				A3($elm$core$Basics$clamp, 0, 59, minute),
				A3($elm$core$Basics$clamp, 0, 59, second),
				A3($elm$core$Basics$clamp, 0, 999, millisecond)));
	});
var $justinmimbs$time_extra$Time$Extra$posixToParts = F2(
	function (zone, posix) {
		return {
			day: A2($elm$time$Time$toDay, zone, posix),
			hour: A2($elm$time$Time$toHour, zone, posix),
			millisecond: A2($elm$time$Time$toMillis, zone, posix),
			minute: A2($elm$time$Time$toMinute, zone, posix),
			month: A2($elm$time$Time$toMonth, zone, posix),
			second: A2($elm$time$Time$toSecond, zone, posix),
			year: A2($elm$time$Time$toYear, zone, posix)
		};
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$setTimeOfDay = F5(
	function (zone, hour, minute, second, timeToUpdate) {
		var parts = A2($justinmimbs$time_extra$Time$Extra$posixToParts, zone, timeToUpdate);
		var newParts = _Utils_update(
			parts,
			{hour: hour, minute: minute, second: second});
		return A2($justinmimbs$time_extra$Time$Extra$partsToPosix, zone, newParts);
	});
var $mercurymedia$elm_datetime_picker$DatePicker$SingleUtilities$selectDay = F3(
	function (zone, previousSelectionTuple, selectedPickerDay) {
		if (selectedPickerDay.disabled) {
			return previousSelectionTuple;
		} else {
			if (previousSelectionTuple.$ === 'Just') {
				var _v1 = previousSelectionTuple.a;
				var previousSelection = _v1.b;
				return A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$posixWithinPickerDayBoundaries, zone, selectedPickerDay, previousSelection) ? $elm$core$Maybe$Just(
					_Utils_Tuple2(
						selectedPickerDay,
						A5(
							$mercurymedia$elm_datetime_picker$DatePicker$Utilities$setTimeOfDay,
							zone,
							A2($elm$time$Time$toHour, zone, previousSelection),
							A2($elm$time$Time$toMinute, zone, previousSelection),
							0,
							selectedPickerDay.start))) : $elm$core$Maybe$Just(
					_Utils_Tuple2(selectedPickerDay, selectedPickerDay.start));
			} else {
				return $elm$core$Maybe$Just(
					_Utils_Tuple2(selectedPickerDay, selectedPickerDay.start));
			}
		}
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$minuteBoundsForSelectedHour = F2(
	function (zone, _v0) {
		var pickerDay = _v0.a;
		var selection = _v0.b;
		var _v1 = A2($mercurymedia$elm_datetime_picker$DatePicker$Utilities$timeOfDayFromPosix, zone, pickerDay.start);
		var startBoundaryHour = _v1.a;
		var startBoundaryMinute = _v1.b;
		var _v2 = A2($mercurymedia$elm_datetime_picker$DatePicker$Utilities$timeOfDayFromPosix, zone, selection);
		var selectedHour = _v2.a;
		var selectedMinute = _v2.b;
		var earliestSelectableMinute = _Utils_eq(startBoundaryHour, selectedHour) ? startBoundaryMinute : 0;
		var _v3 = A2($mercurymedia$elm_datetime_picker$DatePicker$Utilities$timeOfDayFromPosix, zone, pickerDay.end);
		var endBoundaryHour = _v3.a;
		var endBoundaryMinute = _v3.b;
		var latestSelectableMinute = _Utils_eq(endBoundaryHour, selectedHour) ? endBoundaryMinute : 59;
		return _Utils_Tuple2(earliestSelectableMinute, latestSelectableMinute);
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$setHourNotDay = F3(
	function (zone, hour, timeToUpdate) {
		var parts = A2($justinmimbs$time_extra$Time$Extra$posixToParts, zone, timeToUpdate);
		var newParts = _Utils_update(
			parts,
			{hour: hour});
		return A2($justinmimbs$time_extra$Time$Extra$partsToPosix, zone, newParts);
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$setMinuteNotDay = F3(
	function (zone, minute, timeToUpdate) {
		var parts = A2($justinmimbs$time_extra$Time$Extra$posixToParts, zone, timeToUpdate);
		var newParts = _Utils_update(
			parts,
			{minute: minute});
		return A2($justinmimbs$time_extra$Time$Extra$partsToPosix, zone, newParts);
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$doDaysMatch = F3(
	function (zone, dateTimeOne, dateTimeTwo) {
		var twoParts = A2($justinmimbs$time_extra$Time$Extra$posixToParts, zone, dateTimeTwo);
		var oneParts = A2($justinmimbs$time_extra$Time$Extra$posixToParts, zone, dateTimeOne);
		return _Utils_eq(oneParts.day, twoParts.day) && (_Utils_eq(oneParts.month, twoParts.month) && _Utils_eq(oneParts.year, twoParts.year));
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$validSelectionOrDefault = F3(
	function (zone, _default, _v0) {
		var selectionPickerDay = _v0.a;
		var selection = _v0.b;
		var selectionDayEqualsPickerDay = A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$doDaysMatch, zone, selection, selectionPickerDay.start);
		return (A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$posixWithinPickerDayBoundaries, zone, selectionPickerDay, selection) && ((!selectionPickerDay.disabled) && selectionDayEqualsPickerDay)) ? $elm$core$Maybe$Just(
			_Utils_Tuple2(selectionPickerDay, selection)) : _default;
	});
var $mercurymedia$elm_datetime_picker$DatePicker$SingleUtilities$selectHour = F4(
	function (zone, basePickerDay, selectionTuple, newHour) {
		return A3(
			$mercurymedia$elm_datetime_picker$DatePicker$Utilities$validSelectionOrDefault,
			zone,
			selectionTuple,
			function (_v1) {
				var pickerDay = _v1.a;
				var selection = _v1.b;
				var _v2 = A2(
					$mercurymedia$elm_datetime_picker$DatePicker$Utilities$minuteBoundsForSelectedHour,
					zone,
					_Utils_Tuple2(pickerDay, selection));
				var earliestSelectableMinute = _v2.a;
				return _Utils_eq(selectionTuple, $elm$core$Maybe$Nothing) ? _Utils_Tuple2(
					pickerDay,
					A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$setMinuteNotDay, zone, earliestSelectableMinute, selection)) : ((_Utils_cmp(
					A2($elm$time$Time$toMinute, zone, selection),
					earliestSelectableMinute) < 0) ? _Utils_Tuple2(
					pickerDay,
					A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$setMinuteNotDay, zone, earliestSelectableMinute, selection)) : _Utils_Tuple2(pickerDay, selection));
			}(
				function (_v0) {
					var pickerDay = _v0.a;
					var selection = _v0.b;
					return _Utils_Tuple2(
						pickerDay,
						A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$setHourNotDay, zone, newHour, selection));
				}(
					A2(
						$elm$core$Maybe$withDefault,
						_Utils_Tuple2(basePickerDay, basePickerDay.start),
						selectionTuple))));
	});
var $mercurymedia$elm_datetime_picker$DatePicker$SingleUtilities$selectMinute = F4(
	function (zone, basePickerDay, selectionTuple, newMinute) {
		return A3(
			$mercurymedia$elm_datetime_picker$DatePicker$Utilities$validSelectionOrDefault,
			zone,
			selectionTuple,
			function (_v0) {
				var pickerDay = _v0.a;
				var selection = _v0.b;
				return _Utils_Tuple2(
					pickerDay,
					A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$setMinuteNotDay, zone, newMinute, selection));
			}(
				A2(
					$elm$core$Maybe$withDefault,
					_Utils_Tuple2(basePickerDay, basePickerDay.start),
					selectionTuple)));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$update = F3(
	function (settings, msg, _v0) {
		var model = _v0.a;
		var _v1 = model.status;
		if (_v1.$ === 'Open') {
			var timePickerVisible = _v1.a;
			var baseDay = _v1.b;
			switch (msg.$) {
				case 'NextMonth':
					return _Utils_Tuple2(
						$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
							_Utils_update(
								model,
								{viewOffset: model.viewOffset + 1})),
						$elm$core$Maybe$Nothing);
				case 'PrevMonth':
					return _Utils_Tuple2(
						$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
							_Utils_update(
								model,
								{viewOffset: model.viewOffset - 1})),
						$elm$core$Maybe$Nothing);
				case 'NextYear':
					return _Utils_Tuple2(
						$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
							_Utils_update(
								model,
								{viewOffset: model.viewOffset + 12})),
						$elm$core$Maybe$Nothing);
				case 'PrevYear':
					return _Utils_Tuple2(
						$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
							_Utils_update(
								model,
								{viewOffset: model.viewOffset - 12})),
						$elm$core$Maybe$Nothing);
				case 'SetHoveredDay':
					var pickerDay = msg.a;
					return _Utils_Tuple2(
						$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
							_Utils_update(
								model,
								{
									hovered: $elm$core$Maybe$Just(pickerDay)
								})),
						$elm$core$Maybe$Nothing);
				case 'ClearHoveredDay':
					return _Utils_Tuple2(
						$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
							_Utils_update(
								model,
								{hovered: $elm$core$Maybe$Nothing})),
						$elm$core$Maybe$Nothing);
				case 'SetDay':
					var pickerDay = msg.a;
					var _v3 = A3($mercurymedia$elm_datetime_picker$DatePicker$SingleUtilities$selectDay, settings.zone, model.selectionTuple, pickerDay);
					if (_v3.$ === 'Just') {
						var _v4 = _v3.a;
						var newPickerDay = _v4.a;
						var newSelection = _v4.b;
						return _Utils_Tuple2(
							$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
								_Utils_update(
									model,
									{
										selectionTuple: $elm$core$Maybe$Just(
											_Utils_Tuple2(newPickerDay, newSelection))
									})),
							$elm$core$Maybe$Just(newSelection));
					} else {
						return _Utils_Tuple2(
							$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
								_Utils_update(
									model,
									{selectionTuple: $elm$core$Maybe$Nothing})),
							$elm$core$Maybe$Nothing);
					}
				case 'ToggleTimePickerVisibility':
					var _v5 = settings.timePickerVisibility;
					if (_v5.$ === 'Toggleable') {
						return _Utils_Tuple2(
							$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
								_Utils_update(
									model,
									{
										status: A2($mercurymedia$elm_datetime_picker$SingleDatePicker$Open, !timePickerVisible, baseDay)
									})),
							$elm$core$Maybe$Nothing);
					} else {
						return _Utils_Tuple2(
							$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model),
							$elm$core$Maybe$Nothing);
					}
				case 'SetHour':
					var hour = msg.a;
					return A2(
						$elm$core$Maybe$withDefault,
						_Utils_Tuple2(
							$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model),
							$elm$core$Maybe$Nothing),
						A2(
							$elm$core$Maybe$map,
							function (_v6) {
								var pickerDay = _v6.a;
								var selection = _v6.b;
								return _Utils_Tuple2(
									$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
										_Utils_update(
											model,
											{
												selectionTuple: $elm$core$Maybe$Just(
													_Utils_Tuple2(pickerDay, selection))
											})),
									$elm$core$Maybe$Just(selection));
							},
							A4($mercurymedia$elm_datetime_picker$DatePicker$SingleUtilities$selectHour, settings.zone, baseDay, model.selectionTuple, hour)));
				case 'SetMinute':
					var minute = msg.a;
					return A2(
						$elm$core$Maybe$withDefault,
						_Utils_Tuple2(
							$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model),
							$elm$core$Maybe$Nothing),
						A2(
							$elm$core$Maybe$map,
							function (_v7) {
								var pickerDay = _v7.a;
								var selection = _v7.b;
								return _Utils_Tuple2(
									$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
										_Utils_update(
											model,
											{
												selectionTuple: $elm$core$Maybe$Just(
													_Utils_Tuple2(pickerDay, selection))
											})),
									$elm$core$Maybe$Just(selection));
							},
							A4($mercurymedia$elm_datetime_picker$DatePicker$SingleUtilities$selectMinute, settings.zone, baseDay, model.selectionTuple, minute)));
				default:
					return _Utils_Tuple2(
						$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
							_Utils_update(
								model,
								{status: $mercurymedia$elm_datetime_picker$SingleDatePicker$Closed})),
						$elm$core$Maybe$Nothing);
			}
		} else {
			return _Utils_Tuple2(
				$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model),
				$elm$core$Maybe$Nothing);
		}
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$clickedOutsidePicker = F4(
	function (settings, componentId, internalMsg, datePicker) {
		return A2(
			$elm$json$Json$Decode$andThen,
			function (isOutside) {
				return isOutside ? $elm$json$Json$Decode$succeed(
					internalMsg(
						A3($mercurymedia$elm_datetime_picker$SingleDatePicker$update, settings, $mercurymedia$elm_datetime_picker$SingleDatePicker$Close, datePicker))) : $elm$json$Json$Decode$fail('inside component');
			},
			A2(
				$elm$json$Json$Decode$field,
				'target',
				$mercurymedia$elm_datetime_picker$DatePicker$Utilities$eventIsOutsideComponent(componentId)));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$datePickerId = 'date-picker-component';
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $elm$browser$Browser$Events$Document = {$: 'Document'};
var $elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 'MySub', a: a, b: b, c: c};
	});
var $elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {pids: pids, subs: subs};
	});
var $elm$browser$Browser$Events$init = $elm$core$Task$succeed(
	A2($elm$browser$Browser$Events$State, _List_Nil, $elm$core$Dict$empty));
var $elm$browser$Browser$Events$nodeToKey = function (node) {
	if (node.$ === 'Document') {
		return 'd_';
	} else {
		return 'w_';
	}
};
var $elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			$elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {event: event, key: key};
	});
var $elm$browser$Browser$Events$spawn = F3(
	function (router, key, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var actualNode = function () {
			if (node.$ === 'Document') {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			$elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						$elm$core$Platform$sendToSelf,
						router,
						A2($elm$browser$Browser$Events$Event, key, event));
				}));
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _v6) {
				var deads = _v6.a;
				var lives = _v6.b;
				var news = _v6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						$elm$core$List$cons,
						A3($elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_v4, pid, _v5) {
				var deads = _v5.a;
				var lives = _v5.b;
				var news = _v5.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _v2, _v3) {
				var deads = _v3.a;
				var lives = _v3.b;
				var news = _v3.c;
				return _Utils_Tuple3(
					deads,
					A3($elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2($elm$core$List$map, $elm$browser$Browser$Events$addKey, subs);
		var _v0 = A6(
			$elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.pids,
			$elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, $elm$core$Dict$empty, _List_Nil));
		var deadPids = _v0.a;
		var livePids = _v0.b;
		var makeNewPids = _v0.c;
		return A2(
			$elm$core$Task$andThen,
			function (pids) {
				return $elm$core$Task$succeed(
					A2(
						$elm$browser$Browser$Events$State,
						newSubs,
						A2(
							$elm$core$Dict$union,
							livePids,
							$elm$core$Dict$fromList(pids))));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$sequence(makeNewPids);
				},
				$elm$core$Task$sequence(
					A2($elm$core$List$map, $elm$core$Process$kill, deadPids))));
	});
var $elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _v0, state) {
		var key = _v0.key;
		var event = _v0.event;
		var toMessage = function (_v2) {
			var subKey = _v2.a;
			var _v3 = _v2.b;
			var node = _v3.a;
			var name = _v3.b;
			var decoder = _v3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : $elm$core$Maybe$Nothing;
		};
		var messages = A2($elm$core$List$filterMap, toMessage, state.subs);
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Platform$sendToApp(router),
					messages)));
	});
var $elm$browser$Browser$Events$subMap = F2(
	function (func, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var decoder = _v0.c;
		return A3(
			$elm$browser$Browser$Events$MySub,
			node,
			name,
			A2($elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager($elm$browser$Browser$Events$init, $elm$browser$Browser$Events$onEffects, $elm$browser$Browser$Events$onSelfMsg, 0, $elm$browser$Browser$Events$subMap);
var $elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var $elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return $elm$browser$Browser$Events$subscription(
			A3($elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var $elm$browser$Browser$Events$onMouseDown = A2($elm$browser$Browser$Events$on, $elm$browser$Browser$Events$Document, 'mousedown');
var $mercurymedia$elm_datetime_picker$SingleDatePicker$subscriptions = F3(
	function (settings, internalMsg, _v0) {
		var model = _v0.a;
		var _v1 = model.status;
		if (_v1.$ === 'Open') {
			return $elm$browser$Browser$Events$onMouseDown(
				A4(
					$mercurymedia$elm_datetime_picker$SingleDatePicker$clickedOutsidePicker,
					settings,
					$mercurymedia$elm_datetime_picker$SingleDatePicker$datePickerId,
					internalMsg,
					$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model)));
		} else {
			return $elm$core$Platform$Sub$none;
		}
	});
var $justinmimbs$timezone_data$TimeZone$Specification$DateTime = F5(
	function (year, month, day, time, clock) {
		return {clock: clock, day: day, month: month, time: time, year: year};
	});
var $justinmimbs$timezone_data$TimeZone$Specification$Rules = function (a) {
	return {$: 'Rules', a: a};
};
var $justinmimbs$timezone_data$TimeZone$Specification$Save = function (a) {
	return {$: 'Save', a: a};
};
var $justinmimbs$timezone_data$TimeZone$Specification$WallClock = {$: 'WallClock'};
var $justinmimbs$timezone_data$TimeZone$Specification$Zone = F2(
	function (history, current) {
		return {current: current, history: history};
	});
var $justinmimbs$timezone_data$TimeZone$Specification$ZoneState = F2(
	function (standardOffset, zoneRules) {
		return {standardOffset: standardOffset, zoneRules: zoneRules};
	});
var $justinmimbs$timezone_data$TimeZone$maxYear = 2037;
var $justinmimbs$timezone_data$TimeZone$minYear = 1970;
var $justinmimbs$timezone_data$TimeZone$Specification$Universal = {$: 'Universal'};
var $justinmimbs$timezone_data$TimeZone$Specification$dropChangesBeforeEpoch = function (_v0) {
	dropChangesBeforeEpoch:
	while (true) {
		var initial = _v0.a;
		var changes = _v0.b;
		if (changes.b) {
			var change = changes.a;
			var rest = changes.b;
			if (change.start <= 0) {
				var $temp$_v0 = _Utils_Tuple2(change.offset, rest);
				_v0 = $temp$_v0;
				continue dropChangesBeforeEpoch;
			} else {
				return _Utils_Tuple2(initial, changes);
			}
		} else {
			return _Utils_Tuple2(initial, _List_Nil);
		}
	}
};
var $justinmimbs$timezone_data$RataDie$weekdayNumber = function (rd) {
	var _v0 = A2($elm$core$Basics$modBy, 7, rd);
	if (!_v0) {
		return 7;
	} else {
		var n = _v0;
		return n;
	}
};
var $justinmimbs$timezone_data$RataDie$weekdayToNumber = function (wd) {
	switch (wd.$) {
		case 'Mon':
			return 1;
		case 'Tue':
			return 2;
		case 'Wed':
			return 3;
		case 'Thu':
			return 4;
		case 'Fri':
			return 5;
		case 'Sat':
			return 6;
		default:
			return 7;
	}
};
var $justinmimbs$timezone_data$RataDie$floorWeekday = F2(
	function (weekday, rd) {
		var daysSincePreviousWeekday = A2(
			$elm$core$Basics$modBy,
			7,
			($justinmimbs$timezone_data$RataDie$weekdayNumber(rd) + 7) - $justinmimbs$timezone_data$RataDie$weekdayToNumber(weekday));
		return rd - daysSincePreviousWeekday;
	});
var $justinmimbs$timezone_data$RataDie$ceilingWeekday = F2(
	function (weekday, rd) {
		var floored = A2($justinmimbs$timezone_data$RataDie$floorWeekday, weekday, rd);
		return _Utils_eq(rd, floored) ? rd : (floored + 7);
	});
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $justinmimbs$timezone_data$RataDie$isLeapYear = function (y) {
	return ((!A2($elm$core$Basics$modBy, 4, y)) && (!(!A2($elm$core$Basics$modBy, 100, y)))) || (!A2($elm$core$Basics$modBy, 400, y));
};
var $justinmimbs$timezone_data$RataDie$daysBeforeMonth = F2(
	function (y, m) {
		var leapDays = $justinmimbs$timezone_data$RataDie$isLeapYear(y) ? 1 : 0;
		switch (m.$) {
			case 'Jan':
				return 0;
			case 'Feb':
				return 31;
			case 'Mar':
				return 59 + leapDays;
			case 'Apr':
				return 90 + leapDays;
			case 'May':
				return 120 + leapDays;
			case 'Jun':
				return 151 + leapDays;
			case 'Jul':
				return 181 + leapDays;
			case 'Aug':
				return 212 + leapDays;
			case 'Sep':
				return 243 + leapDays;
			case 'Oct':
				return 273 + leapDays;
			case 'Nov':
				return 304 + leapDays;
			default:
				return 334 + leapDays;
		}
	});
var $justinmimbs$timezone_data$RataDie$daysBeforeYear = function (y1) {
	var y = y1 - 1;
	var leapYears = (((y / 4) | 0) - ((y / 100) | 0)) + ((y / 400) | 0);
	return (365 * y) + leapYears;
};
var $justinmimbs$timezone_data$RataDie$dayOfMonth = F3(
	function (y, m, d) {
		return ($justinmimbs$timezone_data$RataDie$daysBeforeYear(y) + A2($justinmimbs$timezone_data$RataDie$daysBeforeMonth, y, m)) + d;
	});
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $justinmimbs$timezone_data$RataDie$daysInMonth = F2(
	function (y, m) {
		switch (m.$) {
			case 'Jan':
				return 31;
			case 'Feb':
				return $justinmimbs$timezone_data$RataDie$isLeapYear(y) ? 29 : 28;
			case 'Mar':
				return 31;
			case 'Apr':
				return 30;
			case 'May':
				return 31;
			case 'Jun':
				return 30;
			case 'Jul':
				return 31;
			case 'Aug':
				return 31;
			case 'Sep':
				return 30;
			case 'Oct':
				return 31;
			case 'Nov':
				return 30;
			default:
				return 31;
		}
	});
var $justinmimbs$timezone_data$RataDie$lastOfMonth = F2(
	function (y, m) {
		return ($justinmimbs$timezone_data$RataDie$daysBeforeYear(y) + A2($justinmimbs$timezone_data$RataDie$daysBeforeMonth, y, m)) + A2($justinmimbs$timezone_data$RataDie$daysInMonth, y, m);
	});
var $justinmimbs$timezone_data$TimeZone$Specification$minutesFromRataDie = function (rd) {
	return (rd - 719163) * 1440;
};
var $elm$core$List$sortBy = _List_sortBy;
var $justinmimbs$timezone_data$TimeZone$Specification$utcAdjustment = F2(
	function (clock, _v0) {
		var standard = _v0.standard;
		var save = _v0.save;
		switch (clock.$) {
			case 'Universal':
				return 0;
			case 'Standard':
				return 0 - standard;
			default:
				return 0 - (standard + save);
		}
	});
var $justinmimbs$timezone_data$TimeZone$Specification$minutesFromDateTime = function (_v0) {
	var year = _v0.year;
	var month = _v0.month;
	var day = _v0.day;
	var time = _v0.time;
	return $justinmimbs$timezone_data$TimeZone$Specification$minutesFromRataDie(
		A3($justinmimbs$timezone_data$RataDie$dayOfMonth, year, month, day)) + time;
};
var $justinmimbs$timezone_data$TimeZone$Specification$utcMinutesFromDateTime = F2(
	function (offset, datetime) {
		return $justinmimbs$timezone_data$TimeZone$Specification$minutesFromDateTime(datetime) + A2($justinmimbs$timezone_data$TimeZone$Specification$utcAdjustment, datetime.clock, offset);
	});
var $justinmimbs$timezone_data$TimeZone$Specification$rulesToOffsetChanges = F5(
	function (previousOffset, start, until, standardOffset, rules) {
		var transitions = A2(
			$elm$core$List$concatMap,
			function (year) {
				return A2(
					$elm$core$List$sortBy,
					function ($) {
						return $.start;
					},
					A2(
						$elm$core$List$map,
						function (rule) {
							return {
								clock: rule.clock,
								save: rule.save,
								start: $justinmimbs$timezone_data$TimeZone$Specification$minutesFromRataDie(
									function () {
										var _v2 = rule.day;
										switch (_v2.$) {
											case 'Day':
												var day = _v2.a;
												return A3($justinmimbs$timezone_data$RataDie$dayOfMonth, year, rule.month, day);
											case 'Next':
												var weekday = _v2.a;
												var after = _v2.b;
												return A2(
													$justinmimbs$timezone_data$RataDie$ceilingWeekday,
													weekday,
													A3($justinmimbs$timezone_data$RataDie$dayOfMonth, year, rule.month, after));
											case 'Prev':
												var weekday = _v2.a;
												var before = _v2.b;
												return A2(
													$justinmimbs$timezone_data$RataDie$floorWeekday,
													weekday,
													A3($justinmimbs$timezone_data$RataDie$dayOfMonth, year, rule.month, before));
											default:
												var weekday = _v2.a;
												return A2(
													$justinmimbs$timezone_data$RataDie$floorWeekday,
													weekday,
													A2($justinmimbs$timezone_data$RataDie$lastOfMonth, year, rule.month));
										}
									}()) + rule.time
							};
						},
						A2(
							$elm$core$List$filter,
							function (rule) {
								return (_Utils_cmp(rule.from, year) < 1) && (_Utils_cmp(year, rule.to) < 1);
							},
							rules)));
			},
			A2($elm$core$List$range, start.year - 1, until.year));
		var initialOffset = {save: 0, standard: standardOffset};
		var initialChange = {
			offset: standardOffset,
			start: A2($justinmimbs$timezone_data$TimeZone$Specification$utcMinutesFromDateTime, previousOffset, start)
		};
		var _v0 = A3(
			$elm$core$List$foldl,
			F2(
				function (transition, _v1) {
					var currentOffset = _v1.a;
					var changes = _v1.b;
					var newOffset = {save: transition.save, standard: standardOffset};
					if (_Utils_cmp(
						transition.start + A2($justinmimbs$timezone_data$TimeZone$Specification$utcAdjustment, transition.clock, previousOffset),
						initialChange.start) < 1) {
						var updatedInitialChange = {offset: standardOffset + transition.save, start: initialChange.start};
						return _Utils_Tuple2(
							newOffset,
							_List_fromArray(
								[updatedInitialChange]));
					} else {
						if (_Utils_cmp(
							transition.start + A2($justinmimbs$timezone_data$TimeZone$Specification$utcAdjustment, transition.clock, currentOffset),
							A2($justinmimbs$timezone_data$TimeZone$Specification$utcMinutesFromDateTime, currentOffset, until)) < 0) {
							var change = {
								offset: standardOffset + transition.save,
								start: transition.start + A2($justinmimbs$timezone_data$TimeZone$Specification$utcAdjustment, transition.clock, currentOffset)
							};
							return _Utils_Tuple2(
								newOffset,
								A2($elm$core$List$cons, change, changes));
						} else {
							return _Utils_Tuple2(currentOffset, changes);
						}
					}
				}),
			_Utils_Tuple2(
				initialOffset,
				_List_fromArray(
					[initialChange])),
			transitions);
		var nextOffset = _v0.a;
		var descendingChanges = _v0.b;
		return _Utils_Tuple2(
			$elm$core$List$reverse(descendingChanges),
			nextOffset);
	});
var $justinmimbs$timezone_data$TimeZone$Specification$stateToOffsetChanges = F4(
	function (previousOffset, start, until, _v0) {
		var standardOffset = _v0.standardOffset;
		var zoneRules = _v0.zoneRules;
		if (zoneRules.$ === 'Save') {
			var save = zoneRules.a;
			return _Utils_Tuple2(
				_List_fromArray(
					[
						{
						offset: standardOffset + save,
						start: A2($justinmimbs$timezone_data$TimeZone$Specification$utcMinutesFromDateTime, previousOffset, start)
					}
					]),
				{save: save, standard: standardOffset});
		} else {
			var rules = zoneRules.a;
			return A5($justinmimbs$timezone_data$TimeZone$Specification$rulesToOffsetChanges, previousOffset, start, until, standardOffset, rules);
		}
	});
var $justinmimbs$timezone_data$TimeZone$Specification$stripDuplicatesByHelp = F4(
	function (f, a, rev, list) {
		stripDuplicatesByHelp:
		while (true) {
			if (!list.b) {
				return $elm$core$List$reverse(rev);
			} else {
				var x = list.a;
				var xs = list.b;
				var b = f(x);
				var rev_ = (!_Utils_eq(a, b)) ? A2($elm$core$List$cons, x, rev) : rev;
				var $temp$f = f,
					$temp$a = b,
					$temp$rev = rev_,
					$temp$list = xs;
				f = $temp$f;
				a = $temp$a;
				rev = $temp$rev;
				list = $temp$list;
				continue stripDuplicatesByHelp;
			}
		}
	});
var $justinmimbs$timezone_data$TimeZone$Specification$zoneToRanges = F3(
	function (zoneStart, zoneUntil, zone) {
		var _v0 = A3(
			$elm$core$List$foldl,
			F2(
				function (_v1, _v2) {
					var state = _v1.a;
					var nextStart = _v1.b;
					var start = _v2.a;
					var ranges = _v2.b;
					return _Utils_Tuple2(
						nextStart,
						A2(
							$elm$core$List$cons,
							_Utils_Tuple3(start, state, nextStart),
							ranges));
				}),
			_Utils_Tuple2(zoneStart, _List_Nil),
			zone.history);
		var currentStart = _v0.a;
		var historyRanges = _v0.b;
		return $elm$core$List$reverse(
			A2(
				$elm$core$List$cons,
				_Utils_Tuple3(currentStart, zone.current, zoneUntil),
				historyRanges));
	});
var $justinmimbs$timezone_data$TimeZone$Specification$toOffsets = F3(
	function (minYear, maxYear, zone) {
		var initialState = function () {
			var _v5 = zone.history;
			if (_v5.b) {
				var _v6 = _v5.a;
				var earliest = _v6.a;
				return earliest;
			} else {
				return zone.current;
			}
		}();
		var initialOffset = {
			save: function () {
				var _v4 = initialState.zoneRules;
				if (_v4.$ === 'Save') {
					var save = _v4.a;
					return save;
				} else {
					return 0;
				}
			}(),
			standard: initialState.standardOffset
		};
		var ascendingChanges = A4(
			$justinmimbs$timezone_data$TimeZone$Specification$stripDuplicatesByHelp,
			function ($) {
				return $.offset;
			},
			initialOffset.standard + initialOffset.save,
			_List_Nil,
			A3(
				$elm$core$List$foldl,
				F2(
					function (_v1, _v2) {
						var start = _v1.a;
						var state = _v1.b;
						var until = _v1.c;
						var prevOffset = _v2.a;
						var prevChanges = _v2.b;
						var _v3 = A4($justinmimbs$timezone_data$TimeZone$Specification$stateToOffsetChanges, prevOffset, start, until, state);
						var nextChanges = _v3.a;
						var nextOffset = _v3.b;
						return _Utils_Tuple2(
							nextOffset,
							_Utils_ap(prevChanges, nextChanges));
					}),
				_Utils_Tuple2(initialOffset, _List_Nil),
				A3(
					$justinmimbs$timezone_data$TimeZone$Specification$zoneToRanges,
					A5($justinmimbs$timezone_data$TimeZone$Specification$DateTime, minYear, $elm$time$Time$Jan, 1, 0, $justinmimbs$timezone_data$TimeZone$Specification$Universal),
					A5($justinmimbs$timezone_data$TimeZone$Specification$DateTime, maxYear + 1, $elm$time$Time$Jan, 1, 0, $justinmimbs$timezone_data$TimeZone$Specification$Universal),
					zone)).b);
		var _v0 = $justinmimbs$timezone_data$TimeZone$Specification$dropChangesBeforeEpoch(
			_Utils_Tuple2(initialOffset.standard + initialOffset.save, ascendingChanges));
		var initial = _v0.a;
		var ascending = _v0.b;
		return _Utils_Tuple2(
			$elm$core$List$reverse(ascending),
			initial);
	});
var $justinmimbs$timezone_data$TimeZone$fromSpecification = function (zone) {
	var _v0 = A3($justinmimbs$timezone_data$TimeZone$Specification$toOffsets, $justinmimbs$timezone_data$TimeZone$minYear, $justinmimbs$timezone_data$TimeZone$maxYear, zone);
	var descending = _v0.a;
	var bottom = _v0.b;
	return A2($elm$time$Time$customZone, bottom, descending);
};
var $justinmimbs$timezone_data$TimeZone$Specification$Day = function (a) {
	return {$: 'Day', a: a};
};
var $justinmimbs$timezone_data$TimeZone$Specification$Last = function (a) {
	return {$: 'Last', a: a};
};
var $justinmimbs$timezone_data$TimeZone$Specification$Next = F2(
	function (a, b) {
		return {$: 'Next', a: a, b: b};
	});
var $justinmimbs$timezone_data$TimeZone$Specification$Rule = F7(
	function (from, to, month, day, time, clock, save) {
		return {clock: clock, day: day, from: from, month: month, save: save, time: time, to: to};
	});
var $elm$time$Time$Sun = {$: 'Sun'};
var $justinmimbs$timezone_data$TimeZone$rules_EU = _List_fromArray(
	[
		A7(
		$justinmimbs$timezone_data$TimeZone$Specification$Rule,
		1977,
		1980,
		$elm$time$Time$Apr,
		A2($justinmimbs$timezone_data$TimeZone$Specification$Next, $elm$time$Time$Sun, 1),
		60,
		$justinmimbs$timezone_data$TimeZone$Specification$Universal,
		60),
		A7(
		$justinmimbs$timezone_data$TimeZone$Specification$Rule,
		1977,
		1977,
		$elm$time$Time$Sep,
		$justinmimbs$timezone_data$TimeZone$Specification$Last($elm$time$Time$Sun),
		60,
		$justinmimbs$timezone_data$TimeZone$Specification$Universal,
		0),
		A7(
		$justinmimbs$timezone_data$TimeZone$Specification$Rule,
		1978,
		1978,
		$elm$time$Time$Oct,
		$justinmimbs$timezone_data$TimeZone$Specification$Day(1),
		60,
		$justinmimbs$timezone_data$TimeZone$Specification$Universal,
		0),
		A7(
		$justinmimbs$timezone_data$TimeZone$Specification$Rule,
		1979,
		1995,
		$elm$time$Time$Sep,
		$justinmimbs$timezone_data$TimeZone$Specification$Last($elm$time$Time$Sun),
		60,
		$justinmimbs$timezone_data$TimeZone$Specification$Universal,
		0),
		A7(
		$justinmimbs$timezone_data$TimeZone$Specification$Rule,
		1981,
		$justinmimbs$timezone_data$TimeZone$maxYear,
		$elm$time$Time$Mar,
		$justinmimbs$timezone_data$TimeZone$Specification$Last($elm$time$Time$Sun),
		60,
		$justinmimbs$timezone_data$TimeZone$Specification$Universal,
		60),
		A7(
		$justinmimbs$timezone_data$TimeZone$Specification$Rule,
		1996,
		$justinmimbs$timezone_data$TimeZone$maxYear,
		$elm$time$Time$Oct,
		$justinmimbs$timezone_data$TimeZone$Specification$Last($elm$time$Time$Sun),
		60,
		$justinmimbs$timezone_data$TimeZone$Specification$Universal,
		0)
	]);
var $justinmimbs$timezone_data$TimeZone$europe__berlin = function (_v0) {
	return $justinmimbs$timezone_data$TimeZone$fromSpecification(
		A2(
			$justinmimbs$timezone_data$TimeZone$Specification$Zone,
			_List_fromArray(
				[
					_Utils_Tuple2(
					A2(
						$justinmimbs$timezone_data$TimeZone$Specification$ZoneState,
						60,
						$justinmimbs$timezone_data$TimeZone$Specification$Save(0)),
					A5($justinmimbs$timezone_data$TimeZone$Specification$DateTime, 1980, $elm$time$Time$Jan, 1, 0, $justinmimbs$timezone_data$TimeZone$Specification$WallClock))
				]),
			A2(
				$justinmimbs$timezone_data$TimeZone$Specification$ZoneState,
				60,
				$justinmimbs$timezone_data$TimeZone$Specification$Rules($justinmimbs$timezone_data$TimeZone$rules_EU))));
};
var $author$project$Main$timeZone = $justinmimbs$timezone_data$TimeZone$europe__berlin(_Utils_Tuple0);
var $author$project$Main$subscriptions = function (model) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				A3(
				$mercurymedia$elm_datetime_picker$SingleDatePicker$subscriptions,
				A2($mercurymedia$elm_datetime_picker$SingleDatePicker$defaultSettings, $author$project$Main$timeZone, $author$project$Main$UpdateDatePicker),
				$author$project$Main$UpdateDatePicker,
				$author$project$Main$insertForm(model).picker),
				A2($elm$time$Time$every, 1000, $author$project$Main$BrowserTick)
			]));
};
var $author$project$Main$ReceiveAuth = function (a) {
	return {$: 'ReceiveAuth', a: a};
};
var $author$project$Main$ReceiveEvent = function (a) {
	return {$: 'ReceiveEvent', a: a};
};
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (maybeValue.$ === 'Just') {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$Main$buildErrorMessage = function (httpError) {
	switch (httpError.$) {
		case 'BadUrl':
			var message = httpError.a;
			return message;
		case 'Timeout':
			return 'Server is taking too long to respond. Please try again later.';
		case 'NetworkError':
			return 'Unable to reach server.';
		case 'BadStatus':
			var statusCode = httpError.a;
			return 'Request failed with status code: ' + $elm$core$String$fromInt(statusCode);
		default:
			var message = httpError.a;
			return message;
	}
};
var $elm$http$Http$expectBytesResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'arraybuffer',
			_Http_toDataView,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $elm$http$Http$expectWhatever = function (toMsg) {
	return A2(
		$elm$http$Http$expectBytesResponse,
		toMsg,
		$elm$http$Http$resolve(
			function (_v0) {
				return $elm$core$Result$Ok(_Utils_Tuple0);
			}));
};
var $author$project$YearMonth$YearMonth = F2(
	function (a, b) {
		return {$: 'YearMonth', a: a, b: b};
	});
var $elm$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		if (ma.$ === 'Nothing') {
			return $elm$core$Maybe$Nothing;
		} else {
			var a = ma.a;
			if (mb.$ === 'Nothing') {
				return $elm$core$Maybe$Nothing;
			} else {
				var b = mb.a;
				return $elm$core$Maybe$Just(
					A2(func, a, b));
			}
		}
	});
var $author$project$YearMonth$stringToMonth = function (month) {
	switch (month) {
		case 'januar':
			return $elm$core$Maybe$Just($elm$time$Time$Jan);
		case 'februar':
			return $elm$core$Maybe$Just($elm$time$Time$Feb);
		case 'märz':
			return $elm$core$Maybe$Just($elm$time$Time$Mar);
		case 'april':
			return $elm$core$Maybe$Just($elm$time$Time$Apr);
		case 'mai':
			return $elm$core$Maybe$Just($elm$time$Time$May);
		case 'juni':
			return $elm$core$Maybe$Just($elm$time$Time$Jun);
		case 'juli':
			return $elm$core$Maybe$Just($elm$time$Time$Jul);
		case 'august':
			return $elm$core$Maybe$Just($elm$time$Time$Aug);
		case 'september':
			return $elm$core$Maybe$Just($elm$time$Time$Sep);
		case 'oktober':
			return $elm$core$Maybe$Just($elm$time$Time$Oct);
		case 'november':
			return $elm$core$Maybe$Just($elm$time$Time$Nov);
		case 'dezember':
			return $elm$core$Maybe$Just($elm$time$Time$Dec);
		default:
			return $elm$core$Maybe$Nothing;
	}
};
var $author$project$YearMonth$fromAttr = function (value) {
	var _v0 = A2($elm$core$String$split, '_', value);
	if ((_v0.b && _v0.b.b) && (!_v0.b.b.b)) {
		var strYear = _v0.a;
		var _v1 = _v0.b;
		var strMonth = _v1.a;
		var year = $elm$core$String$toInt(strYear);
		var month = $author$project$YearMonth$stringToMonth(strMonth);
		return A2(
			$elm$core$Maybe$withDefault,
			$author$project$YearMonth$All,
			A3($elm$core$Maybe$map2, $author$project$YearMonth$YearMonth, year, month));
	} else {
		return $author$project$YearMonth$All;
	}
};
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $ianmackenzie$elm_units$Duration$minutes = function (numMinutes) {
	return $ianmackenzie$elm_units$Duration$seconds(60 * numMinutes);
};
var $justinmimbs$time_extra$Time$Extra$Month = {$: 'Month'};
var $justinmimbs$time_extra$Time$Extra$Day = {$: 'Day'};
var $justinmimbs$time_extra$Time$Extra$Millisecond = {$: 'Millisecond'};
var $justinmimbs$time_extra$Time$Extra$Week = {$: 'Week'};
var $justinmimbs$date$Date$Day = {$: 'Day'};
var $justinmimbs$date$Date$Friday = {$: 'Friday'};
var $justinmimbs$date$Date$Monday = {$: 'Monday'};
var $justinmimbs$date$Date$Month = {$: 'Month'};
var $justinmimbs$date$Date$Quarter = {$: 'Quarter'};
var $justinmimbs$date$Date$Saturday = {$: 'Saturday'};
var $justinmimbs$date$Date$Sunday = {$: 'Sunday'};
var $justinmimbs$date$Date$Thursday = {$: 'Thursday'};
var $justinmimbs$date$Date$Tuesday = {$: 'Tuesday'};
var $justinmimbs$date$Date$Wednesday = {$: 'Wednesday'};
var $justinmimbs$date$Date$Week = {$: 'Week'};
var $justinmimbs$date$Date$Year = {$: 'Year'};
var $elm$time$Time$Fri = {$: 'Fri'};
var $elm$time$Time$Sat = {$: 'Sat'};
var $elm$time$Time$Thu = {$: 'Thu'};
var $elm$time$Time$Tue = {$: 'Tue'};
var $elm$time$Time$Wed = {$: 'Wed'};
var $justinmimbs$date$Date$weekdayNumber = function (_v0) {
	var rd = _v0.a;
	var _v1 = A2($elm$core$Basics$modBy, 7, rd);
	if (!_v1) {
		return 7;
	} else {
		var n = _v1;
		return n;
	}
};
var $justinmimbs$date$Date$weekdayToNumber = function (wd) {
	switch (wd.$) {
		case 'Mon':
			return 1;
		case 'Tue':
			return 2;
		case 'Wed':
			return 3;
		case 'Thu':
			return 4;
		case 'Fri':
			return 5;
		case 'Sat':
			return 6;
		default:
			return 7;
	}
};
var $justinmimbs$date$Date$daysSincePreviousWeekday = F2(
	function (wd, date) {
		return A2(
			$elm$core$Basics$modBy,
			7,
			($justinmimbs$date$Date$weekdayNumber(date) + 7) - $justinmimbs$date$Date$weekdayToNumber(wd));
	});
var $justinmimbs$date$Date$firstOfMonth = F2(
	function (y, m) {
		return $justinmimbs$date$Date$RD(
			($justinmimbs$date$Date$daysBeforeYear(y) + A2($justinmimbs$date$Date$daysBeforeMonth, y, m)) + 1);
	});
var $justinmimbs$date$Date$firstOfYear = function (y) {
	return $justinmimbs$date$Date$RD(
		$justinmimbs$date$Date$daysBeforeYear(y) + 1);
};
var $justinmimbs$date$Date$monthToNumber = function (m) {
	switch (m.$) {
		case 'Jan':
			return 1;
		case 'Feb':
			return 2;
		case 'Mar':
			return 3;
		case 'Apr':
			return 4;
		case 'May':
			return 5;
		case 'Jun':
			return 6;
		case 'Jul':
			return 7;
		case 'Aug':
			return 8;
		case 'Sep':
			return 9;
		case 'Oct':
			return 10;
		case 'Nov':
			return 11;
		default:
			return 12;
	}
};
var $justinmimbs$date$Date$numberToMonth = function (mn) {
	var _v0 = A2($elm$core$Basics$max, 1, mn);
	switch (_v0) {
		case 1:
			return $elm$time$Time$Jan;
		case 2:
			return $elm$time$Time$Feb;
		case 3:
			return $elm$time$Time$Mar;
		case 4:
			return $elm$time$Time$Apr;
		case 5:
			return $elm$time$Time$May;
		case 6:
			return $elm$time$Time$Jun;
		case 7:
			return $elm$time$Time$Jul;
		case 8:
			return $elm$time$Time$Aug;
		case 9:
			return $elm$time$Time$Sep;
		case 10:
			return $elm$time$Time$Oct;
		case 11:
			return $elm$time$Time$Nov;
		default:
			return $elm$time$Time$Dec;
	}
};
var $justinmimbs$date$Date$toCalendarDateHelp = F3(
	function (y, m, d) {
		toCalendarDateHelp:
		while (true) {
			var monthDays = A2($justinmimbs$date$Date$daysInMonth, y, m);
			var mn = $justinmimbs$date$Date$monthToNumber(m);
			if ((mn < 12) && (_Utils_cmp(d, monthDays) > 0)) {
				var $temp$y = y,
					$temp$m = $justinmimbs$date$Date$numberToMonth(mn + 1),
					$temp$d = d - monthDays;
				y = $temp$y;
				m = $temp$m;
				d = $temp$d;
				continue toCalendarDateHelp;
			} else {
				return {day: d, month: m, year: y};
			}
		}
	});
var $justinmimbs$date$Date$divWithRemainder = F2(
	function (a, b) {
		return _Utils_Tuple2(
			A2($justinmimbs$date$Date$floorDiv, a, b),
			A2($elm$core$Basics$modBy, b, a));
	});
var $justinmimbs$date$Date$year = function (_v0) {
	var rd = _v0.a;
	var _v1 = A2($justinmimbs$date$Date$divWithRemainder, rd, 146097);
	var n400 = _v1.a;
	var r400 = _v1.b;
	var _v2 = A2($justinmimbs$date$Date$divWithRemainder, r400, 36524);
	var n100 = _v2.a;
	var r100 = _v2.b;
	var _v3 = A2($justinmimbs$date$Date$divWithRemainder, r100, 1461);
	var n4 = _v3.a;
	var r4 = _v3.b;
	var _v4 = A2($justinmimbs$date$Date$divWithRemainder, r4, 365);
	var n1 = _v4.a;
	var r1 = _v4.b;
	var n = (!r1) ? 0 : 1;
	return ((((n400 * 400) + (n100 * 100)) + (n4 * 4)) + n1) + n;
};
var $justinmimbs$date$Date$toOrdinalDate = function (_v0) {
	var rd = _v0.a;
	var y = $justinmimbs$date$Date$year(
		$justinmimbs$date$Date$RD(rd));
	return {
		ordinalDay: rd - $justinmimbs$date$Date$daysBeforeYear(y),
		year: y
	};
};
var $justinmimbs$date$Date$toCalendarDate = function (_v0) {
	var rd = _v0.a;
	var date = $justinmimbs$date$Date$toOrdinalDate(
		$justinmimbs$date$Date$RD(rd));
	return A3($justinmimbs$date$Date$toCalendarDateHelp, date.year, $elm$time$Time$Jan, date.ordinalDay);
};
var $justinmimbs$date$Date$month = A2(
	$elm$core$Basics$composeR,
	$justinmimbs$date$Date$toCalendarDate,
	function ($) {
		return $.month;
	});
var $justinmimbs$date$Date$monthToQuarter = function (m) {
	return (($justinmimbs$date$Date$monthToNumber(m) + 2) / 3) | 0;
};
var $justinmimbs$date$Date$quarter = A2($elm$core$Basics$composeR, $justinmimbs$date$Date$month, $justinmimbs$date$Date$monthToQuarter);
var $justinmimbs$date$Date$quarterToMonth = function (q) {
	return $justinmimbs$date$Date$numberToMonth((q * 3) - 2);
};
var $justinmimbs$date$Date$floor = F2(
	function (interval, date) {
		var rd = date.a;
		switch (interval.$) {
			case 'Year':
				return $justinmimbs$date$Date$firstOfYear(
					$justinmimbs$date$Date$year(date));
			case 'Quarter':
				return A2(
					$justinmimbs$date$Date$firstOfMonth,
					$justinmimbs$date$Date$year(date),
					$justinmimbs$date$Date$quarterToMonth(
						$justinmimbs$date$Date$quarter(date)));
			case 'Month':
				return A2(
					$justinmimbs$date$Date$firstOfMonth,
					$justinmimbs$date$Date$year(date),
					$justinmimbs$date$Date$month(date));
			case 'Week':
				return $justinmimbs$date$Date$RD(
					rd - A2($justinmimbs$date$Date$daysSincePreviousWeekday, $elm$time$Time$Mon, date));
			case 'Monday':
				return $justinmimbs$date$Date$RD(
					rd - A2($justinmimbs$date$Date$daysSincePreviousWeekday, $elm$time$Time$Mon, date));
			case 'Tuesday':
				return $justinmimbs$date$Date$RD(
					rd - A2($justinmimbs$date$Date$daysSincePreviousWeekday, $elm$time$Time$Tue, date));
			case 'Wednesday':
				return $justinmimbs$date$Date$RD(
					rd - A2($justinmimbs$date$Date$daysSincePreviousWeekday, $elm$time$Time$Wed, date));
			case 'Thursday':
				return $justinmimbs$date$Date$RD(
					rd - A2($justinmimbs$date$Date$daysSincePreviousWeekday, $elm$time$Time$Thu, date));
			case 'Friday':
				return $justinmimbs$date$Date$RD(
					rd - A2($justinmimbs$date$Date$daysSincePreviousWeekday, $elm$time$Time$Fri, date));
			case 'Saturday':
				return $justinmimbs$date$Date$RD(
					rd - A2($justinmimbs$date$Date$daysSincePreviousWeekday, $elm$time$Time$Sat, date));
			case 'Sunday':
				return $justinmimbs$date$Date$RD(
					rd - A2($justinmimbs$date$Date$daysSincePreviousWeekday, $elm$time$Time$Sun, date));
			default:
				return date;
		}
	});
var $justinmimbs$time_extra$Time$Extra$floorDate = F3(
	function (dateInterval, zone, posix) {
		return A3(
			$justinmimbs$time_extra$Time$Extra$posixFromDateTime,
			zone,
			A2(
				$justinmimbs$date$Date$floor,
				dateInterval,
				A2($justinmimbs$date$Date$fromPosix, zone, posix)),
			0);
	});
var $justinmimbs$time_extra$Time$Extra$floor = F3(
	function (interval, zone, posix) {
		switch (interval.$) {
			case 'Millisecond':
				return posix;
			case 'Second':
				return A3(
					$justinmimbs$time_extra$Time$Extra$posixFromDateTime,
					zone,
					A2($justinmimbs$date$Date$fromPosix, zone, posix),
					A4(
						$justinmimbs$time_extra$Time$Extra$timeFromClock,
						A2($elm$time$Time$toHour, zone, posix),
						A2($elm$time$Time$toMinute, zone, posix),
						A2($elm$time$Time$toSecond, zone, posix),
						0));
			case 'Minute':
				return A3(
					$justinmimbs$time_extra$Time$Extra$posixFromDateTime,
					zone,
					A2($justinmimbs$date$Date$fromPosix, zone, posix),
					A4(
						$justinmimbs$time_extra$Time$Extra$timeFromClock,
						A2($elm$time$Time$toHour, zone, posix),
						A2($elm$time$Time$toMinute, zone, posix),
						0,
						0));
			case 'Hour':
				return A3(
					$justinmimbs$time_extra$Time$Extra$posixFromDateTime,
					zone,
					A2($justinmimbs$date$Date$fromPosix, zone, posix),
					A4(
						$justinmimbs$time_extra$Time$Extra$timeFromClock,
						A2($elm$time$Time$toHour, zone, posix),
						0,
						0,
						0));
			case 'Day':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Day, zone, posix);
			case 'Month':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Month, zone, posix);
			case 'Year':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Year, zone, posix);
			case 'Quarter':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Quarter, zone, posix);
			case 'Week':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Week, zone, posix);
			case 'Monday':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Monday, zone, posix);
			case 'Tuesday':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Tuesday, zone, posix);
			case 'Wednesday':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Wednesday, zone, posix);
			case 'Thursday':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Thursday, zone, posix);
			case 'Friday':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Friday, zone, posix);
			case 'Saturday':
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Saturday, zone, posix);
			default:
				return A3($justinmimbs$time_extra$Time$Extra$floorDate, $justinmimbs$date$Date$Sunday, zone, posix);
		}
	});
var $justinmimbs$time_extra$Time$Extra$toFractionalDay = F2(
	function (zone, posix) {
		return A2($justinmimbs$time_extra$Time$Extra$timeFromPosix, zone, posix) / 86400000;
	});
var $justinmimbs$time_extra$Time$Extra$toMonths = F2(
	function (zone, posix) {
		var wholeMonths = (12 * (A2($elm$time$Time$toYear, zone, posix) - 1)) + ($justinmimbs$date$Date$monthToNumber(
			A2($elm$time$Time$toMonth, zone, posix)) - 1);
		var fractionalMonth = (A2($elm$time$Time$toDay, zone, posix) + A2($justinmimbs$time_extra$Time$Extra$toFractionalDay, zone, posix)) / 100;
		return wholeMonths + fractionalMonth;
	});
var $justinmimbs$time_extra$Time$Extra$toRataDieMoment = F2(
	function (zone, posix) {
		return $justinmimbs$date$Date$toRataDie(
			A2($justinmimbs$date$Date$fromPosix, zone, posix)) + A2($justinmimbs$time_extra$Time$Extra$toFractionalDay, zone, posix);
	});
var $elm$core$Basics$truncate = _Basics_truncate;
var $justinmimbs$time_extra$Time$Extra$diff = F4(
	function (interval, zone, posix1, posix2) {
		diff:
		while (true) {
			switch (interval.$) {
				case 'Millisecond':
					return $elm$time$Time$posixToMillis(posix2) - $elm$time$Time$posixToMillis(posix1);
				case 'Second':
					return (A4($justinmimbs$time_extra$Time$Extra$diff, $justinmimbs$time_extra$Time$Extra$Millisecond, zone, posix1, posix2) / 1000) | 0;
				case 'Minute':
					return (A4($justinmimbs$time_extra$Time$Extra$diff, $justinmimbs$time_extra$Time$Extra$Millisecond, zone, posix1, posix2) / 60000) | 0;
				case 'Hour':
					return (A4($justinmimbs$time_extra$Time$Extra$diff, $justinmimbs$time_extra$Time$Extra$Millisecond, zone, posix1, posix2) / 3600000) | 0;
				case 'Day':
					return (A2($justinmimbs$time_extra$Time$Extra$toRataDieMoment, zone, posix2) - A2($justinmimbs$time_extra$Time$Extra$toRataDieMoment, zone, posix1)) | 0;
				case 'Month':
					return (A2($justinmimbs$time_extra$Time$Extra$toMonths, zone, posix2) - A2($justinmimbs$time_extra$Time$Extra$toMonths, zone, posix1)) | 0;
				case 'Year':
					return (A4($justinmimbs$time_extra$Time$Extra$diff, $justinmimbs$time_extra$Time$Extra$Month, zone, posix1, posix2) / 12) | 0;
				case 'Quarter':
					return (A4($justinmimbs$time_extra$Time$Extra$diff, $justinmimbs$time_extra$Time$Extra$Month, zone, posix1, posix2) / 3) | 0;
				case 'Week':
					return (A4($justinmimbs$time_extra$Time$Extra$diff, $justinmimbs$time_extra$Time$Extra$Day, zone, posix1, posix2) / 7) | 0;
				default:
					var weekday = interval;
					var $temp$interval = $justinmimbs$time_extra$Time$Extra$Week,
						$temp$zone = zone,
						$temp$posix1 = A3($justinmimbs$time_extra$Time$Extra$floor, weekday, zone, posix1),
						$temp$posix2 = A3($justinmimbs$time_extra$Time$Extra$floor, weekday, zone, posix2);
					interval = $temp$interval;
					zone = $temp$zone;
					posix1 = $temp$posix1;
					posix2 = $temp$posix2;
					continue diff;
			}
		}
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$calculateViewOffset = F3(
	function (zone, referenceTime, subjectTime) {
		var flooredReference = A3($justinmimbs$time_extra$Time$Extra$floor, $justinmimbs$time_extra$Time$Extra$Month, zone, referenceTime);
		if (subjectTime.$ === 'Nothing') {
			return 0;
		} else {
			var time = subjectTime.a;
			var flooredSubject = A3($justinmimbs$time_extra$Time$Extra$floor, $justinmimbs$time_extra$Time$Extra$Month, zone, time);
			return (_Utils_cmp(
				$elm$time$Time$posixToMillis(flooredReference),
				$elm$time$Time$posixToMillis(flooredSubject)) < 1) ? A4($justinmimbs$time_extra$Time$Extra$diff, $justinmimbs$time_extra$Time$Extra$Month, zone, flooredReference, flooredSubject) : (0 - A4($justinmimbs$time_extra$Time$Extra$diff, $justinmimbs$time_extra$Time$Extra$Month, zone, flooredSubject, flooredReference));
		}
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$getTimePickerSettings = function (settings) {
	var _v0 = settings.timePickerVisibility;
	switch (_v0.$) {
		case 'NeverVisible':
			return $elm$core$Maybe$Nothing;
		case 'Toggleable':
			var timePickerSettings = _v0.a;
			return $elm$core$Maybe$Just(timePickerSettings);
		default:
			var timePickerSettings = _v0.a;
			return $elm$core$Maybe$Just(timePickerSettings);
	}
};
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$pickerDayFromPosix = F4(
	function (zone, isDisabledFn, allowableTimesFn, posix) {
		var flooredPosix = A3($justinmimbs$time_extra$Time$Extra$floor, $justinmimbs$time_extra$Time$Extra$Day, zone, posix);
		var allowableTimes = A2(
			$elm$core$Maybe$withDefault,
			{endHour: 23, endMinute: 59, startHour: 0, startMinute: 0},
			A2(
				$elm$core$Maybe$map,
				function (fn) {
					return A2(fn, zone, flooredPosix);
				},
				allowableTimesFn));
		return {
			disabled: A2(
				isDisabledFn,
				zone,
				A3($justinmimbs$time_extra$Time$Extra$floor, $justinmimbs$time_extra$Time$Extra$Day, zone, flooredPosix)),
			end: A5($mercurymedia$elm_datetime_picker$DatePicker$Utilities$setTimeOfDay, zone, allowableTimes.endHour, allowableTimes.endMinute, 59, flooredPosix),
			start: A5($mercurymedia$elm_datetime_picker$DatePicker$Utilities$setTimeOfDay, zone, allowableTimes.startHour, allowableTimes.startMinute, 0, flooredPosix)
		};
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$generatePickerDay = F2(
	function (settings, time) {
		return A2(
			$elm$core$Maybe$withDefault,
			A4($mercurymedia$elm_datetime_picker$DatePicker$Utilities$pickerDayFromPosix, settings.zone, settings.isDayDisabled, $elm$core$Maybe$Nothing, time),
			A2(
				$elm$core$Maybe$map,
				function (timePickerSettings) {
					return A4(
						$mercurymedia$elm_datetime_picker$DatePicker$Utilities$pickerDayFromPosix,
						settings.zone,
						settings.isDayDisabled,
						$elm$core$Maybe$Just(timePickerSettings.allowedTimesOfDay),
						time);
				},
				$mercurymedia$elm_datetime_picker$SingleDatePicker$getTimePickerSettings(settings)));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$openPicker = F4(
	function (settings, baseTime, pickedTime, _v0) {
		var model = _v0.a;
		var viewOffset = A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$calculateViewOffset, settings.zone, baseTime, pickedTime);
		var timePickerVisible = function () {
			var _v1 = settings.timePickerVisibility;
			switch (_v1.$) {
				case 'NeverVisible':
					return false;
				case 'Toggleable':
					return false;
				default:
					return true;
			}
		}();
		var selectionTuple = A2(
			$elm$core$Maybe$map,
			function (pt) {
				return _Utils_Tuple2(
					A2($mercurymedia$elm_datetime_picker$SingleDatePicker$generatePickerDay, settings, pt),
					pt);
			},
			pickedTime);
		return $mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(
			_Utils_update(
				model,
				{
					selectionTuple: selectionTuple,
					status: A2(
						$mercurymedia$elm_datetime_picker$SingleDatePicker$Open,
						timePickerVisible,
						A2($mercurymedia$elm_datetime_picker$SingleDatePicker$generatePickerDay, settings, baseTime)),
					viewOffset: viewOffset
				}));
	});
var $author$project$Main$resultFromEmptyString = F2(
	function (error, str) {
		return (str === '') ? $elm$core$Result$Err(error) : $elm$core$Result$Ok(str);
	});
var $author$project$Periode$idToString = function (_v0) {
	var id = _v0.a;
	return $elm$core$String$fromInt(id);
};
var $author$project$Main$sendDelete = F2(
	function (result, id) {
		return $elm$http$Http$request(
			{
				body: $elm$http$Http$emptyBody,
				expect: $elm$http$Http$expectWhatever(result),
				headers: _List_Nil,
				method: 'DELETE',
				timeout: $elm$core$Maybe$Nothing,
				tracker: $elm$core$Maybe$Nothing,
				url: '/api/periode/' + $author$project$Periode$idToString(id)
			});
	});
var $ianmackenzie$elm_units$Duration$inSeconds = function (_v0) {
	var numSeconds = _v0.a;
	return numSeconds;
};
var $elm$json$Json$Encode$int = _Json_wrap;
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(_Utils_Tuple0),
			pairs));
};
var $elm$core$Basics$round = _Basics_round;
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Main$insertEncoder = F3(
	function (start, duration, comment) {
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'start',
					$elm$json$Json$Encode$int(
						($elm$time$Time$posixToMillis(start) / 1000) | 0)),
					_Utils_Tuple2(
					'duration',
					$elm$json$Json$Encode$int(
						$elm$core$Basics$round(
							$ianmackenzie$elm_units$Duration$inSeconds(duration)))),
					_Utils_Tuple2(
					'comment',
					$elm$json$Json$Encode$string(comment))
				]));
	});
var $elm$http$Http$jsonBody = function (value) {
	return A2(
		_Http_pair,
		'application/json',
		A2($elm$json$Json$Encode$encode, 0, value));
};
var $elm$http$Http$post = function (r) {
	return $elm$http$Http$request(
		{body: r.body, expect: r.expect, headers: _List_Nil, method: 'POST', timeout: $elm$core$Maybe$Nothing, tracker: $elm$core$Maybe$Nothing, url: r.url});
};
var $author$project$Main$sendInsert = F4(
	function (result, start, duration, comment) {
		return $elm$http$Http$post(
			{
				body: $elm$http$Http$jsonBody(
					A3($author$project$Main$insertEncoder, start, duration, comment)),
				expect: $elm$http$Http$expectWhatever(result),
				url: '/api/periode'
			});
	});
var $elm$http$Http$expectString = function (toMsg) {
	return A2(
		$elm$http$Http$expectStringResponse,
		toMsg,
		$elm$http$Http$resolve($elm$core$Result$Ok));
};
var $author$project$Main$passwordEncoder = function (pass) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'password',
				$elm$json$Json$Encode$string(pass))
			]));
};
var $author$project$Main$sendPassword = F2(
	function (result, pass) {
		return $elm$http$Http$post(
			{
				body: $elm$http$Http$jsonBody(
					$author$project$Main$passwordEncoder(pass)),
				expect: $elm$http$Http$expectString(result),
				url: '/api/auth'
			});
	});
var $author$project$Main$commentEncoder = function (comment) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'comment',
				$elm$json$Json$Encode$string(comment))
			]));
};
var $author$project$Main$sendStartStop = F3(
	function (startStop, result, comment) {
		return $elm$http$Http$post(
			{
				body: $elm$http$Http$jsonBody(
					$author$project$Main$commentEncoder(comment)),
				expect: $elm$http$Http$expectWhatever(result),
				url: '/api/' + startStop
			});
	});
var $author$project$Periode$stateComment = function (state) {
	var _v0 = state.current;
	if (_v0.$ === 'Stopped') {
		return '';
	} else {
		var text = _v0.b;
		return text;
	}
};
var $elm$core$String$toFloat = _String_toFloat;
var $author$project$Main$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 'ReceiveState':
				var response = msg.a;
				if (response.$ === 'Ok') {
					var state = response.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								current: state.current,
								errMsg: $elm$core$Maybe$Nothing,
								formComment: $author$project$Periode$stateComment(state),
								periodes: state.periodes
							}),
						$elm$core$Platform$Cmd$none);
				} else {
					var e = response.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								current: $author$project$Periode$Stopped,
								errMsg: $elm$core$Maybe$Just(
									$author$project$Main$buildErrorMessage(e)),
								periodes: _List_Nil
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 'ReceiveEvent':
				var response = msg.a;
				if (response.$ === 'Ok') {
					return _Utils_Tuple2(
						model,
						$author$project$Main$updateStateIfPermission(model.permission));
				} else {
					var e = response.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								current: $author$project$Periode$Stopped,
								errMsg: $elm$core$Maybe$Just(
									$author$project$Main$buildErrorMessage(e)),
								periodes: _List_Nil,
								permission: $author$project$Main$PermissionNone
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 'BrowserTick':
				var newTime = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{currentTime: newTime}),
					$elm$core$Platform$Cmd$none);
			case 'InsertComment':
				var comment = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{formComment: comment}),
					$elm$core$Platform$Cmd$none);
			case 'ClickStart':
				return _Utils_Tuple2(
					model,
					A3($author$project$Main$sendStartStop, 'start', $author$project$Main$ReceiveEvent, model.formComment));
			case 'ClickStop':
				return _Utils_Tuple2(
					model,
					A3($author$project$Main$sendStartStop, 'stop', $author$project$Main$ReceiveEvent, model.formComment));
			case 'ClickContinue':
				var id = msg.a;
				return _Utils_Tuple2(
					model,
					A2(
						$elm$core$Maybe$withDefault,
						$elm$core$Platform$Cmd$none,
						A2(
							$elm$core$Maybe$andThen,
							function (p) {
								return $elm$core$Maybe$Just(
									A3($author$project$Main$sendStartStop, 'start', $author$project$Main$ReceiveEvent, p.comment));
							},
							$elm$core$List$head(
								A2(
									$elm$core$List$filter,
									function (p) {
										return _Utils_eq(p.id, id);
									},
									model.periodes)))));
			case 'ClickDelete':
				var id = msg.a;
				return _Utils_Tuple2(
					model,
					A2($author$project$Main$sendDelete, $author$project$Main$ReceiveEvent, id));
			case 'ClickAdd':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							formInsert: $elm$core$Maybe$Just(
								$author$project$Main$emptyInsert(model.currentTime))
						}),
					$elm$core$Platform$Cmd$none);
			case 'ClickDatePicker':
				var insert = $author$project$Main$insertForm(model);
				var picker = A4(
					$mercurymedia$elm_datetime_picker$SingleDatePicker$openPicker,
					A2($mercurymedia$elm_datetime_picker$SingleDatePicker$defaultSettings, $author$project$Main$timeZone, $author$project$Main$UpdateDatePicker),
					model.currentTime,
					$elm$core$Maybe$Just(insert.start),
					insert.picker);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							formInsert: $elm$core$Maybe$Just(
								_Utils_update(
									insert,
									{picker: picker}))
						}),
					$elm$core$Platform$Cmd$none);
			case 'UpdateDatePicker':
				var _v3 = msg.a;
				var updatedPicker = _v3.a;
				var maybePickedTime = _v3.b;
				var insert = $author$project$Main$insertForm(model);
				var pickedTime = A2($elm$core$Maybe$withDefault, insert.start, maybePickedTime);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							formInsert: $elm$core$Maybe$Just(
								_Utils_update(
									insert,
									{picker: updatedPicker, start: pickedTime}))
						}),
					$elm$core$Platform$Cmd$none);
			case 'InsertAddDuration':
				var durationStr = msg.a;
				var insert = $author$project$Main$insertForm(model);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							formInsert: $elm$core$Maybe$Just(
								_Utils_update(
									insert,
									{formDuration: durationStr}))
						}),
					$elm$core$Platform$Cmd$none);
			case 'InsertAddComment':
				var comment = msg.a;
				var insert = $author$project$Main$insertForm(model);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							formInsert: $elm$core$Maybe$Just(
								_Utils_update(
									insert,
									{formComment: comment}))
						}),
					$elm$core$Platform$Cmd$none);
			case 'ClickInsert':
				var insert = $author$project$Main$insertForm(model);
				var insertCMD = A2(
					$elm$core$Result$andThen,
					A2(
						$elm$core$Basics$composeR,
						$elm$core$String$toFloat,
						A2(
							$elm$core$Basics$composeR,
							$elm$core$Result$fromMaybe('Duration has to be a number'),
							A2(
								$elm$core$Basics$composeR,
								$elm$core$Result$andThen(
									A2($elm$core$Basics$composeR, $ianmackenzie$elm_units$Duration$minutes, $elm$core$Result$Ok)),
								$elm$core$Result$andThen(
									function (duration) {
										return $elm$core$Result$Ok(
											A4($author$project$Main$sendInsert, $author$project$Main$ReceiveEvent, insert.start, duration, insert.formComment));
									})))),
					A2($author$project$Main$resultFromEmptyString, 'No duration provided', insert.formDuration));
				if (insertCMD.$ === 'Ok') {
					var cmd = insertCMD.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{formInsert: $elm$core$Maybe$Nothing}),
						cmd);
				} else {
					var errMSG = insertCMD.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								formInsert: $elm$core$Maybe$Just(
									_Utils_update(
										insert,
										{
											error: $elm$core$Maybe$Just(errMSG)
										}))
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 'InsertLoginPassword':
				var password = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{formPassword: password}),
					$elm$core$Platform$Cmd$none);
			case 'ClickLogin':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{formPassword: ''}),
					A2($author$project$Main$sendPassword, $author$project$Main$ReceiveAuth, model.formPassword));
			case 'ReceiveAuth':
				var response = msg.a;
				if (response.$ === 'Ok') {
					var permissionLevel = response.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								permission: $author$project$Main$permissionFromString(permissionLevel)
							}),
						$author$project$Periode$fetch($author$project$Main$ReceiveState));
				} else {
					var e = response.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								current: $author$project$Periode$Stopped,
								errMsg: $elm$core$Maybe$Just(
									$author$project$Main$buildErrorMessage(e)),
								periodes: _List_Nil
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 'ClickLogout':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{permission: $author$project$Main$PermissionNone}),
					$elm$http$Http$get(
						{
							expect: $elm$http$Http$expectWhatever($author$project$Main$ReceiveEvent),
							url: '/api/auth/logout'
						}));
			case 'SelectYearMonth':
				var value = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							formYearMonth: $author$project$YearMonth$fromAttr(value)
						}),
					$elm$core$Platform$Cmd$none);
			default:
				var value = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{viewBody: value}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $author$project$Main$canWrite = F2(
	function (permission, html) {
		if (permission.$ === 'PermissionWrite') {
			return html;
		} else {
			return $elm$html$Html$text('');
		}
	});
var $elm$html$Html$div = _VirtualDom_node('div');
var $author$project$Main$ViewMonthly = {$: 'ViewMonthly'};
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $author$project$Main$ClickBodyNav = function (a) {
	return {$: 'ClickBodyNav', a: a};
};
var $elm$html$Html$a = _VirtualDom_node('a');
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $elm$html$Html$li = _VirtualDom_node('li');
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 'Normal', a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $author$project$Main$navLink = F2(
	function (myViewBody, activeViewBody) {
		var viewText = function () {
			if (myViewBody.$ === 'ViewMonthly') {
				return 'Monate';
			} else {
				return 'Zeiten';
			}
		}();
		var linkClass = _Utils_eq(myViewBody, activeViewBody) ? 'nav-link active' : 'nav-link';
		return A2(
			$elm$html$Html$li,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('nav-item')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$a,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(linkClass),
							$elm$html$Html$Attributes$href('#'),
							$elm$html$Html$Events$onClick(
							$author$project$Main$ClickBodyNav(myViewBody))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(viewText)
						]))
				]));
	});
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $author$project$Periode$anyIndex = F2(
	function (comparer, list) {
		return A3(
			$elm$core$List$foldl,
			F2(
				function (element, found) {
					return (element >= 0) ? element : found;
				}),
			-1,
			A2(
				$elm$core$List$indexedMap,
				F2(
					function (index, element) {
						return comparer(element) ? index : (-1);
					}),
				list));
	});
var $author$project$YearMonth$fromPosix = F2(
	function (zone, time) {
		return A2(
			$author$project$YearMonth$YearMonth,
			A2($elm$time$Time$toYear, zone, time),
			A2($elm$time$Time$toMonth, zone, time));
	});
var $author$project$YearMonth$monthToString = function (month) {
	switch (month.$) {
		case 'Jan':
			return 'Januar';
		case 'Feb':
			return 'Februar';
		case 'Mar':
			return 'März';
		case 'Apr':
			return 'April';
		case 'May':
			return 'Mai';
		case 'Jun':
			return 'Juni';
		case 'Jul':
			return 'Juli';
		case 'Aug':
			return 'August';
		case 'Sep':
			return 'September';
		case 'Oct':
			return 'Oktober';
		case 'Nov':
			return 'November';
		default:
			return 'Dezember';
	}
};
var $author$project$YearMonth$toString = function (yearMonth) {
	if (yearMonth.$ === 'All') {
		return 'Alle';
	} else {
		var year = yearMonth.a;
		var month = yearMonth.b;
		return $elm$core$String$fromInt(year) + (' ' + $author$project$YearMonth$monthToString(month));
	}
};
var $author$project$Periode$byYearMonth = F2(
	function (zone, periodes) {
		return A3(
			$elm$core$List$foldl,
			F2(
				function (p, list) {
					var index = $author$project$YearMonth$toString(
						A2($author$project$YearMonth$fromPosix, zone, p.start));
					var foundIndex = A2(
						$author$project$Periode$anyIndex,
						function (e) {
							return _Utils_eq(e.a, index);
						},
						list);
					return _Utils_eq(foundIndex, -1) ? A2(
						$elm$core$List$cons,
						_Utils_Tuple2(
							index,
							_List_fromArray(
								[p])),
						list) : A2(
						$elm$core$List$indexedMap,
						F2(
							function (idx, _v0) {
								var ym = _v0.a;
								var l = _v0.b;
								return _Utils_eq(idx, foundIndex) ? _Utils_Tuple2(
									ym,
									A2($elm$core$List$cons, p, l)) : _Utils_Tuple2(ym, l);
							}),
						list);
				}),
			_List_Nil,
			periodes);
	});
var $author$project$Periode$sort = function (periodes) {
	return $elm$core$List$reverse(
		A2(
			$elm$core$List$sortBy,
			function (p) {
				return $elm$time$Time$posixToMillis(p.start);
			},
			periodes));
};
var $elm$html$Html$table = _VirtualDom_node('table');
var $elm$html$Html$th = _VirtualDom_node('th');
var $elm$html$Html$tr = _VirtualDom_node('tr');
var $ianmackenzie$elm_units$Duration$inMilliseconds = function (duration) {
	return $ianmackenzie$elm_units$Duration$inSeconds(duration) * 1000;
};
var $ianmackenzie$elm_units$Duration$milliseconds = function (numMilliseconds) {
	return $ianmackenzie$elm_units$Duration$seconds(0.001 * numMilliseconds);
};
var $author$project$Main$combineDurations = function (durations) {
	return $ianmackenzie$elm_units$Duration$milliseconds(
		A3(
			$elm$core$List$foldl,
			$elm$core$Basics$add,
			0,
			A2($elm$core$List$map, $ianmackenzie$elm_units$Duration$inMilliseconds, durations)));
};
var $elm$core$String$cons = _String_cons;
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $author$project$Main$intToFormattedString = function (_int) {
	return A2(
		$elm$core$String$join,
		'.',
		A3(
			$elm$core$String$foldr,
			F2(
				function (c, list) {
					var last = A2(
						$elm$core$Maybe$withDefault,
						'',
						$elm$core$List$head(list));
					return ($elm$core$String$length(last) === 3) ? A2(
						$elm$core$List$cons,
						$elm$core$String$fromChar(c),
						list) : A2(
						$elm$core$List$cons,
						A2($elm$core$String$cons, c, last),
						A2($elm$core$List$drop, 1, list));
				}),
			_List_Nil,
			$elm$core$String$fromInt(_int)));
};
var $author$project$Main$intToPadding2String = function (n) {
	var str = $elm$core$String$fromInt(n);
	var formatted = ($elm$core$String$length(str) < 2) ? ('0' + str) : str;
	return formatted;
};
var $author$project$Main$centToString = function (euroCent) {
	var euro = (euroCent / 100) | 0;
	var euroString = $author$project$Main$intToFormattedString(euro);
	var cent = euroCent % 100;
	return euroString + (',' + ($author$project$Main$intToPadding2String(cent) + ' €'));
};
var $author$project$Mony$centPerHour = 8000;
var $author$project$Mony$centPerMinute = 134;
var $ianmackenzie$elm_units$Constants$second = 1;
var $ianmackenzie$elm_units$Constants$minute = 60 * $ianmackenzie$elm_units$Constants$second;
var $ianmackenzie$elm_units$Constants$hour = 60 * $ianmackenzie$elm_units$Constants$minute;
var $ianmackenzie$elm_units$Duration$inHours = function (duration) {
	return $ianmackenzie$elm_units$Duration$inSeconds(duration) / $ianmackenzie$elm_units$Constants$hour;
};
var $ianmackenzie$elm_units$Duration$inMinutes = function (duration) {
	return $ianmackenzie$elm_units$Duration$inSeconds(duration) / 60;
};
var $author$project$Mony$durationInHourMinutes = function (duration) {
	return _Utils_Tuple2(
		$elm$core$Basics$floor(
			$ianmackenzie$elm_units$Duration$inHours(duration)),
		A2(
			$elm$core$Basics$modBy,
			60,
			$elm$core$Basics$ceiling(
				$ianmackenzie$elm_units$Duration$inMinutes(duration))));
};
var $author$project$Mony$durationToCent = function (duration) {
	var _v0 = $author$project$Mony$durationInHourMinutes(duration);
	var hours = _v0.a;
	var minutes = _v0.b;
	return (hours * $author$project$Mony$centPerHour) + (minutes * $author$project$Mony$centPerMinute);
};
var $author$project$Main$durationToMonyString = function (duration) {
	return $author$project$Main$centToString(
		$author$project$Mony$durationToCent(duration));
};
var $author$project$Main$durationToTimeString = function (duration) {
	var _v0 = $author$project$Mony$durationInHourMinutes(duration);
	var hours = _v0.a;
	var minutes = _v0.b;
	return $elm$core$String$fromInt(hours) + (':' + $author$project$Main$intToPadding2String(minutes));
};
var $elm$html$Html$td = _VirtualDom_node('td');
var $author$project$Main$viewMonthlyLine = function (_v0) {
	var yearMonthText = _v0.a;
	var periodes = _v0.b;
	var duration = $author$project$Main$combineDurations(
		A2(
			$elm$core$List$map,
			function ($) {
				return $.duration;
			},
			periodes));
	return A2(
		$elm$html$Html$tr,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				$elm$html$Html$td,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text(yearMonthText)
					])),
				A2(
				$elm$html$Html$td,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('time')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						$author$project$Main$durationToTimeString(duration))
					])),
				A2(
				$elm$html$Html$td,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('mony')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(
						$author$project$Main$durationToMonyString(duration))
					]))
			]));
};
var $author$project$Main$viewMonthly = F2(
	function (zone, periodes) {
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$table,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('table')
						]),
					A2(
						$elm$core$List$cons,
						A2(
							$elm$html$Html$tr,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									$elm$html$Html$th,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('month')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Monat')
										])),
									A2(
									$elm$html$Html$th,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('time')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Zeiten')
										])),
									A2(
									$elm$html$Html$th,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('mony')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Euro')
										]))
								])),
						A2(
							$elm$core$List$map,
							$author$project$Main$viewMonthlyLine,
							A2(
								$author$project$Periode$byYearMonth,
								zone,
								$author$project$Periode$sort(periodes)))))
				]));
	});
var $author$project$Main$SelectYearMonth = function (a) {
	return {$: 'SelectYearMonth', a: a};
};
var $author$project$Periode$filterYearMonth = F3(
	function (zone, ym, periodes) {
		if (ym.$ === 'All') {
			return periodes;
		} else {
			return A2(
				$elm$core$List$filter,
				function (p) {
					return _Utils_eq(
						A2($author$project$YearMonth$fromPosix, zone, p.start),
						ym);
				},
				periodes);
		}
	});
var $elm$html$Html$tbody = _VirtualDom_node('tbody');
var $elm$html$Html$Attributes$scope = $elm$html$Html$Attributes$stringProperty('scope');
var $elm$html$Html$thead = _VirtualDom_node('thead');
var $author$project$Main$viewPeriodeHeader = function (permission) {
	return A2(
		$elm$html$Html$thead,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				$elm$html$Html$tr,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$th,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$scope('col'),
								$elm$html$Html$Attributes$class('time')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Start')
							])),
						A2(
						$elm$html$Html$th,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$scope('col'),
								$elm$html$Html$Attributes$class('time')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Dauer')
							])),
						A2(
						$elm$html$Html$th,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$scope('col')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Euros')
							])),
						A2(
						$elm$html$Html$th,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$scope('col')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Comment')
							])),
						A2(
						$author$project$Main$canWrite,
						permission,
						A2(
							$elm$html$Html$th,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$scope('col'),
									$elm$html$Html$Attributes$class('actions buttons')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('#')
								])))
					]))
			]));
};
var $author$project$Main$ClickContinue = function (a) {
	return {$: 'ClickContinue', a: a};
};
var $author$project$Main$ClickDelete = function (a) {
	return {$: 'ClickDelete', a: a};
};
var $elm$html$Html$button = _VirtualDom_node('button');
var $CoderDennis$elm_time_format$Time$Format$I18n$I_de_de$dayName = function (day) {
	switch (day.$) {
		case 'Mon':
			return 'Montag';
		case 'Tue':
			return 'Dienstag';
		case 'Wed':
			return 'Mittwoch';
		case 'Thu':
			return 'Donnerstag';
		case 'Fri':
			return 'Freitag';
		case 'Sat':
			return 'Samstag';
		default:
			return 'Sonntag';
	}
};
var $CoderDennis$elm_time_format$Time$Format$I18n$I_de_de$dayOfMonthWithSuffix = F2(
	function (_v0, day) {
		return $elm$core$String$fromInt(day) + '.';
	});
var $CoderDennis$elm_time_format$Time$Format$I18n$I_de_de$dayShort = function (day) {
	switch (day.$) {
		case 'Mon':
			return 'Mo';
		case 'Tue':
			return 'Di';
		case 'Wed':
			return 'Mi';
		case 'Thu':
			return 'Do';
		case 'Fri':
			return 'Fr';
		case 'Sat':
			return 'Sa';
		default:
			return 'So';
	}
};
var $CoderDennis$elm_time_format$Time$Format$I18n$I_de_de$monthName = function (month) {
	switch (month.$) {
		case 'Jan':
			return 'Januar';
		case 'Feb':
			return 'Februar';
		case 'Mar':
			return 'März';
		case 'Apr':
			return 'April';
		case 'May':
			return 'Mai';
		case 'Jun':
			return 'Juni';
		case 'Jul':
			return 'Juli';
		case 'Aug':
			return 'August';
		case 'Sep':
			return 'September';
		case 'Oct':
			return 'Oktober';
		case 'Nov':
			return 'November';
		default:
			return 'Dezember';
	}
};
var $CoderDennis$elm_time_format$Time$Format$I18n$I_de_de$monthShort = function (month) {
	switch (month.$) {
		case 'Jan':
			return 'Jan';
		case 'Feb':
			return 'Feb';
		case 'Mar':
			return 'Mär';
		case 'Apr':
			return 'Apr';
		case 'May':
			return 'Mai';
		case 'Jun':
			return 'Jun';
		case 'Jul':
			return 'Jul';
		case 'Aug':
			return 'Aug';
		case 'Sep':
			return 'Sep';
		case 'Oct':
			return 'Okt';
		case 'Nov':
			return 'Nov';
		default:
			return 'Dez';
	}
};
var $CoderDennis$elm_time_format$Time$Format$I18n$I_default$twelveHourPeriod = function (period) {
	if (period.$ === 'AM') {
		return 'AM';
	} else {
		return 'PM';
	}
};
var $CoderDennis$elm_time_format$Time$Format$Config$Config_de_de$config = {
	format: {date: '%-d. %B %Y', dateTime: '%a, %-d. %b %Y. %-H:%M:%S', firstDayOfWeek: $elm$time$Time$Mon, longDate: '%A, %-d. %B %Y', longTime: '%-H:%M:%S', time: '%-H:%M'},
	i18n: {dayName: $CoderDennis$elm_time_format$Time$Format$I18n$I_de_de$dayName, dayOfMonthWithSuffix: $CoderDennis$elm_time_format$Time$Format$I18n$I_de_de$dayOfMonthWithSuffix, dayShort: $CoderDennis$elm_time_format$Time$Format$I18n$I_de_de$dayShort, monthName: $CoderDennis$elm_time_format$Time$Format$I18n$I_de_de$monthName, monthShort: $CoderDennis$elm_time_format$Time$Format$I18n$I_de_de$monthShort, twelveHourPeriod: $CoderDennis$elm_time_format$Time$Format$I18n$I_default$twelveHourPeriod}
};
var $elm$regex$Regex$Match = F4(
	function (match, index, number, submatches) {
		return {index: index, match: match, number: number, submatches: submatches};
	});
var $elm$regex$Regex$fromStringWith = _Regex_fromStringWith;
var $elm$regex$Regex$fromString = function (string) {
	return A2(
		$elm$regex$Regex$fromStringWith,
		{caseInsensitive: false, multiline: false},
		string);
};
var $elm$regex$Regex$never = _Regex_never;
var $CoderDennis$elm_time_format$Time$Format$formatRegex = A2(
	$elm$core$Maybe$withDefault,
	$elm$regex$Regex$never,
	$elm$regex$Regex$fromString('%(y|Y|m|_m|-m|B|^B|b|^b|d|-d|-@d|e|@e|A|^A|a|^a|H|-H|k|I|-I|l|p|P|M|S|%|L)'));
var $CoderDennis$elm_time_format$Time$Format$collapse = function (m) {
	return A2($elm$core$Maybe$andThen, $elm$core$Basics$identity, m);
};
var $CoderDennis$elm_time_format$Time$Format$hourMod12 = function (h) {
	return (!A2($elm$core$Basics$modBy, 12, h)) ? 12 : A2($elm$core$Basics$modBy, 12, h);
};
var $CoderDennis$elm_time_format$Time$Format$Core$monthToInt = function (month) {
	switch (month.$) {
		case 'Jan':
			return 1;
		case 'Feb':
			return 2;
		case 'Mar':
			return 3;
		case 'Apr':
			return 4;
		case 'May':
			return 5;
		case 'Jun':
			return 6;
		case 'Jul':
			return 7;
		case 'Aug':
			return 8;
		case 'Sep':
			return 9;
		case 'Oct':
			return 10;
		case 'Nov':
			return 11;
		default:
			return 12;
	}
};
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$String$repeatHelp = F3(
	function (n, chunk, result) {
		return (n <= 0) ? result : A3(
			$elm$core$String$repeatHelp,
			n >> 1,
			_Utils_ap(chunk, chunk),
			(!(n & 1)) ? result : _Utils_ap(result, chunk));
	});
var $elm$core$String$repeat = F2(
	function (n, chunk) {
		return A3($elm$core$String$repeatHelp, n, chunk, '');
	});
var $elm$core$String$padLeft = F3(
	function (n, _char, string) {
		return _Utils_ap(
			A2(
				$elm$core$String$repeat,
				n - $elm$core$String$length(string),
				$elm$core$String$fromChar(_char)),
			string);
	});
var $CoderDennis$elm_time_format$Time$Format$padWith = function (c) {
	return A2(
		$elm$core$Basics$composeL,
		A2($elm$core$String$padLeft, 2, c),
		$elm$core$String$fromInt);
};
var $CoderDennis$elm_time_format$Time$Format$padWithN = F2(
	function (n, c) {
		return A2(
			$elm$core$Basics$composeL,
			A2($elm$core$String$padLeft, n, c),
			$elm$core$String$fromInt);
	});
var $elm$core$String$right = F2(
	function (n, string) {
		return (n < 1) ? '' : A3(
			$elm$core$String$slice,
			-n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$toUpper = _String_toUpper;
var $elm$time$Time$toWeekday = F2(
	function (zone, time) {
		var _v0 = A2(
			$elm$core$Basics$modBy,
			7,
			A2(
				$elm$time$Time$flooredDiv,
				A2($elm$time$Time$toAdjustedMinutes, zone, time),
				60 * 24));
		switch (_v0) {
			case 0:
				return $elm$time$Time$Thu;
			case 1:
				return $elm$time$Time$Fri;
			case 2:
				return $elm$time$Time$Sat;
			case 3:
				return $elm$time$Time$Sun;
			case 4:
				return $elm$time$Time$Mon;
			case 5:
				return $elm$time$Time$Tue;
			default:
				return $elm$time$Time$Wed;
		}
	});
var $CoderDennis$elm_time_format$Time$Format$TwelveHourClock$AM = {$: 'AM'};
var $CoderDennis$elm_time_format$Time$Format$TwelveHourClock$PM = {$: 'PM'};
var $CoderDennis$elm_time_format$Time$Format$TwelveHourClock$twelveHourPeriod = F2(
	function (z, d) {
		return (A2($elm$time$Time$toHour, z, d) < 12) ? $CoderDennis$elm_time_format$Time$Format$TwelveHourClock$AM : $CoderDennis$elm_time_format$Time$Format$TwelveHourClock$PM;
	});
var $CoderDennis$elm_time_format$Time$Format$formatToken = F4(
	function (config, zone, d, m) {
		var symbol = A2(
			$elm$core$Maybe$withDefault,
			' ',
			$CoderDennis$elm_time_format$Time$Format$collapse(
				$elm$core$List$head(m.submatches)));
		switch (symbol) {
			case 'Y':
				return A3(
					$CoderDennis$elm_time_format$Time$Format$padWithN,
					4,
					_Utils_chr('0'),
					A2($elm$time$Time$toYear, zone, d));
			case 'y':
				return A2(
					$elm$core$String$right,
					2,
					A3(
						$CoderDennis$elm_time_format$Time$Format$padWithN,
						2,
						_Utils_chr('0'),
						A2($elm$time$Time$toYear, zone, d)));
			case 'm':
				return A2(
					$CoderDennis$elm_time_format$Time$Format$padWith,
					_Utils_chr('0'),
					$CoderDennis$elm_time_format$Time$Format$Core$monthToInt(
						A2($elm$time$Time$toMonth, zone, d)));
			case '_m':
				return A2(
					$CoderDennis$elm_time_format$Time$Format$padWith,
					_Utils_chr(' '),
					$CoderDennis$elm_time_format$Time$Format$Core$monthToInt(
						A2($elm$time$Time$toMonth, zone, d)));
			case '-m':
				return $elm$core$String$fromInt(
					$CoderDennis$elm_time_format$Time$Format$Core$monthToInt(
						A2($elm$time$Time$toMonth, zone, d)));
			case 'B':
				return config.i18n.monthName(
					A2($elm$time$Time$toMonth, zone, d));
			case '^B':
				return $elm$core$String$toUpper(
					config.i18n.monthName(
						A2($elm$time$Time$toMonth, zone, d)));
			case 'b':
				return config.i18n.monthShort(
					A2($elm$time$Time$toMonth, zone, d));
			case '^b':
				return $elm$core$String$toUpper(
					config.i18n.monthShort(
						A2($elm$time$Time$toMonth, zone, d)));
			case 'd':
				return A2(
					$CoderDennis$elm_time_format$Time$Format$padWith,
					_Utils_chr('0'),
					A2($elm$time$Time$toDay, zone, d));
			case '-d':
				return $elm$core$String$fromInt(
					A2($elm$time$Time$toDay, zone, d));
			case '-@d':
				return A2(
					config.i18n.dayOfMonthWithSuffix,
					false,
					A2($elm$time$Time$toDay, zone, d));
			case 'e':
				return A2(
					$CoderDennis$elm_time_format$Time$Format$padWith,
					_Utils_chr(' '),
					A2($elm$time$Time$toDay, zone, d));
			case '@e':
				return A2(
					config.i18n.dayOfMonthWithSuffix,
					true,
					A2($elm$time$Time$toDay, zone, d));
			case 'A':
				return config.i18n.dayName(
					A2($elm$time$Time$toWeekday, zone, d));
			case '^A':
				return $elm$core$String$toUpper(
					config.i18n.dayName(
						A2($elm$time$Time$toWeekday, zone, d)));
			case 'a':
				return config.i18n.dayShort(
					A2($elm$time$Time$toWeekday, zone, d));
			case '^a':
				return $elm$core$String$toUpper(
					config.i18n.dayShort(
						A2($elm$time$Time$toWeekday, zone, d)));
			case 'H':
				return A2(
					$CoderDennis$elm_time_format$Time$Format$padWith,
					_Utils_chr('0'),
					A2($elm$time$Time$toHour, zone, d));
			case '-H':
				return $elm$core$String$fromInt(
					A2($elm$time$Time$toHour, zone, d));
			case 'k':
				return A2(
					$CoderDennis$elm_time_format$Time$Format$padWith,
					_Utils_chr(' '),
					A2($elm$time$Time$toHour, zone, d));
			case 'I':
				return A2(
					$CoderDennis$elm_time_format$Time$Format$padWith,
					_Utils_chr('0'),
					$CoderDennis$elm_time_format$Time$Format$hourMod12(
						A2($elm$time$Time$toHour, zone, d)));
			case '-I':
				return $elm$core$String$fromInt(
					$CoderDennis$elm_time_format$Time$Format$hourMod12(
						A2($elm$time$Time$toHour, zone, d)));
			case 'l':
				return A2(
					$CoderDennis$elm_time_format$Time$Format$padWith,
					_Utils_chr(' '),
					$CoderDennis$elm_time_format$Time$Format$hourMod12(
						A2($elm$time$Time$toHour, zone, d)));
			case 'p':
				return $elm$core$String$toUpper(
					config.i18n.twelveHourPeriod(
						A2($CoderDennis$elm_time_format$Time$Format$TwelveHourClock$twelveHourPeriod, zone, d)));
			case 'P':
				return config.i18n.twelveHourPeriod(
					A2($CoderDennis$elm_time_format$Time$Format$TwelveHourClock$twelveHourPeriod, zone, d));
			case 'M':
				return A2(
					$CoderDennis$elm_time_format$Time$Format$padWith,
					_Utils_chr('0'),
					A2($elm$time$Time$toMinute, zone, d));
			case 'S':
				return A2(
					$CoderDennis$elm_time_format$Time$Format$padWith,
					_Utils_chr('0'),
					A2($elm$time$Time$toSecond, zone, d));
			case 'L':
				return A3(
					$CoderDennis$elm_time_format$Time$Format$padWithN,
					3,
					_Utils_chr('0'),
					A2($elm$time$Time$toMillis, zone, d));
			case '%':
				return symbol;
			default:
				return '';
		}
	});
var $elm$regex$Regex$replace = _Regex_replaceAtMost(_Regex_infinity);
var $CoderDennis$elm_time_format$Time$Format$format = F4(
	function (config, formatStr, zone, time) {
		return A3(
			$elm$regex$Regex$replace,
			$CoderDennis$elm_time_format$Time$Format$formatRegex,
			A3($CoderDennis$elm_time_format$Time$Format$formatToken, config, zone, time),
			formatStr);
	});
var $author$project$Main$posixToString = function (time) {
	return A4($CoderDennis$elm_time_format$Time$Format$format, $CoderDennis$elm_time_format$Time$Format$Config$Config_de_de$config, '%Y-%m-%d %H:%M', $author$project$Main$timeZone, time);
};
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $author$project$Main$viewPeriodeLine = F2(
	function (permission, periode) {
		return A2(
			$elm$html$Html$tr,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Main$posixToString(periode.start))
						])),
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Main$durationToTimeString(periode.duration))
						])),
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Main$durationToMonyString(periode.duration))
						])),
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(periode.comment)
						])),
					A2(
					$author$project$Main$canWrite,
					permission,
					A2(
						$elm$html$Html$td,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('buttons')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Attributes$class('btn btn-danger'),
										$elm$html$Html$Events$onClick(
										$author$project$Main$ClickContinue(periode.id))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('→')
									])),
								A2(
								$elm$html$Html$button,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$type_('button'),
										$elm$html$Html$Attributes$class('btn btn-danger'),
										$elm$html$Html$Events$onClick(
										$author$project$Main$ClickDelete(periode.id))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('✖')
									]))
							])))
				]));
	});
var $author$project$Main$viewPeriodeSummary = F2(
	function (permission, periodes) {
		var duration = $author$project$Main$combineDurations(
			A2(
				$elm$core$List$map,
				function ($) {
					return $.duration;
				},
				periodes));
		return A2(
			$elm$html$Html$tr,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Gesamt')
						])),
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Main$durationToTimeString(duration))
						])),
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Main$durationToMonyString(duration))
						])),
					A2(
					$elm$html$Html$td,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('')
						])),
					A2(
					$author$project$Main$canWrite,
					permission,
					A2(
						$elm$html$Html$td,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text('')
							])))
				]));
	});
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 'MayStopPropagation', a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$select = _VirtualDom_node('select');
var $author$project$YearMonth$unique = function (list) {
	unique:
	while (true) {
		if (list.b) {
			if (list.b.b) {
				var first = list.a;
				var _v1 = list.b;
				var second = _v1.a;
				var tail = _v1.b;
				if (_Utils_eq(first, second)) {
					var $temp$list = A2($elm$core$List$cons, first, tail);
					list = $temp$list;
					continue unique;
				} else {
					return A2(
						$elm$core$List$cons,
						first,
						$author$project$YearMonth$unique(
							A2($elm$core$List$cons, second, tail)));
				}
			} else {
				var first = list.a;
				return _List_fromArray(
					[first]);
			}
		} else {
			return _List_Nil;
		}
	}
};
var $elm$html$Html$option = _VirtualDom_node('option');
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$selected = $elm$html$Html$Attributes$boolProperty('selected');
var $elm$core$String$toLower = _String_toLower;
var $author$project$YearMonth$toAttr = function (yearMonth) {
	if (yearMonth.$ === 'All') {
		return 'alle';
	} else {
		var year = yearMonth.a;
		var month = yearMonth.b;
		return $elm$core$String$toLower(
			$elm$core$String$fromInt(year) + ('_' + $author$project$YearMonth$monthToString(month)));
	}
};
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$YearMonth$viewYearMonthOption = F2(
	function (selectedYM, ym) {
		return A2(
			$elm$html$Html$option,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$value(
					$author$project$YearMonth$toAttr(ym)),
					$elm$html$Html$Attributes$selected(
					_Utils_eq(selectedYM, ym))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(
					$author$project$YearMonth$toString(ym))
				]));
	});
var $author$project$YearMonth$yearMonthList = function (zone) {
	return $elm$core$List$map(
		$author$project$YearMonth$fromPosix(zone));
};
var $author$project$YearMonth$viewYearMonthSelect = F4(
	function (zone, selected, event, times) {
		return A2(
			$elm$html$Html$select,
			_List_fromArray(
				[
					$elm$html$Html$Events$onInput(event)
				]),
			A2(
				$elm$core$List$map,
				$author$project$YearMonth$viewYearMonthOption(selected),
				A2(
					$elm$core$List$cons,
					$author$project$YearMonth$All,
					$author$project$YearMonth$unique(
						A2($author$project$YearMonth$yearMonthList, zone, times)))));
	});
var $author$project$Main$viewPeriodes = F4(
	function (zone, selected, permission, periodes) {
		var sorted = $author$project$Periode$sort(periodes);
		var filtered = A3($author$project$Periode$filterYearMonth, $author$project$Main$timeZone, selected, sorted);
		var tableBody = A2(
			$elm$core$List$cons,
			A2($author$project$Main$viewPeriodeSummary, permission, filtered),
			A2(
				$elm$core$List$map,
				$author$project$Main$viewPeriodeLine(permission),
				filtered));
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A4(
					$author$project$YearMonth$viewYearMonthSelect,
					zone,
					selected,
					$author$project$Main$SelectYearMonth,
					A2(
						$elm$core$List$map,
						function ($) {
							return $.start;
						},
						sorted)),
					A2(
					$elm$html$Html$table,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('table')
						]),
					_List_fromArray(
						[
							$author$project$Main$viewPeriodeHeader(permission),
							A2($elm$html$Html$tbody, _List_Nil, tableBody)
						]))
				]));
	});
var $author$project$Main$viewBody = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				$elm$html$Html$ul,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('nav nav-tabs')
					]),
				_List_fromArray(
					[
						A2($author$project$Main$navLink, $author$project$Main$ViewMonthly, model.viewBody),
						A2($author$project$Main$navLink, $author$project$Main$ViewPeriodes, model.viewBody)
					])),
				function () {
				var _v0 = model.viewBody;
				if (_v0.$ === 'ViewMonthly') {
					return A2($author$project$Main$viewMonthly, $author$project$Main$timeZone, model.periodes);
				} else {
					return A4($author$project$Main$viewPeriodes, $author$project$Main$timeZone, model.formYearMonth, model.permission, model.periodes);
				}
			}()
			]));
};
var $author$project$Main$Start = {$: 'Start'};
var $author$project$Main$Stop = {$: 'Stop'};
var $ianmackenzie$elm_units$Duration$from = F2(
	function (startTime, endTime) {
		var numMilliseconds = $elm$time$Time$posixToMillis(endTime) - $elm$time$Time$posixToMillis(startTime);
		return $ianmackenzie$elm_units$Duration$milliseconds(numMilliseconds);
	});
var $author$project$Main$ClickStart = {$: 'ClickStart'};
var $author$project$Main$ClickStop = {$: 'ClickStop'};
var $author$project$Main$InsertComment = function (a) {
	return {$: 'InsertComment', a: a};
};
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $elm$html$Html$input = _VirtualDom_node('input');
var $author$project$Main$viewStartStopForm = F2(
	function (startStop, comment) {
		var _v0 = function () {
			if (startStop.$ === 'Start') {
				return _Utils_Tuple2($author$project$Main$ClickStart, 'Start');
			} else {
				return _Utils_Tuple2($author$project$Main$ClickStop, 'Stop');
			}
		}();
		var event = _v0.a;
		var buttonText = _v0.b;
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('btn btn-primary'),
							$elm$html$Html$Events$onClick(event)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(buttonText)
						])),
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$id('comment'),
							$elm$html$Html$Attributes$type_('text'),
							$elm$html$Html$Attributes$value(comment),
							$elm$html$Html$Events$onInput($author$project$Main$InsertComment)
						]),
					_List_Nil)
				]));
	});
var $author$project$Main$viewCurrent = F3(
	function (current, insertedComment, currentTime) {
		if (current.$ === 'Stopped') {
			return A2($author$project$Main$viewStartStopForm, $author$project$Main$Start, insertedComment);
		} else {
			var start = current.a;
			var serverComment = current.b;
			var mony = $author$project$Main$durationToMonyString(
				A2($ianmackenzie$elm_units$Duration$from, start, currentTime));
			return A2(
				$elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2($author$project$Main$viewStartStopForm, $author$project$Main$Stop, insertedComment),
						A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text(
								'running since ' + ($author$project$Main$posixToString(start) + (': ' + (serverComment + (': ' + mony)))))
							]))
					]));
		}
	});
var $author$project$Main$ClickLogout = {$: 'ClickLogout'};
var $elm$html$Html$footer = _VirtualDom_node('footer');
var $author$project$Main$viewFooter = A2(
	$elm$html$Html$footer,
	_List_fromArray(
		[
			$elm$html$Html$Attributes$class('fixed-bottom container')
		]),
	_List_fromArray(
		[
			A2(
			$elm$html$Html$a,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$href('https://github.com/ostcar/timer')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('github')
				])),
			$elm$html$Html$text(' · '),
			A2(
			$elm$html$Html$a,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$href('#'),
					$elm$html$Html$Attributes$class('link-primary'),
					$elm$html$Html$Events$onClick($author$project$Main$ClickLogout)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('logout')
				]))
		]));
var $author$project$Main$ClickAdd = {$: 'ClickAdd'};
var $author$project$Main$ClickDatePicker = {$: 'ClickDatePicker'};
var $author$project$Main$ClickInsert = {$: 'ClickInsert'};
var $author$project$Main$InsertAddComment = function (a) {
	return {$: 'InsertAddComment', a: a};
};
var $author$project$Main$InsertAddDuration = function (a) {
	return {$: 'InsertAddDuration', a: a};
};
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $elm$html$Html$span = _VirtualDom_node('span');
var $justinmimbs$date$Date$Days = {$: 'Days'};
var $justinmimbs$date$Date$Months = {$: 'Months'};
var $elm$core$Basics$min = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) < 0) ? x : y;
	});
var $justinmimbs$date$Date$add = F3(
	function (unit, n, _v0) {
		var rd = _v0.a;
		switch (unit.$) {
			case 'Years':
				return A3(
					$justinmimbs$date$Date$add,
					$justinmimbs$date$Date$Months,
					12 * n,
					$justinmimbs$date$Date$RD(rd));
			case 'Months':
				var date = $justinmimbs$date$Date$toCalendarDate(
					$justinmimbs$date$Date$RD(rd));
				var wholeMonths = ((12 * (date.year - 1)) + ($justinmimbs$date$Date$monthToNumber(date.month) - 1)) + n;
				var m = $justinmimbs$date$Date$numberToMonth(
					A2($elm$core$Basics$modBy, 12, wholeMonths) + 1);
				var y = A2($justinmimbs$date$Date$floorDiv, wholeMonths, 12) + 1;
				return $justinmimbs$date$Date$RD(
					($justinmimbs$date$Date$daysBeforeYear(y) + A2($justinmimbs$date$Date$daysBeforeMonth, y, m)) + A2(
						$elm$core$Basics$min,
						date.day,
						A2($justinmimbs$date$Date$daysInMonth, y, m)));
			case 'Weeks':
				return $justinmimbs$date$Date$RD(rd + (7 * n));
			default:
				return $justinmimbs$date$Date$RD(rd + n);
		}
	});
var $justinmimbs$time_extra$Time$Extra$add = F4(
	function (interval, n, zone, posix) {
		add:
		while (true) {
			switch (interval.$) {
				case 'Millisecond':
					return $elm$time$Time$millisToPosix(
						$elm$time$Time$posixToMillis(posix) + n);
				case 'Second':
					var $temp$interval = $justinmimbs$time_extra$Time$Extra$Millisecond,
						$temp$n = n * 1000,
						$temp$zone = zone,
						$temp$posix = posix;
					interval = $temp$interval;
					n = $temp$n;
					zone = $temp$zone;
					posix = $temp$posix;
					continue add;
				case 'Minute':
					var $temp$interval = $justinmimbs$time_extra$Time$Extra$Millisecond,
						$temp$n = n * 60000,
						$temp$zone = zone,
						$temp$posix = posix;
					interval = $temp$interval;
					n = $temp$n;
					zone = $temp$zone;
					posix = $temp$posix;
					continue add;
				case 'Hour':
					var $temp$interval = $justinmimbs$time_extra$Time$Extra$Millisecond,
						$temp$n = n * 3600000,
						$temp$zone = zone,
						$temp$posix = posix;
					interval = $temp$interval;
					n = $temp$n;
					zone = $temp$zone;
					posix = $temp$posix;
					continue add;
				case 'Day':
					return A3(
						$justinmimbs$time_extra$Time$Extra$posixFromDateTime,
						zone,
						A3(
							$justinmimbs$date$Date$add,
							$justinmimbs$date$Date$Days,
							n,
							A2($justinmimbs$date$Date$fromPosix, zone, posix)),
						A2($justinmimbs$time_extra$Time$Extra$timeFromPosix, zone, posix));
				case 'Month':
					return A3(
						$justinmimbs$time_extra$Time$Extra$posixFromDateTime,
						zone,
						A3(
							$justinmimbs$date$Date$add,
							$justinmimbs$date$Date$Months,
							n,
							A2($justinmimbs$date$Date$fromPosix, zone, posix)),
						A2($justinmimbs$time_extra$Time$Extra$timeFromPosix, zone, posix));
				case 'Year':
					var $temp$interval = $justinmimbs$time_extra$Time$Extra$Month,
						$temp$n = n * 12,
						$temp$zone = zone,
						$temp$posix = posix;
					interval = $temp$interval;
					n = $temp$n;
					zone = $temp$zone;
					posix = $temp$posix;
					continue add;
				case 'Quarter':
					var $temp$interval = $justinmimbs$time_extra$Time$Extra$Month,
						$temp$n = n * 3,
						$temp$zone = zone,
						$temp$posix = posix;
					interval = $temp$interval;
					n = $temp$n;
					zone = $temp$zone;
					posix = $temp$posix;
					continue add;
				case 'Week':
					var $temp$interval = $justinmimbs$time_extra$Time$Extra$Day,
						$temp$n = n * 7,
						$temp$zone = zone,
						$temp$posix = posix;
					interval = $temp$interval;
					n = $temp$n;
					zone = $temp$zone;
					posix = $temp$posix;
					continue add;
				default:
					var weekday = interval;
					var $temp$interval = $justinmimbs$time_extra$Time$Extra$Day,
						$temp$n = n * 7,
						$temp$zone = zone,
						$temp$posix = posix;
					interval = $temp$interval;
					n = $temp$n;
					zone = $temp$zone;
					posix = $temp$posix;
					continue add;
			}
		}
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix = 'elm-datetimepicker-single--';
var $mercurymedia$elm_datetime_picker$SingleDatePicker$NextMonth = {$: 'NextMonth'};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$NextYear = {$: 'NextYear'};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$PrevMonth = {$: 'PrevMonth'};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$PrevYear = {$: 'PrevYear'};
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$Icon = function (a) {
	return {$: 'Icon', a: a};
};
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$defaultAttributes = function (name) {
	return {
		_class: $elm$core$Maybe$Just('feather feather-' + name),
		size: 24,
		sizeUnit: '',
		strokeWidth: 2,
		viewBox: '0 0 24 24'
	};
};
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$makeBuilder = F2(
	function (name, src) {
		return $mercurymedia$elm_datetime_picker$DatePicker$Icons$Icon(
			{
				attrs: $mercurymedia$elm_datetime_picker$DatePicker$Icons$defaultAttributes(name),
				src: src
			});
	});
var $elm$svg$Svg$Attributes$points = _VirtualDom_attribute('points');
var $elm$svg$Svg$trustedNode = _VirtualDom_nodeNS('http://www.w3.org/2000/svg');
var $elm$svg$Svg$polyline = $elm$svg$Svg$trustedNode('polyline');
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronLeft = A2(
	$mercurymedia$elm_datetime_picker$DatePicker$Icons$makeBuilder,
	'chevron-left',
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$polyline,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$points('15 18 9 12 15 6')
				]),
			_List_Nil)
		]));
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronRight = A2(
	$mercurymedia$elm_datetime_picker$DatePicker$Icons$makeBuilder,
	'chevron-right',
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$polyline,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$points('9 18 15 12 9 6')
				]),
			_List_Nil)
		]));
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronsLeft = A2(
	$mercurymedia$elm_datetime_picker$DatePicker$Icons$makeBuilder,
	'chevrons-left',
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$polyline,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$points('11 17 6 12 11 7')
				]),
			_List_Nil),
			A2(
			$elm$svg$Svg$polyline,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$points('18 17 13 12 18 7')
				]),
			_List_Nil)
		]));
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronsRight = A2(
	$mercurymedia$elm_datetime_picker$DatePicker$Icons$makeBuilder,
	'chevrons-right',
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$polyline,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$points('13 17 18 12 13 7')
				]),
			_List_Nil),
			A2(
			$elm$svg$Svg$polyline,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$points('6 17 11 12 6 7')
				]),
			_List_Nil)
		]));
var $elm$svg$Svg$Attributes$class = _VirtualDom_attribute('class');
var $elm$svg$Svg$Attributes$fill = _VirtualDom_attribute('fill');
var $elm$core$String$fromFloat = _String_fromNumber;
var $elm$svg$Svg$Attributes$height = _VirtualDom_attribute('height');
var $elm$virtual_dom$VirtualDom$map = _VirtualDom_map;
var $elm$svg$Svg$map = $elm$virtual_dom$VirtualDom$map;
var $elm$svg$Svg$Attributes$stroke = _VirtualDom_attribute('stroke');
var $elm$svg$Svg$Attributes$strokeLinecap = _VirtualDom_attribute('stroke-linecap');
var $elm$svg$Svg$Attributes$strokeLinejoin = _VirtualDom_attribute('stroke-linejoin');
var $elm$svg$Svg$Attributes$strokeWidth = _VirtualDom_attribute('stroke-width');
var $elm$svg$Svg$svg = $elm$svg$Svg$trustedNode('svg');
var $elm$svg$Svg$Attributes$viewBox = _VirtualDom_attribute('viewBox');
var $elm$svg$Svg$Attributes$width = _VirtualDom_attribute('width');
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$toHtml = F2(
	function (attributes, _v0) {
		var src = _v0.a.src;
		var attrs = _v0.a.attrs;
		var strSize = $elm$core$String$fromFloat(attrs.size);
		var baseAttributes = _List_fromArray(
			[
				$elm$svg$Svg$Attributes$fill('none'),
				$elm$svg$Svg$Attributes$height(
				_Utils_ap(strSize, attrs.sizeUnit)),
				$elm$svg$Svg$Attributes$width(
				_Utils_ap(strSize, attrs.sizeUnit)),
				$elm$svg$Svg$Attributes$stroke('currentColor'),
				$elm$svg$Svg$Attributes$strokeLinecap('round'),
				$elm$svg$Svg$Attributes$strokeLinejoin('round'),
				$elm$svg$Svg$Attributes$strokeWidth(
				$elm$core$String$fromFloat(attrs.strokeWidth)),
				$elm$svg$Svg$Attributes$viewBox(attrs.viewBox)
			]);
		var combinedAttributes = _Utils_ap(
			function () {
				var _v1 = attrs._class;
				if (_v1.$ === 'Just') {
					var c = _v1.a;
					return A2(
						$elm$core$List$cons,
						$elm$svg$Svg$Attributes$class(c),
						baseAttributes);
				} else {
					return baseAttributes;
				}
			}(),
			attributes);
		return A2(
			$elm$svg$Svg$svg,
			combinedAttributes,
			A2(
				$elm$core$List$map,
				$elm$svg$Svg$map($elm$core$Basics$never),
				src));
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$generateListOfWeekDay = function (firstWeekDay) {
	switch (firstWeekDay.$) {
		case 'Mon':
			return _List_fromArray(
				[$elm$time$Time$Mon, $elm$time$Time$Tue, $elm$time$Time$Wed, $elm$time$Time$Thu, $elm$time$Time$Fri, $elm$time$Time$Sat, $elm$time$Time$Sun]);
		case 'Tue':
			return _List_fromArray(
				[$elm$time$Time$Tue, $elm$time$Time$Wed, $elm$time$Time$Thu, $elm$time$Time$Fri, $elm$time$Time$Sat, $elm$time$Time$Sun, $elm$time$Time$Mon]);
		case 'Wed':
			return _List_fromArray(
				[$elm$time$Time$Wed, $elm$time$Time$Thu, $elm$time$Time$Fri, $elm$time$Time$Sat, $elm$time$Time$Sun, $elm$time$Time$Mon, $elm$time$Time$Tue]);
		case 'Thu':
			return _List_fromArray(
				[$elm$time$Time$Thu, $elm$time$Time$Fri, $elm$time$Time$Sat, $elm$time$Time$Sun, $elm$time$Time$Mon, $elm$time$Time$Tue, $elm$time$Time$Wed]);
		case 'Fri':
			return _List_fromArray(
				[$elm$time$Time$Fri, $elm$time$Time$Sat, $elm$time$Time$Sun, $elm$time$Time$Mon, $elm$time$Time$Tue, $elm$time$Time$Wed, $elm$time$Time$Thu]);
		case 'Sat':
			return _List_fromArray(
				[$elm$time$Time$Sat, $elm$time$Time$Sun, $elm$time$Time$Mon, $elm$time$Time$Tue, $elm$time$Time$Wed, $elm$time$Time$Thu, $elm$time$Time$Fri]);
		default:
			return _List_fromArray(
				[$elm$time$Time$Sun, $elm$time$Time$Mon, $elm$time$Time$Tue, $elm$time$Time$Wed, $elm$time$Time$Thu, $elm$time$Time$Fri, $elm$time$Time$Sat]);
	}
};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewHeaderDay = F2(
	function (formatDay, day) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header-day')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(
					formatDay(day))
				]));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewWeekHeader = function (settings) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header-week')
			]),
		A2(
			$elm$core$List$map,
			$mercurymedia$elm_datetime_picker$SingleDatePicker$viewHeaderDay(settings.formattedDay),
			$mercurymedia$elm_datetime_picker$DatePicker$Utilities$generateListOfWeekDay(settings.firstWeekDay)));
};
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$withSize = F2(
	function (size, _v0) {
		var attrs = _v0.a.attrs;
		var src = _v0.a.src;
		return $mercurymedia$elm_datetime_picker$DatePicker$Icons$Icon(
			{
				attrs: _Utils_update(
					attrs,
					{size: size}),
				src: src
			});
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewCalendarHeader = F3(
	function (settings, model, time) {
		var year = $elm$core$String$fromInt(
			A2($elm$time$Time$toYear, settings.zone, time));
		var monthName = settings.formattedMonth(
			A2($elm$time$Time$toMonth, settings.zone, time));
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header-row')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$id('previous-month'),
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header-chevron'),
									$elm$html$Html$Events$onClick(
									settings.internalMsg(
										A3(
											$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
											settings,
											$mercurymedia$elm_datetime_picker$SingleDatePicker$PrevMonth,
											$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model))))
								]),
							_List_fromArray(
								[
									A2(
									$mercurymedia$elm_datetime_picker$DatePicker$Icons$toHtml,
									_List_Nil,
									A2($mercurymedia$elm_datetime_picker$DatePicker$Icons$withSize, 12, $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronLeft))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header-text')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$id('month')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(monthName)
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$id('next-month'),
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header-chevron'),
									$elm$html$Html$Events$onClick(
									settings.internalMsg(
										A3(
											$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
											settings,
											$mercurymedia$elm_datetime_picker$SingleDatePicker$NextMonth,
											$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model))))
								]),
							_List_fromArray(
								[
									A2(
									$mercurymedia$elm_datetime_picker$DatePicker$Icons$toHtml,
									_List_Nil,
									A2($mercurymedia$elm_datetime_picker$DatePicker$Icons$withSize, 12, $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronRight))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header-row')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$id('previous-year'),
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header-chevron'),
									$elm$html$Html$Events$onClick(
									settings.internalMsg(
										A3(
											$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
											settings,
											$mercurymedia$elm_datetime_picker$SingleDatePicker$PrevYear,
											$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model))))
								]),
							_List_fromArray(
								[
									A2(
									$mercurymedia$elm_datetime_picker$DatePicker$Icons$toHtml,
									_List_Nil,
									A2($mercurymedia$elm_datetime_picker$DatePicker$Icons$withSize, 12, $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronsLeft))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header-text')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$id('year')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(year)
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$id('next-year'),
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-header-chevron'),
									$elm$html$Html$Events$onClick(
									settings.internalMsg(
										A3(
											$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
											settings,
											$mercurymedia$elm_datetime_picker$SingleDatePicker$NextYear,
											$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model))))
								]),
							_List_fromArray(
								[
									A2(
									$mercurymedia$elm_datetime_picker$DatePicker$Icons$toHtml,
									_List_Nil,
									A2($mercurymedia$elm_datetime_picker$DatePicker$Icons$withSize, 12, $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronsRight))
								]))
						])),
					$mercurymedia$elm_datetime_picker$SingleDatePicker$viewWeekHeader(settings)
				]));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$ToggleTimePickerVisibility = {$: 'ToggleTimePickerVisibility'};
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronDown = A2(
	$mercurymedia$elm_datetime_picker$DatePicker$Icons$makeBuilder,
	'chevron-down',
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$polyline,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$points('6 9 12 15 18 9')
				]),
			_List_Nil)
		]));
var $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronUp = A2(
	$mercurymedia$elm_datetime_picker$DatePicker$Icons$makeBuilder,
	'chevron-up',
	_List_fromArray(
		[
			A2(
			$elm$svg$Svg$polyline,
			_List_fromArray(
				[
					$elm$svg$Svg$Attributes$points('18 15 12 9 6 15')
				]),
			_List_Nil)
		]));
var $mercurymedia$elm_datetime_picker$SingleDatePicker$showHoveredIfEnabled = function (hovered) {
	return hovered.disabled ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(hovered);
};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$determineDateTime = F3(
	function (zone, selectionTuple, hoveredDay) {
		var hovered = A2($elm$core$Maybe$andThen, $mercurymedia$elm_datetime_picker$SingleDatePicker$showHoveredIfEnabled, hoveredDay);
		if (hovered.$ === 'Just') {
			var h = hovered.a;
			return A3($mercurymedia$elm_datetime_picker$DatePicker$SingleUtilities$selectDay, zone, selectionTuple, h);
		} else {
			return selectionTuple;
		}
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$timeIsStartOfDay = F2(
	function (settings, time) {
		var _v0 = A2($justinmimbs$time_extra$Time$Extra$posixToParts, settings.zone, time);
		var hour = _v0.hour;
		var minute = _v0.minute;
		return (!hour) && (!minute);
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewDate = F2(
	function (settings, dateTime) {
		return A2(
			$elm$html$Html$span,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text(
					A2(settings.dateStringFn, settings.zone, dateTime))
				]));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewDateTime = F4(
	function (settings, timeStringFn, classString, dateTime) {
		return A2(
			$elm$html$Html$span,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text(
					A2(settings.dateStringFn, settings.zone, dateTime)),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(
							_Utils_ap($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix, classString))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							A2(timeStringFn, settings.zone, dateTime))
						]))
				]));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewDateOrDateTime = F2(
	function (settings, dateTime) {
		return A2(
			$elm$core$Maybe$withDefault,
			A2($mercurymedia$elm_datetime_picker$SingleDatePicker$viewDate, settings, dateTime),
			A2(
				$elm$core$Maybe$map,
				function (timePickerSettings) {
					return A2($mercurymedia$elm_datetime_picker$SingleDatePicker$timeIsStartOfDay, settings, dateTime) ? A2($mercurymedia$elm_datetime_picker$SingleDatePicker$viewDate, settings, dateTime) : A4($mercurymedia$elm_datetime_picker$SingleDatePicker$viewDateTime, settings, timePickerSettings.timeStringFn, 'selection-time', dateTime);
				},
				$mercurymedia$elm_datetime_picker$SingleDatePicker$getTimePickerSettings(settings)));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewEmpty = A2(
	$elm$html$Html$span,
	_List_Nil,
	_List_fromArray(
		[
			$elm$html$Html$text('')
		]));
var $mercurymedia$elm_datetime_picker$SingleDatePicker$determineDateTimeView = F2(
	function (settings, selectionTuple) {
		if (selectionTuple.$ === 'Nothing') {
			return $mercurymedia$elm_datetime_picker$SingleDatePicker$viewEmpty;
		} else {
			var _v1 = selectionTuple.a;
			var selection = _v1.b;
			return A2($mercurymedia$elm_datetime_picker$SingleDatePicker$viewDateOrDateTime, settings, selection);
		}
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$SetHour = function (a) {
	return {$: 'SetHour', a: a};
};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$SetMinute = function (a) {
	return {$: 'SetMinute', a: a};
};
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$hourBoundsForSelectedMinute = F2(
	function (zone, _v0) {
		var pickerDay = _v0.a;
		var selection = _v0.b;
		var _v1 = A2($mercurymedia$elm_datetime_picker$DatePicker$Utilities$timeOfDayFromPosix, zone, pickerDay.start);
		var startBoundaryHour = _v1.a;
		var startBoundaryMinute = _v1.b;
		var _v2 = A2($mercurymedia$elm_datetime_picker$DatePicker$Utilities$timeOfDayFromPosix, zone, selection);
		var selectedMinute = _v2.b;
		var earliestSelectableHour = (_Utils_cmp(selectedMinute, startBoundaryMinute) < 0) ? (startBoundaryHour + 1) : startBoundaryHour;
		var _v3 = A2($mercurymedia$elm_datetime_picker$DatePicker$Utilities$timeOfDayFromPosix, zone, pickerDay.end);
		var endBoundaryHour = _v3.a;
		var endBoundaryMinute = _v3.b;
		var latestSelectableHour = (_Utils_cmp(selectedMinute, endBoundaryMinute) > 0) ? (endBoundaryHour - 1) : endBoundaryHour;
		return _Utils_Tuple2(earliestSelectableHour, latestSelectableHour);
	});
var $mercurymedia$elm_datetime_picker$DatePicker$SingleUtilities$filterSelectableTimes = F3(
	function (zone, baseDay, selectionTuple) {
		if (selectionTuple.$ === 'Just') {
			var _v1 = selectionTuple.a;
			var pickerDay = _v1.a;
			var selection = _v1.b;
			var _v2 = A2(
				$mercurymedia$elm_datetime_picker$DatePicker$Utilities$minuteBoundsForSelectedHour,
				zone,
				_Utils_Tuple2(pickerDay, selection));
			var earliestSelectableMinute = _v2.a;
			var latestSelectableMinute = _v2.b;
			var _v3 = A2(
				$mercurymedia$elm_datetime_picker$DatePicker$Utilities$hourBoundsForSelectedMinute,
				zone,
				_Utils_Tuple2(pickerDay, selection));
			var earliestSelectableHour = _v3.a;
			var latestSelectableHour = _v3.b;
			return {
				selectableHours: A2($elm$core$List$range, earliestSelectableHour, latestSelectableHour),
				selectableMinutes: A2($elm$core$List$range, earliestSelectableMinute, latestSelectableMinute)
			};
		} else {
			var _v4 = A2(
				$mercurymedia$elm_datetime_picker$DatePicker$Utilities$minuteBoundsForSelectedHour,
				zone,
				_Utils_Tuple2(baseDay, baseDay.start));
			var earliestSelectableMinute = _v4.a;
			var latestSelectableMinute = _v4.b;
			var _v5 = A2(
				$mercurymedia$elm_datetime_picker$DatePicker$Utilities$hourBoundsForSelectedMinute,
				zone,
				_Utils_Tuple2(baseDay, baseDay.start));
			var earliestSelectableHour = _v5.a;
			var latestSelectableHour = _v5.b;
			return {
				selectableHours: A2($elm$core$List$range, earliestSelectableHour, latestSelectableHour),
				selectableMinutes: A2($elm$core$List$range, earliestSelectableMinute, latestSelectableMinute)
			};
		}
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$addLeadingZero = function (value) {
	var string = $elm$core$String$fromInt(value);
	return ($elm$core$String$length(string) === 1) ? ('0' + string) : string;
};
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$generateHourOptions = F3(
	function (zone, selectionTuple, selectableHours) {
		var isSelected = function (h) {
			return A2(
				$elm$core$Maybe$withDefault,
				false,
				A2(
					$elm$core$Maybe$map,
					function (_v0) {
						var selection = _v0.b;
						return _Utils_eq(
							A2($elm$time$Time$toHour, zone, selection),
							h);
					},
					selectionTuple));
		};
		return A2(
			$elm$core$List$map,
			function (hour) {
				return A2(
					$elm$html$Html$option,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$value(
							$elm$core$String$fromInt(hour)),
							$elm$html$Html$Attributes$selected(
							isSelected(hour))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$mercurymedia$elm_datetime_picker$DatePicker$Utilities$addLeadingZero(hour))
						]));
			},
			selectableHours);
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$generateMinuteOptions = F3(
	function (zone, selectionTuple, selectableMinutes) {
		var isSelected = function (m) {
			return A2(
				$elm$core$Maybe$withDefault,
				false,
				A2(
					$elm$core$Maybe$map,
					function (_v0) {
						var selection = _v0.b;
						return _Utils_eq(
							A2($elm$time$Time$toMinute, zone, selection),
							m);
					},
					selectionTuple));
		};
		return A2(
			$elm$core$List$map,
			function (minute) {
				return A2(
					$elm$html$Html$option,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$value(
							$elm$core$String$fromInt(minute)),
							$elm$html$Html$Attributes$selected(
							isSelected(minute))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$mercurymedia$elm_datetime_picker$DatePicker$Utilities$addLeadingZero(minute))
						]));
			},
			selectableMinutes);
	});
var $elm_community$html_extra$Html$Events$Extra$customDecoder = F2(
	function (d, f) {
		var resultDecoder = function (x) {
			if (x.$ === 'Ok') {
				var a = x.a;
				return $elm$json$Json$Decode$succeed(a);
			} else {
				var e = x.a;
				return $elm$json$Json$Decode$fail(e);
			}
		};
		return A2(
			$elm$json$Json$Decode$andThen,
			resultDecoder,
			A2($elm$json$Json$Decode$map, f, d));
	});
var $elm_community$html_extra$Html$Events$Extra$maybeStringToResult = $elm$core$Result$fromMaybe('could not convert string');
var $elm_community$html_extra$Html$Events$Extra$targetValueIntParse = A2(
	$elm_community$html_extra$Html$Events$Extra$customDecoder,
	$elm$html$Html$Events$targetValue,
	A2($elm$core$Basics$composeR, $elm$core$String$toInt, $elm_community$html_extra$Html$Events$Extra$maybeStringToResult));
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewTimePicker = F4(
	function (settings, model, baseDay, selectionTuple) {
		var _v0 = A3($mercurymedia$elm_datetime_picker$DatePicker$SingleUtilities$filterSelectableTimes, settings.zone, baseDay, selectionTuple);
		var selectableHours = _v0.selectableHours;
		var selectableMinutes = _v0.selectableMinutes;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'time-picker')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'select-container')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'select')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$select,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$id('hour-select'),
											A2(
											$elm$html$Html$Events$on,
											'change',
											A2(
												$elm$json$Json$Decode$map,
												settings.internalMsg,
												A2(
													$elm$json$Json$Decode$map,
													function (msg) {
														return A3(
															$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
															settings,
															msg,
															$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model));
													},
													A2($elm$json$Json$Decode$map, $mercurymedia$elm_datetime_picker$SingleDatePicker$SetHour, $elm_community$html_extra$Html$Events$Extra$targetValueIntParse))))
										]),
									A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$generateHourOptions, settings.zone, selectionTuple, selectableHours))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'select-spacer')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(':')
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'select')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$select,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$id('minute-select'),
											A2(
											$elm$html$Html$Events$on,
											'change',
											A2(
												$elm$json$Json$Decode$map,
												settings.internalMsg,
												A2(
													$elm$json$Json$Decode$map,
													function (msg) {
														return A3(
															$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
															settings,
															msg,
															$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model));
													},
													A2($elm$json$Json$Decode$map, $mercurymedia$elm_datetime_picker$SingleDatePicker$SetMinute, $elm_community$html_extra$Html$Events$Extra$targetValueIntParse))))
										]),
									A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$generateMinuteOptions, settings.zone, selectionTuple, selectableMinutes))
								]))
						]))
				]));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewFooter = F4(
	function (settings, timePickerVisible, baseDay, model) {
		var displayTime = A3($mercurymedia$elm_datetime_picker$SingleDatePicker$determineDateTime, settings.zone, model.selectionTuple, model.hovered);
		var displayTimeView = A2($mercurymedia$elm_datetime_picker$SingleDatePicker$determineDateTimeView, settings, displayTime);
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'footer')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'time-picker-container')
								]),
							_List_fromArray(
								[
									function () {
									var _v0 = settings.timePickerVisibility;
									switch (_v0.$) {
										case 'NeverVisible':
											return $elm$html$Html$text('');
										case 'Toggleable':
											return timePickerVisible ? A2(
												$elm$html$Html$div,
												_List_Nil,
												_List_fromArray(
													[
														A2(
														$elm$html$Html$div,
														_List_fromArray(
															[
																$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'time-picker-toggle'),
																$elm$html$Html$Events$onClick(
																settings.internalMsg(
																	A3(
																		$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
																		settings,
																		$mercurymedia$elm_datetime_picker$SingleDatePicker$ToggleTimePickerVisibility,
																		$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model))))
															]),
														_List_fromArray(
															[
																A2(
																$mercurymedia$elm_datetime_picker$DatePicker$Icons$toHtml,
																_List_Nil,
																A2($mercurymedia$elm_datetime_picker$DatePicker$Icons$withSize, 12, $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronUp))
															])),
														A4($mercurymedia$elm_datetime_picker$SingleDatePicker$viewTimePicker, settings, model, baseDay, displayTime)
													])) : A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'time-picker-toggle'),
														$elm$html$Html$Events$onClick(
														settings.internalMsg(
															A3(
																$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
																settings,
																$mercurymedia$elm_datetime_picker$SingleDatePicker$ToggleTimePickerVisibility,
																$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model))))
													]),
												_List_fromArray(
													[
														A2(
														$mercurymedia$elm_datetime_picker$DatePicker$Icons$toHtml,
														_List_Nil,
														A2($mercurymedia$elm_datetime_picker$DatePicker$Icons$withSize, 12, $mercurymedia$elm_datetime_picker$DatePicker$Icons$chevronDown))
													]));
										default:
											return A4($mercurymedia$elm_datetime_picker$SingleDatePicker$viewTimePicker, settings, model, baseDay, displayTime);
									}
								}()
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'date-display-container')
								]),
							_List_fromArray(
								[displayTimeView]))
						]))
				]));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$ClearHoveredDay = {$: 'ClearHoveredDay'};
var $elm_community$list_extra$List$Extra$findIndexHelp = F3(
	function (index, predicate, list) {
		findIndexHelp:
		while (true) {
			if (!list.b) {
				return $elm$core$Maybe$Nothing;
			} else {
				var x = list.a;
				var xs = list.b;
				if (predicate(x)) {
					return $elm$core$Maybe$Just(index);
				} else {
					var $temp$index = index + 1,
						$temp$predicate = predicate,
						$temp$list = xs;
					index = $temp$index;
					predicate = $temp$predicate;
					list = $temp$list;
					continue findIndexHelp;
				}
			}
		}
	});
var $elm_community$list_extra$List$Extra$findIndex = $elm_community$list_extra$List$Extra$findIndexHelp(0);
var $elm_community$list_extra$List$Extra$elemIndex = function (x) {
	return $elm_community$list_extra$List$Extra$findIndex(
		$elm$core$Basics$eq(x));
};
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$calculatePad = F3(
	function (firstWeekDay, monthStartDay, isFrontPad) {
		var listOfWeekday = $mercurymedia$elm_datetime_picker$DatePicker$Utilities$generateListOfWeekDay(firstWeekDay);
		var calculatedPadInt = function () {
			var _v0 = A2($elm_community$list_extra$List$Extra$elemIndex, monthStartDay, listOfWeekday);
			if (_v0.$ === 'Just') {
				var val = _v0.a;
				return isFrontPad ? (-val) : (7 - val);
			} else {
				return 0;
			}
		}();
		return calculatedPadInt;
	});
var $justinmimbs$time_extra$Time$Extra$ceiling = F3(
	function (interval, zone, posix) {
		var floored = A3($justinmimbs$time_extra$Time$Extra$floor, interval, zone, posix);
		return _Utils_eq(floored, posix) ? posix : A4($justinmimbs$time_extra$Time$Extra$add, interval, 1, zone, floored);
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$monthDataToPickerDays = F4(
	function (zone, isDisabledFn, allowableTimesFn, posixList) {
		return A2(
			$elm$core$List$map,
			function (posix) {
				return A4($mercurymedia$elm_datetime_picker$DatePicker$Utilities$pickerDayFromPosix, zone, isDisabledFn, allowableTimesFn, posix);
			},
			posixList);
	});
var $justinmimbs$time_extra$Time$Extra$rangeHelp = F6(
	function (interval, step, zone, until, revList, current) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(
				$elm$time$Time$posixToMillis(current),
				$elm$time$Time$posixToMillis(until)) < 0) {
				var $temp$interval = interval,
					$temp$step = step,
					$temp$zone = zone,
					$temp$until = until,
					$temp$revList = A2($elm$core$List$cons, current, revList),
					$temp$current = A4($justinmimbs$time_extra$Time$Extra$add, interval, step, zone, current);
				interval = $temp$interval;
				step = $temp$step;
				zone = $temp$zone;
				until = $temp$until;
				revList = $temp$revList;
				current = $temp$current;
				continue rangeHelp;
			} else {
				return $elm$core$List$reverse(revList);
			}
		}
	});
var $justinmimbs$time_extra$Time$Extra$range = F5(
	function (interval, step, zone, start, until) {
		return A6(
			$justinmimbs$time_extra$Time$Extra$rangeHelp,
			interval,
			A2($elm$core$Basics$max, 1, step),
			zone,
			until,
			_List_Nil,
			A3($justinmimbs$time_extra$Time$Extra$ceiling, interval, zone, start));
	});
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $elm_community$list_extra$List$Extra$splitAt = F2(
	function (n, xs) {
		return _Utils_Tuple2(
			A2($elm$core$List$take, n, xs),
			A2($elm$core$List$drop, n, xs));
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$splitIntoWeeks = F2(
	function (weeks, days) {
		splitIntoWeeks:
		while (true) {
			if ($elm$core$List$length(days) <= 7) {
				return A2($elm$core$List$cons, days, weeks);
			} else {
				var _v0 = A2($elm_community$list_extra$List$Extra$splitAt, 7, days);
				var week = _v0.a;
				var restOfDays = _v0.b;
				var newWeeks = A2($elm$core$List$cons, week, weeks);
				var $temp$weeks = newWeeks,
					$temp$days = restOfDays;
				weeks = $temp$weeks;
				days = $temp$days;
				continue splitIntoWeeks;
			}
		}
	});
var $mercurymedia$elm_datetime_picker$DatePicker$Utilities$monthData = F5(
	function (zone, isDisabledFn, firstWeekDay, allowableTimesFn, time) {
		var monthStart = A3($justinmimbs$time_extra$Time$Extra$floor, $justinmimbs$time_extra$Time$Extra$Month, zone, time);
		var monthStartDay = A2($elm$time$Time$toWeekday, zone, monthStart);
		var nextMonthStart = A3(
			$justinmimbs$time_extra$Time$Extra$ceiling,
			$justinmimbs$time_extra$Time$Extra$Month,
			zone,
			A4($justinmimbs$time_extra$Time$Extra$add, $justinmimbs$time_extra$Time$Extra$Day, 1, zone, monthStart));
		var nextMonthStartDay = A2($elm$time$Time$toWeekday, zone, nextMonthStart);
		var frontPad = A5(
			$justinmimbs$time_extra$Time$Extra$range,
			$justinmimbs$time_extra$Time$Extra$Day,
			1,
			zone,
			A4(
				$justinmimbs$time_extra$Time$Extra$add,
				$justinmimbs$time_extra$Time$Extra$Day,
				A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$calculatePad, firstWeekDay, monthStartDay, true),
				zone,
				monthStart),
			monthStart);
		var endPad = A5(
			$justinmimbs$time_extra$Time$Extra$range,
			$justinmimbs$time_extra$Time$Extra$Day,
			1,
			zone,
			nextMonthStart,
			A4(
				$justinmimbs$time_extra$Time$Extra$add,
				$justinmimbs$time_extra$Time$Extra$Day,
				A3($mercurymedia$elm_datetime_picker$DatePicker$Utilities$calculatePad, firstWeekDay, nextMonthStartDay, false),
				zone,
				nextMonthStart));
		return $elm$core$List$reverse(
			A2(
				$mercurymedia$elm_datetime_picker$DatePicker$Utilities$splitIntoWeeks,
				_List_Nil,
				A4(
					$mercurymedia$elm_datetime_picker$DatePicker$Utilities$monthDataToPickerDays,
					zone,
					isDisabledFn,
					allowableTimesFn,
					_Utils_ap(
						frontPad,
						_Utils_ap(
							A5($justinmimbs$time_extra$Time$Extra$range, $justinmimbs$time_extra$Time$Extra$Day, 1, zone, monthStart, nextMonthStart),
							endPad)))));
	});
var $elm$html$Html$Events$onMouseOut = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'mouseout',
		$elm$json$Json$Decode$succeed(msg));
};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$SetDay = function (a) {
	return {$: 'SetDay', a: a};
};
var $mercurymedia$elm_datetime_picker$SingleDatePicker$SetHoveredDay = function (a) {
	return {$: 'SetHoveredDay', a: a};
};
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $elm$html$Html$Events$onMouseOver = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'mouseover',
		$elm$json$Json$Decode$succeed(msg));
};
var $mercurymedia$elm_datetime_picker$DatePicker$Styles$singleDayClasses = F5(
	function (classPrefix, isHidden, isDisabled, isPicked, isToday) {
		return isHidden ? (classPrefix + ('calendar-day ' + (classPrefix + 'hidden'))) : (isDisabled ? (classPrefix + ('calendar-day ' + (classPrefix + 'disabled'))) : (isPicked ? (classPrefix + ('calendar-day ' + (classPrefix + 'picked'))) : (isToday ? (classPrefix + ('calendar-day ' + (classPrefix + 'today'))) : (classPrefix + 'calendar-day'))));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewDay = F4(
	function (settings, model, currentMonth, day) {
		var isPicked = A2(
			$elm$core$Maybe$withDefault,
			false,
			A2(
				$elm$core$Maybe$map,
				function (_v0) {
					var pickerDay = _v0.a;
					return _Utils_eq(pickerDay, day);
				},
				model.selectionTuple));
		var isFocused = A2(
			$elm$core$Maybe$withDefault,
			false,
			A2(
				$elm$core$Maybe$map,
				function (fday) {
					return _Utils_eq(
						A2($mercurymedia$elm_datetime_picker$SingleDatePicker$generatePickerDay, settings, fday),
						day);
				},
				settings.focusedDate));
		var dayParts = A2($justinmimbs$time_extra$Time$Extra$posixToParts, settings.zone, day.start);
		var dayClasses = A5(
			$mercurymedia$elm_datetime_picker$DatePicker$Styles$singleDayClasses,
			$mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix,
			!_Utils_eq(dayParts.month, currentMonth),
			day.disabled,
			isPicked,
			isFocused);
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$type_('button'),
					$elm$html$Html$Attributes$disabled(day.disabled),
					$elm$html$Html$Attributes$class(dayClasses),
					$elm$html$Html$Events$onClick(
					settings.internalMsg(
						A3(
							$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
							settings,
							$mercurymedia$elm_datetime_picker$SingleDatePicker$SetDay(day),
							$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model)))),
					$elm$html$Html$Events$onMouseOver(
					settings.internalMsg(
						A3(
							$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
							settings,
							$mercurymedia$elm_datetime_picker$SingleDatePicker$SetHoveredDay(day),
							$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model))))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(
					$elm$core$String$fromInt(dayParts.day))
				]));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewWeek = F4(
	function (settings, currentMonth, model, week) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-week')
				]),
			A2(
				$elm$core$List$map,
				A3($mercurymedia$elm_datetime_picker$SingleDatePicker$viewDay, settings, model, currentMonth),
				week));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$viewMonth = F3(
	function (settings, model, viewTime) {
		var currentMonth = A2($justinmimbs$time_extra$Time$Extra$posixToParts, settings.zone, viewTime).month;
		var allowedTimesOfDayFn = A2(
			$elm$core$Maybe$map,
			function ($) {
				return $.allowedTimesOfDay;
			},
			$mercurymedia$elm_datetime_picker$SingleDatePicker$getTimePickerSettings(settings));
		var weeks = A5($mercurymedia$elm_datetime_picker$DatePicker$Utilities$monthData, settings.zone, settings.isDayDisabled, settings.firstWeekDay, allowedTimesOfDayFn, viewTime);
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-month'),
					$elm$html$Html$Events$onMouseOut(
					settings.internalMsg(
						A3(
							$mercurymedia$elm_datetime_picker$SingleDatePicker$update,
							settings,
							$mercurymedia$elm_datetime_picker$SingleDatePicker$ClearHoveredDay,
							$mercurymedia$elm_datetime_picker$SingleDatePicker$DatePicker(model))))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_Nil,
					A2(
						$elm$core$List$map,
						A3($mercurymedia$elm_datetime_picker$SingleDatePicker$viewWeek, settings, currentMonth, model),
						weeks))
				]));
	});
var $mercurymedia$elm_datetime_picker$SingleDatePicker$view = F2(
	function (settings, _v0) {
		var model = _v0.a;
		var _v1 = model.status;
		if (_v1.$ === 'Open') {
			var timePickerVisible = _v1.a;
			var baseDay = _v1.b;
			var offsetTime = A4($justinmimbs$time_extra$Time$Extra$add, $justinmimbs$time_extra$Time$Extra$Month, model.viewOffset, settings.zone, baseDay.start);
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id($mercurymedia$elm_datetime_picker$SingleDatePicker$datePickerId),
						$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'picker-container')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class($mercurymedia$elm_datetime_picker$SingleDatePicker$classPrefix + 'calendar-container')
							]),
						_List_fromArray(
							[
								A3($mercurymedia$elm_datetime_picker$SingleDatePicker$viewCalendarHeader, settings, model, offsetTime),
								A3($mercurymedia$elm_datetime_picker$SingleDatePicker$viewMonth, settings, model, offsetTime)
							])),
						A4($mercurymedia$elm_datetime_picker$SingleDatePicker$viewFooter, settings, timePickerVisible, baseDay, model)
					]));
		} else {
			return $elm$html$Html$text('');
		}
	});
var $author$project$Main$viewInsert = function (maybeInsert) {
	if (maybeInsert.$ === 'Nothing') {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('btn btn-secondary'),
					$elm$html$Html$Events$onClick($author$project$Main$ClickAdd)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text('Add')
				]));
	} else {
		var insert = maybeInsert.a;
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Events$onClick($author$project$Main$ClickDatePicker)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$author$project$Main$posixToString(insert.start))
						])),
					A2(
					$mercurymedia$elm_datetime_picker$SingleDatePicker$view,
					A2($mercurymedia$elm_datetime_picker$SingleDatePicker$defaultSettings, $author$project$Main$timeZone, $author$project$Main$UpdateDatePicker),
					insert.picker),
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$id('duration'),
							$elm$html$Html$Attributes$type_('text'),
							$elm$html$Html$Attributes$placeholder('minutes'),
							$elm$html$Html$Attributes$value(insert.formDuration),
							$elm$html$Html$Events$onInput($author$project$Main$InsertAddDuration)
						]),
					_List_Nil),
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$id('comment'),
							$elm$html$Html$Attributes$type_('text'),
							$elm$html$Html$Attributes$placeholder('comment'),
							$elm$html$Html$Attributes$value(insert.formComment),
							$elm$html$Html$Events$onInput($author$project$Main$InsertAddComment)
						]),
					_List_Nil),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('btn btn-primary'),
							$elm$html$Html$Events$onClick($author$project$Main$ClickInsert)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Insert')
						])),
					A2(
					$elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(
							A2($elm$core$Maybe$withDefault, '', insert.error))
						]))
				]));
	}
};
var $author$project$Main$ClickLogin = {$: 'ClickLogin'};
var $author$project$Main$InsertLoginPassword = function (a) {
	return {$: 'InsertLoginPassword', a: a};
};
var $elm$html$Html$h5 = _VirtualDom_node('h5');
var $author$project$Main$viewLogin = function (pass) {
	return A2(
		$elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				$elm$html$Html$h5,
				_List_Nil,
				_List_fromArray(
					[
						$elm$html$Html$text('Login')
					])),
				A2(
				$elm$html$Html$input,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('password'),
						$elm$html$Html$Attributes$value(pass),
						$elm$html$Html$Events$onInput($author$project$Main$InsertLoginPassword)
					]),
				_List_Nil),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('btn btn-primary'),
						$elm$html$Html$Events$onClick($author$project$Main$ClickLogin)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Anmelden')
					]))
			]));
};
var $author$project$Main$view = function (model) {
	var _v0 = model.errMsg;
	if (_v0.$ === 'Just') {
		var err = _v0.a;
		return A2(
			$elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					$elm$html$Html$text(err)
				]));
	} else {
		var _v1 = model.permission;
		if (_v1.$ === 'PermissionNone') {
			return $author$project$Main$viewLogin(model.formPassword);
		} else {
			return A2(
				$elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$author$project$Main$canWrite,
						model.permission,
						A3($author$project$Main$viewCurrent, model.current, model.formComment, model.currentTime)),
						A2(
						$author$project$Main$canWrite,
						model.permission,
						$author$project$Main$viewInsert(model.formInsert)),
						$author$project$Main$viewBody(model),
						$author$project$Main$viewFooter
					]));
		}
	}
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{init: $author$project$Main$init, subscriptions: $author$project$Main$subscriptions, update: $author$project$Main$update, view: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main($elm$json$Json$Decode$string)(0)}});}(this));