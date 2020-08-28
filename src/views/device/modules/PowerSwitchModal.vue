<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :width="drawerWidth"
    placement="right"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
  >

    <!-- <template slot="title">
      <div style="width: 100%;">
        <span>{{ title }}</span>
        <span style="display:inline-block;width:calc(100% - 51px);padding-right:10px;text-align: right">
          <a-button icon="appstore" style="height:20px;width:20px;border:0px"></a-button>
        </span>
      </div>
    </template> -->

    <!-- <div :class="clazz">
      <a-checkbox-group v-model="powers">
        <a-checkbox-button v-for="(item, index) in 1" :label="index+1" :key="index" @change="handleSelected">
          <i class="obicon obicon-switch-btn"></i>
        </a-checkbox-button>
      </a-checkbox-group>
    </div> -->

    <div class="drawer-bootom-button" v-show="!disableSubmit">
      <a-popconfirm title="确定放弃编辑？" @confirm="handleCancel" okText="确定" cancelText="取消">
        <a-button style="margin-right: .8rem">取消</a-button>
      </a-popconfirm>
      <a-button @click="handleOk" type="primary" :loading="confirmLoading">提交</a-button>
    </div>
  </a-drawer>
</template>


<script>
export default {
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
      form: this.$form.createForm(this),
    }
  },
  methods: {
    add () {
      this.edit({})
    },
    edit (record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.visible = true
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
    },
    // isLightActive (status) {
    //   if (!status) return false
    //   const state = status.slice(0, 2)
    //   return state !== '00'
    // },
    // changeStatus (power) {
    //   this.powerStatus.fill(power)
    // },
    // handleSelected (item) {
    //   this.changeStatus(+item)
    //   const status = panelHandler.getSwitchButtonStatus(this.powerStatus)
    //   if (!this.serialId) return
    //   DeviceAPI.setSwitchStatus(this.serialId, status).then(res => {
    //     if (res.message.includes('success')) {
    //       this.$message({
    //         type: 'success',
    //         message: this.$t('smart.obox.message', {MESSAGE: 'setSuccess'})
    //       })
    //       this.$emit('switcher-change', this.serialId, status)
    //     } else {
    //       this.$message({
    //         type: 'error',
    //         message: this.$t('smart.obox.message', {MESSAGE: 'setFail'})
    //       })
    //       // reset powers when fail
    //       this.powers = [+!item]
    //     }
    //   }).catch(() => {
    //     this.$message({
    //       type: 'error',
    //       message: this.$t('message.exception')
    //     })
    //   })
    // }
  },
}
</script>
