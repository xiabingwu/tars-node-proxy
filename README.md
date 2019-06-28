
### 实现原理

![Tars.js](https://github.com/xiabingwu/tars-node-proxy/blob/master/docs/images/architecture.png?raw=true)

### 使用方法

```
//请作为一个tars应用服务部署
const proxy=require('tars-proxy');
const server=proxy({
    proxyIp:process.env.IP,// 默认为tars web平台，servant ip
    proxyPort:process.env.PORT//默认为tars web平台，servant port
});
```