<template>
  <a-modal :title="title" :width="900" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭" :destroyOnClose="true">
    <a-layout class="expand humidifier">
      <a-layout-sider width="200px" theme="light">
        <ul class="list">
          <li class="list-item" :class="{'active': item.obox_serial_id === oboxSelectedKey}" v-for="(item) in oboxList" :key="item.obox_serial_id" @click="onSelectedObox(item.obox_serial_id)">{{ item.obox_name }}({{ item.obox_status === 1 ? '在线' : '离线' }})</li>
        </ul>
      </a-layout-sider>
      <a-layout-content>
        <a-card style="min-height: 470px;">
          <a-spin :spinning="listLoading">
            <a-checkbox-group v-model="checkDeviceListId" class="checkbox-list">
              <a-checkbox class="checkbox-list-item" v-for="item in deviceList" :value="item.serialId" :key="item.serialId">
                <div>{{ item.name }}</div>
                <div>{{ Descriptor.getTypeDescriptor(item.device_type) }}</div>
                <div>{{ Descriptor.getTypeDescriptor(item.device_type, item.device_child_type) }}</div>
              </a-checkbox>
            </a-checkbox-group>
          </a-spin>
        </a-card>
      </a-layout-content>
    </a-layout>
  </a-modal>
</template>

<script>
// import pick from 'lodash.pick'
import { getOboxDeviceList, getAllOboxList } from '@/api/device'
import { Descriptor } from 'hardware-suit'
export default {
  data () {
    return {
      title: '选择编组成员',
      visible: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      form: this.$form.createForm(this),
      validatorRules: {
        name: { rules: [{ required: true, message: '组名不能为空!' }] },
        member: { rules: [{ required: true, message: '成员不能为空!' }] },
        addr: { rules: [{ required: true, message: '短地址不能为空!' }] },
        group_addr: { rules: [{ required: true, message: '组地址不能为空!' }] },
      },
      oboxList: [],
      deviceList: [],
      checkDeviceListId: [],
      listLoading: false,
      oboxSelectedKey: '',
      Descriptor
    }
  },
  methods: {
    getAllOboxList () {
      getAllOboxList().then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.oboxList = res.result
        }
      })
    },
    getDeviceByOboxId () {
      this.listLoading = true
      const params = {
        obox_serial_id: this.oboxSelectedKey,
        serialId: '',
        pageNo: 1,
        pageSize: 1000
      }
      getOboxDeviceList(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.deviceList = res.result.records
        } else {
          this.$message.error('获取失败')
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    onSelectedObox (serialId) {
      this.oboxSelectedKey = serialId
      this.checkDeviceListId = []
      this.getDeviceByOboxId()
    },
    add () {
      this.edit({})
    },
    edit (record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true
      this.getAllOboxList()
    },
    // 确定
    handleOk () {
      if (!this.checkDeviceListId.length) {
        return this.$message.warning('请选择设备')
      }
      const members = this.checkDeviceListId.join(',')
      this.checkDeviceListId = []
      this.$emit('ok', members)
      this.close()
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
ul,li{
  list-style: none;
}
.list-item{
  padding: 20px 16px;
  text-align: center;
  // border-bottom: 1px solid #000;
  transition: all .3s;
  cursor: pointer;

  &:hover,
  &.active{
    background: #e6f7ff;
  }
}


</style>
<style lang="less">
.checkbox-list .ant-checkbox-wrapper span.ant-checkbox {
  display: none;
}
.checkbox-list{

  .checkbox-list-item + .checkbox-list-item{
    margin: 0;
  }
  .checkbox-list-item span{
    display: inline-block;
    width: 160px;
    height: 120px;
    border: 1px solid #3A4257;
    border-radius: 6px;
    margin: 10px;
    text-align: center;
    padding: 10px;
    overflow: hidden;
  }
  .checkbox-list-item div{
    &:first-child{
      font-size: 16px;
      padding: 10px;
      color: #000;
      font-weight: 600;
    }
    padding: 2px;
  }
  .checkbox-list-item.ant-checkbox-wrapper-checked span{
    background: #e6f7ff;
  }
}
</style>
