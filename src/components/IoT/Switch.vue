<template>
  <div class="switch">
    <a-checkbox-group v-model="powers">
      <a-checkbox v-for="(item, index) in 1" :value="index+1" :key="index" @change="handlePower">
        <i class="obicon obicon-power"></i>
      </a-checkbox>
    </a-checkbox-group>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    serialId: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      powers: []
    }
  },
  mounted () {
    if (this.isLightActive(this.state)) {
      this.powers = [1]
    }
  },
  watch: {
    value (val) {
      this.powers = val
    }
  },
  methods: {
    isLightActive (status) {
      if (!status) return false
      const state = status.slice(0, 2)
      return state !== '00'
    },
    handlePower (e) {
      const item = e.target.checked
      this.$emit('input', [+item])
    }
  },
  beforeDestroy () {
    this.powers = []
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
.switch {
  .ant-checkbox-wrapper span.ant-checkbox {
    display: none;
  }
  .ant-checkbox-wrapper span{
    display: inline-block;
    border: 1px solid;
    border-radius: 2px;
    transition: all .3s;

    > i{
      font-size: 30px;
    }
  }
 .ant-checkbox-wrapper-checked span{
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
