# Learninfi P2P Video Call Library

## What ?

A lot of websites / applications want to add video calling capability. But is there a simple library that you can just import and have video calling work (without having to write tons of code)?

This project is just that!

This library makes embedding p2p video calling in any web-app very easy. It has 2 components - 

1. React component to add video calling UI (manages most of the grunt work of directly dealing with WebRTC)
2. Socket.io based signalling server

Both this components are very loosly coupled and you can swap out one while keeping the other very easily.  

Though the UI is made in React, even if you're not using React you can still embed it in your website. Just grab the built js & css files and include them (see [this section](https://github.com/coderkd10/learninfi-p2p-videocall#using-this-as-library) for more details on this).

Also the actual video call between users of your application will be p2p (for most cases see section on turn server for more on this) so you'll not have to invest upfront in setting up some massive server infrastructure and thus cut down cost greatly.

## Why ?

Few years back I was building an online tutoring marketplace [learninfi.com](https://web.archive.org/web/20181201191242/https://www.learninfi.com/lp/) and video calling between tutor and student was a key component. Out the many options I looked at, using WebRTC to have a p2p video call looked the most reasonanble and cost effective option. But trying to directly work with it was very painful and led to lots of headache. Also looking around I could not find a good library / framework to make things easier and iterate faster. So that is why I built this library to make my job easier. Also I developed it with the intention that it can be dropped into any application and have video calling just work!

If you're trying to build something similar do have a look and try this project out. Drop me line at my [email](mailto:kedia.abhishek10@gmail.com) / [twitter](https://twitter.com/kediaabhishek10) if you need some help or just want to chat! 


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
