["Resource Acquisition is
Initialization"](http://en.wikipedia.org/wiki/Resource_Acquisition_Is_Initialization)
truly is a delightful concept in C++. This lets you use resources without
thinking of things such as closing a file (`std::fstream`), releasing a mutex
(`std::mutex`) or releasing a pointer (`std::unique_ptr`). For instance, this is
safe and idiomatic C++:

```cpp
int main() {
  std::ofstream file("example.txt");
  file << "Hello World" << std::endl;
}
```

Safe, because when the end of the function is reached, C++ automatically
destroys all objects of the scope. Even if an exception causes the stack to
unwind. Destruction is *deterministic*. This is a powerful way to enforce a
program’s correctness.

In C#, the garbage collector makes things a little different. But when it comes
to resources, the [Dispose
Pattern](https://msdn.microsoft.com/en-us/library/b1yfkh5e%28v=vs.110%29.aspx)
comes to help. You can employ the `using` construct on `IDisposable` instances:

```csharp
using (var file = new StreamWriter()) {
  file.WriteLine("Hello World");
}
```

Here again, this is safe and the file will be closed even in the case of an
exception.

In Javascript, we’re out of luck. No such things as deterministic destruction of
objects, nor disposables defined at a language level.


## Files in Node.js

In Node.js, writing a file with the raw functions is error-prone:

    function hello(cb) {
      fs.open('example.txt', 'w', (err, fd) => {
        if (err) return cb(err)
        fs.write(fd, 'Hello World', (err) => {
          fs.close(fd, (err2) => {
            cb(err || err2)
          )
        })
      })
    }

Using streams makes the code much more legible:

    function hello(cb) {
      var stream = fs.createWriteStream('example.txt')
      stream.write('Hello World')
      stream.close()
    }

However, we still need to close the stream explicitly. That means if an
exception is thrown in-between (possibly caught at the call site),
the stream will leak; at least until the next garbage collection.


## Closures Everywhere

There’s a neat solution to this in Javascript. It is common and cheap to make
closures, so we can leverage this to control the lifetime of our resources:

    function hello() {
      usingWriteStream('example.txt', (stream) => {
        stream.write('Hello World')
      }
    }

Where `usingWriteStream` takes care of opening and closing the stream even in
the case of the unexpected. An implementation would be as follows:

    function usingWriteStream(name, handler) {
      var stream = fs.createWriteStream('example.txt')
      try {
        return handler(stream)
      } finally {
        stream.close()
      }
    }

We create the stream, then call the handler. The [`finally`
clause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch#The_finally_clause)
ensures we correctly close the stream whatever happens.

It turns out many other libraries could return streams, so there’s an
opportunity for genericity here. How about taking the 'create'
function as argument?

    function usingStream(createFn, handler) {
      var stream = createFn()
      try {
        return handler(stream)
      } finally {
        stream.close()
      }
    }

We can then conveniently compose the function to build our initial
`usingWriteStream` version:

    var usingWriteStream = (name, handler) =>
      usingStream(fs.createWriteStream.bind(null, name), handler)

Thanks to closures, we can build a RAII-like pattern in Javascript, ensuring
our resources won’t leak. This is useful in a number of cases, even when the
'resource' is not immediately identifiable. For example, the function
[`Map#withMutations()`](https://facebook.github.io/immutable-js/docs/#/Map/withMutations), in the [Immutable](https://facebook.github.io/immutable-js/) library, uses
a similar pattern:

    var map1 = Immutable.Map();
    var map2 = map1.withMutations(map => {
      map.set('a', 1).set('b', 2).set('c', 3);
    });

In that case, the "mutable map" is the resource. This ensures this object cannot
leak easily outside the current scope, and that we properly convert it back to
an immutable map in the same frame. No explicit conversion is done.


## Mind the Asynchronous

We can use a very similar pattern with asynchronous logic, by making the handler
asynchronous. Our very first example with files could translate as such:

    function hello(cb) {
      usingFile('example.txt', 'w', (fd, cb) => {
        fs.write(fd, 'Hello World', cb)
      }, cb)
    }

Where `usingFile` takes care of closing the file even in case of error.
Notice the last argument, that is the function called when the work
is done and the resource is closed. The implementation of `usingFile` is left as
exercice.

More interestingly, we can imagine the same pattern with
[Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise):

    var usingFile = (name, handler) =>
      using(promiseOpenFile.bind(null, name), promiseCloseFile, handler)

    function hello(cb) {
      usingFile(name, (fd) =>
        promiseWriteFile(fd, 'Hello World')
      ).then(() => cb(), cb)
    }

For the purpose of the exercice, we assume the existence of `promiseOpenFile`
and `promiseCloseFile`, returning Promises, respectively resolving to an opened
file number, and to a closed file. Let’s have a try at the implementation of the
`using()` function:

    function using(open, close, handler) {
      return open().then((resource) =>
        handler(resource).then(
          (retval) =>
            close(resource).then(() => retval),
          (reason) =>
            close(resource).then(
              () => Promise.reject(reason),
              () => Promise.reject(reason)
            )
        )
      )
    }

We start by opening the resource. If this is rejected, the process stops here.
Otherwise, we move on into the `handler`. It can take any amount of time before
this promise is accepted or rejected. In either case, we close the resource
before forwarding the result. Notice that if closing the resource itself failed,
we only forward the first error that happened. Another possible strategy would
be to build an error object containing both reasons.


## It still isn’t RAII

In C++ one can write code like:

```cpp
class Hello {
public:
  Hello(): _file("example.txt") {}
  void write() { _file << “Hello World” << std::endl; }

private:
  std::ofstream _file;
}
```

This is still safe, because whenever `Hello` is deterministically destroyed,
`_file` is destroyed as well. In Javascript, we cannot reproduce the pattern
with callbacks like we did. But we could imagine the following:

```js
class Hello extends Disposable({ _file: fs.createWriteStream }) {
  constructor(fileName) {
    super({ _file: [fileName] })
  }
  write() {
    steam.write('Hello World\n')
  }
}
```

Where `Disposable` is a higher-order function returning a class (that is, a
function). It takes care of creating the resources, and closing
them when the object’s own `close()` function is called:

```js
function Disposable(ctors) {
  var DisposableImpl = function (opts) {
    for (var name in ctors) {
      this[name] = ctors[name].apply(void 0, opts[name])
    }
  }
  DisposableImpl.prototype.close = function () {
    for (var name in ctors) {
      this[name].close()
      this[name] = null
    }
  }
  return DisposableImpl
}
```

(A real version would need error handling, etc.) Because `Disposable` exposes
its own `close()` function, this pattern is composable:

```js
class SuperHello extends Disposable({
  _hello: (name) => new Hello(name),
}) {
  constructor() {
    super({ _hello: ["example.txt”] })
  }
}
```

Although this is less elegant than the C++ RAII pattern, it provides an
additional level of robustness. We could imagine more capabilities, like
accepting custom 'dispose' functions instead of `close()`, etc.

That’s it! Use RAII-minded patterns and make code robust. Happy Javascript
hacking!
