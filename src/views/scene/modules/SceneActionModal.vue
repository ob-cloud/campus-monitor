<template>
  <a-modal :title="title" :width="800" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <div class="action-container">
      <div v-if="is3KeyPanel()" class="list power-group">
        <a-checkbox-group v-model="powers" class="">
          <a-checkbox v-for="(item, index) in 1" :value="index+1" :key="index">
            <i class="obicon obicon-power"></i>
          </a-checkbox>
        </a-checkbox-group>
      </div>
      <div v-if="isTransponder()" class="list transponder">
        <a-spin :spinning="transponderLoading">
          <div v-if="actionObject.serialId && !transponderList.length" style="text-align:center;">暂无数据</div>
          <div class="item" :class="{active: item.index === currentTransponderDevice.index}" v-for="(item, index) in transponderList" :key="index" @click="currentTransponderDevice = item">
            <p class="item-icon">
              <i class="obicon obicon-ac" :class="transponderIconFilter(item.deviceType)"></i>
            </p>
            <p>{{ item.name }}</p>
            <p>{{ item.rmodel }}</p>
          </div>
          <div class="controller">
            <!-- transponderList.length === 0 -->
            <div class="tabPicker" v-if="tabPickerVisible">
              <a-radio-group v-model="tabActiveName" size="small">
                <a-radio-button value="cloud" style="display: block; margin: 0; border-radius: 0;">云端码库</a-radio-button>
                <a-radio-button value="custom" style="display: block; margin: 10px 0; border-radius: 0;">学习按键</a-radio-button>
              </a-radio-group>
            </div>
            <div class="panel" v-if="tabActiveName ? tabActiveName === 'cloud' : isAirCondition()">
              <div class="templure">
                <p>{{ airCondition.isPowerOn ? airAction.templure : '--' }}<span>℃</span></p>
                <p>温度</p>
              </div>
              <div class="control-style">
                <div class="mode">{{ airCondition.isPowerOn ? speedFilter(airAction.speed) : '--' }} 风速</div>
                <div class="fans">{{ airCondition.isPowerOn ? modeFilter(airAction.mode) : '--' }} 模式</div>
              </div>
              <div class="btn-controller">
                <div class="btn" :class="{inactive: !isFanSpeedEnable()}">
                  <i class="obicon obicon-wing-o" @click="keyHandler(1)"></i>
                  <p>风扇</p>
                </div>
                <div class="btn" :class="{on: airCondition.isPowerOn, off: !airCondition.isPowerOn}">
                  <i class="obicon obicon-power" @click="keyHandler(0)"></i>
                  <p>开关</p>
                </div>
                <div class="btn" :class="{inactive: !airCondition.isPowerOn}">
                  <i class="obicon obicon-mode-o" @click="keyHandler(2)"></i>
                  <p>模式</p>
                </div>
              </div>
              <div class="btn-controller templure " :class="{inactive: !isTemplureEnable()}">
                <i class="obicon obicon-minus" @click="keyHandler(3, -1)"></i>
                <p>温度</p>
                <i class="obicon obicon-plus" @click="keyHandler(3, 1)"></i>
              </div>
            </div>
            <!-- 学习按键区域 -->
            <div class="panel" v-if="tabActiveName ? tabActiveName === 'custom' : isCustomKeyBoard()" style="height: 424px; overflow-y: auto; ">
              <a-spin :spinning="customKeyLoading">
                <div class="custom_key">
                  <a-radio-group v-model="customKeyPicker" size="small">
                    <a-radio-button :value="item" border v-for="(item, index) in customKeyList" :key="index">{{ item.name && `${item.name} - ` }}{{ item.key }}</a-radio-button>
                  </a-radio-group>
                </div>
              </a-spin>
            </div>
          </div>
        </a-spin>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { getTransponderDevice, getIrCustomKeys } from '@/api/device'
import ActionMixin from '@/utils/mixins/ActionMixin'
import { TypeHints } from 'hardware-suit'
export default {
  mixins: [ ActionMixin ],
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

      powers: [],
      powerStatus: [0, 0, 0], // switcher panel controller panel status
      transponderList: [],
      currentTransponderDevice: {},
      transponderLoading: false,
      airCondition: {
        isPowerOn: false,
        isHanlePanel: false, // is handle controller panel keys
      },
      airAction: {
        templure: 26,
        speed: 0,
        mode: 0,
        power: 0
      },
      tabPickerVisible: false,
      tabActiveName: '', // 云端码库或学习按键 tab
      customKeyLoading: false,
      customKeyList: [],
      customKeyPicker: '',
      actionObject: {}
    }
  },
  watch: {
    powers (val) {
      this.changeStatus(val.length ? 1 : 0)
    },
    tabActiveName (val) {
      if (!val) return
      if (val === 'custom') {
        this.getCustomKeys()
      }
    },
    currentTransponderDevice (val) {
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
    }
  },
  methods: {
    add () {
      this.edit({})
    },
    edit (record) {
      this.actionObject = record
      this.isTransponder() && this.getTransponderDeviceList()
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

    transponderIconFilter (type) {
      const iconMap = {
        7: 'obicon-ac',
        2: 'obicon-tv'
      }
      return {[iconMap[type]]: true}
    },
    is3KeyPanel () {
      return TypeHints.isXkeySocketSwitch(this.deviceSubType)
      // return this.deviceType === '04' && this.deviceSubType === '21'
    },
    isTransponder () {
      return this.deviceType === '51'
    },
    isAirCondition () {
      return this.currentTransponderDevice.deviceType === 7
    },
    isCustomKeyBoard () {
      return this.currentTransponderDevice.deviceType === 0
    },
    isJustTouchPower () {
      // has touch the power key and other key's value is default
      return this.airCondition.isHanlePanel && (this.airAction.power === 0 || this.airAction.power === 1) && this.airAction.templure === 26 && this.airAction.speed === 0 && this.airAction.mode === 0
    },
    changeStatus (power) {
      this.powerStatus.fill(power)
    },
    getTransponderDeviceList () {
      this.transponderLoading = true
      if (!this.actionObject.serialId) { // 没有序列号
        this.transponderLoading = false
        this.currentTransponderDevice.deviceType = 7
        this.tabActiveName = 'cloud'
        this.tabPickerVisible = true
        return
      }
      getTransponderDevice(this.actionObject.serialId).then(res => {
        if (res.status === 200) {
          this.transponderList = res.data.rs
          this.tabPickerVisible = !this.transponderList.length
        }
        this.transponderLoading = false
      })
    },
    getCustomKeys () {
      this.customKeyLoading = true
      getIrCustomKeys().then(res => {
        if (res.status === 0) {
          this.customKeyList = res.data.records || []
        }
        this.customKeyLoading = false
      }).catch(() => {
        this.customKeyLoading = false
      })
    },
    handleOk () {
      const room = {
        action_time: this.actionObject.action_time
      }
      if (this.is3KeyPanel()) {
        this.$emit('ok', {action: this.changeSwitchButtonToAction(this.powerStatus, this.actionObject, room), extra: this.powerStatus[0] ? '开关 - 开' : '开关 - 关'}, false)
      } else if (this.isTransponder()) {
        let keys = ''
        if (this.tabActiveName === 'custom' || (this.currentTransponderDevice && this.currentTransponderDevice.deviceType === 0)) { // 学习按键
          if (!this.customKeyPicker) {
            return this.$message.warning('请进行按键设置')
          }
          keys = this.customKeyPicker.key
          this.currentTransponderDevice.index = this.customKeyPicker.index || this.currentTransponderDevice.index
          this.currentTransponderDevice.name = this.customKeyPicker.name || this.currentTransponderDevice.name
        } else {
          if (!this.airCondition.isHanlePanel) {
            return this.$message.warning('请进行按键设置')
          }

          if (this.isJustTouchPower()) { // get power keys
            keys = this.getAireConditionPowerKey(this.airAction.power)
          } else { // get other condition keys
            let hasVW = ''
            let hasHW = ''
            const isV3 = this.isV3Ac(this.currentTransponderDevice.rmodel)
            if (!isV3 && this.currentTransponderDevice.keys) {
              hasVW = +this.hasVerticalWind(this.currentTransponderDevice.keys)
              hasHW = +this.hasHorizontalWind(this.currentTransponderDevice.keys)
            }
            keys = this.currentTransponderDevice ? this.getAirConditionKeys(this.airAction.templure, this.airAction.mode, this.airAction.speed, hasVW, hasHW) : ''
          }
        }

        const action = {
          index: this.currentTransponderDevice.index,
          key: keys,
          keyType: 0,
          name: this.currentTransponderDevice.name || ''
        }
        this.airCondition.isHanlePanel = false
        this.$emit('ok', {action: this.changeAirConditionToAction(JSON.stringify(action), {...this.currentTransponderDevice, deviceType: '51'}, room), extra: action.key}, false)
      }
      this.close()
    },
    speedFilter (val) {
      return {0: '自动', 1: '弱风', 2: '中风', 3: '强风'}[val] || '自动'
    },
    modeFilter (val) {
      return {0: '自动', 1: '制冷', 2: '抽湿', 3: '送风', 4: '制热'}[val] || '制冷'
    },
    isTemplureEnable () {
      return this.airCondition.isPowerOn && (this.airAction.mode === 4 || this.airAction.mode === 1)
    },
    isFanSpeedEnable () {
      return this.airCondition.isPowerOn && ([0, 1, 4].includes(this.airAction.mode))
    },
    keyHandler (type, subtype) {
      if (type === 0) {
        this.airCondition.isPowerOn = !this.airCondition.isPowerOn
        this.airCondition.isHanlePanel = true
        this.airAction.power = +this.airCondition.isPowerOn
        return
      }
      if (!this.airCondition.isPowerOn) return
      if (subtype && [1, 4].includes(this.airAction.mode)) {
        this.airAction.templure += subtype
        this.airAction.templure < 16 && (this.airAction.templure += 1)
        this.airAction.templure > 30 && (this.airAction.templure -= 1)
      } else if (type === 1) {
        this.airAction.speed += 1
        this.airAction.speed > 3 && (this.airAction.speed = 0)
      } else if (type === 2) {
        this.airAction.mode += 1
        this.airAction.mode > 4 && (this.airAction.mode = 0)
        if ([2, 3].includes(this.airAction.mode)) this.airAction.speed = 1
        this.airAction.templure = 26
      }
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
  .templure{
    padding: 30px 0 20px;
    background: #fff;
    > p{
      font-size: 26px;
      span{
        color: #999;
        font-size: 14px;
        margin-left: 4px;
      }
    }
  }
  .control-style{
    background: #fff;
    div{
      display: inline-block;
      width: 50%;
      padding: 30px;
    }
  }
  .btn-controller{
    margin-top: 30px;
    padding: 10px;

    &.templure{
      // &::after,
      // &::before{
      //   content: ' ';
      //   width: 1px;
      //   height: 1px;
      //   visibility: hidden;
      //   clear: both;
      // }
      background: transparent;
      width: 50%;
      margin: 0 auto;
      background: #fff;
      border-radius: 40px;
      margin-top: 30px;
      padding: 16px 0;

      i,p{
        display: inline-block;
        width: 30%;
        font-size: 16px;
      }
      i{
        color: #3e3b3b;
        cursor: pointer;
      }
    }
    &.templure.inactive i,
    & .btn.inactive i{
      color: #eee;
    }
    .btn{
      display: inline-block;
      width: 30%;
      padding: 10px;
    }
  }
  .btn {
    i{
      font-size: 26px;
      padding: 6px;
      background: #fff;
      border-radius: 100%;
      border: 1px solid #eee;
      cursor: pointer;
      transition: all .3s;
      color: #3e3b3b;
    }
    p{
      margin-top: 14px!important;
    }
  }
  .btn.off i {
    color: #999;
  }
  .btn.on i {
    color: rgb(241, 102, 102);
  }
}
.footer{
  padding: 18px 8px 0;
  text-align: right;
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
      font-size: 12px;
    }
    .el-checkbox-button{
      width: 30%;
    }
    .el-checkbox-button__inner{
      border: 1px solid #DCDFE6;
      border-radius: 4px;
    }
    .el-checkbox-button.is-checked .el-checkbox-button__inner{
      border-color: #409EFF;
    }
    .obicon{
      font-size: 30px;
    }

    // .power-group .ant-checkbox-wrapper span.ant-checkbox {
    //   display: none;
    // }
    // .power-group .ant-checkbox-wrapper span{
    //   display: inline-block;
    //   border: 1px solid;
    //   border-radius: 2px;
    //   transition: all .3s;
    // }
    // .power-group .ant-checkbox-wrapper-checked span{
    //   color: #fff;
    //   background-color: #1890FE;
    //   border-color: #1890ff;
    //   text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
    //   box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
    // }
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
.tabPicker,
.custom_key{
  .el-radio-button:first-child .el-radio-button__inner,
  .el-radio-button:last-child .el-radio-button__inner{
    border-radius: 0;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    border-color: none;
  }
}
.custom_key{
  margin-top: 10px;
  .el-radio-button{
    margin: 10px;
  }
  .el-radio-button .el-radio-button__inner{
    border: 1px solid #DCDFE6;
  }
}
</style>
