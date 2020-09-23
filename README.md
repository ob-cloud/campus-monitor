# campus monitor

> 校园监控系统

```
yarn install
```

```
yarn run serve
```

```
yarn run build
```


<br/>
<br/>
<br/>

# OBE websocket 协议
- 数据传输格式：JSON

## 连接websocket

- URL
~~~
ws://127.0.0.1:8201/websocket/{token}

示例：
ws://127.0.0.1:8201/websocket/BearereyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJjYzY2IiwiY3JlYXRlZCI6MTU5OTEyNTUyNDU0MiwiZXhwIjoxNTk5NzMwMzI0fQ.Oo0-GWKFTONjGi-ZXlocoU9rGs9utc4DFLGUkW8k55eHVoh1fOG2__l0h-nF9OF5_OaRdmD5SLCKv-4fHCmqvA

~~~

- websocket推送数据

示例
~~~
{
    "type":0,
    "cmd":"a100",
    "data":"01aced1ea2810002bcba0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "serialId":"aced1ea281",
    "onLine":true
}
~~~

- JSON参数详解

|key|类型|说明|取值范围
|---|:---:|:---|:---|
|type|int|推送消息类型,默认取值0|查看【推送类型枚举值说明】
|cmd|string|cmd|查看【cmd枚举值说明】
|data|string|OBox返回的数据，根据cmd类型做相应的数据解析|
|serialId|string|OBox序列号|
|onLine|boolean|OBox是否在线|true/false

- 推送类型枚举值说明

|type|说明|
|---|:---|
|0|OBox反馈数据|
|1||
|2|OBox在线状态|
|3|警报|
|4|红外在线状态|
|5|红外反馈数据|
|99|门锁|

- cmd枚举值说明

|cmd|说明|
|---|:---|
|a007||
|a001|OBox信息|
|a100|设备节点状态|
|a00e|场景|
|a00b||
|2003|搜索设备|
|2500|传感器|
|a004|更新节点名称|
|a006||
|a008|删除所有节点|
|a00a|删除节点|
|a015|信号强度改变|
|a016|编组按键|
|a014|面板编组|
|a012||
|200c|设备版本号更新|

- websocket搜索设备

搜索成功示例

~~~
{
  "type": 0,
  "cmd": "2003",
  "data": "01aced1ea2810002bcba0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "serialId": "aced1ea281",
  "onLine": true,
  "result": {
    "deviceId": "Lamp2",
    "deviceSerialId": "0c0b0a0000",
    "deviceRfAddr": "02",
    "deviceType": "01",
    "deviceChildType": "02"
  }
}
~~~

搜索失败示例

~~~
{
  "type": 0,
  "cmd": "2003",
  "data": "01aced1ea2810002bcba0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "serialId": "aced1ea281",
  "onLine": true,
  "result": null
}
~~~

<br/>
<br/>
<br/>

# OBE添加OBox

注：
- 添加OBox是异步，添加成功与否使用websocket推送通知前端。
- 添加OBox失败的情况有各种各样，前端应做默认10秒的超时等待，超时没有收到websocket推送表示添加失败。
- 无线/有线OBox如果一直添加不成功，可以断电重启OBox，经过测试发现有时候是配置成功，断电重启即可连接上MQTT。

## 一、添加无线OBox

- Request headers
~~~
X-Access-Token: BearereyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImNyZWF0ZWQiOjE1OTcxOTgzNTY2MTgsImV4cCI6MTU5NzgwMzE1Nn0.kbmCKY3FHKleA0yZgU68sKbFL2fqTKuUeEPa9NHCEWuGA9S65j0sxggZmyRRE9LmppA8iyPeBInd5uVm0374xQ
~~~

- Params

|参数|类型|是否必填（YES/NO）|示例|
|---|:---|:---:|:---|
|CMD|string|Y|add_wireless_obox
|config|string|Y|{"ssid":"OBE-dev","bssid":"20:6b:e7:7f:7c:95","password":"28068198"}

- config参数说明

|key|说明|示例|
|---|:---|:---|
|ssid|WiFi用户名|OBE-dev
|bssid|路由器bssid,由于这个值是smartconfig必填，但普通用户又无法获取到，因此校园的项目使用有线版OBox居多|20:6b:e7:7f:7c:95
|password|WiFi密码|28068198

- HTTP API Response
~~~
{
    "code": "OK",
    "message": "success!",
    "result": null
}
~~~

- websocket推送添加OBox成功示例

~~~
{
  "type": 6,
  "cmd": "connected",
  "serialId": "aced1ea281",
  "onLine": true
}
~~~

- websocket推送添加OBox失败示例

~~~
{
  "type": 7,
  "cmd": "failure",
  "serialId":null,
  "onLine": false
}
~~~

## 二、添加有线OBox
- Request headers
~~~
X-Access-Token: BearereyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImNyZWF0ZWQiOjE1OTcxOTgzNTY2MTgsImV4cCI6MTU5NzgwMzE1Nn0.kbmCKY3FHKleA0yZgU68sKbFL2fqTKuUeEPa9NHCEWuGA9S65j0sxggZmyRRE9LmppA8iyPeBInd5uVm0374xQ
~~~

- Params

|参数|类型|是否必填（YES/NO）|示例|
|---|:---|:---:|:---|
|CMD|string|Y|add_wired_obox

- HTTP API Response
~~~
{
    "code": "OK",
    "message": "success!",
    "result": null
}
~~~

- websocket推送添加OBox成功示例

~~~
{
  "type": 6,
  "cmd": "connected",
  "serialId": "aced1ea281",
  "onLine": true
}
~~~

- websocket推送添加OBox失败示例

~~~
{
  "type": 7,
  "cmd": "failure",
  "serialId":null,
  "onLine": false
}
~~~