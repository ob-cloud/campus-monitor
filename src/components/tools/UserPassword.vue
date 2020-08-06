<template>
  <a-modal :title="title" :width="modalWidth" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="旧密码">
          <a-input type="password" placeholder="请输入旧密码" v-decorator="[ 'oldpassword', validatorRules.oldpassword]" />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="新密码">
          <a-input type="password" placeholder="请输入新密码" v-decorator="[ 'password', validatorRules.password]" />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="确认新密码">
          <a-input type="password" @blur="handleConfirmBlur" placeholder="请确认新密码" v-decorator="[ 'confirmpassword', validatorRules.confirmpassword]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import md5 from 'md5'
import { updatePassword } from '@/api/system'
import { mapActions } from 'vuex'

export default {
  name: 'UserPassword',
  data () {
    return {
      title: '修改密码',
      modalWidth: 800,
      visible: false,
      confirmLoading: false,
      validatorRules: {
        oldpassword: {
          rules: [{ required: true, message: '请输入旧密码!' }],
        },
        password: {
          rules: [
            { required: true, message: '请输入新密码!' },
            { validator: this.validateToNextPassword }
          ],
        },
        confirmpassword: {
          rules: [
            { required: true, message: '请确认新密码!' },
            { validator: this.compareToFirstPassword }
          ],
        }
      },
      confirmDirty: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      form: this.$form.createForm(this),
      username: '',
    }
  },
  methods: {
    ...mapActions(['Logout']),
    show (uname) {
      if (!uname) {
        return this.$message.warning('当前系统无登陆用户!')
      } else {
        this.username = uname
        this.form.resetFields()
        this.visible = true
      }
    },
    handleCancel () {
      this.close()
    },
    close () {
      this.$emit('close')
      this.visible = false
      this.disableSubmit = false
    },
    handleOk () {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          let { oldpassword, password, confirmpassword } = values
          let params = {
            username: this.username,
            oldpassword: md5(oldpassword),
            password: md5(password),
            confirmpassword: md5(confirmpassword)
          }
          updatePassword(params).then((res) => {
            if (that.$isAjaxSuccess(res.code)) {
              that.$message.success(res.message)
              that.close()
              this.Logout({}).then(() => {
                setTimeout(() => {
                  window.location.reload()
                }, 16)
              }).catch(err => {
                that.$message.error({
                  title: '错误',
                  description: err.message
                })
              })
            } else {
              that.$message.warning(res.message)
            }
          }).finally(() => {
            that.confirmLoading = false
          })
        }
      })
    },
    validateToNextPassword (rule, value, callback) {
      if (value && this.confirmDirty) {
        this.form.validateFields(['confirm'], {
          force: true
        })
      }
      callback()
    },
    compareToFirstPassword (rule, value, callback) {
      if (value && value !== this.form.getFieldValue('password')) {
        callback('两次输入的密码不一样！')
      } else {
        callback()
      }
    },
    handleConfirmBlur (e) {
      const value = e.target.value
      this.confirmDirty = this.confirmDirty || !!value
    }
  }
}
</script>
