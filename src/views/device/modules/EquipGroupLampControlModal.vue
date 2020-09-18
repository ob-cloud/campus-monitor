<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :height="drawerWidth"
    placement="bottom"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
    :destroyOnClose="true"
    :bodyStyle="{height: 'calc(100% - 60px)'}"
  >
    <bizz-lamp :siderWidth="150" :status="status" :deviceType="deviceType" :deviceChildType="deviceChildType" @change="handleLampChange"></bizz-lamp>
  </a-drawer>
</template>


<script>
import { execDeviceGroup } from '@/api/device'
import BizzLamp from '@/components/Bizz/BizzLamp'
export default {
  components: { BizzLamp },
  data () {
    return {
      drawerWidth: 500,
      title: "灯控",
      visible: false,
      model: {},
      status: '',
      deviceType: '',
      deviceChildType: '',
    }
  },
  methods: {
    edit (record) {
      this.model = Object.assign({}, record)
      this.visible = true
      this.title = `组控 - ${record.groupName}`
      this.status = record.groupState
      this.deviceType = record.groupType
      this.deviceChildType = record.groupChildType
    },
    close () {
      this.$emit('close')
      this.visible = false
    },
    handleCancel () {
      this.close()
    },
    handleLampChange (status, lampStatusInfo) {
      console.log('lamp ', lampStatusInfo)
      this.setLampState(status)
    },
    setLampState (status) {
      execDeviceGroup(this.model.groupId, status).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('成功')
        } else {
          this.$message.error('失败')
        }
      })
    }
  }
}
</script>
