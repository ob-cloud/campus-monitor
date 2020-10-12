<template>
  <a-form :form="form">
    <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="网关">
      <a-select placeholder="请选择网关" allowClear @change="onOboxChange">
        <a-select-option v-for="item in oboxList" :key="item.obox_serial_id" :value="item.obox_serial_id">
          {{ item.obox_name }}（{{ item.obox_status === 1 ? '在线' : '离线' }}）
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="trasnferVisible" :labelCol="labelCol" :wrapperCol="wrapperCol2" label="设备">
      <a-transfer
        :data-source="dataSource"
        :titles="['设备列表', '编组设备']"
        :target-keys="targetKeys"
        :filter-option="(inputValue, item) => item.title.indexOf(inputValue) !== -1"
        :showSelectAll="false"
        @change="onChange"
      >
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
            :scroll="{ y: 200 }"
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
    </a-form-item>
  </a-form>
</template>


<script>
import { getAllOboxList, getOboxDeviceList, addPanelGroupDeviceMember, delPanelGroupDeviceMember, getPanelGroupDeviceList } from '@/api/device'
import difference from 'lodash/difference'
import intersection from 'lodash/intersection'
import uniqBy from 'lodash/uniqBy'
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
    title: '设备类型',
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
      confirmLoading: false,
      trasnferVisible: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 }
      },
      wrapperCol2: {
        xs: { span: 24 },
        sm: { span: 18 }
      },
      oboxList: [],
      deviceList: [],
      form: this.$form.createForm(this),
      dataSource: [],
      targetKeys: [],
      leftColumns: leftTableColumns,
      rightColumns: rightTableColumns,
      oboxSerialId: '',
      groupId: '',  // 教室号
      groupAddr: '',
      groupPrimaryId: '',
      loading: false
    }
  },
  methods: {
    init (record) {
      this.getOboxList()
      this.groupAddr = record.groupAddr
      this.groupPrimaryId = record.primaryId
    },
    edit (record) {
      this.init(record)
      this.setEditDeviceList(record.primaryId)
    },
    getOboxList () {
      getAllOboxList().then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.oboxList = res.result
        }
      })
    },
    getOboxDeviceList (oboxSerialId) {
      if (!oboxSerialId) return
      // this.oboxSerialId = oboxSerialId
      const params = {
        obox_serial_id: oboxSerialId,
        pageNo: 1,
        pageSize: 1000
      }
      this.loading = true
      getOboxDeviceList(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.dataSource = res.result.records.map(item => item && this.getTransferObjList(item))
          if (this.deviceList.length) {
            this.dataSource = this.unique(this.dataSource.concat(this.deviceList))
          }
        }
      }).finally(() => this.loading = false)
    },
    getTransferObjList (item) {
      return {
        ...item,
        key: item.serialId,
        title: item.name,
        description: Descriptor.getTypeDescriptor(item.device_type)
      }
    },
    onOboxChange (val) {
      this.trasnferVisible = !!val
      val && this.getOboxDeviceList(val)
    },
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
    handleOk () {
      return new Promise(resolve => {
        if (!this.targetKeys.length) {
          this.$message.warning('请选择设备')
          resolve({ status: 0 })
          return
        }
        resolve({ status: 1, groupAddr: this.groupAddr, primaryId: this.groupPrimaryId })
      })
    },
    getDeviceListByKeys (keyList) {
      return keyList.map(key => this.dataSource.find(item => item.serialId === key))
    },
    getDeviceKeys (list) {
      return list.map(item => item.serialId)
    },
    reset () {
      this.form.resetFields()
      this.oboxList = []
      this.trasnferVisible = false
      this.groupAddr = ''
      this.groupPrimaryId = ''
      this.dataSource = []
      this.targetKeys = []
    },
    onChange(nextTargetKeys, direction, moveKeys) {
      console.log('.... --- ', nextTargetKeys)
      this.loading = true
      const timeout = moveKeys.length * 6 * 1000 || 6000
      if (direction === 'right') { // 添加组员
        // A B(pre) ---> A B C D(next) |  C D(move) | D(result) ---> A B D(final)
        addPanelGroupDeviceMember(this.groupPrimaryId, moveKeys.join(','), { timeout }).then(res => {
          if(this.$isAjaxSuccess(res.code)) {
            const isAsynSuccess = res.result.groupMember && res.result.groupMember.length
            if (!isAsynSuccess) return this.$message.error('添加设备到组失败！')
            const memberResult = res.result.groupMember.split(',')
            // 原绑定设备
            const preTargetKeys = difference(nextTargetKeys, moveKeys)
            // 成功添加的设备
            const memberKeys = intersection(moveKeys, memberResult)
            this.targetKeys = preTargetKeys.concat(memberKeys)
            this.$message.success(`设备（${memberKeys.join(',')}）添加成功`)
          } else this.$message.error('添加失败')
        }).finally(() => this.loading = false)
      } else { // 删除组员
        delPanelGroupDeviceMember(this.groupPrimaryId, moveKeys.join(','), { timeout }).then(res => {
          if(this.$isAjaxSuccess(res.code)) {
            const isAsynSuccess = res.result.groupMember && res.result.groupMember.length
            if (!isAsynSuccess) return this.$message.error('从组中移除设备失败！')
            const memberResult = res.result.groupMember.split(',')
            const preTargetKeys = nextTargetKeys.concat(moveKeys)
            const memberKeys = difference(moveKeys, memberResult) // 删除成功的成员
            const targetKeys = preTargetKeys.concat(memberKeys)
            this.targetKeys = difference(targetKeys, memberResult)
            const tips = memberKeys.length ? `(${memberKeys.join(',')})` : ''
            this.$message.success(`设备 ${tips}删除成功`)
          } else this.$message.error('删除失败')
        }).finally(() => this.loading = false)
      }
    },
    setEditDeviceList (groupId) {
      this.trasnferVisible = true
      this.loading = true
      getPanelGroupDeviceList(groupId).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.deviceList = res.result && res.result.length ? res.result.map(item => item && this.getTransferObjList(item)) : []
          this.targetKeys = this.getDeviceKeys(res.result)
          this.dataSource = this.unique(this.dataSource.concat(this.deviceList))
          console.log(this.deviceList, this.dataSource)
        }
      }).finally(() => this.loading = false)
    },
    unique (list) {
      return uniqBy(list, 'serialId')
    }
  },
}
</script>
