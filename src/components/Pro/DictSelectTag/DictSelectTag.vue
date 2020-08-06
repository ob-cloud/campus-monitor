<template>
  <a-radio-group v-if="tagType=='radio'" @change="handleInput" :value="value" :disabled="disabled">
    <a-radio v-for="(item, key) in dictOptions" :key="key" :value="item.value">{{ item.text }}</a-radio>
  </a-radio-group>

  <a-select v-else-if="tagType=='select'" :placeholder="placeholder" :disabled="disabled" :value="value" @change="handleInput">
    <a-select-option value="">请选择</a-select-option>
    <a-select-option v-for="(item, key) in dictOptions" :key="key" :value="item.value">
      <span style="display: inline-block; width: 100%" :title=" item.text || item.label ">
        {{ item.text || item.label }}
      </span>
    </a-select-option>
  </a-select>
</template>

<script>
import { ajaxGetDictItems } from '@/api/system'

export default {
  name: 'DictSelectTag',
  props: {
    dictCode: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    triggerChange: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    /* eslint-disable vue/require-default-prop*/
    value: {
      type: String
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dictOptions: [],
      tagType: ''
    }
  },
  created() {
    this.tagType = !this.type || this.type === 'list' ? 'select' : this.type
    //获取字典数据
    this.initDictData()
  },
  methods: {
    initDictData () {
      //根据字典Code, 初始化字典数组
      ajaxGetDictItems(this.dictCode, null).then((res) => {
        if (this.$isAjaxSuccess(res.code)) {
          this.dictOptions = res.result
        }
      })
    },
    handleInput (e) {
      const val = this.tagType === 'radio' ? e.target.value : e
      this.$emit(this.triggerChange ? 'change' : 'input', val)
    },
    setCurrentDictOptions (dictOptions) {
      this.dictOptions = dictOptions
    },
    getCurrentDictOptions () {
      return this.dictOptions
    }
  }
}
</script>
