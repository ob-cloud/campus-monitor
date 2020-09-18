<template>
  <a-spin :spinning="confirmLoading">
    <a-form :form="form">
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="组名">
        <a-input placeholder="输入组名" v-decorator="[ 'group_name', validatorRules.name]" />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="网关">
        <a-select placeholder="请选择网关" allowClear v-decorator="[ 'obox_serial_id', validatorRules.oboxSerialId]">
          <a-select-option v-for="item in oboxList" :key="item.obox_serial_id" :value="item.obox_serial_id">
            {{ item.obox_name }}（{{ item.obox_status === 1 ? '在线' : '离线' }}）
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-spin>
</template>

<script>
import { getAllOboxList, addDeviceGroup } from '@/api/device'
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
        sm: { span: 16 }
      },
      oboxList: [],
      form: this.$form.createForm(this),
      validatorRules: {
        name: { rules: [{ required: true, message: '组名不能为空!' }] },
        oboxSerialId: { rules: [{ required: true, message: '网关不能为空!' }] }
      }
    }
  },
  mounted () {
    this.getOboxList()
  },
  methods: {
    getOboxList () {
      getAllOboxList().then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.oboxList = res.result
        }
      })
    },
    handleOk () {
      return new Promise(resolve => {
        const that = this
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            console.log('ok ', values)
            const groupName = values.group_name
            const oboxSerialId = values.obox_serial_id
            addDeviceGroup(oboxSerialId, groupName).then(res => {
              if (that.$isAjaxSuccess(res.code)) {
                const groupId = res.result.groups.group_id
                that.$message.success(res.message)
                that.confirmLoading = false
                resolve({status: 1, oboxSerialId, groupId})
              } else {
                that.$message.warning(res.message)
              }
            }).finally(() => that.confirmLoading = false)
          }
        })
      })
    },
    reset () {
      this.form.resetFields()
      this.oboxList = []
    }
  },
}
</script>

<style lang="less" scoped>

</style>
