<template>
  <a-modal :title="title" :width="'90%'" :visible="visible" :confirmLoading="confirmLoading" @cancel="handleCancel" destroyOnClose>
    <div slot="footer"></div>
    <add-member-block ref="modal"></add-member-block>
  </a-modal>
</template>

<script>
import AddMemberBlock from './AddMemberBlock'
export default {
  components: { AddMemberBlock },
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
      if (!groupNo) return
      this.$nextTick(() => {
        groupNo && this.$refs.modal.init(groupNo)
      })
    },
    handleOk () {
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
