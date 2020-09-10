<template>
  <iot-switch v-model="powers" :serialId="serialId" :state="state"></iot-switch>
</template>

<script>
import { editSwitchStatus } from '@/api/device'
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
      if (!this.serialId) return
      editSwitchStatus(this.serialId, status).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('设置成功')
        } else this.$message.error(res.message)
      }).finally(() => this.$emit('change', this.powers))
    },
  },
}
</script>

<style lang="less" scoped>

</style>
