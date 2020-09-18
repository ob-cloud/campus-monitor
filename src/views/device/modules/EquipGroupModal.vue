<template>
  <a-modal :title="title" :width="1000" :maskClosable="false" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" destroyOnClose cancelText="取消">
    <a-card :bordered="false">
      <div slot="title">
        <a-steps :current="current">
          <a-step key="1" title="添加分组" />
          <a-step key="2" title="添加组员" />
        </a-steps>
      </div>
      <div class="steps-content">
        <create-equip-group-block v-show="current === 0" ref="createModal"></create-equip-group-block>
        <create-equip-group-member-block v-show="current === 1" ref="createMemberModal"></create-equip-group-member-block>
      </div>
    </a-card>
  </a-modal>
</template>

<script>
// import { setPanelGroup } from '@/api/device'
import CreateEquipGroupBlock from './CreateEquipGroupBlock'
import CreateEquipGroupMemberBlock from './CreateEquipGroupMemberBlock'
export default {
  components: { CreateEquipGroupBlock, CreateEquipGroupMemberBlock },
  data () {
    return {
      title: '操作',
      visible: false,
      current: 0,
      model: {},
      confirmLoading: false,
    }
  },
  methods: {
    add () {
      this.edit({})
    },
    edit () {
      this.visible = true
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
    handleAddMemberOk () {
      this.handleCancel()
    },
    // 确定
    handleOk () {
      if (this.current === 0) { // 添加分组
        this.handleAddGroupOk()
      } else { // 添加组员
        this.handleAddMemberOk()
      }
    },
    reset () {
      this.current = 0
      this.$refs.createModal.reset()
      this.$refs.createMemberModal.reset()
    },
    // 关闭
    handleCancel () {

      this.close(this.current === 1)
    },
    close (refresh) {
      this.$emit('close', refresh)
      this.visible = false
      this.reset()
    }
  },
}
</script>

<style lang="less" scoped>

</style>
