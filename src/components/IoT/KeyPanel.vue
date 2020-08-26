<template>
  <div class="panel">
    <div class="panel-header">
      <slot name="header"></slot>
    </div>
    <div class="panel-content">
      <div class="key-container">
        <div class="key" :class="{'active': item === selectedKey}" v-for="(item, index) in keyNum" :key="index"
             @click="onClickKey(item)"
        >
          <span class="dot"></span>
          <span class="label">{{ item }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KeyPanel',
  props: {
    type: {
      type: String,
      default: '' // scene | mixup
    },
    keyNum: {
      type: Number,
      default: 6
    },
    labels: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      selectedKey: ''
    }
  },
  methods: {
    onClickKey (selectedKey) {
      this.selectedKey = selectedKey
      this.$emit('on-selected', selectedKey)
    }
  },
}
</script>

<style lang="less" scoped>
.panel-content{
  padding: 10px;
  text-align: center;

  .key-container{
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #000;
    border-radius: 6px;
  }
}

.key{
  display: inline-block;
  position: relative;
  cursor: pointer;
  padding: 10px 0;
  & .dot{
    width: 20px;
    height: 20px;
    border: 1px solid #000;
    border-radius: 100%;
    margin: 12px 16px;
    display: inline-block;
    transition: all .3s;
  }
  & .label{
    color: #A2AAB5;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
  }
  &.active,
  &:hover{
    & .dot {
      border-color: #0185ED;
    }
  }
}
</style>
