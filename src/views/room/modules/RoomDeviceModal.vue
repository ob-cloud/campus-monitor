<template>
  <a-modal :title="title" :width="900" :visible="visible" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <a-card :bordered="false">
      <div class="table-operator" style="border-top: 5px">
        <a-button v-isPermitted="'room:classroom:device:bind'" @click="handleBind" type="primary"><i class="obicon obicon-bangding"></i>绑定</a-button>
      </div>
      <a-table
        ref="table"
        bordered
        size="middle"
        rowKey="deviceSerialId"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <span slot="action" slot-scope="text, record">
          <a-popconfirm title="确定解绑吗?" @confirm="() => handleUnbind(record)">
            <a v-isPermitted="'room:classroom:device:unbind'" title="解绑"><i class="obicon obicon-unbind"></i></a>
          </a-popconfirm>
        </span>
      </a-table>

      <bind-device-modal ref="bindModal" @ok="bindModalOk"></bind-device-modal>
    </a-card>
  </a-modal>
</template>

<script>
import { ProListMixin } from '@/utils/mixins/ProListMixin'
import { getRoomDeviceList, bindRoomDevice, unbindRoomDevice } from '@/api/room'
import { Descriptor } from 'hardware-suit'
import BindDeviceModal from './BindDeviceModal'
export default {
  mixins: [ProListMixin],
  components: { BindDeviceModal },
  data() {
    return {
      title: '已绑定设备',
      visible: false,
      queryParam: {
        roomId: ''
      },
      columns: [{
          title: '序列号',
          align: 'center',
          dataIndex: 'deviceSerialId',
        },
        {
          title: '设备名称',
          align: 'center',
          dataIndex: 'deviceName',
        },
        {
          title: '设备类型',
          align: 'center',
          dataIndex: 'deviceType',
          customRender(t) {
            return Descriptor.getEquipTypeDescriptor(t)
          }
        },

        {
          title: '子类型',
          align: 'center',
          dataIndex: 'deviceChildType',
          customRender(t, row) {
             return Descriptor.getEquipTypeDescriptor(row.deviceType, t)
          }
        },
        {
          title: '设备状态',
          align: 'center',
          dataIndex: 'deviceState',
          customRender(status, row) {
            return Descriptor.getStatusDescriptor(status, row.deviceType, row.deviceChildType)
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: {
            customRender: 'action'
          },
          align: 'center',
        }
      ]
    }
  },
  methods: {
    loadData (arg) {
      if (!this.queryParam.roomId) return
      if (arg === 1) {
          this.ipagination.current = 1
        }
      const params = {...this.queryParam}
      params.pageNo = this.ipagination.current
      params.pageSize = this.ipagination.pageSize
      this.loading = true
      getRoomDeviceList(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.dataSource = res.result.records
          this.ipagination.total = res.result.total
        }
        this.loading = false
      })
    },
    show (record) {
      this.queryParam.roomId = record.id
      this.visible = true
      this.loadData()
    },
    bindModalOk (selection) {
      const params = {
        roomId: this.queryParam.roomId,
        deviceId: selection.id,
        deviceSerialId: selection.serialId,
        deviceType: selection.device_type,
        deviceChildType: selection.device_child_type
      }
      bindRoomDevice(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.loadData()
        }
      })
    },
    handleBind () {
      this.$refs.bindModal.show({})
    },
    handleUnbind (selection) {
      const params = {
        roomId: this.queryParam.roomId,
        deviceId: selection.deviceId,
        deviceSerialId: selection.deviceSerialId,
        deviceType: selection.deviceType,
        deviceChildType: selection.deviceChildType
      }
      unbindRoomDevice(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.loadData()
        }
      })
    },
    handleOk () {
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

</style>
