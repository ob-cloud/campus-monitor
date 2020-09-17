<template>
  <a-transfer
    :data-source="dataSource"
    :show-search="true"
    :titles="['设备列表', '已添加组员']"
    :operations="['添加组员', '移除组员']"
    :target-keys="targetKeys"
    :filter-option="(inputValue, item) => item.title.indexOf(inputValue) !== -1"
    :showSelectAll="false"
    @change="onChange"
  >
    <a-button
      slot="footer"
      size="small"
      style="float:right;margin: 5px"
      @click="init(oboxSerialId)"
    >
      刷新
    </a-button>
    <template
      slot="children"
      slot-scope="{
        props: { direction, filteredItems, selectedKeys, disabled: listDisabled },
        on: { itemSelectAll, itemSelect },
      }"
    >
      <a-table
        :row-selection="
          getRowSelection({ disabled: listDisabled, selectedKeys, itemSelectAll, itemSelect })
        "
        :columns="direction === 'left' ? leftColumns : rightColumns"
        :data-source="filteredItems"
        size="small"
        :style="{ pointerEvents: listDisabled ? 'none' : null }"
        :scroll="{ y: 250 }"
      />
    </template>
  </a-transfer>
</template>

<script>
import { getOboxDeviceList, addDeviceGroupMember, delDeviceGroupMember, getGroupMemberById } from '@/api/device'
import { Descriptor } from 'hardware-suit'
const leftTableColumns = [
  {
    dataIndex: 'serialId',
    title: '序列号',
  },
  {
    dataIndex: 'name',
    title: '名称',
  },
  {
    dataIndex: 'description',
    title: '设备类型'
  }
]
const rightTableColumns = [
  {
    dataIndex: 'serialId',
    title: '序列号',
  },
  {
    dataIndex: 'name',
    title: '名称',
  },
]
export default {
  data () {
    return {
      dataSource: [],
      targetKeys: [],
      leftColumns: leftTableColumns,
      rightColumns: rightTableColumns,
      oboxSerialId: '',
      groupId: ''
    }
  },
  mounted () {
  },
  methods: {
    edit (record) {
      const groupId = record.groupId
      const oboxSerialId = record.oboxSerialId
      this.init(oboxSerialId, groupId)
      this.getMembers(groupId)
    },
    getMembers (groupId) {
      if (!groupId) return
      const params = {
        groupId,
        pageNo: 1,
        pageSize: 1000
      }
      getGroupMemberById(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.targetKeys = res.result.records
        }
      })
    },
    init (oboxSerialId, groupId) {
      if (!oboxSerialId || !groupId) return
      this.oboxSerialId = oboxSerialId
      this.groupId = groupId
      const params = {
        obox_serial_id: oboxSerialId,
        pageNo: 1,
        pageSize: 1000
      }
      getOboxDeviceList(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.dataSource = res.result.records.map(item => {
            return {
              ...item,
              key: item.serialId,
              title: item.name,
              description: Descriptor.getTypeDescriptor(item.device_type)
            }
          })
        }
      })
    },
    onChange(nextTargetKeys, direction, moveKeys) {
      console.log('.... --- ', nextTargetKeys)
      if (direction === 'right') { // 添加组员
        addDeviceGroupMember(this.groupId, moveKeys).then(res => {
          if(this.$isAjaxSuccess(res.code) && res.result.groups) {
            this.targetKeys = nextTargetKeys
            this.$message.success('添加成功')
          } else this.$message.error('添加失败')
        })
      } else { // 删除组员
        delDeviceGroupMember(this.groupId, moveKeys).then(res => {
          if(this.$isAjaxSuccess(res.code) && res.result.groups) {
            this.targetKeys = nextTargetKeys
            this.$message.success('删除成功')
          } else this.$message.error('删除失败')
        })
      }
    },
    getRowSelection({ disabled, selectedKeys, itemSelectAll, itemSelect }) {
      selectedKeys = [selectedKeys.length === 1 ? selectedKeys[0] : selectedKeys[selectedKeys.length - 1]]
      return {
        hideDefaultSelections: true,
        getCheckboxProps: item => ({ props: { disabled: disabled || item.disabled } }),
        onSelectAll(selected, selectedRows) {
          const unselectedKeys = selectedRows.map(({ key }) => key)
          const treeSelectedKeys = selectedRows.filter((item, index) => index === 0).map(({ key }) => key)
          itemSelectAll(unselectedKeys, false)
          itemSelectAll(treeSelectedKeys, selected)
        },
        onSelect({ key }, selected, selectedRows) {
          const unselectedKeys = selectedRows.filter(item => item.key !== key).map(({ key }) => key)
          itemSelectAll(unselectedKeys, false)
          itemSelect(key, selected)
        },
        selectedRowKeys: selectedKeys,
      };
    },
    reset () {
      this.dataSource = []
      this.targetKeys = []
    }
  },
}
</script>

<style lang="less" scoped>

</style>
