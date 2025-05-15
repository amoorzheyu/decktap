const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { keyboard, Key } = require("@nut-tree/nut-js");
const os = require('os');
const qrcode = require('qrcode-terminal');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 9999;

// 判断是否为 pkg 打包环境
const isPkg = typeof process.pkg !== 'undefined';
const staticPath = isPkg
  ? path.join(path.dirname(process.execPath), 'controller', 'public')
  : path.join(__dirname, '..', 'controller', 'public');

console.log('📂 Static files path:', staticPath);
app.use(express.static(staticPath));

wss.on('connection', (ws) => {
  console.log('📲 Mobile phone controller connected');
  ws.on('message', (message) => {
    const msg = message.toString();
    if (msg === 'next') {
      try {     
        (async () => {
            await keyboard.pressKey(Key.Right);
            await keyboard.releaseKey(Key.Right);
        })();
      } catch (error) {
        console.error('❌ Key simulation failed:', error);
      }
    } else if (msg === 'prev') {
      try {   
        (async () => {
            await keyboard.pressKey(Key.Left);
            await keyboard.releaseKey(Key.Left);
        })();
      } catch (error) {
        console.error('❌ Key simulation failed:', error);
      }
    } else {
      console.log('❌ Unknown message type:', msg);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('🔌 The phone controller has been disconnected');
  });
});

server.listen(port, () => {
  const controlUrl = `http://${getLocalIP()}:${port}`;
  console.log(`\n✅ DeckTap LAN service has been started：${controlUrl}`);
  console.log('\n🔗 Please open the above link with your mobile phone under the same Wi-Fi, or scan the QR code below:\n');
  qrcode.generate(controlUrl, { small: true });
});

process.on('SIGINT', () => {
    ioHook.unload();
    ioHook.stop();
    process.exit();
  });

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  console.log('🔍 Scanning the network interface......');
  
  // 存储所有找到的 IP 地址
  const ipAddresses = [];
  
  for (let [name, iface] of Object.entries(interfaces)) {
    for (let config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        // 检查是否是有效的单播地址（不是网络地址或广播地址）
        const ipParts = config.address.split('.').map(Number);
        const lastOctet = ipParts[3];
        if (lastOctet !== 0 && lastOctet !== 255) {  // 排除网络地址和广播地址
          console.log(`📡 Discover network interfaces: ${name}`);
          console.log(`   IP Address: ${config.address}`);
          console.log(`   Subnet Mask: ${config.netmask}`);
          ipAddresses.push({
            name,
            address: config.address,
            netmask: config.netmask,
            // 添加优先级分数
            priority: getPriorityScore(config.address, name)
          });
        }
      }
    }
  }

  // 按优先级排序
  ipAddresses.sort((a, b) => b.priority - a.priority);
  
  if (ipAddresses.length > 0) {
    const selectedIP = ipAddresses[0];
    console.log(`✅ Choose Local IP: ${selectedIP.address} (${selectedIP.name})`);
    return selectedIP.address;
  }

  console.log('❌ No available network interface was found, use localhost');
  return 'localhost';
}

// 计算 IP 地址的优先级分数
function getPriorityScore(address, interfaceName) {
  let score = 0;
  
  // 优先选择常见的本地网络接口名称
  if (interfaceName.includes('en0') || interfaceName.includes('wlan0')) {
    score += 100;
  }
  
  // 优先选择 192.168.x.x 地址（最常见的本地网络）
  if (address.startsWith('192.168.')) {
    score += 50;
  }
  
  // 优先选择 172.16.x.x - 172.31.x.x 地址
  if (address.startsWith('172.')) {
    const secondOctet = parseInt(address.split('.')[1]);
    if (secondOctet >= 16 && secondOctet <= 31) {
      score += 40;
    }
  }
  
  // 优先选择 10.x.x.x 地址
  if (address.startsWith('10.')) {
    score += 30;
  }
  
  // 排除一些特殊的网络接口
  if (interfaceName.includes('vmnet') || 
      interfaceName.includes('docker') || 
      interfaceName.includes('veth')) {
    score -= 100;
  }
  
  return score;
}
