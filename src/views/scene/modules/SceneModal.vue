<template>
  <a-modal :title="title" :width="900" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭" :destroyOnClose="true">
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="sceneForm" :rules="sceneModelRules" :model="sceneModel">
        <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="场景名称" prop="scene_name">
          <a-input placeholder="请输入场景名称" v-model="sceneModel.scene_name" />
        </a-form-model-item>

        <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="位置" class="location" prop="location.buildingId">
          <a-row>
            <a-col :span="8">
              <a-select placeholder="请选择楼栋" v-model="sceneModel.location.buildingId" allowClear :disabled="!!this.sceneNumber">
                <a-select-option v-for="item in buildingList" :key="item.buildingId" :value="item.buildingId">
                  {{ item.buildingName }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="7" :offset="1">
              <a-select placeholder="请选择楼层" v-model="sceneModel.location.floorId" allowClear :disabled="!!this.sceneNumber">
                <a-select-option v-for="item in floorList" :key="item.floorId" :value="item.floorId">
                  {{ item.floorName }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="7" :offset="1">
              <a-select placeholder="请选择教室" v-model="sceneModel.location.roomId" allowClear :disabled="!!this.sceneNumber">
                <a-select-option v-for="item in roomList" :key="item.roomId" :value="item.roomId">
                  {{ item.roomName }}
                </a-select-option>
              </a-select>
            </a-col>
          </a-row>
        </a-form-model-item>

        <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="设备条件" class="box-card">
          <scene-condition-block ref="conditionModal"></scene-condition-block>
        </a-form-model-item>

        <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="设备行为">
          <scene-action-block ref="actionBlockModal"></scene-action-block>
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { getSmartSceneById, addSmartScene, editSmartScene } from '@/api/scene'
import SceneMixin from '../SceneMixin'
import SceneConditionBlock from './SceneConditionBlock'
import SceneActionBlock from './SceneActionBlock'
export default {
  components: { SceneConditionBlock, SceneActionBlock },
  mixins: [ SceneMixin ],
  data () {
    return {
      title: '操作',
      visible: false,
      queryParam: {},
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
      sceneModel: this.initSceneModel(),
      sceneModelRules: {
        scene_name: [{ required: true, trigger: 'blur', message: '场景名称不能为空!'}],
        'location.buildingId': [{ required: true, trigger: 'change', message: '楼栋不能为空'}],
      },
      isEditScene: false,
      loadingEditData: false,
      sceneNumber: ''
    }
  },
  watch: {
    'sceneModel.location.buildingId' (id) {
      this.handleBuildingChange(id)
    },
    'sceneModel.location.floorId' (id) {
      this.handleFloorChange(id)
    },
    'sceneModel.location.roomId' (id) {
      this.handleRoomChange(id)
    }
  },
  methods: {
    initSceneModel () {
      return {
        scene_type: '00',
        scene_status: '01',
        scene_number: 0, // create 0
        scene_name: '',
        scene_group: '00',
        msg_alter: 0,
        actions: [], // device behaviors
        conditions: [], // device conditions
        location: {
          buildingId: undefined,
          floorId: undefined,
          roomId: undefined
        }
      }
    },
    handleBuildingChange (id) {
      if (!this.isEditScene) {
        this.sceneModel.location.floorId = undefined
        this.sceneModel.location.roomId = undefined
      }
      this.floorList = []
      this.roomList = []
      this.getFloorList(id)
      this.$refs.actionBlockModal.getFloorList(id)
      this.$refs.actionBlockModal.resetActionTypeList()
    },
    handleFloorChange (id) {
      !this.isEditScene && (this.sceneModel.location.roomId = undefined)
      this.roomList = []
      this.getRoomList(id)
      this.$refs.actionBlockModal.getRoomList(id)
      this.$refs.actionBlockModal.resetActionTypeList()
    },
    handleRoomChange (id) {
      if (!id) return this.$refs.actionBlockModal.resetActionTypeList()
      const list = this.$refs.actionBlockModal.getTypeListByRoom(id)
      this.$refs.actionBlockModal.setActionTypeList(list)
      this.isEditScene = false // after finishing rendering location, reset isEditScene variable
    },
    // 设备行为类型去重
    uniqList (list, aliasType = 'deviceType') {
      const uniq = []
      const uniqType = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        if (!uniqType[element[aliasType]]) {
          uniqType[element[aliasType]] = true
          uniq.push(element)
        }
      }
      return uniq
    },
    hasEmptyAction (actions) {
      return !actions || !actions.length || actions.findIndex(item => !item || !Object.keys(item).length || !item.action) > -1
    },
    getLocation () { // get validable location
      const location = {...this.sceneModel.location}
      // const location = { buildingId: this.buildingId, floorId: this.floorId, roomId: this.roomId}
      // location.buildingId === '' && delete location.buildingId
      // location.floorId === '' && delete location.floorId
      // location.roomId === '' && delete location.roomId
      return location
    },
    getSceneDataBySceneNumber () { // init sceneModel data
      if (!this.sceneNumber) return
      getSmartSceneById(this.sceneNumber).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.sceneModel.location = res.result.location || {}
          this.sceneModel.scene_type = res.result.scene_type || '00'
          this.sceneModel.scene_status = res.result.scene_status || '01'
          this.sceneModel.scene_number = res.result.scene_number || this.sceneNumber
          this.sceneModel.scene_name = res.result.scene_name || ''
          this.sceneModel.scene_group = res.result.scene_group || '00'
          this.sceneModel.msg_alter = res.result.msg_alter || 0

          this.$refs.conditionModal.toConditionList(res.result.conditions)
          setTimeout(() => {
            this.$refs.actionBlockModal.toActionList(res.result.actions)
          }, 0)
        }
        this.loadingEditData = false
      })
    },
    add () {
      this.edit({})
    },
    edit (record) {
      this.initSceneModel()
      this.model = Object.assign({}, record)
      this.sceneNumber = record.sceneNumber
      this.visible = true

      this.getSceneDeviceList().then((buildingList) => {
        if (this.sceneNumber) { // when there is a sceneNumber, It's in an editable mode
          this.isEditScene = true
          this.loadingEditData = true
          this.getSceneDataBySceneNumber()
        } else {
          this.isEditScene = false
        }
        this.$refs.actionBlockModal.buildingList = buildingList
      })
    },
    // 确定
    handleOk () {
      const actions = this.$refs.actionBlockModal.getSceneAction()
      const conditions = this.$refs.conditionModal.getSceneCondition()
      this.sceneModel.actions = actions
      this.sceneModel.conditions = [...conditions]
      const model = {...this.sceneModel}
      model.location = this.getLocation()
      if (this.hasEmptyAction(actions)) {
        return this.$message.warning('请补全设备行为')
      }
      const that = this
      this.$refs.sceneForm.validate(valid => {
        if (valid) {
          let obj = that.sceneNumber ? editSmartScene(model) : addSmartScene(model)
          obj.then((res) => {
            if (that.$isAjaxSuccess(res.code)) {
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
    // 关闭
    handleCancel () {
      this.close()
    },
    close () {
      this.$emit('close')
      this.visible = false
      this.resetModal()
    },
    resetModal () {
      this.$refs.sceneForm.resetFields()
      this.$refs.conditionModal.reset()
      this.$refs.actionBlockModal.reset()
    }
  },
}
</script>

<style lang="less" scoped>
.location .ant-select{
  margin-right: 28px;
}
</style>
<style lang="css">
.box-card .ant-tabs,
.box-card.ant-card.is-always-shadow{
  box-shadow: none;
}
.box-card .ant-card__header{
  padding: 0 20px;
}
.box-card .ant-card__body{
  padding: 10px 0 20px;
}
</style>
