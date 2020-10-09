<template>
  <a-modal :title="title" :width="'60%'" :visible="visible" :confirmLoading="confirmLoading" @cancel="handleCancel" @ok="handleOk" destroyOnClose>
    <add-group-block ref="createModal"></add-group-block>
  </a-modal>
</template>

<script>
import AddGroupBlock from './AddGroupBlock'
export default {
  components: { AddGroupBlock },
  data () {
    return {
      title: '编辑',
      visible: false,
      model: {},
      confirmLoading: false
    }
  },
  methods: {
    add () {
      this.edit({})
    },
    edit (record) {
      console.log(record)
      this.visible = true
      this.model = {
        group_id: record.group_id,
        group_name: record.group_name,
        addr: record.panel_addr && record.panel_addr.length ? record.panel_addr[0].addr : ''
      }
      this.$nextTick(() => {
        this.$refs.createModal.setFieldsValue(this.model)
      })
    },
    handleOk () {
      this.confirmLoading = true
      this.$refs.createModal.handleOk().finally(() => {
        this.$emit('ok')
        this.confirmLoading = false
        this.handleCancel()
      })
    },
    // 关闭
    handleCancel () {
      this.close()
    },
    close () {
      this.$emit('close')
      this.visible = false
      this.reset()
    },
    reset () {
      this.confirmLoading = false
      this.$refs.createModal.reset()
    },
  },
}
</script>
