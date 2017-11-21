On MacOS and Linux systems you can pipe the output of a command to another to
implement more complex logic. Say, as a contrived example, I want to find all
the files matching a particular regex:

```sh
ls | grep '.*\.png'
```

So that `grep` can properly match the different file names, the `ls` command
output them one at a time, separated by newline characters `\n`. You can verify
that behavior using `cat`, a command that just echoes verbatim whatever comes on
its input:

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

(In the most common setup. You may not have a coloured `ls`.)

The reason for the difference lies in the `ls` program. It detects whether or
not the output is an interactive terminal. More specifically, `stdout`. If it
is, it'll output the file names in a way that's convenient for humans, often
including colors to signify the type of a particular entry: directory, plain
file, symbolic link, etc.

When we pipe the output to another process, however, `ls` outputs the file names
in a simpler format so that it can be processed programmatically. Notably, it
does not generate the [special SGR codes](https://en.wikipedia.org/wiki/ANSI_esc
ape_code#SGR_.28Select_Graphic_Rendition.29_parameters) used for coloring and
styling. This is the essence of UNIX: chaining programs input/outputs to
build more complex pipelines.

To know whether the output is a terminal, programs generally call the
[`isatty()`](http://pubs.opengroup.org/onlinepubs/009695399/functions/isatty.html)
function. Then they check the [`$TERM`](https://linux.die.net/man/7/term)
environment variable to understand the capabilities of the terminal. For
example, whether or not it supports coloured text.

This behavior, very useful for piping, is not desirable in some particular
conditions: sometimes you just want to forward content as it is to the end user,
including its formatting, without further processing.

## Forwarding Content

Here's an example. In the [`upd`](http://github.com/jeanlauliac/upd) project,
I've been wanting to buffer the output of several processes running in parallel.
For example `clang`, to compile some C/C++. Buffering is useful to avoid outputs
of parallel processes to get mixed up: process #1 might output some message,
then process #2 some other message, then process #1 again. If you don't buffer
their output the user won't know which is which.

The simplest implementation for buffering involves using
[`pipe()`](http://pubs.opengroup.org/onlinepubs/009695399/functions/pipe.html)
to redirect processes' `stdout` and `stderr` streams (by definition they have
file descriptors 1 and 2, respectively). When you execute the subprocesses
you override their ouput streams to flow into these pipes and store the output
into some kind of buffer.

When simple pipes are used `isatty(1)` and `isatty(2)` will return zero from the
subprocess' point of view, since a pipe is not a terminal. As result, processes
like `clang` will not enable formatted/coloured diagnostics automatically. But
from the parent process perspective, we know the final destination for this
output is a terminal, and we don't intend to process or otherwise modify
`clang`'s messages.

In that case, we can create a virtual terminal that we'll use for the
subprocess' `stderr`. This will provide us both with a piping mechanism,
redirecting the output into our own buffer, as well as allowing the subprocess
to automatically enable formatted output.

## Simulating a TTY

POSIX systems provide us with a group of function dedicated to create pseudo-terminals:
[`posix_openpt`](http://pubs.opengroup.org/onlinepubs/009695399/functions/posix_openpt.html),
[`grantpt`](http://pubs.opengroup.org/onlinepubs/9699919799/functions/grantpt.html),
[`unlockpt`](http://pubs.opengroup.org/onlinepubs/009695399/functions/unlockpt.html),
and [`ptsname`](http://pubs.opengroup.org/onlinepubs/009695399/functions/ptsname.html). For pretty
much all uses cases, we'll call them in that order. This will allow us to create
the 'master' and the 'slave' sides of the terminal. These are represented by
file descriptors, that we then manipulate using the usual `write`, `read`,
`close`, etc. functions. The 'master' side is designed to be used by the
terminal implementation, and the 'slave' side is to be exposed to the
subprocess.

```cpp
char *slave_device;
int master_fd = posix_openpt(O_RDWR | O_NOCTTY);
if (master_fd == -1 ||
    grantpt(master_fd) == -1 ||
    unlockpt(master_fd) == -1 ||
    (slave_device = ptsname(master_fd)) == NULL)
  throw std::runtime_error("failed to create terminal");

int slave_fd = open(slave_device, O_RDWR | O_NOCTTY);
if (slave_fd < 0)
  throw std::runtime_error("failed to open terminal slave side");
```

In our particular use case, let's say we want to simulate a terminal just for
receiving the `stderr` of some sub-process. Assuming we've got `master_fd` and
`slave_fd` successfully, what remains to do is creating the subprocess and
overriding their `stderr` with the slave side of the terminal. We can use
for this [`posix_spawn`](http://pubs.opengroup.org/onlinepubs/009695399/funct
ions/posix_spawn.html), a lightweigth equivalent to the usual `fork` & `exec`
pattern.

```cpp
posix_spawn_file_actions_t actions;
if (posix_spawn_file_actions_init(&actions) != 0 ||
    posix_spawn_file_actions_addclose(&actions, master_fd) != 0 ||
    posix_spawn_file_actions_adddup2(&actions, slave_fd, STDERR_FILENO) != 0 ||
    posix_spawn_file_actions_addclose(&actions, slave_fd) != 0)
  throw std::runtime_error("failed to create actions");

pid_t pid;
if (posix_spawn(&pid, "/usr/bin/clang", &actions, nullptr, argv, environ) != 0)
  throw std::runtime_error("failed to spawn process");

close(slave_fd);
```

The `action` type is an opaque data structure that tells `posix_spawn` what to
do with the file descriptors inherited from the parent process (with `fork` &
`exec` we'd just do the same using the `close` and `dup2` functions).

First, we close the master side of the terminal inside the subprocess, because
we only want to read and have control of it from the parent process.

Then we "dup2" the slave side onto `stderr`: that means after this action,
`STDERR_FILENO` (that is always the file descriptor #2) now refers to the same underlying device as
`slave_fd`, that is, our pseudo-terminal 'slave'. Finally we close `slave_fd` as we won't
need it: this destroy the file descriptor, the number, but the slave side of the
terminal is kept alive by being referenced as `STDERR_FILENO`.

Finally, we can discard the `slave_fd` in the parent process as we won't need
it there. This does not destroy the pseudo-terminal 'slave' since the
subprocess references it as its own `stderr`.

## Reading the TTY Output

The last bit of code we need for buffering is to read from the 'master' side
of the pseudo-terminal. The subprocess will just use the normal `write` function
to output content to `stderr`, and we'll be able to use `read` to collect it.
One option is to push content into a string steam of our own:

```cpp
std::string read_output_as_string(int master_fd) {
  std::ostringstream result;
  result.exceptions(std::ostringstream::badbit | std::ostringstream::failbit);
  ssize_t count;
  do {
    char buffer[1 << 12];
    count = read(master_fd, buffer, sizeof(buffer));
    if (count >= 0) {
      result.write(buffer, count);
      continue;
    }
    if (errno == EIO) {
      // On Linux, EIO is returned when the last
      // slave of a pseudo-terminal is closed.
      return result.str();
    }
    throw std::runtime_error("read() failed: " + std::to_string(errno));
  } while (count > 0);
  return result.str();
}
```

This function return the entire content as a string when the 'slave' side of the
terminal is closed. This happens when the subprocess terminates either normally
or abnormally, when all of its file descriptors are automatically closed by the
OS. This could also happen if the subprocess was manually closing its `stderr`
stream (ie. `close(STDERR_FILENO)`), but this is uncommon.

On that matter, I noticed the behavior differs between MacOS and Linux. If we
were using a pipe instead of a pseudo-terminal, both OSes behave the same:
`read` returns a count of zero when the other side is closed and you can return
cleanly. For pseudo-terminals, however, Linux will instead trigger en `EIO`
error when the 'slave' side is closed, that needs to be handled specifically.
On MacOS, `read` will return a count of zero just like for pipes.

That's pretty much all there is to using pseudo-terminals for this simple
purpose. Pseudo-terminals actually support a bunch of additional features like
job control communication, that are used to implement full fledged software
terminals like `xterm`, `iTerm`, etc. A great article on the topic is [*Using
pseudo-terminals to control interactive
programs*](http://rachid.koucha.free.fr/tech_corner/pty_pdip.html).
