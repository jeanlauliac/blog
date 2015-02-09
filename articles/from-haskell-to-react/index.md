
Take any tutorial out there. Spend a day learning, playing with Haskell. Or
Clojure. Or OCaml. Or even F#. Any language that puts pure functional constructs
as first class citizens, really. If you never programmed with such a functional
language before, this will change your vision of programming. Not kidding. Try
it now.

Understand it deeply. Learn about things like [tail call
elimination](https://en.wikipedia.org/wiki/Tail_call), [function
purity](https://en.wikipedia.org/wiki/Pure_function) and
[immutability](https://en.wikipedia.org/wiki/Immutable_object). Think about the
benefits and drawbacks of the functional approach. Is it robust? Is it
performant? Are you functions *reasonable* -- easy to reason about? How does it
compare to the object-oriented programming?

When you come back to Javascript, you’ll find yourself missing the
expressivity, the composability of a functional language.

What makes Javascript's [React](https://facebook.github.io/react/) beautiful is
precisely that it makes components reasonable. Because they are autonomous
entities that do not depend on global state, you are in full control of their
behavior. Coupled with [immutable-js](https://github.com/facebook/immutable-js),
you're ready to make interfaces robust, and components truly reusable.

But only if you play by the rules: think *functional*.
