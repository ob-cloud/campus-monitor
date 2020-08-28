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
    <a-layout>
      <a-layout-sider width="200px" theme="light">
        <key-panel @on-selected="onKeySelected"></key-panel>
      </a-layout-sider>
      <a-layout-content>
        <a-row>
          <a-col :span="10">
            <a-card class="box-card" shadow="never">
              <div slot="header" class="clearfix">
                <span>灯组</span>
              </div>
              <div class="card-content" style="height: 290px; overflow-y:auto;">
                <a-spin :spinning="lampGroupLoading">
                  <a-checkbox-group v-model="checkboxGroup">
                    <a-checkbox-button class="card-item" v-for="(item, index) in lampGroupList" :label="item.groupNum" :key="index" @click.native="onClickLampItem(item)">
                      <p><i class="el-icon-s-opportunity"></i></p>
                      <p>{{ item.name }}</p>
                    </a-checkbox-button>
                  </a-checkbox-group>
                </a-spin>
              </div>
            </a-card>
          </a-col>
          <a-col :span="14">
            <a-card shadow="never" class="slider-wrapper">
              <div slot="header" class="clearfix">
                <span>设置</span>
              </div>
              <div class="card-footer" style="height: 290px; overflow-y:auto;">
                <a-spin :spinning="lampGroupLoading">
                  <div class="wrapper" v-for="(item, index) in checkboxGroupList" :key="index">
                    <a-row :gutter="40">
                      <a-col :span="12">
                        <span class="text">亮度</span>
                        <a-slider class="slider" v-model="item.light" :marks="{0: '0', 100: '100'}"></a-slider>
                      </a-col>
                      <a-col :span="12">
                        <span class="text">色度</span>
                        <a-slider class="slider" v-model="item.temp" :min="0" :max="100" :marks="{0: '0', 100: '100'}"></a-slider>
                      </a-col>
                    </a-row>
                  </div>
                </a-spin>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-layout-content>
    </a-layout>

    <div class="drawer-bootom-button" v-show="!disableSubmit">
      <a-popconfirm title="确定放弃编辑？" @confirm="handleCancel" okText="确定" cancelText="取消">
        <a-button style="margin-right: .8rem">取消</a-button>
      </a-popconfirm>
      <a-button @click="handleOk" type="primary" :loading="confirmLoading">提交</a-button>
    </div>
  </a-drawer>
</template>


<script>
import KeyPanel from '@/components/IoT/KeyPanel'
import { getGroupListByPanelId, getGrouplListPanelKey, setPanelKey } from '@/api/device'
export default {
  components: { KeyPanel },
  data () {
    return {
      drawerWidth: 500,
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

      lampGroupLoading: false,
      lampGroupList: [],
      checkboxGroup: [],
      selectedLampGroupItem: '',

      selectedPanelKeyIndex: '',
      keyList: [],
      checkboxGroupList: []
    }
  },
  watch: {
    checkboxGroup (group) {
      if (!group.length) {
        this.checkboxGroupList = []
        return
      }
      if (group.length && !this.checkboxGroupList.length) {
        this.checkboxGroupList = group.map(item => {
          const target = this.lampGroupList.find(it => it.groupNum === item)
          return {
            groupNum: item,
            ...target
          }
        })
        return
      }
      let groupList = []
      if (group.length <= this.checkboxGroupList.length) {
        groupList = group.map(item => this.checkboxGroupList.find(it => it.groupNum === item))
      } else {
        groupList = group.map(item => {
          const t = this.checkboxGroupList.find(it => it.groupNum === item)
          return t || {groupNum: item}
        })
      }

      this.checkboxGroupList = groupList.map(item => {
        const target = this.lampGroupList.find(it => it.groupNum === item.groupNum)
        return {
          ...item,
          ...target
        }
      })
    }
  },
  methods: {
    add () {
      this.edit({})
    },
    show (record) {
      this.model = Object.assign({}, record)
      this.visible = true
      this.title = `面板配置（${record.name}-${record.serialId}）`
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
      const params = {
        serialId: this.serialId,
        index: this.selectedPanelKeyIndex
      }
      const groupStatus = this.checkboxGroupList.map(item => {
        return {
          groupNum: item.groupNum,
          light: item.light,
          temp: item.temp
        }
      })
      params.groupStatus = {list: groupStatus}
      setPanelKey(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('设置成功')
          this.$emit('ok')
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.confirmLoading = false
        this.close()
      })
    },
    onClickLampItem (item) {
      this.selectedLampGroupItem = item
    },
    onKeySelected (item) {
      this.selectedPanelKeyIndex = item
      this.checkboxGroupList = []
      this.checkboxGroup = []
      this.getPanelGroupList().then(() => {
        this.getGrouplListPanelKey(item)
      })
    },
    getPanelGroupList () {
      this.lampGroupLoading = true
      return getGroupListByPanelId(this.model.serialId).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.lampGroupList = res.result.records
        }
        this.lampGroupLoading = false
      })
    },
    getGrouplListPanelKey (index) {
      getGrouplListPanelKey(this.model.serialId, index).then(res => {
         if (this.$isAjaxSuccess(res.code)) {
          const result = res.result.records
          this.keyList = result
          this.lampGroupList = this.extendsGroupList(result, this.lampGroupList)
          this.checkboxGroup = result.map(item => item.groupNum)
        }
      })
    },
    extendsGroupList (sourceList, targetList) {
      const a = targetList.map(element => {
        const it = sourceList.find(item => item.groupNum === element.groupNum)
        return {...element, ...it}
      })
      return a
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
