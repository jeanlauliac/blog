On MacOS and Linux systems you can pipe the output of a command to another to
implement more complex logic. Say, as a contrived example, I want to find all
the files matching a particular regex:

```sh
$ ls | grep '.*\.png'
```

So that `grep` can properly match the different file names, the `ls` command
output them one at a time, separated by newline characters. You can verify that
behavior by using `cat`, that just echoes verbatim whatever comes on its input:

<div class="terminal">$ ls | cat
README.md
configure.js
tools
</div>

This is different from the output that we get when running `ls` directly from
the shell:

<div class="terminal">$ ls
README.md     <span style="color: rgb(0, 130, 0)">configure.js</span>    <span style="color: rgb(181, 25, 49)">articles</span>
</div>

The reason for the difference lies in the `ls` program. It detects whether or
not the output is an interactive terminal. If it is, it'll output the file
names in a way that's convenient for humans, often including colors to
signify the type of a particular entry: directory, plain file, symbolic link,
etc.

When we pipe the output to another process, however, `ls` outputs the file names
in a simpler format so that it can be processed programmatically. Notably, it
does not generate the [special characters used for coloring and
styling](https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_.28Select_Graphic_Rendition.29_parameters).

To know whether the output is a terminal, programs call the
[`isatty()`](http://pubs.opengroup.org/onlinepubs/009695399/functions/isatty.html)
function. Then they check the [`$TERM`](https://linux.die.net/man/7/term)
environment variable to understand the capabilities of the terminal. For
example, whether or not it supports colored text.

This is not always desirable: sometimes you just want to forward content as it
is, including its formatting, without processing.

## Content Forwarding

In the
[`upd`](http://github.com/jeanlauliac/upd) project, I've been wanting to
buffer the output of several processes running in parallel. Buffering is useful
to avoid outputs of parallel processes to get mixed up. The simple implementation
involves using [`pipe()`](http://pubs.opengroup.org/onlinepubs/009695399/functions/pipe.html)
to redirect processes' `stdout` and `stderr` streams (file descriptors 1 and 2,
respectively).

When simple pipes are used `isatty(1)` and `isatty(2)` will return zero,
indicating that these streams are not terminals. As result, processes like
`clang` will not enable formatted diagnostics automatically. But from the parent
process perspective, we know the final destination for this output is a
terminal.

In that case, it makes sense to simulate the final terminal, so that processes
like `clang` automatically output formatted content.

## Simulating a TTY

POSIX systems provide us with a group of function dedicated to create virtual
terminals.

