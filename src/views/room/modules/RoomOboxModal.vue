<template>
  <a-modal :title="title" :width="900" :visible="visible" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <a-card title="已绑定obox" :bordered="false">
      <a-button slot="extra" type="primary" title="绑定" @click="handleBind"><i class="obicon obicon-bangding"></i>绑定</a-button>
      <a-tag closable v-for="(item, index) in oboxList" :key="index" @close="handleUndbind(item)">{{ item.name }}</a-tag>
    </a-card>
    <a-card title="obox设备">
      <div class="devbox" v-for="(item, index) in deviceList" :key="index">
        {{ item.name }}
      </div>
    </a-card>
    <a-card title="场景">
      <div class="devbox" v-for="(item, index) in sceneList" :key="index">
        {{ item.name }}
      </div>
    </a-card>
    <bind-obox-modal ref="bindModal" @ok="bindModalOk"></bind-obox-modal>
  </a-modal>
</template>

<script>
import { ProListMixin } from '@/utils/mixins/ProListMixin'
import { getOboxDeviceList } from '@/api/device'
// import { Descriptor } from 'hardware-suit'
import BindOboxModal from './BindOboxModal'
export default {
  mixins: [ProListMixin],
  components: { BindOboxModal },
  data() {
    return {
      title: '绑定设备',
      visible: false,
      oboxList: [],
      deviceList: [],
      sceneList: []
    }
  },
  watch: {
    oboxList (list) {
      if (!list || !list.length) return
      this.getDeviceList(list[0].obox_serial_id)
      this.getSceneList(list[0].obox_serial_id)
    }
  },
  methods: {
    getDeviceList (oboxSerialId) {
      const params = {
        obox_serial_id: oboxSerialId,
        pageNo: 1,
        pageSize: 1000
      }
      getOboxDeviceList(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.deviceList = res.result.records
        }
      })
    },
    getSceneList (oboxSerialId) {
      console.log(oboxSerialId)
    },
    show () {
      this.visible = true
      this.loadData()
    },
    handleBind () {
      this.$refs.bindModal.show({})
    },
    bindModalOk (selection) {
      console.log(selection)
      this.oboxList = selection
    },
    handleUndbind (obox) {
      console.log(obox)
      this.$confirm({
        title: '确认操作',
        content: '解绑oboox?',
        onOk: function () {
          console.log('unbindobox')
        }
      })
    },
    handleOk () {
      if (!this.selectionRows.length) return this.$message.warning('请选择设备')
      this.$emit('ok', this.selectionRows[0])
      this.handleCancel()
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
