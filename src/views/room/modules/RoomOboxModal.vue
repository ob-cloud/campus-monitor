<template>
  <a-modal :title="title" :width="1000" :visible="visible" @ok="handleOk" @cancel="handleCancel" cancelText="关闭" destroyOnClose>
    <a-card :bodyStyle="{padding: '12px 14px 20px'}">
      <div slot="title">
        <a-tag class="tag" :color="item.obox_status ? 'green' : ''" v-for="(item, index) in oboxList" :key="index" :title="item.obox_status ? '在线' : '离线'">
          <a-popconfirm title="解绑OBOX?" @confirm="() => handleUndbind(item)">
            <a-icon v-isPermitted="'room:classroom:device:unbind'" type="close" class="close" title="解绑" />
          </a-popconfirm>
          {{ item.obox_name }}
        </a-tag>
      </div>
      <a-button slot="extra" v-isPermitted="'room:classroom:device:bind'" size="small" type="primary" title="绑定" @click="handleBind"><i class="obicon obicon-bangding" style="margin-right: 5px;"></i>绑定OBOX</a-button>
      <div class="content">
        <a-row>
          <a-col :span="12">
            <a-card title="设备" :bordered="false" :bodyStyle="{padding: '5px'}">
              <a-table
                bordered
                size="small"
                rowKey="deviceSerialId"
                :columns="devColumns"
                :dataSource="deviceList"
                :loading="loading"
                :pagination="false"
                :scroll="{ y: 250 }"
              ></a-table>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="场景" :bordered="false" :bodyStyle="{padding: '5px'}">
              <a-table
                bordered
                size="small"
                rowKey="sceneNumber"
                :columns="sceneColumns"
                :dataSource="sceneList"
                :loading="sceneLoading"
                :pagination="false"
                :scroll="{ y: 250 }"
              ></a-table>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-card>

    <bind-obox-modal ref="bindModal" @ok="bindModalOk"></bind-obox-modal>
  </a-modal>
</template>

<script>
import { ProListMixin } from '@/utils/mixins/ProListMixin'
import { getRoomObox, unbindObox2Room } from '@/api/device'
import { getRoomDeviceList } from '@/api/room'
import { getSmartSceneList } from '@/api/scene'

import { Descriptor } from 'hardware-suit'
import BindOboxModal from './BindOboxModal'
export default {
  mixins: [ProListMixin],
  components: { BindOboxModal },
  data() {
    return {
      title: 'OBOX操作',
      visible: false,
      loading: false,
      sceneLoading: false,
      oboxList: [],
      sceneColumns: [
         {
          title: '场景号',
          align: 'center',
          dataIndex: 'sceneNumber',
        },
        {
          title: '场景名称',
          align: 'center',
          dataIndex: 'sceneName',
        },
        {
          title: '教室',
          align: 'center',
          dataIndex: 'roomName',
        },
        {
          title: '场景状态',
          align: 'center',
          dataIndex: 'sceneStatus',
          customRender (status) {
            return status ? '启用' : '禁用'
          }
        },
      ],
      sceneList: [],
      roomId: '',
      deviceList: [],
      devColumns: [
        {
          title: '序列号',
          align: 'center',
          dataIndex: 'deviceSerialId'
        },
        {
          title: '设备名称',
          align: 'center',
          dataIndex: 'deviceName'
        },
        {
          title: '设备状态',
          align: 'center',
          dataIndex: 'deviceState',
          customRender (status, row) {
            return Descriptor.getStatusDescriptor(status, row.deviceType, row.deviceChildType)
          }
        },
        {
          title: '设备类型',
          align: 'center',
          dataIndex: 'deviceType',
          customRender (t) {
            return Descriptor.getTypeDescriptor(t)
          }
        }
      ]
    }
  },
  watch: {
    oboxList (list) {
      if (!list || !list.length) {
        this.deviceList = []
        this.sceneList = []
        return
      }
      this.getDeviceList()
      this.getSceneList()
    }
  },
  methods: {
    loadData (id) {
      this.getOboxList(id)
    },
    getOboxList (roomId) {
      getRoomObox(roomId).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.oboxList = res.result.records
        }
      })
    },
    getDeviceList () {
      this.loading = true
      getRoomDeviceList({ roomId: this.roomId }).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.deviceList = res.result.records
        }
      }).finally(() => this.loading = false)
    },
    getSceneList () {
      const params = {
        roomId: this.roomId,
        pageNo: 1,
        pageSize: 1000
      }
      this.sceneLoading = true
      getSmartSceneList(params).then((res) => {
        if (this.$isAjaxSuccess(res.code)) {
          this.sceneList = res.result.records
        }
      }).finally(() => this.sceneLoading = false)
    },
    show (record) {
      this.visible = true
      console.log('---- ', record)
      this.roomId = record.id
      this.loadData(record.id)
    },
    handleBind () {
      this.$refs.bindModal.show({ roomId: this.roomId })
    },
    bindModalOk (selection) {
      console.log(selection)
      this.oboxList = selection
    },
    handleUndbind (obox) {
      console.log(obox)
      unbindObox2Room(this.roomId, obox.oboxId, obox.obox_serial_id).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.getOboxList(this.roomId)
          this.$message.success('解绑成功')
        }else this.$message.error(res.message)
      })
    },
    handleOk () {
      // if (!this.selectionRows.length) return this.$message.warning('请选择设备')
      this.$emit('ok')
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
.tag{
  position: relative;
  padding: 28px 50px;
}
.close{
  float: right;
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
}
</style>
