<template>
  <a-spin :spinning="confirmLoading">
    <a-form :form="form">
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="编号">
        <a-input-number v-decorator="[ 'addr', validatorRules.no]" :min="1" :max="65535" :disabled="!!groupId" />
      </a-form-item>
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="名称">
        <a-input placeholder="输入组名" v-decorator="[ 'group_name', validatorRules.name]" />
      </a-form-item>
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
          :titles="['设备列表', '编组列表']"
          :target-keys="targetKeys"
          :filter-option="(inputValue, item) => item.title.indexOf(inputValue) !== -1"
          :showSelectAll="false"
          @change="onTransferChange"
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
  </a-spin>
</template>

<script>
import { getAllOboxList, getOboxDeviceList, setPanelGroup, getPanelGroupDeviceList } from '@/api/device'
import difference from 'lodash/difference'
import { Descriptor, Converter, fillLength } from 'hardware-suit'
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
        sm: { span: 5 }
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
      form: this.$form.createForm(this),
      validatorRules: {
        no: { initialValue: 1, rules: [{ required: true, message: '请输入数字(1~65535)!' }] },
        name: { rules: [{ required: true, message: '组名不能为空!' }] },
        oboxSerialId: { rules: [{ required: true, message: '网关不能为空!' }] }
      },
      dataSource: [],
      targetKeys: [],
      leftColumns: leftTableColumns,
      rightColumns: rightTableColumns,
      oboxSerialId: '',
      groupId: '',
      loading: false,
      isEditMode: false,
      deviceList: []
    }
  },
  mounted () {
    this.getOboxList()
  },
  methods: {
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
          const dataSource = res.result.records.map(item => item && this.getTransferObjList(item))
          this.dataSource = this.isEditMode ? dataSource.concat(this.deviceList) : dataSource
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
    onTransferChange(nextTargetKeys, direction, moveKeys) {
      console.log(nextTargetKeys, direction, moveKeys)
      this.targetKeys = nextTargetKeys
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
        const that = this
        this.form.validateFields((err, values) => {
          if (!err) {
            console.log('ok ', values)
            if (!that.targetKeys.length) {
              that.$message.warning('请选择设备')
              resolve({ status: 0 })
              return
            }
            that.confirmLoading = true
            let formData = {}
            if (that.groupId) {
              formData.group_id = that.groupId
            }
            // 转16进制
            let addr = new Converter(values.addr, 10).toHex()
            addr = fillLength(addr, 4)
            formData.panel_addr = {list: [{addr: addr, groupAddr: '00'}]}
            formData.group_name = values.group_name
            formData.group_member = that.targetKeys.join(',')
            formData.type = '00'
            console.log(formData)
            const groupNo = values.addr
            const timeout = that.targetKeys.length * 6 * 1000 || 6000
            let obj = setPanelGroup(formData, { timeout })
            obj.then(res => {
              if (that.$isAjaxSuccess(res.code)) {
                // that.targetKeys
                const validKeys = res.result.group_member ? res.result.group_member.split(',') : []
                const deviceList = that.getDeviceListByKeys(validKeys)
                that.trasnferVisible = false
                resolve({status: 1, deviceList, groupNo})
              } else {
                that.$message.warning(res.message)
              }
            }).catch(e => {
              this.$message.error(e.message || '服务异常')
              console.log('err ', e)
              resolve({ status: 0 })
            }).finally(() => that.confirmLoading = false)
          } else resolve({ status: 0 })
        })
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
      this.isEditMode = false
      this.groupId = ''
      this.dataSource = []
      this.targetKeys = []
    },
    setFieldsValue (model) {
      model.addr = model.addr ? +(new Converter(model.addr, 16).toDecimal()) : 1
      this.form.setFieldsValue(model)
    },
    setEditDeviceList (groupId) {
      this.isEditMode = true
      this.trasnferVisible = true
      this.groupId = groupId
      this.loading = true
      getPanelGroupDeviceList(groupId).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.deviceList = res.result && res.result.length ? res.result.map(item => item && this.getTransferObjList(item)) : []
          this.targetKeys = this.getDeviceKeys(res.result)
          this.dataSource = this.dataSource.concat(this.deviceList)
          console.log(this.deviceList, this.dataSource)
        }
      }).finally(() => this.loading = false)
    }
  },
}
</script>

<style lang="less" scoped>

</style>
