
### 实现原理

![Tars.js](https://github.com/xiabingwu/tars-node-proxy/blob/master/docs/images/architecture.png?raw=true)

### 使用方法
- 代理部署（请作为一个tars应用服务部署）
```javascript
const proxy=require('tars-proxy');
const server=proxy({
    proxyIp:process.env.IP,// 默认为tars web平台，servant ip
    proxyPort:process.env.PORT//默认为tars web平台，servant port
});
```
- 代理关联
```javascript
//伪代码
const Tars      = require("@tars/tars").client;
const prx      = Tars.stringToProxy("应用服务3proxy", "应用服务3obj@tcp -h 应用服务4ip -p 应用服务4port -t 60000");
```