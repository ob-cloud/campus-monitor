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

    <template slot="title">
      <div style="width: 100%;">
        <span>{{ title }}</span>
        <span style="display:inline-block;width:calc(100% - 51px);padding-right:10px;text-align: right">
          <a-button @click="toggleScreen" icon="appstore" style="height:20px;width:20px;border:0px"></a-button>
        </span>
      </div>

    </template>

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="用户账号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入用户账号" v-decorator="[ 'username', validatorRules.username]" :readOnly="!!model.id" />
        </a-form-item>

        <template v-if="!model.id">
          <a-form-item label="登陆密码" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input type="password" placeholder="请输入登陆密码" v-decorator="[ 'password', validatorRules.password]" />
          </a-form-item>

          <a-form-item label="确认密码" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input type="password" @blur="handleConfirmBlur" placeholder="请重新输入登陆密码" v-decorator="[ 'confirmpassword', validatorRules.confirmpassword]" />
          </a-form-item>
        </template>

        <a-form-item label="用户名字" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入用户名称" v-decorator="[ 'realname', validatorRules.realname]" />
        </a-form-item>

        <a-form-item label="角色分配" :labelCol="labelCol" :wrapperCol="wrapperCol" v-show="!roleDisabled">
          <a-select
            mode="multiple"
            style="width: 100%"
            placeholder="请选择用户角色"
            optionFilterProp="children"
            v-model="selectedRole"
          >
            <a-select-option v-for="(role,roleindex) in roleList" :key="roleindex.toString()" :value="role.id">
              {{ role.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="头像" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-upload
            listType="picture-card"
            class="avatar-uploader"
            :showUploadList="false"
            :action="uploadAction"
            :data="{'isup':1}"
            :headers="headers"
            :beforeUpload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="picUrl" :src="getAvatarView()" alt="头像" style="height:104px;max-width:300px" />
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'" />
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item label="生日" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-date-picker
            style="width: 100%"
            placeholder="请选择生日"
            v-decorator="['birthday', {initialValue:!model.birthday?null:moment(model.birthday,dateFormat)}]"
          />
        </a-form-item>

        <a-form-item label="性别" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="[ 'sex', {}]" placeholder="请选择性别">
            <a-select-option :value="1">男</a-select-option>
            <a-select-option :value="2">女</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="邮箱" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入邮箱" v-decorator="[ 'email', validatorRules.email]" />
        </a-form-item>

        <a-form-item label="手机号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入手机号码" :disabled="isDisabledAuth('user:form:phone')" v-decorator="[ 'phone', validatorRules.phone]" />
        </a-form-item>

      </a-form>
    </a-spin>

    <div class="drawer-bootom-button" v-show="!disableSubmit">
      <a-popconfirm title="确定放弃编辑？" @confirm="handleCancel" okText="确定" cancelText="取消">
        <a-button style="margin-right: .8rem">取消</a-button>
      </a-popconfirm>
      <a-button @click="handleSubmit" type="primary" :loading="confirmLoading">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
  import pick from 'lodash.pick'
  import moment from 'moment'
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  import { addUser, editUser, queryUserRole, queryAllRole } from '@/api/system'
  // import { disabledAuthFilter } from "@/utils/authFilter"
  import { duplicateCheck } from '@/api/system'
  import { isEmail } from '@/utils/validator'
  import md5 from 'md5'

  export default {
    name: 'UserModal',
    components: {
    },
    data () {
      return {
        roleDisabled: false, //是否是角色维护调用该页面
        modalWidth: 800,
        drawerWidth: 700,
        modaltoggleFlag: true,
        confirmDirty: false,
        userId: '', //保存用户id
        disableSubmit: false,
        dateFormat: 'YYYY-MM-DD',
        validatorRules: {
          username: {
            rules: [{
              required: true, message: '请输入用户账号!'
            },{
              validator: this.validateUsername,
            }]
          },
          password: {
            rules: [{
              required: true,
              pattern:/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/,
              message: '密码由8位数字、大小写字母和特殊符号组成!'
            }, {
              validator: this.validateToNextPassword,
            }],
          },
          confirmpassword: {
            rules: [{
              required: true, message: '请重新输入登陆密码!',
            }, {
              validator: this.compareToFirstPassword,
            }],
          },
          realname: {rules: [{ required: true, message: '请输入用户名称!' }]},
          phone: {rules: [{validator: this.validatePhone}]},
          email: {
            rules: [{
              validator: this.validateEmail
            }],
          },
          roles: {}
        },
        title: '操作',
        visible: false,
        model: {},
        roleList: [],
        selectedRole: [],
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        uploadLoading: false,
        confirmLoading: false,
        headers: {},
        form: this.$form.createForm(this),
        picUrl: '',
        url: {
          fileUpload: window._CONFIG['domianURL'] + '/sys/common/upload',
          imgerver: window._CONFIG['domianURL'] + '/sys/common/view',
          userId: '/sys/user/generateUserId', // 引入生成添加用户情况下的url
        },
      }
    },
    created () {
      const token = Vue.ls.get(ACCESS_TOKEN)
      this.headers = {
        'X-Access-Token': token
      }
    },
    computed:{
      uploadAction () {
        return this.url.fileUpload
      }
    },
    methods: {
      isDisabledAuth (code) {
        console.log(code)
        // return disabledAuthFilter(code)
      },
      //窗口最大化切换
      toggleScreen () {
        this.modalWidth = this.modaltoggleFlag ? window.innerWidth : 800
        this.modaltoggleFlag = !this.modaltoggleFlag;
      },
      initialRoleList () {
        queryAllRole({
          column: '',
          order: true
        }).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.roleList = res.result.records
          } else {
            console.log(res.message)
          }
        })
      },
      loadUserRoles (userid) {
        queryUserRole({
          userid: userid
        }).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.selectedRole = res.result
          } else {
            console.log(res.message)
          }
        })
      },
      refresh () {
          this.userId = ''
      },
      add () {
        this.picUrl = ''
        this.refresh()
        this.edit({activitiSync: false})
      },
      edit (record) {
        this.resetScreenSize() // 调用此方法,根据屏幕宽度自适应调整抽屉的宽度
        this.initialRoleList()
        this.form.resetFields()
        if (record.hasOwnProperty('id')) {
          this.loadUserRoles(record.id)
          this.picUrl = 'Has no pic url yet'
        }
        this.userId = record.id
        this.visible = true
        this.model = Object.assign({}, record)
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'username', 'sex', 'realname', 'email', 'phone', 'activitiSync'))
        })
      },
      close () {
        this.$emit('close')
        this.visible = false
        this.disableSubmit = false
        this.selectedRole = []
      },
      moment,
      handleSubmit () {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            let avatar = that.model.avatar
            values.birthday = values.birthday ? values.birthday.format(this.dateFormat) : ''
            let formData = Object.assign(this.model, values)
            formData.avatar = avatar
            formData.selectedroles = this.selectedRole.length > 0 ? this.selectedRole.join(',') : ''

            if (!this.model.id) {
              formData.id = this.userId
              formData.password = md5(formData.password)
              formData.confirmpassword = md5(formData.confirmpassword)
            }
            let obj = !this.model.id ? addUser(formData) : editUser(formData)
            obj.then((res) => {
              if (this.$isAjaxSuccess(res.code)) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            }).finally(() => {
              that.confirmLoading = false
              that.close()
            })
          }
        })
      },
      handleCancel () {
        this.close()
      },
      validateToNextPassword  (rule, value, callback) {
        const form = this.form
        const confirmpassword = form.getFieldValue('confirmpassword')

        if (value && confirmpassword && value !== confirmpassword) {
          callback('两次输入的密码不一样！')
        }
        if (value && this.confirmDirty) {
          form.validateFields(['confirm'], {
            force: true
          })
        }
        callback()
      },
      compareToFirstPassword (rule, value, callback) {
        const form = this.form
        if (value && value !== form.getFieldValue('password')) {
          callback('两次输入的密码不一样！')
        } else {
          callback()
        }
      },
      validatePhone(rule, value, callback) {
        if (!value) {
          callback()
        } else {
          if (new RegExp(/^1[3|4|5|7|8][0-9]\d{8}$/).test(value)) {
            var params = {
              tableName: 'sys_user',
              fieldName: 'phone',
              fieldVal: value,
              dataId: this.userId
            };
            duplicateCheck(params).then((res) => {
              if (this.$isAjaxSuccess(res.code)) {
                callback()
              } else {
                callback('手机号已存在!')
              }
            })
          } else {
            callback('请输入正确格式的手机号码!')
          }
        }
      },
      validateEmail(rule, value, callback) {
        if (!value) {
          callback()
        } else {
          if (isEmail(value)) {
            var params = {
              tableName: 'sys_user',
              fieldName: 'email',
              fieldVal: value,
              dataId: this.userId
            };
            duplicateCheck(params).then((res) => {
              if (this.$isAjaxSuccess(res.code)) {
                callback()
              } else {
                callback('邮箱已存在!')
              }
            })
          } else {
            callback('请输入正确格式的邮箱!')
          }
        }
      },
      validateUsername(rule, value, callback) {
        var params = {
          tableName: 'sys_user',
          fieldName: 'username',
          fieldVal: value,
          dataId: this.userId
        };
        duplicateCheck(params).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            callback()
          } else {
            callback('用户名已存在!')
          }
        })
      },
      handleConfirmBlur (e) {
        const value = e.target.value
        this.confirmDirty = this.confirmDirty || !!value
      },

      normFile (e) {
        if (Array.isArray(e)) {
          return e
        }
        return e && e.fileList
      },
      beforeUpload(file) {
        var fileType = file.type
        if (fileType.indexOf('image') < 0) {
          this.$message.warning('请上传图片')
          return false
        }
      },
      handleChange (info) {
        this.picUrl = ''
        if (info.file.status === 'uploading') {
          this.uploadLoading = true
          return
        }
        if (info.file.status === 'done') {
          var response = info.file.response
          this.uploadLoading = false
          console.log(response)
          if (this.$isAjaxSuccess(response.code)) {
            this.model.avatar = response.result.url
            this.picUrl = 'Has no pic url yet'
          } else {
            this.$message.warning(response.message)
          }
        }
      },
      getAvatarView() {
        // return this.url.imgerver + '/' + this.model.avatar
        return this.model.avatar
      },

      // 根据屏幕变化,设置抽屉尺寸
      resetScreenSize() {
        let screenWidth = document.body.clientWidth
        this.drawerWidth = screenWidth < 500 ? screenWidth : 700
      },
    }
  }
</script>

<style scoped>
  .avatar-uploader > .ant-upload {
    width:104px;
    height:104px;
  }
  .ant-upload-select-picture-card i {
    font-size: 49px;
    color: #999;
  }

  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }

  .ant-table-tbody .ant-table-row td{
    padding-top:10px;
    padding-bottom:10px;
  }

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
