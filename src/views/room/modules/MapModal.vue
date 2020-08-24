<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :width="drawerWidth"
    placement="right"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;"
  >

    <!-- <template slot="title">
      <div style="width: 100%;">
        <span>{{ title }}</span>
        <span style="display:inline-block;width:calc(100% - 51px);padding-right:10px;text-align: right">
          <a-button icon="appstore" style="height:20px;width:20px;border:0px"></a-button>
        </span>
      </div>
    </template> -->

    <a-spin :spinning="deviceLoading">
      <!-- <a-form :form="form">

        <a-form-item label="用户账号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入用户账号" />
        </a-form-item>
      </a-form> -->
      <div class="item" v-for="(item, index) in deviceList" :key="index">
        <div class="title">{{ getPanelTitle(item) }}</div>
        <div class="detail">
          <template v-if="TypeHints.isThreeKeySocketSwitch(item.deviceChildType)">
            <!-- <iSwitcher :state="item.deviceState" :serialId="item.deviceSerialId" :useDefaultStyle="false" @switcher-change="onSwitcherChange" styles="map power"></iSwitcher> -->
          </template>
          <template v-else-if="TypeHints.isHumidifierSensors(item.deviceChildType)">
            <div class="sensors">
              <p><i class="obicon obicon-temperature-o"></i><span>温度</span></p>
              <span>℃</span>
            </div>
            <div class="sensors">
              <p><i class="obicon obicon-humidity"></i><span>湿度</span></p>
              <span>%</span>
            </div>
          </template>
          <template v-else-if="TypeHints.isTransponder(item.deviceType)">
            <!-- <AireCondition class="map" :serialId="item.deviceSerialId"></AireCondition> -->
          </template>
        </div>
      </div>
    </a-spin>

    <div class="drawer-bootom-button" v-show="!disableSubmit">
      <a-popconfirm title="确定放弃编辑？" @confirm="handleCancel" okText="确定" cancelText="取消">
        <a-button style="margin-right: .8rem">取消</a-button>
      </a-popconfirm>
      <a-button @click="handleOk" type="primary" :loading="confirmLoading">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
import { getRoomDeviceList } from '@/api/room'
import { TypeHints } from 'hardware-suit'
export default {
  name: 'MapModal',
  data () {
    return {
      drawerWidth: 700,
      treeData: [],
      treeValue: '0-0-4',
      title: "操作",
      visible: false,
      disableSubmit: false,
      model: {},
      localMenuType: 0,
      alwaysShow: false, //表单元素-聚合路由
      menuHidden: false, //表单元素-隐藏路由
      routeSwitch: true, //是否路由菜单
      internalOrExternal:false,//菜单打开方式
      isKeepalive: true, //是否缓存路由
      show: true, //根据菜单类型，动态显示隐藏表单元素
      menuLabel: '菜单名称',
      isRequrie: true, // 是否需要验证
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },

      confirmLoading: false,
      form: this.$form.createForm(this),

      iconChooseVisible: false,
      validateStatus: '',
      deviceList: [],
      deviceLoading: false,
      TypeHints
    }
  },
  methods: {
    getPanelTitle (deviceType, deviceChildType) {
      if (TypeHints.isThreeKeySocketSwitch(deviceChildType)) return '开关'
      if (TypeHints.isHumidifierSensors(deviceChildType)) return '温湿度'
      if (TypeHints.isTransponder(deviceType)) return '红外'
    },
    getDeviceList (id) {
      this.deviceLoading = true
      getRoomDeviceList({roomId: id}).then(res => {
        if (res.status === 0) {
          this.deviceList = Array.from(res.data.records).filter(item => {
            const isKeyPanel = TypeHints.isThreeKeySocketSwitch(item.deviceChildType)
            const isHumidity = TypeHints.isHumidifierSensors(item.deviceChildType)
            const isTransponder = TypeHints.isTransponder(item.deviceType)
            return isKeyPanel || isHumidity || isTransponder
          })
        }
        this.deviceLoading = false
      }).catch(() => { this.deviceLoading = false })
    },
    add () {
      this.edit({})
    },
    edit (record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true
      if (record.roomId) {
        this.getDeviceList(record.roomId)
      }
    },
    close () {
      this.$emit('close')
      this.disableSubmit = false
      this.visible = false
    },
    handleCancel () {
      this.close()
    },
    handleOk () {
    }
  },
}
</script>

<style lang="less" scoped>
.drawer-bootom-button {
  position: absolute;
  bottom: -8px;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
  border-radius: 0 0 2px 2px;
}
</style>
