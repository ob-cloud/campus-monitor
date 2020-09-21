<template>
  <a-modal :title="title" :width="'90%'" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" destroyOnClose cancelText="关闭">
    <a-card :bordered="false">
      <div slot="title">
        <a-steps :current="current">
          <a-step key="1" title="添加分组" />
          <a-step key="2" title="添加组员" />
        </a-steps>
      </div>
      <div class="steps-content">
        <add-group-block v-show="current === 0" ref="createModal"></add-group-block>
        <add-member-block v-show="current === 1" ref="createMemberModal"></add-member-block>
      </div>
    </a-card>
    <!-- <group-member-modal ref="memberModal" @ok="modalOk"></group-member-modal> -->
  </a-modal>
</template>

<script>
// import { setPanelGroup } from '@/api/device'
// import GroupMemberModal from './GroupMemberModal'
import AddGroupBlock from './AddGroupBlock'
import AddMemberBlock from './AddMemberBlock'
export default {
  components: { AddGroupBlock, AddMemberBlock },
  data () {
    return {
      title: '操作',
      visible: false,
      model: {},
      current: 0,
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
    handleAddGroupOk () {
      this.$refs.createModal.handleOk().then(({status, oboxSerialId, groupId}) => {
        if (status) {
          this.current++
          console.log('===== ', oboxSerialId, groupId)
          this.$refs.createMemberModal.init(oboxSerialId, groupId)
        }
      })
    },
    // 确定
    handleOk () {
      if (this.current === 0) { // 添加分组
        this.handleAddGroupOk()
      } else { // 添加组员
        this.handleAddMemberOk()
      }
    },
    handleOk1 () {
      // const that = this
      // // 触发表单验证
      // this.form.validateFields((err, values) => {
      //   if (!err) {
      //     that.confirmLoading = true
      //     const formData = {}
      //     if (this.model.group_id) {
      //       formData.group_id = this.model.group_id
      //     }
      //     formData.panel_addr = {list: [{addr: values.addr, groupAddr: values.group_addr}]}
      //     formData.group_name = values.group_name
      //     formData.group_member = values.group_member
      //     console.log(formData)
      //     let obj = setPanelGroup(formData)
      //     obj.then((res) => {
      //       if (that.$isAjaxSuccess(res.code)) {
      //         that.$message.success(res.message)
      //         that.$emit('ok')
      //       } else {
      //         that.$message.warning(res.message)
      //       }
      //     }).finally(() => {
      //       that.confirmLoading = false
      //       that.close()
      //     })
      //   }
      // })
    },
    // 关闭
    handleCancel () {
      this.close(this.current === 1)
    },
    close (refresh) {
      this.$emit('close', refresh)
      this.visible = false
      this.reset()
    },
    reset () {
      this.current = 0
      this.$refs.createModal.reset()
      this.$refs.createMemberModal.reset()
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
