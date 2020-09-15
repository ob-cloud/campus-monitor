<template>
  <a-modal :title="title" :width="800" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <a-tabs v-model="conditionType" class="condition-type" @change="onConditionTabClick">
      <a-tab-pane tab="定时条件" key="1">
        <Cron v-model="conditionModel.cron"></Cron>
      </a-tab-pane>
      <a-tab-pane tab="联动条件" key="2" class="left h200 chain-list">
        <div class="chain-device" :class="{active: item.serialId === chainActiveDevice.serialId}" v-for="(item, index) in chainDeviceList" :key="index" @click="onChainDeviceClick(item)">
          <p>{{ item.name }}</p>
          <p>{{ item.serialId }}</p>
          <p>{{ deviceTypeDescriptFilter(item.device_type, item.device_child_type) }}</p>
        </div>
        <div class="chain-device-actions">
          <div class="chain-action__item" v-if="isHumidifier()">
            <div class="title">
              <a-radio-group v-model="templureAction">
                <a-radio-button :value="0">温度</a-radio-button>
                <a-radio-button :value="1">湿度</a-radio-button>
              </a-radio-group>
              <div class="humidifier-text">
                <div>
                  <span>温度</span>
                  {{ conditionModel.symbolT && conditionModel.symbolT !== '无' ? `${conditionModel.symbolT} ${conditionModel.templure}℃` : '无' }}
                </div>
                <div>
                  <span>湿度</span>
                  {{ conditionModel.symbolH && conditionModel.symbolH !== '无' ? `${conditionModel.symbolH} ${conditionModel.humidifier}%` : '无' }}
                </div>
              </div>
            </div>
            <div class="content">
              <template v-if="templureAction === 0">
                <a-radio-group v-model="conditionModel.symbolT">
                  <a-radio :value="key" border v-for="(item, key) in templureCondition" :key="item">{{ key }}</a-radio>
                </a-radio-group>
              </template>
              <template v-if="templureAction === 1">
                <a-radio-group v-model="conditionModel.symbolH">
                  <a-radio :value="key" border v-for="(item, key) in templureCondition" :key="item">{{ key }}</a-radio>
                </a-radio-group>
              </template>
            </div>
            <div class="content" v-if="templureAction === 0 && conditionModel.symbolT && conditionModel.symbolT !== '无'">
              <a-radio-group v-model="conditionModel.templure">
                <a-radio class="templure-value" :value="item" border v-for="(item, index) in templureValue" :key="index">{{ item }}</a-radio>
              </a-radio-group>
            </div>
            <div class="content" v-if="templureAction === 1 && conditionModel.symbolH && conditionModel.symbolH !== '无'">
              <a-radio-group v-model="conditionModel.humidifier">
                <a-radio class="templure-value" :value="item" border v-for="(item, index) in humidifierValue" :key="index">{{ item }}</a-radio>
              </a-radio-group>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script>
import { TypeHints, Converter, Descriptor } from 'hardware-suit'
import Cron from '@/components/IoT/Cron'
export default {
  name: 'SceneConditionModal',
  components: { Cron },
  data () {
    return {
      title: '操作',
      visible: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,

      conditionType: '1',
      conditionTimeType: '1',
      conditionModel: {
        cron: '',
        year: '',
        month: '',
        day: '',
        date: '',
        time: '',
        week: '',
        pick: '',
        name: '',
        type: '联动条件',
        action: '',
        symbolT: '',
        symbolH: '',
        templure: '',
        humidifier: '',
        conditionType: '',
        condition: '',
        conditionDesc: ''
      },
      templureCondition: {'>': '49', '=': '4a', '>=': '4b', '<': '4c', '<=': '4e', '无': ''},
      templureValue: [],
      humidifierValue: [],
      templureAction: 0,
      tempHumCondition: ['', '', '', '', ''],
      chainDeviceList: [],
      chainActiveDevice: ''
    }
  },
  watch: {
    conditionModel: {
      deep: true,
      handler () {
        if (this.conditionType === '1') { // 时间
        } else if (this.conditionType === '2') { // 联动
        }
      }
    },
    'conditionModel.symbolT' (val) {
      if (this.templureCondition[val]) {
        this.tempHumCondition[0] = this.templureCondition[val]
        this.tempHumCondition[1] = '' // change symbol, reset temperature's value
      } else {
        this.tempHumCondition[0] = '4C'
        this.tempHumCondition[1] = 'FF'
        this.templureAction = 1
      }
      this.conditionModel.templure = '' // changing symbole, reset templure model
      this.tempHumCondition[4] = '000000000000'
    },
    'conditionModel.symbolH' (val) {
      if (this.templureCondition[val]) {
        this.tempHumCondition[2] = this.templureCondition[val]
        this.tempHumCondition[3] = ''
      } else {
        this.tempHumCondition[2] = '00'
        this.tempHumCondition[3] = '00'
      }
      this.conditionModel.humidifier = ''
      this.tempHumCondition[4] = '000000000000'
    },
    'conditionModel.templure' (val) {
      if (val) {
        this.tempHumCondition[1] = new Converter(+val + 30, 10).toHex()
        this.templureAction = 1
      }
    },
    'conditionModel.humidifier' (val) {
      if (val) {
        this.tempHumCondition[3] = new Converter(val, 10).toHex()
      }
    }
  },
  methods: {
    deviceTypeDescriptFilter (deviceType, deviceSubType) {
      return Descriptor.getTypeDescriptor(deviceType, deviceSubType)
    },
    getChainDeviceList () {
      this.chainDeviceList = [{
        serialId: '',
        name: '温湿度类型设备',
        device_type: '0b',
        device_child_type: '0b'
      }]
    },
    isChainType (deviceType, deviceSubType, isLocal) {
      return TypeHints.isSensors(deviceType)
        || (TypeHints.isFinger(deviceType) && !isLocal)
        || TypeHints.isDoorLock(deviceType)
        || (TypeHints.isSocketSwitch(deviceType) && (TypeHints.isSceneSocketSwitch(deviceSubType) || TypeHints.isMixSocketSwitch(deviceSubType)))
    },
    getTemplureValue () {
      for (let i = 0; i < 52; i++) {
        this.templureValue[i] = '' + (-11 + i)
      }
    },
    getHumidifierValue () {
      for (let i = 0; i < 20; i++) {
        this.humidifierValue[i] = '' + (i * 5)
      }
    },
    onConditionTabClick (key) {
      if (key === '2') {
        this.getChainDeviceList()
      }
    },
    onChainDeviceClick (device) {
      this.chainActiveDevice = device
      if (this.isHumidifier()) {
        this.getTemplureValue()
        this.getHumidifierValue()
      }
    },
    isHumidifier () {
      return TypeHints.isHumidifierSensors(this.chainActiveDevice.device_child_type)
    },
    hasEmptyHumCondition () {
      return this.tempHumCondition.findIndex(con => !con) !== -1
    },
    getDateTimeCondition () {
      return this.conditionModel.cron
    },
    handleOk () {
      if (this.conditionType === '1') {
        this.conditionModel.type = '1'
        this.conditionModel.conditionType = '00'
        this.conditionModel.condition = this.getDateTimeCondition()
        const cronArr = this.conditionModel.condition.split(' ')
        const day = cronArr[3]
        const week = cronArr[5]
        if (day === '?' && week === '?') {
          return this.$message.error('日期与星期不可以同时为“不指定”')
        }
        if (day !== '?' && week !== '?') {
          return this.$message.error('日期与星期必须有一个为“不指定”')
        }
        this.$emit('ok', {model: this.conditionModel, selected: null}, false)
      } else if (this.conditionType === '2') {
        if (this.isHumidifier()) {
          this.conditionModel.condition = this.tempHumCondition.join('')
          this.conditionModel.action = `温度${this.conditionModel.symbolT}${this.conditionModel.templure} / 湿度${this.conditionModel.symbolH}${this.conditionModel.humidifier})`
        }
        this.conditionModel.type = '2'
        this.conditionModel.conditionType = '01'
        if (!this.conditionModel.condition || this.hasEmptyHumCondition()) {
          return this.$message.warning('请配置联动条件')
        }
        this.$emit('ok', {model: this.conditionModel, selected: this.chainActiveDevice}, false)
      }
      this.close()
    },
    add () {
      this.edit({})
    },
    edit () {
      this.visible = true
    },
    // 关闭
    handleCancel () {
      this.close()
    },
    close () {
      this.$emit('close')
      this.visible = false
      this.resetModal()
    },
    resetModal () {
      this.conditionType = '1'
      this.templureAction = 0
      this.conditionModel = {
        cron: '',
        year: '',
        month: '',
        day: '',
        date: '',
        time: '',
        week: '',
        pick: '',
        name: '',
        type: '联动条件',
        action: '',
        symbolT: '',
        symbolH: '',
        templure: '',
        humidifier: '',
        conditionType: '',
        condition: '',
        conditionDesc: ''
      }
    }
  },
}
</script>

<style lang="less" scoped>
.close{
  font-size: 20px;
  color: #999;
  line-height: 41px;
  cursor: pointer;
}
.w8{
  width: 80%;
}
.w140px{
  width: 140px;
}
.w440px{
  width: 440px;
}
.h200{
  min-height: 200px;
}
.fl{
  float: left;
}
.fr{
  float: right;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
.center{
  text-align: center;
}
.left{
  text-align: left;
}

.condition-type{
  list-style: none;
  text-align: center;
}
.timing{
  height: 200px;
}
.timing .picker{
  margin-left: 10px;
  margin-top: 20px;
}
.timing .weeks{
  width: 440px;
  margin: 10px auto 20px;
  text-align: center;
}
.timing .weeks .el-radio-button{
  margin-top: 10px;
  margin-right: 10px;
}

.chain-device{
  display: inline-block;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 5px;
  box-shadow: 1px 1px 2px #f2f2f2;
  margin-right: 10px;
  margin-top: 10px;
  transition: all .3s;
  cursor: pointer;
  min-height: 120px;
  vertical-align: top;
}
.chain-device.active,
.chain-device:hover{
  border-color: #409EFF;
}
.chain-device p{
  padding: 5px;
  font-size: 14px;
  color: #333;
}
.chain-device p:not(:first-child) {
  font-size: 12px;
  color: #666;
}
.chain-device-actions {
  margin-top: 20px;
}
.chain-action__item .title{
  color: #555;
  padding: 5px;
  border-bottom: 1px solid #eee;
  & .humidifier-text{
    float: right;
    background: #fff;
    border: 1px solid #eee;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 1px 1px 1px 0px #f2f2f2;
    div{
      display: inline-block;
      padding: 0 10px;
      color: #999;
    }
    span{
      color: #666;
    }
  }
}
.chain-action__item .content{
  padding: 10px;
}
.chain-action__item .content .el-radio{
  margin-right: 10px;
  margin-top: 10px;
}
.el-radio.is-bordered + .el-radio.is-bordered{
  margin-left: 0;
}
.chain-action__item .content .templure-value{
  height: 25px;
  width: 60px;
  // margin-right: 0;
  // margin-left: 5px;
  padding: 5px;
  // margin-top: 5px;
}
.footer{
  padding: 18px 8px 0;
  text-align: right;
}
</style>
<style lang="css">
/* .condition-type.el-tabs--border-card,
.box-card .el-tabs--border-card,
.box-card.el-card.is-always-shadow{
  box-shadow: none;
}
.box-card .el-card__header{
  padding: 0 20px;
}
.box-card .el-card__body{
  padding: 10px 0 20px;
}
.condition-type > .el-tabs__header{
  background: #f2f2f2;
} */
/* .timing .el-radio-button .el-radio-button__inner{
  border-left: 1px solid #DCDFE6;
  width: 80px;
  border-radius: 4px;
}

.timing .el-radio-button__orig-radio:checked + .el-radio-button__inner{
  border-left-color: #409EFF;
} */
.condition-type .ant-tabs-nav-wrap{
  text-align: left;
}
</style>
