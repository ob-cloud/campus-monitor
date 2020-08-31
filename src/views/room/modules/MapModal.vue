<template>
  <a-drawer
    :title="title"
    :maskClosable="false"
    :width="drawerWidth"
    placement="right"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
  >

    <a-spin :spinning="deviceLoading">
      <div class="map-drawer-content">
        <div class="item" v-for="(item, index) in deviceList" :key="index">
          <a-card>
            <div slot="title">
              {{ getPanelTitle(item.deviceType, item.deviceChildType) }}
            </div>
            <div class="detail">
              <template v-if="TypeHints.isXkeySocketSwitch(item.deviceChildType)">
                <iot-switch :serialId="item.deviceSerialId" :state="item.deviceState"></iot-switch>
              </template>
              <template v-else-if="TypeHints.isHumidifierSensors(item.deviceChildType)">
                <div class="sensors">
                  <p><i class="obicon obicon-temperature-o"></i><span>温度</span></p>
                  <span>{{ Temperature }}℃</span>
                </div>
                <div class="sensors">
                  <p><i class="obicon obicon-humidity"></i><span>湿度</span></p>
                  <span>{{ humidityfier }}%</span>
                </div>
              </template>
              <template v-else-if="TypeHints.isTransponder(item.deviceType)">
                <!-- <AireCondition class="map" :serialId="item.deviceSerialId"></AireCondition> -->
              </template>
            </div>
          </a-card>
        </div>
        <div class="item">
          <a-card title="操作">
            <div class="detail">
              <a-tooltip title="删除房间节点" placement="bottom" effect="light">
                <a-button type="danger" icon="delete" @click="handleRemove"></a-button>
              </a-tooltip>
            </div>
          </a-card>
        </div>
      </div>
    </a-spin>

    <!-- <div class="drawer-bootom-button" v-show="!disableSubmit">
      <a-popconfirm title="确定放弃编辑？" @confirm="handleCancel" okText="确定" cancelText="取消">
        <a-button style="margin-right: .8rem">取消</a-button>
      </a-popconfirm>
      <a-button @click="handleOk" type="primary" :loading="confirmLoading">提交</a-button>
    </div> -->
  </a-drawer>
</template>

<script>
import { getRoomDeviceList } from '@/api/room'
import { TypeHints, HumidityEquip } from 'hardware-suit'
import ActionMixin from '@/utils/mixins/ActionMixin'
import IotSwitch from '@/components/Bizz/BizzSwitch'
export default {
  name: 'MapModal',
  mixins: [ ActionMixin ],
  components: { IotSwitch },
  data () {
    return {
      drawerWidth: 700,
      title: "操作",
      visible: false,
      disableSubmit: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,

      deviceList: [],
      deviceLoading: false,
      TypeHints,

      humidity: {}
    }
  },
  computed: {
    Temperature () {
      return this.humidity.getTemperature()
    },
    humidityfier () {
      return this.humidity.getHumidity()
    }
  },
  methods: {
    getPanelTitle (deviceType, deviceChildType) {
      if (TypeHints.isXkeySocketSwitch(deviceChildType)) return '开关'
      if (TypeHints.isHumidifierSensors(deviceChildType)) return '温湿度'
      if (TypeHints.isTransponder(deviceType)) return '红外'
    },
    getDeviceList (id) {
      this.deviceLoading = true
      getRoomDeviceList({roomId: id}).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.deviceList = Array.from(res.result.records).filter(item => {
            const isKeyPanel = TypeHints.isXkeySocketSwitch(item.deviceChildType)
            const isHumidity = TypeHints.isHumidifierSensors(item.deviceChildType)
            const isTransponder = TypeHints.isTransponder(item.deviceType)
            return isKeyPanel || isHumidity || isTransponder
          })
        }
        this.deviceLoading = false
      }).catch(() => { this.deviceLoading = false })
    },
    handleRemove () {

    },
    add () {
      this.edit({})
    },
    edit (record) {
      this.model = Object.assign({}, record)
      this.visible = true
      this.title = `${record.buildingName}栋-${record.floorName}层-${record.roomName}`
      this.humidity = new HumidityEquip(record.deviceState)
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
.map-drawer-content {
  .item{
    // border-bottom: 1px solid #eee;
    box-shadow: 0 1px 1px 0p #f2f2f2;
    padding-bottom: 10px;
  }
  // .title{
  //   margin-top: 10px;
  //   padding: 10px 12px;
  //   background-color: #eee;
  //   color: #666;
  //   font-size: 14px;
  // }
  .detail{
    padding: 10px;
    .sensors{
      display: inline-block;
      width: 50%;
      text-align: center;
    }
  }
  .sensors p{
    padding: 20px;
    color: #666;
    span{
      font-size: 12px;
    }
    i{
      font-size: 30px;
      color: rgba(5, 100, 184, 0.9);
    }
  }
  // .power{
  //   padding: 10px;
  //   text-align: center;
  // }
  // .action{
  //   padding: 10px;
  // }
}
</style>
