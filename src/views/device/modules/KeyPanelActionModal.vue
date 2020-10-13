<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :height="drawerWidth"
    placement="bottom"
    :closable="true"
    :destroyOnClose="true"
    @close="handleCancel"
    :visible="visible"
  >
    <a-layout>
      <a-layout-sider width="200px" theme="light">
        <key-panel @on-selected="onKeySelected"></key-panel>
      </a-layout-sider>
      <a-layout-content>
        <a-row :gutter="0">
          <a-col :span="10">
            <a-card class="box-card" shadow="never">
              <div slot="title" class="clearfix">
                <span>灯组</span>
              </div>
              <div class="card-content" style="height: 290px; overflow-y:auto;">
                <a-spin :spinning="lampGroupLoading">
                  <a-checkbox-group v-model="checkboxGroup" class="checkbox-list">
                    <a-checkbox class="checkbox-list-item" v-for="(item, index) in lampGroupList" :value="item.groupNum" :key="index" @click.native="onClickLampItem(item)">
                      <p><i class="el-icon-s-opportunity"></i></p>
                      <p>{{ item.name }}</p>
                    </a-checkbox>
                  </a-checkbox-group>
                </a-spin>
              </div>
            </a-card>
          </a-col>
          <a-col :span="14">
            <a-card shadow="never" class="slider-wrapper">
              <div slot="title" class="clearfix">
                <span>设置</span>
              </div>
              <div class="card-footer" style="height: 290px; overflow-y:auto;">
                <a-spin :spinning="lampGroupLoading">
                  <div class="wrapper" v-for="(item, index) in checkboxGroupList" :key="index">
                    <a-row :gutter="40" class="row">
                      <a-col :span="1" style="padding: 0"><span class="circle" :title="item.name">{{ item.name }}</span></a-col>
                      <a-col :span="12">
                        <span class="text">亮度</span>
                        <a-slider class="slider" v-model="item.light" :min="0" :max="100" :marks="{0: '0', 100: '100'}"></a-slider>
                      </a-col>
                      <a-col :span="11">
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
import { Descriptor } from 'hardware-suit'
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
      if (groupList && groupList.length && groupList[0]) {
        this.checkboxGroupList = groupList.map(item => {
          const target = this.lampGroupList.find(it => it.groupNum === item.groupNum)
          return {
            ...item,
            ...target
          }
        })
      }

    }
  },
  methods: {
    add () {
      this.edit({})
    },
    show (record) {
      this.model = Object.assign({}, record)
      this.visible = true
      this.title = `${Descriptor.getTypeDescriptor(record.device_type, record.device_child_type)}（${record.serialId}）`
    },
    close () {
      this.$emit('close')
      this.disableSubmit = false
      this.visible = false
      this.reset()
    },
    handleCancel () {
      this.close()
    },
    reset () {
      this.lampGroupList = []
      this.checkboxGroup = []
      this.keyList = []
      this.checkboxGroupList = []
    },
    handleOk () {
      const params = {
        serialId: this.model.serialId,
        index: this.selectedPanelKeyIndex
      }
      const groupStatus = this.checkboxGroupList.map(item => {
        return {
          groupNum: item.groupNum,
          light: item.light || 0,
          temp: item.temp || 0
        }
      })
      params.groupStatus = {list: groupStatus}
      setPanelKey(params).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.$message.success('设置成功')
          // this.$emit('ok')
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.confirmLoading = false
        // setTimeout(() => this.close(), 2000)

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
          this.lampGroupList = res.result
        }
        this.lampGroupLoading = false
      })
    },
    getGrouplListPanelKey (index) {
      getGrouplListPanelKey(this.model.serialId, index).then(res => {
         if (this.$isAjaxSuccess(res.code)) {
          const result = res.result
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
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
  border-radius: 0 0 2px 2px;
}
.row{
  border: 1px solid #f1f1f1;
  padding: 4px 10px;
  border-radius: 6px;
  margin-left: 0!important;
  margin-right: 0!important;
  margin-bottom: 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
  // box-shadow: 1px 1px 3px 0px #f2f2f2;
}
.circle{
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: 22px;
  height: 22px;
  border: 1px solid #000;
  border-radius: 50%;
  text-align: center;
  background: #000;
  color: #fff;
  font-size: 13px;
  margin-top: 24px;
  user-select: none;
  &::after {
    display: inline-block;
    content: ' ';
    width: 1px;
    height: 20px;
    background: #f2f2f2;
    margin-left: 12px;
    position: absolute;
  }
}
</style>
<style lang="less">
.checkbox-list{
  .checkbox-list-item + .checkbox-list-item{
    margin: 0;
  }
  .checkbox-list-item span{
    display: inline-block;
    width: 150px;
    height: 120px;
    border: 1px solid #3A4257;
    border-radius: 6px;
    margin: 10px;
    text-align: center;
    padding: 10px;
    overflow: hidden;
  }
  .checkbox-list-item p{
    &:first-child{
      font-size: 16px;
      padding: 10px;
      color: #000;
      font-weight: 600;
    }
    padding: 2px;
  }
  .checkbox-list-item.ant-checkbox-wrapper-checked span{
    background: #e6f7ff;
  }
  .ant-checkbox-wrapper span.ant-checkbox {
    display: none;
  }
  .ant-checkbox-wrapper-checked span{
    background: #e6f7ff;
  }
}
</style>
