<template>
  <a-modal :title="title" :width="800" :destroyOnClose="true" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <div class="action-container">
      <div v-if="isXkeyPanel" class="list power-group">
        <scene-action-switch :state="switchStatus" @change="(status) => powerStatus = status"></scene-action-switch>
      </div>
      <div v-if="isTransponder" class="list transponder">
        <a-spin :spinning="transponderLoading">
          <div v-if="actionObject.serialId && !transponderList.length" style="text-align:center;">暂无数据</div>
          <!-- 红外列表 -->
          <div class="item" :class="{active: item.index === curInfraredDevice.index}" v-for="(item, index) in transponderList" :key="index" @click="curInfraredDevice = item">
            <p class="item-icon">
              <i class="obicon obicon-ac" :class="transponderIconFilter(item.deviceType)"></i>
            </p>
            <p>{{ item.name }}</p>
            <p>{{ item.rmodel }}</p>
          </div>

          <div class="controller">
            <div class="tabPicker" v-if="tabPickerVisible">
              <a-radio-group v-model="tabActiveName" size="small">
                <a-radio-button value="cloud" style="display: block; margin: 0; border-radius: 0;">云端码库</a-radio-button>
                <a-radio-button value="custom" style="display: block; margin: 10px 0; border-radius: 0;">学习按键</a-radio-button>
              </a-radio-group>
            </div>

            <!-- 空调遥控 -->
            <air-condition-remote-control v-if="tabActiveName ? tabActiveName === 'cloud' : isAirCondition" @change="(record) => remoteControlValue = record"></air-condition-remote-control>

            <!-- 学习按键区域 -->
            <custom-learning-button v-if="tabActiveName ? tabActiveName === 'custom' : isCustomKeyBoard" v-model="customKeyPicker" :keyList="customKeyList"></custom-learning-button>
          </div>
        </a-spin>
      </div>
      <div v-if="isBicolorLed">
        <bizz-lamp :siderWidth="150" :deviceType="deviceType" :deviceChildType="deviceSubType" @change="(status, statusInfo) => { lampStatus = status; lampStatusInfo = statusInfo}"></bizz-lamp>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { getTransponderDevice, getIrCustomKeys } from '@/api/device'
import ActionMixin from '@/utils/mixins/ActionMixin'
import { TypeHints } from 'hardware-suit'
import BizzLamp from '@/components/Bizz/BizzLamp'
import SceneActionSwitch from './SceneActionSwitch'
import AirConditionRemoteControl from '@/components/IoT/AirCondition'
import CustomLearningButton from '@/components/IoT/CustomLearningButton'
export default {
  mixins: [ ActionMixin ],
  components: { BizzLamp, SceneActionSwitch, AirConditionRemoteControl, CustomLearningButton },
  data () {
    return {
      title: '操作',
      visible: false,
      model: {},
      confirmLoading: false,

      switchStatus: '00',
      powerStatus: '', // switcher panel controller panel status

      transponderList: [],
      curInfraredDevice: {},
      transponderLoading: false,

      tabPickerVisible: false, // 是否显示tab选项
      tabActiveName: '', // 云端码库或学习按键 tab

      customKeyLoading: false,
      customKeyList: [],
      customKeyPicker: null, // 自定义按键radio值
      actionObject: {}, // 选中的设备类型对象

      lampStatus: '',
      lampStatusInfo: '',
      remoteControlValue: null
    }
  },
  watch: {
    tabActiveName (val) {
      if (!val) return
      if (val === 'custom') {
        this.getCustomKeys()
      }
    },
    curInfraredDevice (val) {
      if (!val) return
      if (val.deviceType === 0) {
        this.customKeyList = val.extendsKeys
      }
    }
  },
  computed: {
    deviceType () {
      return this.actionObject && this.actionObject.device_type
    },
    deviceSubType () {
      return this.actionObject && this.actionObject.device_child_type
    },
    isXkeyPanel () {
      return TypeHints.isXkeySocketSwitch(this.deviceSubType)
    },
    isTransponder () {
      return this.deviceType === '51'
    },
    isAirCondition () {
      return this.curInfraredDevice.deviceType === 7
    },
    isCustomKeyBoard () {
      return this.curInfraredDevice.deviceType === 0
    },
    isBicolorLed () {
      return TypeHints.isSimpleLed(this.deviceSubType)
    }
  },
  methods: {
    show (record) {
      this.actionObject = { ...record }
      this.isTransponder && this.getTransponderDeviceList()
      this.visible = true
    },
    // 关闭
    handleCancel () {
      this.close()
    },
    close () {
      this.$emit('close')
      this.visible = false
    },
    reset () {
      this.lampStatus = ''
      this.powerStatus = ''
      this.customKeyPicker = null
    },
    transponderIconFilter (type) {
      const iconMap = {
        7: 'obicon-ac',
        2: 'obicon-tv'
      }
      return {[iconMap[type]]: true}
    },
    getTransponderDeviceList () {
      this.transponderLoading = true
      if (!this.actionObject.serialId) { // 没有序列号
        this.transponderLoading = false
        this.curInfraredDevice.deviceType = 7
        this.tabActiveName = 'cloud'
        this.tabPickerVisible = true
        return
      }
      // 有序列号
      getTransponderDevice(this.actionObject.serialId).then(res => {
        if (res.status === 200) {
          this.transponderList = res.data.rs
          this.tabPickerVisible = !this.transponderList.length
        }
        this.transponderLoading = false
      })
    },
    getCustomKeys () { // 获取自定义按键
      this.customKeyLoading = true
      getIrCustomKeys().then(res => {
        if (res.status === 0) {
          this.customKeyList = res.data.records || []
        }
      }).finally(() => this.customKeyLoading = false)
    },
    isCustomLearningButton () { // 是否学习按键
      return this.tabActiveName === 'custom' || (this.curInfraredDevice && this.curInfraredDevice.deviceType === 0)
    },
    handleOk () {
      const room = {
        action_time: this.actionObject.action_time
      }
      if (this.isXkeyPanel) {
        if (!this.powerStatus) return this.$message.warning('请设置开关状态')
        this.$emit('ok', {action: this.toAction(this.powerStatus, this.actionObject, room), extra: this.powerStatus.slice(0, 2) === '00' ? '开关 - 关' : '开关 - 开'}, this.actionObject.childActionIndex)
      } else if (this.isTransponder) {
        let keys = ''
        if (this.isCustomLearningButton()) { // 学习按键
          if (!this.customKeyPicker) {
            return this.$message.warning('请进行学习按键设置')
          }
          keys = this.customKeyPicker.key
          this.curInfraredDevice.index = this.customKeyPicker.index || this.curInfraredDevice.index
          this.curInfraredDevice.name = this.customKeyPicker.name || this.curInfraredDevice.name

        } else { // 遥控按键
          if (!this.remoteControlValue) return this.$message.warning('请进行按键设置')

          if (this.remoteControlValue && this.remoteControlValue.powerOnly) { // 只设置电源开关
            keys = this.getAireConditionPowerKey(this.remoteControlValue.power)
          } else { // get other condition keys
            let hasVW = ''
            let hasHW = ''
            if (!this.isV3Ac(this.curInfraredDevice.rmodel) && this.curInfraredDevice.keys) {
              hasVW = +this.hasVerticalWind(this.curInfraredDevice.keys)
              hasHW = +this.hasHorizontalWind(this.curInfraredDevice.keys)
            }
            keys = this.curInfraredDevice ? this.getAirConditionKeys(this.remoteControlValue.temperature, this.remoteControlValue.mode, this.remoteControlValue.speed, hasVW, hasHW) : ''
          }
        }
        const action = {
          index: this.curInfraredDevice.index,
          key: keys,
          keyType: 0,
          name: this.curInfraredDevice.name || ''
        }
        this.remoteControlValue = null
        this.$emit('ok', {action: this.changeAirConditionToAction(JSON.stringify(action), {...this.curInfraredDevice, deviceType: '51'}, room), extra: action.key},  this.actionObject.childActionIndex)
      } else if (this.isBicolorLed) {
        if (!this.lampStatus) return this.$message.warning('请设置灯状态')
        const descriptor = `亮度:${this.lampStatusInfo.bright} / 色温:${this.lampStatusInfo.color} (${this.lampStatus})`
        this.$emit('ok', {action: this.toAction(this.lampStatus, this.actionObject, room), extra: descriptor},  this.actionObject.childActionIndex)
      }
      this.close()
    },
  },
}
</script>

<style lang="less" scoped>
.controller {
  position: relative;
  border-top: 6px double #eee;
  padding-top: 20px;

  .tabPicker{
    position: absolute;
    left: 20px;
    top: 20px;
  }
  .panel{
    width: 380px;
    text-align: center;
    margin: 0 auto;
    border: 1px solid #eee;
    border-radius: 14px;
    background: #f3f3f3;
    overflow: hidden;
    padding-bottom: 30px;
    box-shadow: 1px 1px 2px 1px #f2f2f2;
    user-select: none;
  }
}
</style>
<style lang="less">
.action-container {
  .list {
    text-align: center;
    padding: 80px 10px;
    &.transponder{
      padding: 10px;
      text-align: left;
    }
    &.transponder .item{
      display: inline-block;
      width: 140px;
      height: 105px;
      overflow: hidden;
      border: 1px solid #999;
      border-radius: 4px;
      padding: 10px;
      margin: 5px;
      text-align: center;
      font-size: 14px;
      cursor: pointer;
      transition: all .3s;

      &.active{
        border-color: #409EFF;
      }
    }
    &.transponder .item-icon{
      text-align: center;
      > i{
        font-size: 40px;
      }
    }
    &.transponder p:last-of-type{
      color: #999;
      margin-top: 4px;
      margin-bottom: 0;
      font-size: 12px;
    }
    // .el-checkbox-button{
    //   width: 30%;
    // }
    // .el-checkbox-button__inner{
    //   border: 1px solid #DCDFE6;
    //   border-radius: 4px;
    // }
    // .el-checkbox-button.is-checked .el-checkbox-button__inner{
    //   border-color: #409EFF;
    // }
    .obicon{
      font-size: 30px;
    }
  }
  .power-group{
    width: 360px;
    height: 300px;
    border: 1px solid #ccc;
    margin: 0 auto;
    text-align: center;
    padding: 40px 10px;
    -webkit-box-shadow: 1px 1px 1px 1px #f5f5f5;
    box-shadow: 1px 1px 1px 1px #f5f5f5;
    background-color: #f7f7f7;
    border-radius: 12px;
    position: relative;

    .ant-checkbox-group{
      position: absolute;
      left: 50%;
      top: 40%;
      transform: translateX(-50%)
    }
  }
  .power-group .ant-checkbox-wrapper span.ant-checkbox {
    display: none;
  }
  .power-group .ant-checkbox-wrapper span{
    display: inline-block;
    border: 1px solid;
    border-radius: 2px;
    transition: all .3s;

    > i{
      font-size: 30px;
    }
  }
  .power-group .ant-checkbox-wrapper-checked span{
    color: #dd0b0b;
    background-color: #fff;
    border-color: #d8d815;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
    // box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
    text-shadow: 0 -2px 0 #d8d815;
    // box-shadow: 0px -4px 7px 2px #d8d815;
  }
}

</style>
