<template>
  <a-modal :title="title" :width="900" :visible="visible" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <a-card :bordered="false">
      <a-table
        ref="table"
        bordered
        size="middle"
        rowKey="serialId"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{type: 'radio', selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange"
      >
        <!-- <span slot="action" slot-scope="text, record">
          <a-popconfirm title="确定解绑吗?" @confirm="() => handleUnbind(record.id)">
            <a><i class="obicon obicon-unbind"></i></a>
          </a-popconfirm>
        </span> -->
      </a-table>
    </a-card>
  </a-modal>
</template>

<script>
import { ProListMixin } from '@/utils/mixins/ProListMixin'
import { getAllBuildingDeviceList } from '@/api/device'
import { Descriptor } from 'hardware-suit'
export default {
  mixins: [ProListMixin],
  data() {
    return {
      title: '绑定设备',
      visible: false,
      queryParam: {
        oboxSerialId: '',
        pageNo: 1,
        pageSize: 10
      },
      columns: [{
          title: '序列号',
          align: 'center',
          dataIndex: 'obox_serial_id',
        },
        {
          title: 'obox序列号',
          align: 'center',
          dataIndex: 'serialId',
        },
        {
          title: '设备名称',
          align: 'center',
          dataIndex: 'name',
        },
        {
          title: '设备类型',
          align: 'center',
          dataIndex: 'device_type',
          customRender(t) {
            return Descriptor.getEquipTypeDescriptor(t)
          }
        },
        {
          title: '子类型',
          align: 'center',
          dataIndex: 'device_child_type',
          customRender(t, row) {
             return Descriptor.getEquipTypeDescriptor(row.device_type, t)
          }
        },
        {
          title: '设备状态',
          align: 'center',
          dataIndex: 'state',
          customRender(status, row) {
            return Descriptor.getStatusDescriptor(status, row.device_type, row.device_child_type)
          }
        },
        // {
        //   title: '操作',
        //   dataIndex: 'action',
        //   scopedSlots: {
        //     customRender: 'action'
        //   },
        //   align: 'center',
        //   width: 170
        // }
      ]
    }
  },
  methods: {
    loadData (arg) {
      if (arg === 1) {
          this.ipagination.current = 1
        }
      const params = {...this.queryParam}
      params.pageNo = this.ipagination.current
      params.pageSize = this.ipagination.pageSize
      this.loading = true
      getAllBuildingDeviceList(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.dataSource = res.result.records
          this.ipagination.total = res.result.total
        }
        this.loading = false
      })
    },
    show () {
      this.visible = true
      this.loadData()
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
