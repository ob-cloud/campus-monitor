<template>
  <a-modal :title="title" :width="'80%'" :visible="visible" :confirmLoading="confirmLoading" @cancel="handleCancel" destroyOnClose>
    <div slot="footer"></div>
    <add-device-block ref="modal"></add-device-block>
  </a-modal>
</template>

<script>
import AddDeviceBlock from './AddDeviceBlock'
export default {
  components: { AddDeviceBlock },
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
      const panelAddr = record.panel_addr[0]
      const groupNo = panelAddr ? panelAddr.addr : ''
      if (!record.group_id) return
      this.$nextTick(() => {
        this.$refs.modal.edit({ groupId: groupNo, gropuAddr: groupNo, primaryId: record.group_id})
      })
    },
    handleOk () {
      this.handleCancel()
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
      this.$refs.modal.reset()
    },
  },
}
</script>
