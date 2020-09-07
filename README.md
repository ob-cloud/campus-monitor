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


# OBE websocket
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