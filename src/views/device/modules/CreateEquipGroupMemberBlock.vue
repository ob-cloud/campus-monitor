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
    <!-- <a-button
      slot="footer"
      size="small"
      style="float:right;margin: 5px"
      @click="init(oboxSerialId)"
    >
      刷新
    </a-button> -->
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
        :loading="loading"
        size="small"
        :style="{ pointerEvents: listDisabled ? 'none' : null }"
        :scroll="{ y: 250 }"
        :custom-row="
          ({ key, disabled: itemDisabled }) => ({
            on: {
              click: () => {
                if (itemDisabled || listDisabled) return
                itemSelect(key, !selectedKeys.includes(key))
              },
            },
          })
        "
      />
    </template>
  </a-transfer>
</template>

<script>
import { getOboxDeviceList, addDeviceGroupMember, delDeviceGroupMember, getGroupMemberById } from '@/api/device'
import { Descriptor } from 'hardware-suit'
import difference from 'lodash/difference'
import intersection from 'lodash/intersection'

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
      groupId: '',
      loading: false
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
      this.loading = true
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
      }).finally(() => this.loading = false)
    },
    onChange(nextTargetKeys, direction, moveKeys) {
      console.log('.... --- ', nextTargetKeys)
      this.loading = true
      if (direction === 'right') { // 添加组员
        // A B(pre) ---> A B C D(next) |  C D(move) | D(result) ---> A B D(final)
        addDeviceGroupMember(this.groupId, moveKeys).then(res => {
          if(this.$isAjaxSuccess(res.code)) {
            const isAsynSuccess = res.result.groupNumber && res.result.groupNumber.length
            if (!isAsynSuccess) return this.$message.error('添加组员到OBOX失败！')
            // 原绑定设备
            const preTargetKeys = difference(nextTargetKeys, moveKeys)
            // 成功添加的设备
            const memberKeys = intersection(moveKeys, res.result.groupNumber)
            this.targetKeys = preTargetKeys.concat(memberKeys)
            this.$message.success(`组员（${memberKeys.join(',')}）添加成功`)
          } else this.$message.error('添加失败')
        }).finally(() => this.loading = false)
      } else { // 删除组员
        // A B C D(pre)  -->  A B(next) | C D(move)  | D(result) --> A B C(final)
        delDeviceGroupMember(this.groupId, moveKeys).then(res => {
          if(this.$isAjaxSuccess(res.code)) {
            const isAsynSuccess = res.result.groupNumber && res.result.groupNumber.length
            if (!isAsynSuccess) return this.$message.error('从OBOX移除组员失败！')
            const preTargetKeys = nextTargetKeys.concat(moveKeys)
            const memberKeys = difference(moveKeys, res.result.groupNumber) // 删除成功的成员
            this.targetKeys = preTargetKeys.concat(memberKeys)
            this.$message.success(`组员（${memberKeys.join(',')}）删除成功`)
          } else this.$message.error('删除失败')
        }).finally(() => this.loading = false)
      }
    },
    // 单选
    // getRowSelection({ disabled, selectedKeys, itemSelectAll, itemSelect }) {
    //   selectedKeys = [selectedKeys.length === 1 ? selectedKeys[0] : selectedKeys[selectedKeys.length - 1]]
    //   return {
    //     hideDefaultSelections: true,
    //     getCheckboxProps: item => ({ props: { disabled: disabled || item.disabled } }),
    //     onSelectAll(selected, selectedRows) {
    //       const unselectedKeys = selectedRows.map(({ key }) => key)
    //       const treeSelectedKeys = selectedRows.filter((item, index) => index === 0).map(({ key }) => key)
    //       itemSelectAll(unselectedKeys, false)
    //       itemSelectAll(treeSelectedKeys, selected)
    //     },
    //     onSelect({ key }, selected, selectedRows) {
    //       const unselectedKeys = selectedRows.filter(item => item.key !== key).map(({ key }) => key)
    //       itemSelectAll(unselectedKeys, false)
    //       itemSelect(key, selected)
    //     },
    //     selectedRowKeys: selectedKeys,
    //   };
    // },
    // 多选
    getRowSelection({ disabled, selectedKeys, itemSelectAll, itemSelect }) {
      return {
        getCheckboxProps: item => ({ props: { disabled: disabled || item.disabled } }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter(item => !item.disabled)
            .map(({ key }) => key)
          const diffKeys = selected
            ? difference(treeSelectedKeys, selectedKeys)
            : difference(selectedKeys, treeSelectedKeys)
          itemSelectAll(diffKeys, selected)
        },
        onSelect({ key }, selected) {
          itemSelect(key, selected)
        },
        selectedRowKeys: selectedKeys
      }
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