<template>
  <a-modal :title="title" :width="600" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="名称">
          <a-input placeholder="请输入名称" v-decorator="[ 'name', validatorRules.name]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { editOboxName } from '@/api/device'
export default {
  data () {
    return {
      title: '操作',
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
      form: this.$form.createForm(this),
      validatorRules: {
        name: { rules: [{ required: true, message: '请输入名称!' }] },
      }
    }
  },
  methods: {
    add () {
      this.edit({})
    },
    edit (record) {
      this.form.resetFields()
      this.model = Object.assign({}, {name: record.obox_name, serialId: record.obox_serial_id})
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.model, 'name'))
      })
    },
    // 确定
    handleOk () {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          let formData = Object.assign(this.model, values)
          let obj = editOboxName(formData.serialId, formData.name)
          obj.then((res) => {
            if (that.$isAjaxSuccess(res.code)) {
              that.$message.success(res.message)
              that.$emit('ok')
            } else {
              that.$message.warning(res.message)
            }
          }).finally(() => {
            that.confirmLoading = false
            that.close()
          })
        }
      })
    },
    // 关闭
    handleCancel () {
      this.close()
    },
    close () {
      this.$emit('close')
      this.visible = false
    }
  },
}
</script>

<style lang="less" scoped>

</style>
