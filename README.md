# Learninfi Video Call

## Basic Usage

1. Start the socket.io server

```
cd server
yarn install
yarn start
```

^ this starts a server listening on the port 3500.

2. Serve and run demo site

The demo site is react app. First build it -

```
cd client
yarn install
yarn build
```

^ this will build the react app into a static site in the `build` directory. Since this built demo site is a static website, it can be run using any webserver (apache, nginx, etc.) by simplying copying the code to server directory. Here we'll describe serving the site using `http-server`.

```
npm install -g http-server
cd build
http-server -p 9000
```

Now the demo site is being served on `localhost:9000`. (Note - all the client opening this url will be connected on the same room).

## Advanced

### Turn Server
For a smooth video experience we recommend deploying a turn-server. Details can be found at - https://github.com/coderkd10/learninfi-videocall/wiki/Deploying-a-turn-server

### Reverse Proxy

When deploying the socket.io server in production it should be reverse proxied behind nginx.  
Why? - The demo site must be on https in production (so that accessing webcam is allowed) and so it will expect the server to be on https as well. The server does not do any https handling on its own. We can add https handling code in node itself, but it is recommended to reverse proxy this node behind a node server which takes care of https and other important stuff.

The nginx configuration that we are using in production is - https://github.com/coderkd10/learninfi-videocall/wiki/nginx-configuration

### Using this as library

This project exports an independent react component for video calling, which can used in any react project or otherwise.
If you are not using react simply copy the `build/static` directory and place it in your project directory as say `vc-app/static`. Now simply include the following in the head of you html file -

```html
<head>
    <link rel="stylesheet" href="./vc-app/static/css/main.[hash].css"/>
    <script type="text/javascript" src="./vc-app/static/js/main.[hash].js"></script>
</head>
``` 

and now a function `renderVideoCall` will be attached to window, which can called from anywhere to render the video call app. It takes two arguments - a dom node, room name. It will render the vc app inside that dom node and join the peer in the specified room.
