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
import { getBindableOboxList, bindObox2Room } from '@/api/device'
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
          title: '绑定状态',
          align: 'center',
          dataIndex: 'is_bind',
          customRender (status) {
            return status ? '已绑定' : '未绑定'
          }
        }
      ],
      roomId: ''
    }
  },
  methods: {
    loadData (arg) {
      if (this.roomId) this.getDataList(arg)
    },
    getDataList (arg) {
      if (arg === 1) {
        this.ipagination.current = 1
      }
      // const params = {...this.queryParam}
      const params = {}
      params.pageNo = this.ipagination.current
      params.pageSize = this.ipagination.pageSize
      this.loading = true
      getBindableOboxList(params).then((res) => {
        if (this.$isAjaxSuccess(res.code)) {
          this.dataSource = res.result.records
          this.ipagination.total = res.result.total || 0
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() =>  this.loading = false)
    },
    show (record) {
      this.visible = true
      this.roomId = record.roomId
      this.loadData()
    },
     handleOk () {
      if (!this.selectionRows.length) return this.$message.warning('请选择OBOX')
      const selection = this.selectionRows[0]
      const roomId = this.roomId
      const oboxId = selection.oboxId
      const oboxSerialId = selection.obox_serial_id
      bindObox2Room(roomId, oboxId, oboxSerialId).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('绑定成功')
          this.$emit('ok', this.selectionRows)
        } else this.$message.error(res.message)
      }).finally(() => this.handleCancel())
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
      // this.selectionRows = []
      this.onClearSelected()
    }
  },
}
</script>

<style lang="less" scoped>

</style>
