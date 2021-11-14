# Cow2020
## deploy
### prerequirement
* [Node.js 12](https://nodejs.org/dist/v12.18.3/node-v12.18.3-x64.msi)
* [git latest](https://git-scm.com/download/win)
### In project directory run:
1. ```npm install```
2. run:```npm install pm2 -g```
3. run:```npm install pm2-windows-startup -g```
4. run:```pm2-startup install```
5. run:```pm2 start pm2.json```
6. run:```pm2 save```

這樣就會開機自動啟動 當機也會自動啟動
