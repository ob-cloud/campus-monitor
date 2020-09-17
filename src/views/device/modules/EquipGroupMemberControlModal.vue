<template>
  <a-modal :title="title" :width="1000" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <create-equip-group-member-block ref="memberBlock"></create-equip-group-member-block>
  </a-modal>
</template>

<script>
import CreateEquipGroupMemberBlock from './CreateEquipGroupMemberBlock'
export default {
  components: { CreateEquipGroupMemberBlock },
  data () {
    return {
      title: '编辑组员',
      visible: false,
      confirmLoading: false,
    }
  },
  methods: {
    edit (record) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.memberBlock.edit(record)
      })
    },
    // 确定
    handleOk () {
      this.$emit('ok')
      this.close()
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
