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
  >
    <a-layout>
      <a-layout-sider width="200px">
        <lamp :color="lampColor"></lamp>
      </a-layout-sider>
      <a-layout-content>
        <a-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span>异常状态：{{ this.exceptionText }}</span>
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
                <a-slider v-model="color" :min="0" :max="254" :disabled="!isPowerOn" :marks="{0: '0', 254: '254'}" input-size="mini" @afterChange="onColorChange"></a-slider>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </a-layout-content>
    </a-layout>
  </a-drawer>
</template>


<script>
import Lamp from '@/components/IoT/Lamp'
import { editSwitchStatus, getSwitchStatus } from '@/api/device'
import { LedLampEquip } from 'hardware-suit'
export default {
  components: { Lamp },
  data () {
    return {
      drawerWidth: 500,
      title: "操作",
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
      power: false,
      bright: 0,
      color: 0,
      lampColor: '#fff',
      exception: '',
      isColorLamp: false
    }
  },
  watch: {
    power (power) {
      // #f4f980 f5ff07
      this.lampColor = power ? 'rgba(244, 255, 0, 0.6)' : '#666'
    },
    bright (bright) {
      // console.log(' === ', bright)
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
    },
    exceptionText () {
      const bits = this.exception.split('')
      if (!bits || !bits.length) return '无异常'
      return bits[0] === '1' ? '开路' : bits[1] === '1' ? '短路' : '无异常'
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
      const ledLampEquip = this.ledLampEquip = new LedLampEquip(record.state, record.device_type, record.device_child_type)
      this.status = record.state
      // this.power = record.state.slice(0, 2) !== '00'
      // this.bright = this.getBrightDecimal()
      // this.color = this.getColorDecimal()
      // this.exception = record.state.slice(14) || '00'
      this.isColorLamp = ledLampEquip.isBicolor()
      this.power = ledLampEquip.isPowerOn()
      this.bright = ledLampEquip.getBrightness()
      this.color = ledLampEquip.getColdColor()
      this.exception = ledLampEquip.getLampExceptionStatus()
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
    // isColorLamp () {
    //   // return this.model.device_child_type === '02'
    //   // return this.ledLampEquip.isBicolor()
    // },
    // getBrightDecimal (status) {
    //   const state = status || this.status
    //   const brightValue = parseInt(state.slice(0, 2), 16)
    //   return Math.ceil(brightValue / 255 * 100)
    // },
    // getBrightHex (bright) {
    //   const hexValue = Math.ceil(bright * 255 / 100)
    //   const hex = parseInt(hexValue, 10).toString(16)
    //   return hex.length > 1 ? hex : '0' + hex
    // },
    // getColorHex (color = 0) {
    //   const hexValue = Math.ceil(color * 254 / 100)
    //   const hex = parseInt(hexValue, 10).toString(16)
    //   return hex.length > 1 ? hex : '0' + hex
    // },
    // getColorDecimal (status) {
    //   const state = status || this.status
    //   const brightValue = parseInt(state.slice(2, 4), 16)
    //   return Math.ceil(brightValue / 254 * 100)
    // },
    onPowerChange (power) {
      // const powerHex = power ? 'ff' : '00'
      // let state = ''
      this.bright = !power ? 0 : 100
      // if (this.isColorLamp()) {
      //   const color = this.getColorHex(this.color)
      //   state = powerHex + color + 'ff0000000200'
      // } else {
      //   state = powerHex + '00000000000200'
      // }
      // this.setSwtich(state)
      const status = this.ledLampEquip.setBrightness(this.bright).setColdColor(this.color).getBytes()
      this.setSwtich(status)
    },
    onBrightChange (bright) {
      if (bright === 0) (this.power = false)
      // const brightValue = this.getBrightHex(bright)
      // let state = ''

      // if (this.isColorLamp()) {
      //   // let color = (255 - Math.round(this.color * 2.55)).toString(16)
      //   // color = color.length > 1 ? color : '0' + color
      //   const color = this.getColorHex(this.color)
      //   state = brightValue + color + 'ff0000000200'
      // } else {
      //   state = brightValue + '00000000000200'
      // }
      // this.setSwtich(state)
      const status = this.ledLampEquip.setBrightness(bright).getBytes()
      this.setSwtich(status)
    },
    onColorChange (color) {
      // const brightValue = this.getBrightHex(this.bright)
      // let state = ''
      // if (this.isColorLamp()) {
      //   const colorHex = this.getColorHex(color)
      //   state = brightValue + colorHex + 'ff0000000200'
      // } else {
      //   state = brightValue + '00000000000200'
      // }
      // this.setSwtich(state)
      const status = this.ledLampEquip.setColdColor(color).getBytes()
      this.setSwtich(status)
    },
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
.card-content__item{
  padding: 30px 24px;
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
