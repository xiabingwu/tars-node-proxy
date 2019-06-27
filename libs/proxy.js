module.exports = function ({
    proxyIp,
    proxyPort,
    proxyTimeout = 5 * 60 * 1000,//默认代理socket5分钟释放
    remoteTimeout = 10 * 1000//转发socket10秒钟释放
}) {
    var debug = require('debug')('tars-proxy');
    const net = require('net');
    const Registry = require('@tars/registry');
    const Tars = require("@tars/stream");
    Registry.setLocator("tars.tarsregistry.QueryObj");//初始化主控
    const server = net.createServer(function (socket) {
        let endpoint = {};
        socket.on('data', async function (buffer) {
            const ist = new Tars.TarsInputStream(new Tars.BinBuffer(buffer));
            const obj = ist.readString(5, true);
            console.log('当前obj：', obj);
            if (!endpoint[obj]) {//没有就去查吧
                const data = await Registry.findObjectById4Any(obj);
                const endpoints = data.response.arguments.activeEp;
                // for (const i = 0; i < endpoints.length; i++) {
                //   console.log("活跃节点:", endpoints.value[i].host, endpoints.value[i].port);
                // }     
                //只寻找第一个节点转发，开发测试的时候，让后端保持一个节点活跃吧
                const ip = endpoints.value[0].host;
                const port = endpoints.value[0].port;
                endpoint[obj] = {//将从主控得到endpoint缓存起来
                    ip,
                    port
                }
            }
            const { ip, port } = endpoint[obj];
            const remoteSocket = new net.Socket();
            console.log(`转发节点：ip:${ip},port:${port}`);
            //建立隧道透传
            remoteSocket.connect(Number(port), ip, function () {
                remoteSocket.write(buffer);
            });
            remoteSocket.on("data", function (data) {
                socket.write(data);
            });
            remoteSocket.setTimeout(remoteTimeout);//定时释放资源
            remoteSocket.on('timeout', () => {
                debug('转发远程socket超时');
                remoteSocket.end();//主动关闭
            });
            remoteSocket.on('end', () => {
                debug('转发远程socket已关闭');
            });
            remoteSocket.on('error', (err) => {
                debug('转发远程socket异常');
            });
        });
        socket.setTimeout(proxyTimeout);//定时释放资源，清除缓存数据
        socket.on('timeout', () => {
            debug('代理socket超时');
            socket.end();//主动关闭
        });
        socket.on('end', () => {
            debug('代理socket已关闭');
        });
        socket.on('error', (err) => {
            debug('代理socket异常');
        });
    });
    server.listen(Number(proxyPort), proxyIp);
}