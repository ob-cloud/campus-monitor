<template>
  <a-modal :title="title" :width="'90%'" :visible="visible" :confirmLoading="confirmLoading" @cancel="handleCancel" destroyOnClose>
    <div slot="footer"></div>
    <add-member-block ref="modal"></add-member-block>
  </a-modal>
</template>

<script>
import AddMemberBlock from './AddMemberBlock'
import { Converter } from 'hardware-suit'
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
      let groupNo = panelAddr ? panelAddr.addr : ''
      groupNo = new Converter(groupNo, 16).toDecimal()
      if (!groupNo) return
      if (!record.group_id) return
      this.$nextTick(() => {
        this.$refs.modal.init({ groupAddr: groupNo, primaryId: record.group_id})
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
