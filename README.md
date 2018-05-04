# Learninfi Video Call

## Basic Usage

1. Start the server

```
cd video-server
npm install
npm link
learninfi-video-server
```

(use `learninfi-video-server --help` to see options to change port, and start in HTTPS mode).

2. Serve and run demo site

The demo site is a static website. It can be run using any webserver by simplying copying the code to server directory. Here we'll describe serving the site using `http-server`.

```
npm install -g http-server
cd client
http-server -p 9000
```

Now the demo site is being served on `localhost:9000`. Point the browser to this url. This will generate `room` parameter in the url-bar. Copy the generated url to a another browser and open it. Both browsers should now be connected to each other.

## Advanced

### Turn Server
For a smooth video experience we recommend deploying a turn-server.

```
sudo turnserver -a -n  --no-dtls --no-tls -u username:password -r "someRealm"
```

and setting this in peerjs config in `client/video-js/index.js`

### Babel transpilation

Client code contains newer es6 features such as async-await and arrow function. So it may not work on older browsers (such as safari & ie).
To be able to run on older browsers need to compile the client code using babel & async-await runtime polyfill.

Please refer the following for details :

1. https://babeljs.io/docs/usage/cli/
2. http://masnun.com/2015/11/11/using-es7-asyncawait-today-with-babel.html
