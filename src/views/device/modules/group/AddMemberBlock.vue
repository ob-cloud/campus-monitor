<template>
  <div class="group">
    <a-spin :spinning="confirmLoading">
      <a-card>
        <div class="card-content">
          <!-- <a-button class="add-btn" size="small" icon="plus" @click="handleAdd"></a-button> -->
          <a-form-model ref="form" :model="formModel" layout="inline" class="block" v-bind="formItemLayoutWithOutLabel">
            <div class="block-item" v-for="(item, index) in formModel.group" :key="index">
              <a-icon type="close" class="del-btn" @click="handleDel(index)" title="删除组"></a-icon>
              <a-form-model-item v-bind="formItemLayout" label="组" :prop="'group.' + index + '.no'" :rules="{ required: true, message: '编号不能空', trigger: 'blur', }">
                <a-input-number v-model="formModel.group[index].no" :min="1" />
              </a-form-model-item>
              <a-form-model-item v-bind="formItemLayout" label="成员" :prop="'group.' + index + '.member'" :rules="{ required: true, message: '成员不能空', trigger: 'blur', }">
                <a-select mode="multiple" style="width: 300px" placeholder="请选择成员" v-model="formModel.group[index].member" @change="onMemberChange">
                  <!-- <a-select-option v-for="item in oboxList" :key="item.obox_serial_id" :value="item.obox_serial_id">
                    {{ item.obox_name }}（{{ item.obox_status === 1 ? '在线' : '离线' }}）
                  </a-select-option> -->
                </a-select>
              </a-form-model-item>
            </div>
            <a-form-model-item v-bind="formItemLayoutWithOutLabel" style="display: block; margin-right: 0;">
              <a-button type="dashed" style="width: 100%" @click="handleAdd">
                <a-icon type="plus" /> 添加组
              </a-button>
            </a-form-model-item>
          </a-form-model>
        </div>
      </a-card>
    </a-spin>
  </div>
</template>

<script>
// import { getOboxDeviceList, addDeviceGroupMember, delDeviceGroupMember, getGroupMemberById } from '@/api/device'
// import { Descriptor } from 'hardware-suit'
// import difference from 'lodash/difference'
// import intersection from 'lodash/intersection'

export default {
  data () {
    return {
      oboxSerialId: '',
      groupId: '',
      loading: false,
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 9 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 12 },
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: { span: 24, offset: 0 },
          sm: { span: 24, offset: 0 },
        },
      },
      // form: this.$form.createForm(this),
      // validatorRules: {
      //   no: { initialValue: 1, rules: [{ required: true, message: '组名不能为空!' }] },
      //   oboxSerialId: { rules: [{ required: true, message: '网关不能为空!' }] }
      // },
      formModel: {
        group: [{
          no: 1,
          member: ''
        }]
      },
      modelRules: {
        no: [{ required: true, trigger: 'change', message: '不能空!'}],
        member: [{ required: true, trigger: 'change', message: '不能空'}],
      },
      confirmLoading: false
    }
  },
  mounted () {
  },
  methods: {
    handleAdd () {
      this.formModel.group.push({
        no: 1,
        member: ''
      })
    },
    handleDel () {

    },
    edit (record) {
      const groupId = record.groupId
      const oboxSerialId = record.oboxSerialId
      this.init(oboxSerialId, groupId)
      this.getMembers(groupId)
    },
    onMemberChange () {
      //
    },
    handleOk () {
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log(valid)
        }
      })
    },
    // getMembers (groupId) {
    //   if (!groupId) return
    //   const params = {
    //     groupId,
    //     pageNo: 1,
    //     pageSize: 1000
    //   }
    //   getGroupMemberById(params).then(res => {
    //     if (this.$isAjaxSuccess(res.code)) {
    //       this.targetKeys = res.result.records
    //     }
    //   })
    // },
    init (oboxSerialId, groupId) {
      if (!oboxSerialId || !groupId) return
      // this.oboxSerialId = oboxSerialId
      // this.groupId = groupId
      // const params = {
      //   obox_serial_id: oboxSerialId,
      //   pageNo: 1,
      //   pageSize: 1000
      // }
      // this.loading = true
      // getOboxDeviceList(params).then(res => {
      //   if (this.$isAjaxSuccess(res.code)) {
      //     this.dataSource = res.result.records.map(item => {
      //       return {
      //         ...item,
      //         key: item.serialId,
      //         title: item.name,
      //         description: Descriptor.getTypeDescriptor(item.device_type)
      //       }
      //     })
      //   }
      // }).finally(() => this.loading = false)
    },
    // onChange(nextTargetKeys, direction, moveKeys) {
    //   console.log('.... --- ', nextTargetKeys)
    //   this.loading = true
    //   if (direction === 'right') { // 添加组员
    //     // A B(pre) ---> A B C D(next) |  C D(move) | D(result) ---> A B D(final)
    //     addDeviceGroupMember(this.groupId, moveKeys).then(res => {
    //       if(this.$isAjaxSuccess(res.code)) {
    //         const isAsynSuccess = res.result.groupNumber && res.result.groupNumber.length
    //         if (!isAsynSuccess) return this.$message.error('添加组员到OBOX失败！')
    //         // 原绑定设备
    //         const preTargetKeys = difference(nextTargetKeys, moveKeys)
    //         // 成功添加的设备
    //         const memberKeys = intersection(moveKeys, res.result.groupNumber)
    //         this.targetKeys = preTargetKeys.concat(memberKeys)
    //         this.$message.success(`组员（${memberKeys.join(',')}）添加成功`)
    //       } else this.$message.error('添加失败')
    //     }).finally(() => this.loading = false)
    //   } else { // 删除组员
    //     // A B C D(pre)  -->  A B(next) | C D(move)  | D(result) --> A B C(final)
    //     delDeviceGroupMember(this.groupId, moveKeys).then(res => {
    //       if(this.$isAjaxSuccess(res.code)) {
    //         const isAsynSuccess = res.result.groupNumber && res.result.groupNumber.length
    //         if (!isAsynSuccess) return this.$message.error('从OBOX移除组员失败！')
    //         const preTargetKeys = nextTargetKeys.concat(moveKeys)
    //         const memberKeys = difference(moveKeys, res.result.groupNumber) // 删除成功的成员
    //         this.targetKeys = preTargetKeys.concat(memberKeys)
    //         this.$message.success(`组员（${memberKeys.join(',')}）删除成功`)
    //       } else this.$message.error('删除失败')
    //     }).finally(() => this.loading = false)
    //   }
    // },
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
    // getRowSelection({ disabled, selectedKeys, itemSelectAll, itemSelect }) {
    //   return {
    //     getCheckboxProps: item => ({ props: { disabled: disabled || item.disabled } }),
    //     onSelectAll(selected, selectedRows) {
    //       const treeSelectedKeys = selectedRows
    //         .filter(item => !item.disabled)
    //         .map(({ key }) => key)
    //       const diffKeys = selected
    //         ? difference(treeSelectedKeys, selectedKeys)
    //         : difference(selectedKeys, treeSelectedKeys)
    //       itemSelectAll(diffKeys, selected)
    //     },
    //     onSelect({ key }, selected) {
    //       itemSelect(key, selected)
    //     },
    //     selectedRowKeys: selectedKeys
    //   }
    // },
    reset () {
      this.dataSource = []
      this.targetKeys = []
    }
  },
}
</script>

<style lang="less" scoped>
.block{
  position: relative;
  width: 70%;
  margin: 0 auto;

  .block-item{
    border: 1px solid #eee;
    padding: 10px 16px;
    border-radius: 6px;
    margin-bottom: 10px;
  }
}
.add-btn {
  float: right;
  margin: 0 5px 0;
}
.del-btn {
  float: right;
  margin-top: 10px;
}
</style>
<style lang="less">
  .group .block{
    .ant-form-inline .ant-form-item-with-help{
      margin-bottom: 0;;
    }
  }
</style>
