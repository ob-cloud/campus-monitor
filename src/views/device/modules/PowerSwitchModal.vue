<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :height="drawerWidth"
    placement="bottom"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
  >
    <div class="power-group">
      <iot-switch v-model="powers" :serialId="serialId" :state="state"></iot-switch>
    </div>
  </a-drawer>
</template>
<script>
import IotSwitch from '@/components/IoT/Switch'
import ActionMixin from '@/utils/mixins/ActionMixin'
import { editSwitchStatus } from '@/api/device'
import { Descriptor } from 'hardware-suit'
export default {
  components: { IotSwitch },
  mixins: [ ActionMixin ],
  data () {
    return {
      drawerWidth: 500,
      title: "总开关",
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
      powers: [],
      serialId: '',
      state: '',
      powerStatus: [0, 0, 0]
    }
  },
  watch: {
    powers (val) {
      // console.log('---- ', val)
      this.handlePower(val[0])
    }
  },
  methods: {
    show (record) {
      this.model = Object.assign({}, record)
      this.visible = true
      this.title = `开关 - ${Descriptor.getTypeDescriptor(record.device_type, record.device_child_type)}(${record.serialId})`
      this.serialId = this.model.serialId
      this.state = this.model.state
    },
    close () {
      this.$emit('close')
      this.visible = false
    },
    handleCancel () {
      this.close()
    },
    handleOk () {
      this.$emit('ok')
      this.handleCancel()
    },
    changeStatus (power) {
      this.powerStatus.fill(power)
    },
    handlePower (item) {
      this.changeStatus(+item)
      const status = this.getSwitchButtonStatus(this.powerStatus)
      if (!this.model.serialId) return
      editSwitchStatus(this.model.serialId, status).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('设置成功')
          // this.$emit('ok')
        } else {
          this.$message.error(res.message)
          // reset powers when fail
          // this.powers = [+!item]
        }
      }).finally(() => {
        // this.powers = [+!item]
        // this.close()
      })
    }
  },
}
</script>
<style lang="less">
.power-group{
  width: 360px;
  height: 300px;
  border: 1px solid #ccc;
  margin: 0 auto;
  text-align: center;
  padding: 40px 10px;
  -webkit-box-shadow: 1px 1px 1px 1px #f5f5f5;
  box-shadow: 1px 1px 1px 1px #f5f5f5;
  background-color: #f7f7f7;
  border-radius: 12px;
  position: relative;

  .ant-checkbox-group{
    position: absolute;
    left: 50%;
    top: 40%;
    transform: translateX(-50%)
  }
}
.power-group .ant-checkbox-wrapper span.ant-checkbox {
  display: none;
}
.power-group .ant-checkbox-wrapper span{
  display: inline-block;
  border: 1px solid;
  border-radius: 2px;
  transition: all .3s;

  > i{
    font-size: 30px;
  }
}
.power-group .ant-checkbox-wrapper-checked span{
  color: #dd0b0b;
  background-color: #fff;
  border-color: #d8d815;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
  // box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
  text-shadow: 0 -2px 0 #d8d815;
  // box-shadow: 0px -4px 7px 2px #d8d815;
}
</style>
