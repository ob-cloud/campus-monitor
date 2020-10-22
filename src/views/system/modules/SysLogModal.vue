<template>
  <a-modal :title="title" :width="600" :visible="visible" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <div class="actionBar" style="text-align: center;">
      <a-range-picker
        v-model="pickerValue"
        format="YYYY-MM-DD"
        :placeholder="['开始日期', '结束日期']"
        @change="onChange"
      />
    </div>
  </a-modal>
</template>

<script>
  import { exportsLogs } from '@/api/system'
  export default {
    data () {
      return {
        title: '导出日志',
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        confirmLoading: false,
        pickerValue: null,
      }
    },
    created () {
    },
    methods: {
      onChange (val) {
        console.log(val)
      },
      edit () {
        this.visible = true
      },
      // 确定
      handleOk () {
        if(!this.pickerValue) return
        const start = this.pickerValue[0]
        const end = this.pickerValue[1]
        const fmt = 'YYYY-MM-DD'
        window.open(exportsLogs(start.format(fmt), end.format(fmt)))
      },
      // 关闭
      handleCancel () {
        this.close()
      },
      close () {
        this.$emit('close')
        this.visible = false
      }
    }
  }
</script>
