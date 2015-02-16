I’ve sometimes seen components assuming a particular property wouldn’t ever
change. It is easy to feel like we can make this assumption when we control the
rest of an application’s ecosystem. However, this makes the component fragile,
because future changes *outside* of the component may break this assumption. In
other words, the component is not self-contained anymore.

## Assumptions that break

Consider a fictional component `PostList`. It displays an array of article items
(title and date) provided as the property `posts`. On top of the list, we’ll
show a search input, that will let us filter the list. The list should also be
sorted anti-chronologically.

We know `posts` will not change because the array is loaded at the start of the
application. So, we decide to sort once and for all in `componentWillMount`,
hoping it will make subsequent renderings more performant.

    PostList = React.createClass({
      componentWillMount() {
        this._sortedPosts = this.props.posts.sort(comparePost)
      },
      render() {
        var filteredPosts = this._sortedPosts.filter(this._searchFilter)
        return this._renderWith(filteredPosts)
      },
      // [...]
    })

Weeks later, a fellow developper, who joined the project recently, implements a
feature to live-reload the newest articles from the server. That breaks the
assumption, the new articles never show up on the page, and time is lost
debugging.

Of course, this is a trivial example. There could be many more layers
in-between the innocent changes and the component that made an assumption. The
investigation could be harder, the consequences worse. And it could be happening
in production.

These considerations lead to an important rule: never make assumptions about
properties that you do not enforce. Be kind to the component users. Instead,
either enforce the property to be constant, or take changes into account.

## Enforcing constantness

In our example case, enforcing the posts to be constant would have avoided the
issue. In React, this can be done in
[`componentWillReceiveProps`](https://facebook.github.io/react/docs/component-
specs.html#updating-componentwillreceiveprops), lifecycle function called only
on updates, not on mount. Let's have first try:

    PostList = React.createClass({
      componentWillMount() {
        this._sortedPosts = this.props.posts.sort(comparePost)
      },
      componentWillReceiveProps(nextProps) {
        if (nextProps.posts !== this.props.posts) {
          throw new Error(‘posts cannot change’)
        }
      },
      // [...]
    })

This forces the caller to pass the same array *object* every time it
renders the component; not just the same post contents. In other words, the
`posts` object shall be *immutable*. This constraint too must also be enforced,
because the array could have been mutated! One way of doing that is using
immutable data constructs, such as provided by
[immutable-js](https://facebook.github.io/immutable-js/). We'll accept
any `Iterable` instead of an array:

    PostList = React.createClass({
      propTypes: { posts: React.PropTypes.instanceOf(Immutable.Iterable) },
      // [...]
    })

With this version of `PostList`, the new live-reload feature now immediately
triggers an exception, pinpointing the issue with clarity.

## Transitioning to a changing property

We now no longer want to assume `posts` is constant, as to support the
live-reload feature. One easy solution, of course, is to make the data-loader do
the sorting, instead of the component. However, for the sake of the exercise,
we’ll add a control allowing the user to chose between alphabetic or
chronological sort, directly into our component. As such, it makes sense to keep
sorting local to the component.

We could simply move everything in `render()`:

    PostList = React.createClass({
      render() {
        var sortedPosts = this.props.posts.sort(this._comparePost)
        var filteredPosts = sortedPosts.filter(this._searchFilter)
        return this._renderWith(filteredPosts)
      },
      // [...]
    });

Each time the user enters a new character in the search input, we set
the state, triggering a new render. This means we sort the same list over
and over again. On a large array, this could cause small delays, noticeable
enough to make the experience unpleasant.


## Memoizing the sorted array

[Memoization](https://en.wikipedia.org/wiki/Memoization) is a classic
optimisation technique, where we store the result of expensive functions into a
cache. The structure of the cache can be very diverse. In some cases, results
are stored forever. For most cases, a smarter cache algorithm will be used, such
as an [LRU cache](https://en.wikipedia.org/wiki/Cache_algorithms).

In our specific case, it is very unlikely for the immutable `Iterable` to be
reverted to an older value. We can simply store the latest result:

    function memoizedSortPost() {
      var lastPosts = null;
      var lastSortFn = null;
      var lastResult = null;
      return (posts, sortFn) => {
        if (posts === lastPosts && sortFn === lastSortFn) {
          return lastResult
        }
        lastPosts = posts
        lastSortFn = sortFn
        lastResult = posts.sort(sortFn)
        return lastResult
      }
    }

Again, this works thanks to immutability. A whole new list object will be
passed every time a live-reload is done. Then, in the component:

    PostList = React.createClass({
      propTypes: { posts: React.PropTypes.instanceOf(Immutable.Iterable) },
      componentWillMount() {
        this._sortPosts = memoizedSortPost()
      },
      render() {
        var sortedPosts = this._sortPosts(this.props.posts, this._comparePost)
        var filteredPosts = sortedPosts.filter(this._searchFilter)
        return this._renderWith(filteredPosts)
      },
      // [...]
    })

In which case `_sortPosts` itself is a closure that takes the list of posts and
the sorting function, and does the computations only if necessary.

## Generalised 1-sized-cache memoization

`memoizedSortPost()` is very specific to our use case. In Javascript,
we can easily make a generic version that accommodates any number of immutable
arguments:

    function memoize(fn) {
      var lastArgs = []
      var lastResult = null
      return (...args) => {
        if (
          args.length === lastArgs.length &&
          args.every((arg, i) => arg === lastArgs[i])
        ) {
          return lastResult
        }
        lastArgs = args
        lastResult = fn(...args)
        return lastResult
      }
    }

This can then be used as such:

    this._sortPosts = memoize((posts, sortFn) => posts.sort(sortFn))

And here it is. Robust and performant at the same time. Happy React coding!
