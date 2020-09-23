<template>
  <div class="panel">
    <div class="panel-header">
      <slot name="header"></slot>
    </div>
    <div class="panel-content">
      <!-- <a-icon type="bulb" :style="[iconSize, colorStyle]" /> -->
      <i class="icon obicon obicon-droplight" :style="[iconSize, colorStyle]"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Lamp',
  props: {
    size: {
      type: String,
      default: 'large'
    },
    color: {
      type: String,
      default: '#fff'
    }
  },
  data () {
    return {
    }
  },
  computed: {
    iconSize () {
      const map = {
        'large': 100,
        'medium': 60,
        'small': 30,
        'mini': 20
      }
      return {
        'fontSize': (map[this.size] || 20) + 'px'
      }
    },
    colorStyle () {
      return {
        'color': this.color
      }
    }
  },
  methods: {

  },
}
</script>

<style lang="less">
.panel-content{
  text-align: center;

  > i{
    display: block;
    // padding: 40px;
    padding-top: 40px;
    color: #fff;
    transition: all .3s;
  }
}
</style>
