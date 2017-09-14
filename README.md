# blablah
Irc webchat applciation without using javascript

## Tools needed
To install this application, we recommend to download the .zip or clone the repository to a debian linux machine.

The program is based on [Nodejs](https://nodejs.org/en/download/). Download and extract the files in a directory of your choice.

Another helpful tool is the [Node Package Manager](https://www.npmjs.com/). You will need this to automatically download the corresponding dependencies. You can install npm by executing:

```
sudo apt install npm
```

You can verifiy the success of your installation by running `node -v` and/or `npm -v`. If you want to access the node executable from anywhere else than the downloaded directory you have to create a symbolic link such as:

```
sudo ln -s /path/to/your/node.executable /bin/node
```

## Installation

If you have downloaded the files and installed the tools needed you are able to install the application.

You have to change to the application's root directory (where the package.json file is) and run `sudo npm install`. This command will download the missing dependencies automagically.

When the install command finishes you only have to set the environment variable `http_port` like:

```
sudo export http_port=<free port>
```

Where `<free_port>` must be replaced by any free port an your system >=0 and <=65535.

Finally you have to start the application by executing:

```
node /path/to/blablah/bin/app.js
```

If this command tells you, that the service is listening on the given port you've set up the application successfully.

You can access the chat in your browser by calling '127.0.0.1:<free_port>' in a web browser's url field.
