<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
          <a-col :span="12">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="模板CODE"
              style="margin-right: -35px"
            >
              <a-input
                :disabled="disable"
                placeholder="请输入模板编码"
                v-decorator="['templateCode', validatorRules.templateCode ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="模板类型">
              <dict-select-tag @change="handleChangeTemplateType" :triggerChange="true" dictCode="msgType" v-decorator="['templateType', validatorRules.templateType ]" placeholder="请选择模板类型">
              </dict-select-tag>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row" :gutter="24">
          <a-col :span="24" pull="2">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="模板标题" style="margin-left: -15px">
              <a-input placeholder="请输入模板标题" v-decorator="['templateName', validatorRules.templateName]" style="width: 122%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row" :gutter="24">
          <a-col :span="24" pull="4">
            <a-form-item v-show="!useEditor" :labelCol="labelCol" :wrapperCol="wrapperCol" label="模板内容" style="margin-left: 4px; width: 126%">
              <a-textarea placeholder="请输入模板内容" v-decorator="['templateContent', validatorRules.templateContent ]" :autosize="{ minRows: 8, maxRows: 8 }" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row" :gutter="24">
          <a-col :span="24" pull="4">
            <a-form-item v-show="useEditor" :labelCol="labelCol" :wrapperCol="wrapperCol" label="模板内容" style="margin-left: 4px;width: 126%">
              <editor v-model="templateEditorContent"></editor>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import { httpAction } from '@/utils/ajax'
  import { duplicateCheck } from '@/api/system'
  import Editor from '@/components/Pro/Editor'
  import DictSelectTag from '@/components/Pro/DictSelectTag'

  export default {
    name: 'SysMessageTemplateModal',
    components:{
      Editor,
      DictSelectTag
    },
    data () {
      return {
        title: '操作',
        visible: false,
        disable: true,
        model: {},
        labelCol: {
          xs: {
            span: 24
          },
          sm: {
            span: 5
          },
        },
        wrapperCol: {
          xs: {
            span: 24
          },
          sm: {
            span: 16
          },
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          templateCode: {
            rules: [{
              required: true,
              message: '请输入模板CODE!'
            }, {
              validator: this.validateTemplateCode
            }]
          },
          templateName: {
            rules: [{
              required: true,
              message: '请输入模板标题!'
            }]
          },
          templateContent: {
            rules: []
          },
          templateType: {
            rules: [{
              required: true,
              message: '请输入模板类型!'
            }]
          },
        },
        url: {
          add: '/message/sysMessageTemplate/add',
          edit: '/message/sysMessageTemplate/edit',
        },
        useEditor: false,
        templateEditorContent: ''
      }
    },
    created () {
    },
    methods: {
      add () {
        this.disable = false
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.model = Object.assign({ remark: ' '}, record)
        this.useEditor = (record.templateType == 2 || record.templateType == 4)
        this.templateEditorContent = this.useEditor ? record.templateContent : ''
        this.visible = true
        this.$nextTick(() => {
          if (this.useEditor) {
            this.form.setFieldsValue(pick(this.model, 'templateCode', 'templateName', 'templateTestJson', 'templateType'))
          } else {
            this.form.setFieldsValue(pick(this.model, 'templateCode', 'templateContent', 'templateName', 'templateTestJson', 'templateType'))
          }
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
        this.disable = true
      },
      handleOk() {
        this.model.templateType = this.templateType
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            let httpurl = !this.model.id ? this.url.add : this.url.edit
            let method = !this.model.id ? 'post' : 'put'
            let formData = Object.assign(this.model, values)
            if (this.useEditor) {
              formData.templateContent = this.templateEditorContent
            }
            httpAction(httpurl, formData, method).then((res) => {
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
      validateTemplateCode(rule, value, callback) {
        var params = {
          tableName: 'sys_sms_template',
          fieldName: 'template_code',
          fieldVal: value,
          dataId: this.model.id
        }
        duplicateCheck(params).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            callback()
          } else {
            callback(res.message)
          }
        })
      },
      handleCancel() {
        this.close()
      },
      handleChangeTemplateType(value) {
        //如果是邮件类型那么则改变模板内容是富文本编辑器
        this.useEditor = (value == 2 || value == 4)
      }
    }
  }
</script>

<style scoped>

</style>
