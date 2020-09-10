<template>
  <iot-switch v-model="powers" :serialId="serialId" :state="state"></iot-switch>
</template>

<script>
import ActionMixin from '@/utils/mixins/ActionMixin'
import IotSwitch from '@/components/IoT/Switch'
export default {
  props: {
    serialId: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    extra: {
      type: Object,
      default: () => {}
    }
  },
  mixins: [ ActionMixin ],
  components: { IotSwitch },
  data () {
    return {
      powers: [],
      powerStatus: [0, 0, 0]
    }
  },
  watch: {
    powers (val) {
      this.handlePower(val[0])
    }
  },
  methods: {
    handlePower (item) {
      this.powerStatus.fill(+item)
      const status = this.getSwitchButtonStatus(this.powerStatus)
      console.log('satus ', status)
      this.$emit('change', status)
    },
  },
  destroyed () {
    this.powers = []
    this.powerStatus = [0, 0, 0]
  },
}
</script>

<style lang="less" scoped>

</style>
