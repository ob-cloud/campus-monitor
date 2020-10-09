<template>
  <a-modal :title="title" :width="'90%'" :visible="visible" :confirmLoading="confirmLoading" @cancel="handleAddMemberOk" destroyOnClose>
    <template slot="footer">
      <a-button v-if="cancelText" key="back" @click="handleCancel">{{ cancelText }}</a-button>
      <a-button key="submit" type="primary" :loading="confirmLoading" @click="handleOk">{{ confirmText }}</a-button>
    </template>
    <a-card :bordered="false" style="width: 90%; margin:0 auto;">
      <div slot="title">
        <a-steps :current="current">
          <a-step key="1" title="" />
          <a-step key="2" title="" />
          <a-step key="3" title="" />
        </a-steps>
      </div>
      <div class="steps-content">
        <add-group-block v-show="current === 0" ref="createModal"></add-group-block>
        <add-device-block v-show="current === 1" ref="createDeviceModal"></add-device-block>
        <add-member-block v-show="current === 2" ref="createMemberModal"></add-member-block>
      </div>
    </a-card>
  </a-modal>
</template>

<script>
import AddGroupBlock from './AddGroupBlock'
import AddDeviceBlock from './AddDeviceBlock'
import AddMemberBlock from './AddMemberBlock'
export default {
  components: { AddGroupBlock, AddMemberBlock, AddDeviceBlock },
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
      },
      cancelText: null,
      confirmText: '下一步'
    }
  },
  methods: {
    add () {
      this.edit({})
    },
    edit (record) {
      console.log(record)
      this.form.resetFields()
      this.visible = true
      this.model = {
        group_id: record.group_id,
        group_name: record.group_name,
        addr: record.panel_addr && record.panel_addr.length ? record.panel_addr[0].addr : ''
      }
      this.$nextTick(() => {
        this.$refs.createModal.init()
        this.$refs.createModal.setFieldsValue(this.model)
        record.group_id && this.$refs.createModal.setEditDeviceList(this.model.group_id)
      })
    },
    handleAddGroupOk () {
      this.confirmLoading = true
      this.$refs.createModal.handleOk().then(({status, groupNoHex, groupAddr, primaryId}) => {
        if (status) {
          this.confirmLoading = false
          this.current++
          this.cancelText = ''
          this.confirmText = '下一步'
          console.log('===== ', groupNoHex, groupAddr)
          this.$refs.createDeviceModal.init({ groupAddr, groupNoHex, primaryId })
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleDeviceOk () {
      this.$refs.createDeviceModal.handleOk().then(({ status, groupAddr, primaryId }) => {
        if (status) {
          this.current++
          this.confirmText = '完成'
          this.$refs.createMemberModal.init({ groupAddr, primaryId })
        }
      })
    },
    handleAddMemberOk () {
      const that = this
      this.$confirm({
        content: '确认退出编辑操作吗？',
        onOk() {
          that.$emit('ok')
          that.close()
        },
        cancelText: '取消',
        onCancel() {},
      })
    },
    // 确定
    handleOk () {
      if (this.current === 0) { // 添加分组
        this.handleAddGroupOk()
      } else if (this.current === 1) { // 添加设备
        this.handleDeviceOk()
      } else {
        this.handleAddMemberOk()
      }
    },
    // 关闭
    handleCancel () {
      this.reset()
    },
    close () {
      this.$emit('close', this.current === 1)
      this.visible = false
      this.reset()
    },
    reset () {
      this.current = 0
      this.cancelText = null
      this.confirmLoading = false
      this.confirmText = '下一步'
      this.$refs.createModal.reset()
      this.$refs.createMemberModal.reset()
    },
  },
}
</script>
