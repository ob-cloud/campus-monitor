<template>
  <div :class="clazz">
    <a-checkbox-group v-model="powers">
      <a-checkbox-button v-for="(item, index) in 1" :label="index+1" :key="index" @change="handleSelected">
        <i class="obicon obicon-switch-btn"></i>
      </a-checkbox-button>
    </a-checkbox-group>
  </div>
</template>

<script>
// import * as panelHandler from '@/oblink/panelHandler'
// import DeviceAPI from '@/api/device'
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
    useDefaultStyle: {
      type: Boolean,
      default: true
    },
    styles: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      powers: [],
      powerStatus: [0, 0, 0],
    }
  },
  computed: {
    clazz () {
      return this.useDefaultStyle ? 'ura-switcher list' : this.styles ? this.styles : ''
    }
  },
  mounted () {
    if (this.isLightActive(this.state)) {
      this.powers = [1]
    }
  },
  methods: {
    isLightActive (status) {
      if (!status) return false
      const state = status.slice(0, 2)
      return state !== '00'
    },
    changeStatus (power) {
      this.powerStatus.fill(power)
    },
    handleSelected (item) {
      this.changeStatus(+item)
      // const status = panelHandler.getSwitchButtonStatus(this.powerStatus)
      // if (!this.serialId) return
      // DeviceAPI.setSwitchStatus(this.serialId, status).then(res => {
      //   if (res.message.includes('success')) {
      //     this.$message({
      //       type: 'success',
      //       message: this.$t('smart.obox.message', {MESSAGE: 'setSuccess'})
      //     })
      //     this.$emit('switcher-change', this.serialId, status)
      //   } else {
      //     this.$message({
      //       type: 'error',
      //       message: this.$t('smart.obox.message', {MESSAGE: 'setFail'})
      //     })
      //     // reset powers when fail
      //     this.powers = [+!item]
      //   }
      // }).catch(() => {
      //   this.$message({
      //     type: 'error',
      //     message: this.$t('message.exception')
      //   })
      // })
    }
  },
  beforeDestroy () {
    this.powers = []
    this.powerStatus = [0, 0, 0]
  },
  destroyed () {

  },
}
</script>

<style lang="less" scoped>
.list{
  text-align: center;
  padding: 80px 10px;
  border: 1px solid #eee;
  border-radius: 6px;
  // width: 68%;
  width: 500px;
  margin: 30px auto;
  box-shadow: 1px 1px 1px 1px #f5f5f5;
  background-color: #f7f7f7;
}

</style>
<style lang="less">
.ura-switcher {
  .el-checkbox-button{
    // width: 30%;
    margin: 0 50px;
  }
  .el-checkbox-button .el-checkbox-button__inner{
    padding: 0px;
    border: 1px solid #eee!important;
    color: #c1c1c1;
    border-radius: 4px!important;
    box-shadow: none!important;
    // box-shadow: 0px 4px 1px 0px #c1c1c1 !important;
    // border: 1px solid #DCDFE6;
    // border-radius: 4px!important;
    transition: all .3s;
    > i{
      font-size: 50px;
    }
  }
  .el-checkbox-button.is-checked .el-checkbox-button__inner{
    // border-color: #409EFF;
    border-color: transparent;
    background-color: #fff;
    // #12eaf7
    color: #d8d815;
    // box-shadow: 0px -4px 1px 0px #d8d815 !important;
    box-shadow: 0px -4px 7px 2px #d8d815 !important;
  }
}
</style>
