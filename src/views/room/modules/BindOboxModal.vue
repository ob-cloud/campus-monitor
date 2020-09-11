<template>
  <a-modal :title="title" :width="900" :visible="visible" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <a-card :bordered="false">
      <a-table
        ref="table"
        bordered
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{type: 'radio', selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange"
      >
      </a-table>
    </a-card>
  </a-modal>
</template>

<script>
import { ProListMixin } from '@/utils/mixins/ProListMixin'
import { getOboxList } from '@/api/device'
export default {
  mixins: [ProListMixin],
  data() {
    return {
      title: '绑定OBOX',
      visible: false,
      queryParam: {
        oboxSerialId: '',
        pageNo: 1,
        pageSize: 10
      },
      columns: [
        {
          title: '序列号',
          align: 'center',
          dataIndex: 'obox_serial_id',
        },
        {
          title: '名称',
          align: 'center',
          dataIndex: 'obox_name',
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'obox_status',
          customRender (status) {
            return status ? '在线' : '离线'
          }
        },
        {
          title: '版本',
          align: 'center',
          dataIndex: 'obox_version'
        }
      ]
    }
  },
  methods: {
    loadData (arg) {
      this.getDataList(arg)
    },
    getDataList (arg) {
      if (arg === 1) {
        this.ipagination.current = 1
      }
      const params = {...this.queryParam}
      params.pageNo = this.ipagination.current
      params.pageSize = this.ipagination.pageSize
      this.loading = true
      getOboxList(params).then((res) => {
        if (this.$isAjaxSuccess(res.code)) {
          this.dataSource = res.result.records
          this.ipagination.total = res.result.total || 0
        } else {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },
    show () {
      this.visible = true
      this.loadData()
    },
     handleOk () {
      if (!this.selectionRows.length) return this.$message.warning('请选择OBOX')
      // const selection = this.selectionRows[0]
      // const params = {
      //   roomId: this.queryParam.roomId,
      //   deviceId: selection.id,
      //   deviceSerialId: selection.serialId,
      //   deviceType: selection.device_type,
      //   deviceChildType: selection.device_child_type
      // }
      // bindRoomDevice(params).then(res => {
      //   if (this.$isAjaxSuccess(res.code)) {
      //     this.loadData()
      //   }
      // })
      this.$emit('ok', this.selectionRows)
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
