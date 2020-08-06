<template>
  <a-date-picker
    :disabled="disabled || readOnly"
    :placeholder="placeholder"
    @change="handleDateChange"
    :value="momVal"
    :showTime="showTime"
    :format="format"
    :getCalendarContainer="getCalendarContainer"
  />
</template>
<script>
  import moment from 'moment'
  export default {
    name: 'ProDate',
    props: {
      placeholder: {
        type: String,
        default: '',
        required: false
      },
      /* eslint-disable vue/require-default-prop */
      value: {
        type: String,
        required: false
      },
      format: {
        type: String,
        default: 'YYYY-MM-DD',
        required: false
      },
      readOnly: {
        type: Boolean,
        required: false,
        default: false
      },
      disabled: {
        type: Boolean,
        required: false,
        default: false
      },
      showTime: {
        type: Boolean,
        required: false,
        default: false
      },
      getCalendarContainer: {
        type: Function,
        default: () => document.body
      }
    },
    data() {
      let dateStr = this.value
      return {
        decorator: '',
        momVal: !dateStr ? null : moment(dateStr, this.format)
      }
    },
    watch: {
      value(val) {
        this.momVal = val ? moment(val, this.format) : null
      }
    },
    methods: {
      handleDateChange(mom, dateStr) {
        this.$emit('change', dateStr)
      }
    },
    //2.2新增 在组件内定义 指定父组件调用时候的传值属性和事件类型 这个牛逼
    model: {
      prop: 'value',
      event: 'change'
    }
  }
</script>
