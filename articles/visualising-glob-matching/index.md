The standard
[`glob`](http://pubs.opengroup.org/onlinepubs/009695399/functions/glob.html)
function allows you to identify all files of a directory which name match a
particular pattern. The pattern contains 'wildcard' characters such as `*`
(match any several characters) and `?` (match any single character except `.`).
This is the same function that is used by the shell (ex. `bash`) to expand the
command line. For example, if you have files `a.cpp`, `b.cpp`, and `c.cpp` in a
directory named `src`, here an example of glob expansion:

<div class="terminal">$ echo src/*.cpp
a.cpp b.cpp c.cpp
</div>

*Before* executing the command `echo`, the shell calls `glob` with the pattern
`src/*.cpp`, that returns 3 results. These are then provided as command line
arguments to `echo`. (A somewhat common misconception is to think the
command itself is doing the expansion, such as  `ls`. It is in fact the shell.)

There is an equivalent function called
[`fnmatch`](http://pubs.opengroup.org/onlinepubs/009695399/functions/fnmatch.html)
that allows you to match any string with a pattern, no just files. A possible
implementation of `glob` would be to call `fnmatch` for each file of a
directory.
