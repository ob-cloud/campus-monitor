<template>
  <div class="controller">
    <div class="tabPicker" v-if="tabPickerVisible">
      <a-radio-group v-model="tabActiveName" size="small">
        <a-radio-button value="cloud" style="display: block; margin: 0; border-radius: 0;">云端码库</a-radio-button>
        <a-radio-button value="custom" style="display: block; margin: 10px 0; border-radius: 0;">学习按键</a-radio-button>
      </a-radio-group>
    </div>
    <air-condition-remote-control v-if="tabActiveName ? tabActiveName === 'cloud' : isAirCondition"></air-condition-remote-control>
    <!-- 学习按键区域 -->
    <div class="panel" v-if="tabActiveName ? tabActiveName === 'custom' : isCustomKeyBoard" style="height: 424px; overflow-y: auto; ">
      <a-spin :spinning="customKeyLoading">
        <div class="custom_key">
          <a-radio-group v-model="customKeyPicker" size="small">
            <a-radio-button :value="item" border v-for="(item, index) in customKeyList" :key="index">{{ item.name && `${item.name} - ` }}{{ item.key }}</a-radio-button>
          </a-radio-group>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script>
import AirConditionRemoteControl from '@/components/IoT/AirCondition'
export default {
  components: { AirConditionRemoteControl },
  data () {
    return {
      transponderList: [],
      currentTransponderDevice: {},
      transponderLoading: false,
      isHanlePanel: false, // is handle controller panel keys
      tabPickerVisible: false,
      tabActiveName: '', // 云端码库或学习按键 tab
      customKeyLoading: false,
      customKeyList: [],
      customKeyPicker: '',
      actionObject: {},
    }
  },
  computed: {
    deviceType () {
      return this.actionObject && this.actionObject.device_type
    },
    deviceSubType () {
      return this.actionObject && this.actionObject.device_child_type
    },
    isAirCondition () {
      return this.currentTransponderDevice.deviceType === 7
    },
    isCustomKeyBoard () {
      return this.currentTransponderDevice.deviceType === 0
    },
  },
  methods: {
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
