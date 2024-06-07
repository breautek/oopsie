
@breautek/oopsie
----------------

An error library that supports attaching metadata and additional
error causes to exceptions.

An `Oopsie` is an `Error` itself, and will have all the symbols of a standard javascript error.

`Oopsie` errors are designed to be serializable, so a NodeJS backend can produce and provide `Oopsie` errors in which the front-end implementation via an `OopsieFactory` can re-create the oopsie instance.

`Oopsie` can be used stand-alone, but extending them will allow you to attach additional data. When receiving a thrown object, the unknown object can be tested via `Oopsie.is` static method:

```typescript
try {
    doSomethingThatThrows();
}
catch (e: unknown) {
    if (Oopsie.is(MyOopsie, e)) {
        // e is considered `InstanceType<MyOopsie>` in this block
    }
}
```

`Oopsie` can accept a cause parameter, which will produce a stacktrace chain:

```typescript
let rootCause: Error = new Error('The Root cause');
let oopsie: Oopsie = new Oopsie('Routine failed', rootCause);

let stack: string = oopsie.getStack();

// Produces:
`
Oopsie stacktrace:
    Oopsie: Routine failed
  at ...
  Caused by:
    Error: The Root cause
  at..
```

#### OopsieFactory

A singleton is provided to create Oopsie instances dynamically using the appropriate constructor.

This allows one program to serialize an Oopsie and provide the serialized structure to another program to recreate that instance so that the other program can respond using the error details, provided that both programs has access to the proper Oopsie constructor.

Oopsie classes should implement the `IOopsieCtor` interface for the constructor, which means they must accept message and details.

Custom oopsies should register themselves with the `OopsieFactory`:

```typescript
class MyOopsie extends Oopsie{}

OopsieFactory.getInstance().registerOopsie(MyOopsie);
```

Programs that can receive a serialized version of `MyOopsie` can re-create a `MyOopsie`:

```typescript
let e: Oopsie = OopsieFactory.getInstance().create(new MyOopsie('oops').serialize());
Oopsie.is(MyOopsie, e);// returns true
```

Using an `OopsieFactory` to create an Oopsie who has a missing registration will result
an the base `Oopsie` instance being created instead.

#### Installation Notes

For applications, use `npm install @breautek/oopsie`

For libraries, this package should be a peer dependency, so install as a dev
dependency and add an appropriate version range to the `peerDependencies` block:

`npm install @breautek/oopsie --save-dev`

package.json:

```
{
    ...,
    "peerDependencies": {
        "@breautek/oopsie": ">= 0.1.0"
    }
}
```

It is important to allow a wide range of versions otherwise you're library
may not be compatible with end-user's projects. Set the peer dependency version
range as wide as possible, if your library can support using the version.

If you install this package as a direct `dependency`, then the library may have
it's own **copy** of the library in the runtime, which means there will not be
a shared `OopsieFactory` instance.
