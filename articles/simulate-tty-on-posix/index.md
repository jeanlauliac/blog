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

## Forwarding Content

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
terminals: [`posix_openpt`](http://pubs.opengroup.org/onlinepubs/009695399/functions/posix_openpt.html),
[`grantpt`](http://pubs.opengroup.org/onlinepubs/9699919799/functions/grantpt.html),
[`unlockpt`](http://pubs.opengroup.org/onlinepubs/009695399/functions/unlockpt.html),
and [`ptsname`](http://pubs.opengroup.org/onlinepubs/009695399/functions/ptsname.html). For pretty
much all uses cases, we'll call them in that order. The OpenGroup documentation
for `posix_openpt` provide a good example on how to create the 'master' and
'slave' sides of the terminal, that I won't duplicate here. These are
represented by file descriptors, that we then manipulate using the usual `write`,
`read`, `close`, etc. functions.

In our particular use case, let's say we want to simulate a terminal just for
receiving the `stderr` of some sub-process. In the case of `clang`, this will
effectively enable formatting for errors and warnings. Assuming we've got
`masterfd` and `slavefd` successfully, what remains is creating the subprocess
and overriding their `stderr` with the slave side of the terminal. What we
can use for that is [`posix_spawn`](http://pubs.opengroup.org/onlinepubs/009695399/functions/posix_spawn.html):

```cpp
posix_spawn_file_actions_t actions;
if (
  posix_spawn_file_actions_init(&actions) != 0 ||
  posix_spawn_file_actions_addclose(&actions, masterfd) != 0 ||
  posix_spawn_file_actions_adddup2(&actions, slavefd, STDERR_FILENO) != 0 ||
  posix_spawn_file_actions_addclose(&actions, slavefd) != 0
) {
  throw std::runtime_error("failed to create actions");
}

pid_t pid;
if (posix_spawn(&pid, "/usr/bin/clang", &actions, nullptr, argv, environ) != 0) {
  throw std::runtime_error("failed to spawn process");
}
```

So what's happening there? The `action` type is an opaque data structure that
tells `posix_spawn` what to do with the file descriptors inherited from the
parent process (we could also use `fork` and `exec`, and the sequence would
be the same). First we close the master side of the terminal, because we only
want to read and control it from the parent process.

Then we "dup2" the slave side onto `stderr`: that means after this action,
`STDERR_FILENO` (that is always 2) now refers to the same underlying device as
`slavefd`, that is, our virtual terminal. Finally we close `slavefd` as we won't
need it: this destroy the file descriptor itself, but the slave side of the
terminal is kept alive by being referenced as `STDERR_FILENO`.

## Reading the TTY Output

Once we've got the virtual terminal and spawn in place, we'll want to read
