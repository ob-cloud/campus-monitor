<template>
  <a-modal :title="title" :width="600" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="组名">
          <a-input placeholder="输入组名" v-decorator="[ 'group_name', validatorRules.name]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="组员">
          <a-input placeholder="选择组员" v-decorator="[ 'group_member', validatorRules.member]" @click.native="handleMember" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="短地址">
          <a-input placeholder="输入短地址(2个字节)" v-decorator="[ 'addr', validatorRules.addr]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="面板地址">
          <a-input placeholder="输入面板地址(1个字节)" v-decorator="[ 'group_addr', validatorRules.group_addr]" />
        </a-form-item>
      </a-form>
    </a-spin>

    <group-member-modal ref="memberModal" @ok="modalOk"></group-member-modal>
  </a-modal>
</template>

<script>
import { setPanelGroup } from '@/api/device'
import GroupMemberModal from './GroupMemberModal'
export default {
  components: { GroupMemberModal },
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
        name: { rules: [{ required: true, message: '组名不能为空!' }] },
        member: { rules: [{ required: true, message: '成员不能为空!' }] },
        addr: { rules: [{ required: true, message: '短地址不能为空!' }] },
        group_addr: { rules: [{ required: true, message: '组地址不能为空!' }] },
      }
    }
  },
  methods: {
    add () {
      this.edit({})
    },
    edit (record) {
      this.form.resetFields()
      this.model = {
        group_id: record.group_id,
        group_member: record.group_member,
        group_name: record.group_name,
        addr: record.panel_addr && record.panel_addr.length ? record.panel_addr[0].addr : '',
        group_addr: record.panel_addr && record.panel_addr.length ? record.panel_addr[0].group_addr : ''
      }
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(this.model)
      })
    },
    // 确定
    handleOk () {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          const formData = {}
          if (this.model.group_id) {
            formData.group_id = this.model.group_id
          }
          formData.panel_addr = {list: [{addr: values.addr, groupAddr: values.group_addr}]}
          formData.group_name = values.group_name
          formData.group_member = values.group_member
          console.log(formData)
          let obj = setPanelGroup(formData)
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
    },
    handleMember () {
      this.$refs.memberModal.edit({members: this.form.getFieldValue('group_member')})
    },
    modalOk (member) {
      this.form.setFieldsValue({group_member: member})
    }
  },
}
</script>

<style lang="less" scoped>

</style>
