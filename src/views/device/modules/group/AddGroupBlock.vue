<template>
  <a-spin :spinning="confirmLoading">
    <a-form :form="form">
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="编号">
        <a-input-number v-decorator="[ 'addr', validatorRules.no]" :min="1" :max="65535" :disabled="!!groupId" />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="名称">
        <a-input placeholder="输入组名" v-decorator="[ 'group_name', validatorRules.name]" />
      </a-form-item>
    </a-form>
  </a-spin>
</template>

<script>
import { setPanelGroup, editPanelGroup } from '@/api/device'
import { Converter, fillLength } from 'hardware-suit'
export default {
  data () {
    return {
      confirmLoading: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 }
      },
      wrapperCol2: {
        xs: { span: 24 },
        sm: { span: 18 }
      },
      form: this.$form.createForm(this),
      validatorRules: {
        no: { initialValue: 1, rules: [{ required: true, message: '请输入数字(1~65535)!' }] },
        name: { rules: [{ required: true, message: '组名不能为空!' }] },
      },
      groupId: '',
    }
  },
  methods: {
    init () {
    },
    edit (record) {
      // this.init()
      this.setFieldsValue(record)
    },
    handleOk () {
      return new Promise(resolve => {
        const that = this
        this.form.validateFields((err, values) => {
          if (!err) {
            console.log('ok ', values)
            that.confirmLoading = true
            let formData = {}
            if (that.groupId) {
              formData.group_id = that.groupId
            }
            // 转16进制
            let addr = new Converter(values.addr, 10).toHex()
            addr = fillLength(addr, 4)
            formData.panel_addr = {list: [{addr: addr, groupAddr: '00'}]}
            formData.group_name = values.group_name
            // formData.group_member = that.targetKeys.join(',')
            formData.group_member = ''
            formData.type = '00'
            console.log(formData)
            const groupNoHex = addr // 教室号 hex
            // const groupId = values.addr // 教室号 十进制
            let obj = formData.group_id ? editPanelGroup(formData.group_id, formData.group_name) : setPanelGroup(formData)
            obj.then(res => {
              if (that.$isAjaxSuccess(res.code)) {
                const Action = formData.group_id ? {} : { primaryId: res.result.group_id }
                resolve({status: 1, groupNoHex, groupAddr: values.addr, ...Action })
              } else {
                that.$message.warning(res.message)
                resolve({ status: 0 })
              }
            }).catch(e => {
              this.$message.error(e.message || '服务异常')
              console.log('err ', e)
              resolve({ status: 0 })
            }).finally(() => that.confirmLoading = false)
          } else resolve({ status: 0 })
        })
      })
    },
    reset () {
      this.form.resetFields()
      this.groupId = ''
    },
    setFieldsValue (model) {
      this.groupId = model.group_id
      model.addr = model.addr ? +(new Converter(model.addr, 16).toDecimal()) : 1
      this.form.setFieldsValue(model)
    },
  },
}
</script>

