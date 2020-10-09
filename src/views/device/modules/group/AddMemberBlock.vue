<template>
  <div class="group">
    <a-spin :spinning="confirmLoading">
      <a-card :bordered="false">
        <div class="card-content">
          <a-form-model :ref="`form${index}`" :model="formModel" v-for="(item, index) in formModel.group" :key="index" layout="inline" class="block" v-bind="formItemLayoutWithOutLabel">
            <div class="block-item">
              <a-tooltip placement="top">
                <template slot="title">
                  <span>检测设备，点击后请查看设备是否闪烁</span>
                </template>
                <a-icon type="api" class="action-btn" @click="handleCheck(item, index)" title="检测" />
              </a-tooltip>
              <a-popconfirm title="确定删除组?" @confirm="() => handleDel(item, index)">
                <a-icon type="close-circle" class="del-btn" title="删除组"></a-icon>
              </a-popconfirm>
              <a-icon type="check-circle" class="check-btn" @click="handleConfirm(item, index)" title="确认" />
              <a-form-model-item v-bind="formItemLayout" label="组号" :prop="'group.' + index + '.no'" :rules="{ required: true, message: '组号不能空', trigger: 'blur', }">
                <a-input-number v-model="item.no" :min="1" :max="255" :disabled="!!item.group_id" />
              </a-form-model-item>
              <a-form-model-item v-bind="formItemLayout" label="组名" :prop="'group.' + index + '.name'" :rules="{ required: true, message: '组名不能空', trigger: 'blur', }">
                <a-input placeholder="输入组名" v-model="item.name" />
              </a-form-model-item>
              <a-form-model-item v-bind="formItemLayout" label="成员" :prop="'group.' + index + '.member'" :rules="{ required: true, message: '成员不能空', trigger: 'blur', }">
                <a-select mode="multiple" style="width: 200px" placeholder="请选择成员" v-model="item.member">
                  <a-select-option v-for="it in deviceList" :key="it.serialId" :value="it.serialId">
                    {{ it.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </div>
          </a-form-model>
          <a-button type="dashed" style="width: 100%" @click="handleAdd">
            <a-icon type="plus" /> 添加组
          </a-button>

          <!-- <a-button class="add-btn" size="small" icon="plus" @click="handleAdd"></a-button> -->
          <!-- <a-form-model ref="form" :model="formModel" layout="inline" class="block" v-bind="formItemLayoutWithOutLabel">
            <div class="block-item" v-for="(item, index) in formModel.group" :key="index">
              <a-icon type="close-circle" class="del-btn" @click="handleDel(index)" title="删除组"></a-icon>
              <a-icon type="check-circle" class="check-btn" @click="handleConfirm(item, index)" title="确认" />
              <a-form-model-item v-bind="formItemLayout" label="组号" :prop="'group.' + index + '.no'" :rules="{ required: true, message: '组号不能空', trigger: 'blur', }">
                <a-input-number v-model="formModel.group[index].no" :min="1" />
              </a-form-model-item>
              <a-form-model-item v-bind="formItemLayout" label="组名" :prop="'group.' + index + '.name'" :rules="{ required: true, message: '组名不能空', trigger: 'blur', }">
                <a-input placeholder="输入组名" v-model="formModel.group[index].name" />
              </a-form-model-item>
              <a-form-model-item v-bind="formItemLayout" label="成员" :prop="'group.' + index + '.member'" :rules="{ required: true, message: '成员不能空', trigger: 'blur', }">
                <a-select mode="multiple" style="width: 200px" placeholder="请选择成员" v-model="formModel.group[index].member">
                  <a-select-option v-for="it in deviceList" :key="it.serialId" :value="it.serialId">
                    {{ it.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </div>
            <a-form-model-item v-bind="formItemLayoutWithOutLabel" style="display: block; margin-right: 0;">
              <a-button type="dashed" style="width: 100%" @click="handleAdd">
                <a-icon type="plus" /> 添加组
              </a-button>
            </a-form-model-item>
          </a-form-model> -->
        </div>
      </a-card>
    </a-spin>
  </div>
</template>

<script>
import { setPanelGroup, delPanelGroup, getPanelGroupDeviceList, getPanelChildGroupList, twinklePanelGroupDevice } from '@/api/device'
import { Converter, fillLength } from 'hardware-suit'

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
          sm: { span: 14 },
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: { span: 24, offset: 0 },
          sm: { span: 24, offset: 0 },
        },
      },
      formModel: {
        group: [{
          no: 1,
          group_id: '',
          name: '',
          member: []
        }]
      },
      modelRules: {
        no: [{ required: true, trigger: 'change', message: '不能空!'}],
        name: [{ required: true, trigger: 'change', message: '不能空!'}],
        member: [{ required: true, trigger: 'change', message: '不能空'}],
      },
      confirmLoading: false,
      deviceList: [],
      groupNo: '',
      groupNoHex: ''
    }
  },
  mounted () {
  },
  methods: {
    handleAdd () {
      this.formModel.group.push({
        no: 1,
        group_id: '',
        name: '',
        member: []
      })
    },
    handleDel (item, index) {
      if (item.group_id) { // 已入库组
        this.confirmLoading = true
        delPanelGroup(item.group_id, '01').then(res => {
          if (this.$isAjaxSuccess(res.code)) {
            this.$message.success('删除成功')
            this.formModel.group.splice(index, 1)
          } else this.$message.error('删除失败')
        }).finally(() => this.confirmLoading = false)
      } else { // 未入库
        this.formModel.group.splice(index, 1)
      }
    },
    handleCheck (item) {
      if (!item.member.length) return this.$message.warning('请选择设备成员!')
      twinklePanelGroupDevice(item.member.join(',')).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('指令发送成功，请查看设备闪烁状态')
        } else this.$message.error(res.message)
      }).catch(() => this.$message.error('服务异常'))
    },
    handleConfirm (item, index) {
      console.log(item, index)
      const that = this
      this.$refs[`form${index}`][0].validate(valid => {
        if (valid) {
          that.confirmLoading = true
          let formData = {}
          if (item.group_id) {
            formData.group_id = item.group_id
          }
          let addr = new Converter(item.no, 10).toHex()
          addr = fillLength(addr, 2)
          formData.panel_addr = {list: [{addr: that.groupNoHex, groupAddr: addr}]}
          formData.group_name = item.name
          formData.group_member = item.member.join(',')
          formData.type = '01'
          console.log(formData)
          const timeout = item.member.length * 6 * 1000 || 6000
          setPanelGroup(formData, { timeout }).then(res => {
            if (this.$isAjaxSuccess(res.code)) {
              // if (!res.result) return this.$message.error('添加组失败，请查看OBOX是否正常!')
              // 根据设备组员入网结果，重置选项值
              item.group_member = res.result.group_member ? res.result.group_member.split(',') : []
              const addTips = `添加组成功，设备成员有(${item.group_member.join(',')})`
              const editTips = `编辑组成功，${res.result.addMember && '添加设备成员(' + res.result.addMember + ')'} ${res.result.delMember && '删除设备成员(' + res.result.delMember + ')'}`
              this.$message.success(item.group_id ? editTips : addTips)
              // 添加时，添加group_id
              if (res.result.group_id) item.group_id = res.result.group_id
            } else this.$message.error('添加失败')
          }).finally(() => that.confirmLoading = false)
        }
      })
    },
    edit (record) {
      this.init(record)
    },
    async init (record) {
      const groupNo = record.groupAddr
      if (!groupNo) return
      // 组id
      const records = await getPanelGroupDeviceList(record.primaryId)
      this.deviceList = records.result
      this.groupNo = groupNo
      this.confirmLoading = true
      let addr = new Converter(groupNo, 10).toHex()
      addr = fillLength(addr, 4)
      this.groupNoHex = addr

      // addr 教室号
      getPanelChildGroupList(addr).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          if (res.result && res.result.length) {
            this.formModel.group = res.result.map(item => {
              return {
                no: +(new Converter(item.panel_addr[0].group_addr, 16).toDecimal()),
                group_id: item.group_id,
                name: item.group_name,
                member: item.groupMember.map(it => it.serialId)
              }
            })
            console.log(this.formModel.group)
          }
        }
      }).finally(() => this.confirmLoading = false)
    },
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
  // width: 70%;
  // margin: 0 auto;

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
.action-btn,
.check-btn,
.del-btn {
  font-size: 18px;
  float: right;
  margin-top: 10px;
  cursor: pointer;
  margin-right: 10px;
}
// .check-btn{
//   margin-right: 10px;
// }
</style>
<style lang="less">
  .group .block{
    .ant-form-inline .ant-form-item-with-help{
      margin-bottom: 0;;
    }
  }
</style>
