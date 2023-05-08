# Cow2023
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

# develop
- 需安裝 mongodb； mongodb://localhost:27017 
- D:/ 需建置相關資料夾
    1. api 
    2. producedAudio
    3. test    

- 執行 `npm run start`
- `npm run development`


# 增加功能列需改動的流程步驟
增加之後要整個關掉在下 `npm run development` 比較不會出問題

1. routes/api.js 的部分需要增加 
    - seed system permissions 行的參數
    - function setSeedRole 的權限

2. app.js 的部分需要修改
    - route 管理
    - 頁面管理
    - models 管理

# 如果卡住的話透過以下方法關閉端口
netstat -ano | findstr :3000
taskkill typeyourPIDhere 
