<template>
  <a-modal :title="title" :width="900" :visible="visible" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <div class="table-page-search-wrapper">
      <a-form :form="form" layout="inline">
        <a-row :gutter="24">
          <a-col :md="8" :sm="8">
            <a-form-item label="网关">
              <a-select placeholder="请选择网关" allowClear v-decorator="[ 'oboxSerialId', validatorRules.oboxSerialId]">
                <a-select-option v-for="item in oboxList" :key="item.obox_serial_id" :value="item.obox_serial_id">
                  {{ item.obox_name }}（{{ item.obox_status === 1 ? '在线' : '离线' }}）
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="8" :sm="12">
            <a-form-item label="序列号">
              <a-input placeholder="输入设备序列号" v-decorator="[ 'serialId' ]"></a-input>
            </a-form-item>
          </a-col>

          <!-- <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="设备名称">
                <a-input placeholder="请输入设备名称" v-model="queryParam.name"></a-input>
              </a-form-item>
            </a-col>
          </template> -->

          <a-col :md="8" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">扫描</a-button>
              <a-button type="primary" :disabled="!confirmLoading" @click="searchPause" icon="stop" style="margin-left: 8px">停止</a-button>
              <!-- <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button> -->
              <!-- <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a> -->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <a-card style="height: 400px; overflow-y: auto;" class="ant-spin-nested-loading">
      <div style="text-align: center;" v-if="!confirmLoading && !scanDeviceListFromWebsocket.length">暂无设备</div>
      <a-spin :spinning="confirmLoading" :tip="scanTips">
        <a-card class="box" size="small" v-for="(item, index) in scanDeviceListFromWebsocket" :key="index">
          <p>{{ item.deviceId }}</p>
          <p>{{ Descriptor.getTypeDescriptor(item.deviceType) }}</p>
          <p>{{ Descriptor.getTypeDescriptor(item.deviceType, item.deviceChildType) }}</p>
        </a-card>
        <!-- <div v-else>暂无设备</div> -->
      </a-spin>
    </a-card>
  </a-modal>
</template>

<script>
import { scanAndSaveDevicesToObox, pauseScanDevices, getAllOboxList } from '@/api/device'
import { Descriptor } from 'hardware-suit'
export default {
  data () {
    return {
      title: '扫描设备',
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
        oboxSerialId: { rules: [{ required: true, message: '请选择网关!' }] },
      },
      oboxList: [],
      oboxSerialId: '',
      scanDeviceListFromWebsocket: [],
      scanTimeout: 60000,
      timePicker: null,
      scanTips: '扫描设备中...',
      Descriptor
    }
  },
  mounted () {
    // 订阅WebSocket设备扫描信息
    this.$bus.$on('scan', (record) => {
      // if (!record.result) {
      //   this.timePicker && clearTimeout(this.timePicker)
      //   return this.confirmLoading = false
      // }
      record.result && this.scanDeviceListFromWebsocket.push(record.result)
    })
  },
  methods: {
    getOboxList () {
      getAllOboxList().then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.oboxList = res.result
        }
      })
    },
    searchQuery () {
      const that = this
      this.scanDeviceListFromWebsocket = []
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          let formData = Object.assign(that.model, values)
          that.oboxSerialId = formData.oboxSerialId
          scanAndSaveDevicesToObox(formData.oboxSerialId, formData).then(res => {
            if (this.$isAjaxSuccess(res.code)) {
              // console.log('scan  ', res)
              // that.$message.success(`设备已扫描并添加到OBox(${that.oboxSerialId})中`)
              // that.handleOk()
              // that.scanTips = '扫描设备中...'
              that.clearScanLoading()
            } else {
              that.$message.warning(res.message)
            }
          }).catch(() => that.confirmLoading = false)
          // .finally(() => {
          //   that.confirmLoading = false
          // })
        }
      })
    },
    // 反序列号，123456 --> 563412| eeec1ea281 -> 81a21eecee
    deSerial (serialId) {
      const serial = serialId.split('').reverse()
      serial.forEach((item, index) => {
        if((index + 1) % 2 === 0) {
          var t = serial[index-1]
          serial[index-1] = item
          serial[index] = t
        }
      })
      return serial.join('')
    },
    clearScanLoading () {
      this.timePicker = setTimeout(() => {
        this.confirmLoading = false
      }, this.scanTimeout)
    },
    searchPause () {
      if (!this.oboxSerialId) return
      return pauseScanDevices(this.oboxSerialId).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('已停止扫描')
        } else {
          this.$message.error(res.message)
        }
      }).finally(() => this.confirmLoading = false)
    },
    add () {
      this.edit({})
    },
    edit (record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true
      this.getOboxList()
    },
    // 确定
    handleOk () {
      this.$emit('ok')
      this.close()
    },
    // 关闭
    // handleCancel () {
    //   this.close()
    // },
    handleCancel () {
      if (this.confirmLoading) {
        const that = this
        this.$confirm({
          content: '正在扫描添加设备，确认退出？',
          onOk() {
            that.searchPause().then(() => that.close())
          },
          cancelText: '取消'
        })
      } else {
        this.close()
      }
    },
    close () {
      this.$emit('close')
      this.visible = false
      this.scanDeviceListFromWebsocket = []
    }
  },
}
</script>

<style lang="less" scoped>
.box {
  width: 180px;
  border-radius: 6px;
  display: inline-block;
  margin: 0 10px 10px 0;
  text-align: center;
}
</style>
