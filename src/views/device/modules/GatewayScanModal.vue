<template>
  <a-modal :title="title" :width="800" :visible="visible" :confirmLoading="confirmLoading" @cancel="handleClose">
    <template slot="footer">
      <a-button v-if="cancelText" key="back" :disabled="confirmLoading" @click="handleCancel">{{ cancelText }}</a-button>
      <a-button key="submit" type="primary" :loading="confirmLoading" @click="handleOk">确定</a-button>
    </template>
    <a-spin :spinning="confirmLoading" :tip="loadingTips">
      <a-steps :current="current" progress-dot>
        <a-step key="1" title="" />
        <a-step key="2" title="" />
      </a-steps>
      <div class="steps-content">
        <a-form :form="form" v-show="current === 0">
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="网络类型">
            <a-radio-group v-model="type">
              <a-radio :value="1">无线</a-radio>
              <a-radio :value="2">有线</a-radio>
            </a-radio-group>
          </a-form-item>
          <template v-if="type === 1">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="WIFI名称">
              <a-input placeholder="请输入WIFI名称" v-decorator="[ 'ssid', validatorRules.ssid]" />
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="WIFI密码">
              <a-input placeholder="请输入WIFI密码" v-decorator="[ 'password', validatorRules.password]" />
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="路由器">
              <a-input placeholder="请输入路由器bssid" v-decorator="[ 'bssid', validatorRules.bssid]" />
            </a-form-item>
          </template>
        </a-form>
        <div v-if="current === 1" class="scan-result">
          <div style="text-align: center;" v-if="!confirmLoading && !oboxList.length">没有找到OBOX</div>
          <a-card class="box" v-for="(item, index) in oboxList" :key="index">
            <p>{{ item }}</p>
          </a-card>
        </div>
      </div>

    </a-spin>
  </a-modal>
</template>

<script>
import { addWiredObox, addWirelessObox, } from '@/api/device'
export default {
  data () {
    return {
      title: '添加网关',
      visible: false,
      current: 0,
      type: 1,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      loadingTips: '',
      form: this.$form.createForm(this),
      validatorRules: {
        ssid: { rules: [{ required: true, message: 'wifi名称不能空!' }] },
        password: { rules: [{ required: true, message: 'wifi密码不能空!' }] },
        bssid: { rules: [{ required: true, message: '路由器bssid不能空!' }] },
      },
      timePicker: null,
      scanTimeout: 10000,
      oboxList: [],
      cancelText: null
    }
  },
  mounted () {
    // 订阅WebSocket设备扫描信息
    this.$bus.$on('obox-connected', (record) => {
      if (!record.serialId) {
        this.timePicker && clearTimeout(this.timePicker)
        return this.confirmLoading = false
      }
      !this.oboxList.includes(record.serialId) && this.oboxList.push(record.serialId)
    })
    this.$bus.$on('obox-connected-fail', () => {
      this.timePicker && clearTimeout(this.timePicker)
      this.confirmLoading = false
    })
  },
  methods: {
    add () {
      this.edit({})
    },
    edit () {
      this.form.resetFields()
      this.visible = true
    },
    // 确定
    handleOk () {
      if (this.current === 1) {
        this.$emit('ok')
        this.close()
        return
      }
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          that.loadingTips = '扫描OBOX中...'
          const formData = Object.assign({}, values)
          that.current++
          console.log(formData)
          that.cancelText = '返回'
          setTimeout(() => {
            this.scan(formData.ssid ? 0 : 1, formData)
          }, 1000)
        }
      })
    },
    clearScanLoading () {
      this.timePicker = setTimeout(() => {
        this.confirmLoading = false
        this.loadingTips = ''
      }, this.scanTimeout)
    },
    scan (isWired, params) {
      const obj = isWired ? addWiredObox() : addWirelessObox(params.ssid, params.password, params.bssid)
      obj.then((res) => {
        if (this.$isAjaxSuccess(res.code)) {
          this.clearScanLoading()
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        // this.confirmLoading = false
        // this.loadingTips = ''
      })
    },
    // 关闭
    handleCancel () {
      // this.close()
      this.reset()
    },
    handleClose () {
      if (this.confirmLoading) {
        const that = this
        this.$confirm({
          content: '正在扫描添加OBOX，确认退出？',
          onOk() {
            that.confirmLoading = false
            that.close()
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
      this.reset()
    },
    reset () {
      this.current = 0
      this.loadingTips = ''
      this.cancelText = null
      if (this.type === 2) {
        this.form.resetFields()
        this.form.clearField()
      }
      this.type = 1
    }
  },
}
</script>

<style lang="less" scoped>
.steps-content{
  padding: 20px;
}
.box {
  width: 110px;
  border-radius: 6px;
  display: inline-block;
  margin: 0 10px 10px 0;
  text-align: center;
  p {
    margin: 0;
  }
}
.scan-result{
  height: 100px;
  padding: 10px 30px;
  width: 90%;
  margin: 0 auto;
}
</style>
