# Cow2023
Web-based audio editor with various filters and audio library.

## Introduction
<img src="https://github.com/KAIST-CS409/WebAudioEditor/raw/master/img/main_image.png" alt="main_image">

WebAudioEditor project is about an audio editor that can be used in the web environment. There are various application-based audio editors these days, but those products are too complicated for novice users who are not familiar with audio editing. Also, it is cumbersome to install those applications on the local computer. Therefore, our project targets novice web audio editor users and provide access in web environment to give high accessibility. Moreover, users can save their edited audio files in their library.

## Architecture
<img src="https://github.com/KAIST-CS409/WebAudioEditor/raw/master/img/architectureV2.png" alt="architecture" width="100%">

The system consists of four modules: Handler, View, Server and DB. The Handler module uses Web Audio API to implement audio editing functions. It can modify audio files, workspaces, blocks and apply filters to selected blocks. After it finished loading or editing audio files it requests View module to render waveform of audio files. View component also renders main container view layout on the screen. As there are user data saved in the remote server, Handler module uses HTTP protocol communicates with Server module, which consists of node.js and express framework.  Handler module may requests audio, workspace or login info to the server and get responses about those information. Server module accepts these requests and then send queries to DB module, which is MongoDB, to get receive information.

## Deployment
### Dependency installation
* [Node.js 12](https://nodejs.org/dist/v12.18.3/node-v12.18.3-x64.msi)
* [Git](https://git-scm.com/download/win)
  
Install npm and mongodb before installing our project. Mongodb should run on localhost with port number 27017.

And then, run following command on the terminal.
```sh
$ npm install -g babel babel-cli nodemon cross-env webpack webpack-dev-server
$ npm install
```

### Quick start
```sh
$ npm run build
$ npm run start
```
Shortcut is ```$npm run bstart```

### Start with development environment
```sh
$ npm run development
```
If code changes, develompent server automatically compiles the code and run the server again.

### Auto to run
It will automatically turn on when booting and also start automatically when the machine crashes.

 ```npm install```
 
```npm install pm2 -g```

```npm install pm2-windows-startup -g```

```pm2-startup install```

```pm2 start pm2.json```

```pm2 save```


### Necessary file
Connection:  mongodb://localhost:27017

D:/  ```api``` ```producedAudio``` ```test```



# If it is stuck, close the port through the following methods
netstat -ano | findstr :3000
tskill PID

# src 
Corresponds to public/build, but since it will not be automatically rebuilt, it is recommended to delete this folder first and then re-execute npm run build to ensure that the functions are updated.

```pm2 start app.js```

```pm2 list```

```pm2 delete { id or name }```

```pm2 stop { id or name }```

```pm2 restart { id or name }```
