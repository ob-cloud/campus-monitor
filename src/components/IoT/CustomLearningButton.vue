<template>
  <div class="custom-panel" :style="wrapperStyle" :val="value_">
    <div class="custom-key">
      <a-radio-group v-model="val" size="small">
        <a-radio-button :value="item" border v-for="(item, index) in keyList" :key="index">{{ item.name && `${item.name} - ` }}{{ item.key }}</a-radio-button>
      </a-radio-group>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    height: {
      type: Number,
      default: 424
    },
    keyList: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      val: null
    }
  },
  computed: {
    wrapperStyle () {
      return {
        height: `${this.height}px`,
        'overflow-y': 'auto'
      }
    },
    value_ () {
      const val = this.val
      this.$emit('input', val)
      return val
    }
  },
  watch: {
    // val (v) {
    //   console.log('333333 ', v)
    // },
    value (val) {
      this.val = val
    }
  },
}
</script>

<style lang="less" scoped>
.custom-panel{
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
</style>
<style lang="less">
.custom-panel .custom-key{
  margin-top: 10px;

  .ant-radio-button-wrapper{
    margin: 10px;
  }
  .ant-radio-button-wrapper:first-child,
  .ant-radio-button-wrapper:last-child{
    border-radius: 0;
  }
}
</style>
