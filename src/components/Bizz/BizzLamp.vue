<template>
  <a-layout style="height: 100%">
    <a-layout-sider :width="`${siderWidth}px`" style="background: #132436;">
      <lamp :color="lampColor"></lamp>
    </a-layout-sider>
    <a-layout-content>
      <a-card class="box-card" shadow="never">
        <div slot="extra" class="clearfix" v-if="status">
          <a-icon style="color: #ff4d4f;" type="warning" />
          <span style="font-size: 12px; margin-left: 5px">{{ exceptionText }}</span>
        </div>
        <div class="card-content">
          <a-row :gutter="40" class="card-content__item">
            <a-col :xs="12" :sm="5" :md="5">
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
            <a-col :xs="12" :sm="5" :md="5">
              <span>亮度</span>
            </a-col>
            <a-col :span="16">
              <a-slider v-model="bright" :marks="{0: '0', 100: '100'}" :disabled="!isPowerOn" input-size="mini" @afterChange="onBrightChange"></a-slider>
            </a-col>
          </a-row>
          <a-row :gutter="40" class="card-content__item" v-if="isColorLamp">
            <a-col :xs="12" :sm="5" :md="5">
              <span>色度</span>
            </a-col>
            <a-col :span="16">
              <a-slider v-model="color" :min="0" :max="255" :disabled="!isPowerOn" :marks="{0: '0', 255: '255'}" input-size="mini" @afterChange="onColorChange"></a-slider>
            </a-col>
          </a-row>
        </div>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>

<script>
import Lamp from '@/components/IoT/Lamp'
import { LedLampEquip } from 'hardware-suit'
export default {
  props: {
    status: {
      type: String,
      default: ''
    },
    deviceType: {
      type: String,
      default: ''
    },
    deviceChildType: {
      type: String,
      default: ''
    },
    siderWidth: {
      type: Number,
      default: 200
    }
  },
  components: { Lamp },
  data () {
    return {
      power: false,
      bright: 0,
      color: 0,
      lampColor: '#fff',
      exception: '',
      isColorLamp: false,
      ledLampEquip: null,
      exceptionText: ''
    }
  },
  watch: {
    power (power) {
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
    const ledLampEquip = this.ledLampEquip = new LedLampEquip(this.status, this.deviceType, this.deviceChildType)
    this.isColorLamp = ledLampEquip.isBicolor()
    console.log('lamp ', this.isColorLamp)
    this.power = ledLampEquip.isPowerOn()
    this.bright = ledLampEquip.getBrightness()
    this.color = ledLampEquip.getColdColor()
    this.exceptionText = ledLampEquip.getLampExceptionStatus() || ''
  },
  methods: {
    onPowerChange (power) {
      this.bright = !power ? 0 : 100
      const status = this.ledLampEquip.setBrightness(this.bright).setColdColor(this.color).getBytes()
      this.$emit('change', status, { power: this.power, bright: this.bright, color: this.color })
    },
    onBrightChange (bright) {
      if (bright === 0) (this.power = false)
      const status = this.ledLampEquip.setBrightness(bright).setColdColor(this.color).getBytes()
      this.$emit('change', status, { power: this.power, bright: this.bright, color: this.color })
    },
    onColorChange (color) {
      const status = this.ledLampEquip.setColdColor(color).setBrightness(this.bright).getBytes()
      this.$emit('change', status, { power: this.power, bright: this.bright, color: this.color })
    },
  },
  destroyed () {
    this.power = false
    this.bright = 0
    this.color = 0
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
</style>
