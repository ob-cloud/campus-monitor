<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :height="drawerWidth"
    placement="bottom"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
    :destroyOnClose="true"
    :bodyStyle="{height: 'calc(100% - 60px)'}"
  >
    <bizz-lamp :siderWidth="150" :status="status" :deviceType="deviceType" :deviceChildType="deviceChildType" @change="handleLampChange"></bizz-lamp>
    <!-- <a-layout style="height: 100%">
      <a-layout-sider width="200px" style="background: #132436;">
        <lamp :color="lampColor"></lamp>
      </a-layout-sider>
      <a-layout-content>
        <a-card class="box-card" shadow="never">
          <div slot="extra" class="clearfix">
            <a-icon style="color: #ff4d4f;" type="warning" />
            <span style="font-size: 12px; margin-left: 5px">{{ this.exceptionText }}</span>
          </div>
          <div class="card-content">
            <a-row :gutter="40" class="card-content__item">
              <a-col :span="3">
                <span>开关</span>
              </a-col>
              <a-col :span="16" style="text-align: left;">
                <a-switch
                  v-model="power"
                  inactive-color="#DC143C"
                  checked-children="开"
                  un-checked-children="关"
                  @change="onPowerChange"
                >
                </a-switch>
              </a-col>
            </a-row>
            <a-row :gutter="40" class="card-content__item">
              <a-col :span="3">
                <span>亮度</span>
              </a-col>
              <a-col :span="16">
                <a-slider v-model="bright" :marks="{0: '0', 100: '100'}" :disabled="!isPowerOn" input-size="mini" @afterChange="onBrightChange"></a-slider>
              </a-col>
            </a-row>
            <a-row :gutter="40" class="card-content__item" v-if="isColorLamp">
              <a-col :span="3">
                <span>色度</span>
              </a-col>
              <a-col :span="16">
                <a-slider v-model="color" :min="0" :max="255" :disabled="!isPowerOn" :marks="{0: '0', 255: '255'}" input-size="mini" @afterChange="onColorChange"></a-slider>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </a-layout-content>
    </a-layout> -->
  </a-drawer>
</template>


<script>
// import Lamp from '@/components/IoT/Lamp'
import { editSwitchStatus, getSwitchStatus } from '@/api/device'
import { LedLampEquip, Descriptor } from 'hardware-suit'
import BizzLamp from '@/components/Bizz/BizzLamp'
export default {
  components: { BizzLamp },
  data () {
    return {
      drawerWidth: 500,
      title: "灯控",
      visible: false,
      disableSubmit: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },

      confirmLoading: false,
      form: this.$form.createForm(this),

      ledLampEquip: null,

      status: '',
      deviceType: '',
      deviceChildType: '',
      power: false,
      bright: 0,
      color: 0,
      lampColor: '#fff',
      exception: '',
      isColorLamp: false,
      exceptionText: ''
    }
  },
  watch: {
    power (power) {
      // #f4f980 f5ff07
      this.lampColor = power ? 'rgba(244, 255, 0, 0.6)' : '#666'
    },
    bright (bright) {
      const alpha = (bright / 100 * 0.4) + 0.6
      this.lampColor = this.power ? `rgba(244, 255, 0, ${alpha})` : this.lampColor
    },
    color (color) {
      console.log('color  ', color)
    }
  },
  computed: {
    isPowerOn () {
      return this.power
    }
  },
  mounted () {

  },
  methods: {
    add () {
      this.edit({})
    },
    show (record) {
      this.model = Object.assign({}, record)
      this.visible = true
      this.title = `灯控 - ${Descriptor.getTypeDescriptor(record.device_type, record.device_child_type)}(${record.serialId})`

      this.status = record.state
      this.deviceType = record.device_type
      this.deviceChildType = record.device_child_type

      const ledLampEquip = this.ledLampEquip = new LedLampEquip(record.state, record.device_type, record.device_child_type)
      this.isColorLamp = ledLampEquip.isBicolor()
      this.power = ledLampEquip.isPowerOn()
      this.bright = ledLampEquip.getBrightness()
      this.color = ledLampEquip.getColdColor()
      this.exceptionText = ledLampEquip.getLampExceptionStatus()
    },
    close () {
      this.$emit('close')
      this.disableSubmit = false
      this.visible = false
    },
    handleCancel () {
      this.close()
    },
    handleOk () {
    },
    handleLampChange (status, lampStatusInfo) {
      // lampStatus = status; lampStatusInfo = statusInfo
      console.log('lamp ', lampStatusInfo)
      this.setSwtich(status)
    },
    // onPowerChange (power) {
    //   this.bright = !power ? 0 : 100
    //   const status = this.ledLampEquip.setBrightness(this.bright).setColdColor(this.color).getBytes()
    //   this.setSwtich(status)
    // },
    // onBrightChange (bright) {
    //   if (bright === 0) (this.power = false)
    //   const status = this.ledLampEquip.setBrightness(bright).getBytes()
    //   this.setSwtich(status)
    // },
    // onColorChange (color) {
    //   const status = this.ledLampEquip.setColdColor(color).getBytes()
    //   this.setSwtich(status)
    // },
    setSwtich (status) {
      editSwitchStatus(this.model.serialId, status).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('成功')
          // this.getSwitchStatus()
        } else {
          this.$message.error('失败')
        }
      })
    },
    getSwitchStatus () {
      getSwitchStatus(this.model.serialId).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('成功')
        } else {
          this.$message.error('失败')
        }
      })
    }
  },
}
</script>


<style lang="less" scoped>
.box-card{
  margin: 10px;
}
.card-content__item{
  padding: 20px;
  // border-bottom: 1px solid #3A4257;

  > div{
    text-align: right;
    line-height: 38px;
  }
}
.toolbox{
  position: absolute;
  left: 212px;
  right: 0;
  bottom: 0;
  text-align: right;
  padding: 6px;
  padding-right: 30px;
  background: #2C3449;
}
</style>
