<template>
  <a-modal :title="title" :width="600" :visible="visible" :confirmLoading="confirmLoading" @ok="handleOk" @cancel="handleCancel" cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="场景名称">
          <a-input placeholder="请输入场景名称" v-decorator="[ 'scene_name', validatorRules.name]" />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="位置" class="location">
          <a-select placeholder="请选择楼栋" v-model="queryParam.buildingId" allowClear>
            <a-select-option v-for="item in buildingList" :key="item.buildingId" :value="item.buildingId" v-decorator="[ 'buildingId', validatorRules.buildingId]">
              {{ item.buildingName }}
            </a-select-option>
          </a-select>
          <a-select placeholder="请选择楼层" v-model="queryParam.floorId" allowClear>
            <a-select-option v-for="item in floorList" :key="item.floorId" :value="item.floorId" v-decorator="[ 'floorId']">
              {{ item.floorName }}
            </a-select-option>
          </a-select>
          <a-select placeholder="请选择教室" v-model="queryParam.roomId" allowClear>
            <a-select-option v-for="item in roomList" :key="item.roomId" :value="item.roomId" v-decorator="[ 'roomId']">
              {{ item.roomName }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="设备条件" class="box-card">
          <a-tabs class="condition w8" v-model="conditionsTab" type="border-card">
            <a-tab-pane tab="条件1" key="c1" class="panel">
              <span slot="tab">条件1<span class="or">OR</span></span>
              <div class="condition-item clearfix" v-for="(condition, index) in conditionMapList['c1']" :key="index">
                <i class="obicon obicon-node fl"></i>
                <i class="el-icon-close fr" @click="removeCondition(index)"></i>
                <p>
                  {{parseCondition(condition)}}
                  <span class="and" v-if="conditionMapList['c1'].length !== 1 && index !== conditionMapList['c1'].length - 1">AND</span>
                </p>
              </div>
              <a-button class="add-btn" size="mini" type="plain" icon="plus" @click="addCondition"></a-button>
            </a-tab-pane>

            <a-tab-pane tab="条件2" name="c2" class="panel">
              <span slot="tab">条件2<span class="or">OR</span></span>
              <div class="condition-item clearfix" v-for="(condition, index) in conditionMapList['c2']" :key="index">
                <i class="obicon obicon-node fl"></i>
                <i class="el-icon-close fr" @click="removeCondition(index)"></i>
                <p>
                  {{parseCondition(condition)}}
                  <span class="and" v-if="conditionMapList['c2'].length !== 1 && index !== conditionMapList['c2'].length - 1">AND</span>
                </p>
              </div>
              <a-button class="add-btn" size="mini" type="plain" icon="plus" @click="addCondition"></a-button>
            </a-tab-pane>
            <a-tab-pane tab="条件3" name="c3" class="panel">
              <div class="condition-item clearfix" v-for="(condition, index) in conditionMapList['c3']" :key="index">
                <i class="obicon obicon-node fl"></i>
                <i class="el-icon-close fr" @click="removeCondition(index)"></i>
                <p>
                  {{parseCondition(condition)}}
                  <span class="and" v-if="conditionMapList['c3'].length !== 1 && index !== conditionMapList['c3'].length - 1">AND</span>
                </p>
              </div>
              <a-button class="add-btn" size="mini" type="plain" icon="plus" @click="addCondition"></a-button>
            </a-tab-pane>
          </a-tabs>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="设备行为">
          <div class="action-content">
            <div class="condition-item clearfix" v-for="(deviceAction, index) in deviceActionModel" :key="index">
              <i v-if="index !== 0" class="el-icon-close fr" @click="handleRemoveAction(index)"></i>
              <div class="action-item">
                <a-tooltip title="行为执行时间(单位秒)" placement="top">
                  <a-input-number v-model="deviceAction.action_time" :min="0" @change="onSelectDevice('', index, '', 1)"></a-input-number>
                </a-tooltip>
                <a-select v-if="deviceAction.serialId" placeholder="选择设备类型" v-model="deviceAction.serialId"  @change="onSelectDevice(deviceAction.serialId, index)">
                  <a-select-option v-for="item in deviceAction.deviceTypeList" :key="item.deviceSerialId" :value="item.deviceSerialId">
                    {{ deviceTypeFilter(item.deviceType, item.deviceChildType) }}
                  </a-select-option>
                </a-select>
                <a-select v-else placeholder="设备类型" v-model="deviceAction.deviceType"  @change="onSelectDevice(deviceAction.serialId, index, deviceAction.deviceType)">
                  <a-select-option v-for="item in deviceAction.deviceTypeList" :key="item.deviceType" :value="item.deviceType">
                    {{ deviceTypeFilter(item.deviceType, item.deviceChildType) }}
                  </a-select-option>
                </a-select>
                <div v-if="deviceAction.serialId || deviceAction.deviceType" class="action-item__behavior" @click="settingAction(deviceAction.serialId, index, deviceAction.deviceType, 2)" :title="deviceAction.actionDescriptor">
                  <p>{{deviceAction.actionDescriptor || '配置设备动作' }}</p>
                </div>
              </div>
            </div>
            <el-button class="add-btn" size="mini" type="plain" icon="el-icon-plus" @click="handleAddAction"></el-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { getSmartSceneById } from '@/api/scene'
import SceneMixin from '../SceneMixin'
import { Descriptor, TypeHints } from 'hardware-suit'
export default {
  mixins: [ SceneMixin ],
  data () {
    return {
      title: '操作',
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
        scene_name: { rules: [{ required: true, message: '场景名称不能为空!' }] },
        buildingId: [{ required: true, trigger: 'change', message: '楼栋不能为空'}],
      },
      sceneModel: { // the scene created or edited model object
        scene_type: '00',
        scene_status: '01',
        scene_number: 0, // create 0
        scene_name: '',
        scene_group: '00',
        msg_alter: 0,
        actions: [], // device behaviors
        conditions: [], // device conditions
        location: {
          buildingId: '',
          floorId: '',
          roomId: ''
        }
      },
      deviceActionModel: this.initActionModel(),
      currentAction: null, // current handling action
      activeDevice: null, // current active device
      conDialogVisible: false, // condition dialog visible controller flag
      conditionList: [], // list to store conditions
      conditionsTab: 'c1', // condition 'c1' for the default or active tab
      conditionMapList: { // condition tab map list
        'c1': [],
        'c2': [],
        'c3': []
      },
      deviceTypeList: this.initDeviceType(), // list of device's type
      actionDialogVisible: false,
      isEditScene: false,
      loadingEditData: false,
      sceneNumber: ''
    }
  },
  watch: {
    'buildingId' (id) { // get floor's list by building id
      if (!this.isEditScene) {
        this.sceneModel.location.floorId = ''
        this.sceneModel.location.roomId = ''
      }
      this.floorList = []
      this.roomList = []
      this.getFloorList(id)
      this.deviceActionModel = this.initActionModel()
      this.deviceActionModel[0].deviceTypeList = this.initDeviceType()
    },
    'floorId' (id) { // get room's list by floor id
      !this.isEditScene && (this.sceneModel.location.roomId = '')
      this.roomList = []
      this.getRoomList(id)
      this.deviceActionModel = this.initActionModel()
      this.deviceActionModel[0].deviceTypeList = this.initDeviceType()
    },
    'roomId' (id) { // get device's list by room id
      if (!id) { // init by default data
        this.deviceTypeList = this.initDeviceType()
        this.deviceActionModel = this.initActionModel()
        this.deviceActionModel[0].deviceTypeList = this.initDeviceType()
        return
      }
      this.getDeviceTypeListByRoomId(id)
      this.deviceTypeList = this.deviceTypeList.filter(item => {
        return this.isActionDevice(item.deviceType, item.deviceChildType)
      })
      this.deviceActionModel = this.initActionModel()
      this.deviceActionModel[0].deviceTypeList = this.deviceTypeList
      this.isEditScene = false // after finishing rendering location, reset isEditScene variable
    }
  },
  methods: {
    initDeviceType () { // for building or floor location
      return [{
        name: '3 way switch',
        deviceType: '04',
        deviceChildType: '17'
      }, {
        name: 'Ifrate',
        deviceType: '51'
      }]
    },
    initActionModel () { // model for device to save action messages
      return [{
        action_time: 0,
        serialId: '',
        deviceType: '',
        actionDescriptor: '',
        action: '',
        deviceTypeList: []
      }]
    },
    deviceTypeFilter (type, subtype) { // get description text of device's type
      if (!type && !subtype) return
      // return subtype ? this.$t('system.devtype', {FIELD: Suit.getDeviceTypeDescriptor(type, subtype)}) : this.$t('system.devtype', {FIELD: Suit.getRootDeviceDescriptor(type)})
    },
    isActionDevice (deviceType, deviceSubType, isLocal) { // only some device can be set action
      return !TypeHints.isSensors(deviceType)
        && !TypeHints.isFinger(deviceType)
        && !TypeHints.isDoorLock(deviceType)
        && !TypeHints.isCamera(deviceType)
        && !(TypeHints.isSocketSwitch(deviceType) && TypeHints.isSceneSocketSwitch(deviceSubType))
        && !(TypeHints.isSocketSwitch(deviceType) && TypeHints.isMixSocketSwitch(deviceSubType))
    },
    settingAction (serialId, index, deviceType, type) { // click area of the action behavior and set
      this.actionDialogVisible = true
      this.onSelectDevice(serialId, index, deviceType, type)
    },

    addCondition () { // for condition modal/dialog controller
      this.conDialogVisible = true
    },
    removeCondition (index) {
      this.conditionList.splice(index, 1)
      this.conditionMapList[this.conditionsTab].splice(index, 1)
    },
    onConditionChange (condition, dialogVisible) { // when finishing choosing conditions, enter this callback function
      if (this.conditionMapList[this.conditionsTab].length >= 3) {
        this.$message({
          message: this.$t('smart.scene.create', {FIELD: 'conTip'}),
          type: 'info'
        })
        return
      }
      this.conditionList.push(condition)
      this.conditionMapList[this.conditionsTab].push(condition)
      this.conDialogVisible = dialogVisible
    },
    onActionChange (actionData, dialogVisible) { // when finishing handling actions, enter this callback function
      this.actionDialogVisible = dialogVisible
      this.currentAction.actionDescriptor = actionData.extra
      this.currentAction.action = actionData.action
    },
    /**
     * @param {String} serialId
     * @param {Number} index  action index
     * @param {String} deviceType
     * @param {Number} actionType action type: 1-timing, 2-action description
     */
    onSelectDevice (serialId, index, deviceType, actionType) {
      const activeActionModel = this.deviceActionModel[index]
      const device = activeActionModel.deviceTypeList.find(item => item.deviceSerialId === serialId)
      this.activeDevice = {}
      if (device) { // by device's serial number
        // select a device type depends on a serial number and pass to action component
        this.activeDevice = {
          device_child_type: device.deviceChildType,
          device_type: device.deviceType,
          device_name: device.deviceName,
          serialId: device.deviceSerialId,
          obox_serial_id: device.oboxSerialId,
          state: device.deviceState,
          addr: device.rfAddress,
          action_time: activeActionModel.action_time
        }
      } else if (deviceType) { // by device's type
        const item = activeActionModel.deviceTypeList.find(type => type.deviceType === deviceType)
        this.activeDevice.device_type = item.deviceType
        this.activeDevice.device_child_type = item.deviceChildType
        this.activeDevice.action_time = activeActionModel.action_time
      }
      this.currentAction = activeActionModel
      if (actionType) { // change action time & change action description
        actionType === 1 && (this.activeDevice.action_time = activeActionModel.action_time)
      } else { // reset only by select a device
        this.currentAction.actionDescriptor = ''
      }
    },
    handleRemoveAction (index) { // remove device's action
      this.deviceActionModel.splice(index, 1)
    },
    handleAddAction () { // add device's action
      this.deviceActionModel.push({
        action_time: 0,
        serialId: this.getSerialIdFromTypeListBySceneNumber() || '',
        deviceType: '',
        actionDescriptor: '',
        action: '',
        deviceTypeList: this.deviceTypeList
      })
    },
    getSerialIdFromTypeListBySceneNumber () { // edit mode, get serialId for deviceActionModel
      if (this.sceneNumber) {
        const typeObj = this.deviceTypeList.find(type => type.deviceSerialId)
        return typeObj && typeObj.deviceSerialId
      }
    },
    hasEmptyAction (actions) {
      return !actions || !actions.length || actions.findIndex(item => !item || !Object.keys(item).length || !item.action) > -1
    },
    handleSelectedCondition () { // combine the arguments and save
      const actions = this.getModelAction()
      const conditions = this.getModelCondition()
      this.sceneModel.actions = actions
      this.sceneModel.conditions = [...conditions]
      const model = {...this.sceneModel}
      model.location = this.getLocation()
      if (this.hasEmptyAction(actions)) {
        return this.$message.warning({title: false, message: this.$t('smart.scene.condition', {FIELD: 'setActionBehavior'})})
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('scene-ready', model, false)
        }
      })
    },
    parseCondition (condition) { // parse condition to readable text
      let str = ''
      if (condition.model.type === '1') {
        str = `${this.$t('smart.scene.condition', {FIELD: 'timing'})} ${condition.model.condition}`
      } else if (condition.model.type === '2') {
        const type = this.$t('system.devtype', {FIELD: Suit.getDeviceTypeDescriptor(condition.selected.device_type, condition.selected.device_child_type)})
        str = `${this.$t('smart.scene.condition', {FIELD: 'chain'})} ${type} ${condition.model.action}`
      }
      return str
    },
    getModelCondition () { // get condition arguments
      const conditions = Object.keys(this.conditionMapList).map(key => {
        return this.conditionMapList[key].map(condition => {
          const device = condition.selected
          let cons = { // for timing condition
            condition: condition.model.condition,
            condition_type: condition.model.conditionType,
          }
          if (device) { // for chain's device condition
            cons = {
              ...cons,
              ...{
                addr: device.addr,
                conditionID: device.name,
                device_child_type: device.device_child_type,
                device_type: device.device_type,
                obox_serial_id: device.obox_serial_id,
                serialId: device.serialId
              }
            }
          }
          return cons
        })
      })
      return conditions
    },
    getModelAction () { // get action model and set serialId
      return this.deviceActionModel.map(item => {
        return item.serialId ? {...item.action, serialId: item.serialId, action_time: item.action_time} : {...item.action, action_time: item.action_time}
      })
    },
    getLocation () { // get validable location
      // const location = {...this.sceneModel.location}
      const location = { buildingId: this.buildingId, floorId: this.floorId, roomId: this.roomId}
      location.buildingId === '' && delete location.buildingId
      location.floorId === '' && delete location.floorId
      location.roomId === '' && delete location.roomId
      return location
    },
    getSceneDataBySceneNumber () { // init sceneModel data
      if (!this.sceneNumber) return
      getSmartSceneById(this.sceneNumber).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.sceneModel.location = res.result.location
          this.sceneModel.scene_type = res.result.scene_type || '00'
          this.sceneModel.scene_status = res.result.scene_status || '01'
          this.sceneModel.scene_number = res.result.scene_number || this.sceneNumber
          this.sceneModel.scene_name = res.result.scene_name || ''
          this.sceneModel.scene_group = res.result.scene_group || '00'
          this.sceneModel.msg_alter = res.result.msg_alter || 0

          const conditions = res.result.conditions
          this.conditionMapList.c1 = this.inverseCondition(conditions[0] || [])
          this.conditionMapList.c2 = this.inverseCondition(conditions[1] || [])
          this.conditionMapList.c3 = this.inverseCondition(conditions[2] || [])
          setTimeout(() => {
            this.deviceActionModel = this.inverseActions(res.result.actions)
          }, 0)
        }
        this.loadingEditData = false
      })
    },
    inverseActions (actions) { // convert action data to created structure
      const parseKey = act => {
        let actObj = {}
        try {
          actObj = JSON.parse(act)
        } catch (err) {
          console.log(err)
        }
        return actObj.key
      }
      const parseSwitch = act => {
        return act.slice(0, 2) === '00' ? '关' : '开'
      }
      const isTransponder = act => {
        return act.indexOf('{') !== -1
      }

      return actions.map(action => {
        let actionDesc = ''
        if (action.action) {
          actionDesc = isTransponder(action.action) ? parseKey(action.action) : parseSwitch(action.action)
        }
        return {
          deviceTypeList: this.deviceTypeList,
          serialId: action.serialId,
          deviceType: action.device_type,
          action_time: action.action_time,
          actionDescriptor: actionDesc,
          action: action
        }
      })
    },
    inverseCondition (conditions) { // convert condition to created mode
      const parseChainAction = condition => {
        const temSymbol = condition.slice(0, 2)
        const temperature = condition.slice(2, 4) === '4C' ? '' : Suit.converter.toDecimal(condition.slice(2, 4), 16) - 30
        const humSymbol = condition.slice(4, 6)
        const humidifier = condition.slice(6, 8) === '00' ? '' : Suit.converter.toDecimal(condition.slice(6, 8), 16)
        const symbol = {'49': '>', '4a': '=', '4b': '>=', '4c': '<', '4e': '<=', '4C': '无', '00': '无'}
        return `温度${symbol[temSymbol]}${temperature} / 湿度${symbol[humSymbol]}${humidifier}`
      }
      return conditions.map(condition => {
        const conMap = {
          model: {
            type: '',
            action: condition.condition,
            condition: condition.condition,
            conditionType: '00'
          },
          selected: null
        }
        if (condition.serialId) { // chain's device condition
          conMap.model.type = '2'
          conMap.model.conditionType = '01'
          conMap.model.action = parseChainAction(condition.condition)
          conMap.selected = {...condition}
        } else { // timing condition
          conMap.model.type = '1'
          conMap.model.conditionType = '00'
        }
        return conMap
      })
    },
    add () {
      this.edit({})
    },
    edit (record) {
      this.form.resetFields()
      this.model = Object.assign({}, record)
      this.sceneNumber = record.scene_number
      this.visible = true
      // this.$nextTick(() => {
      //   this.form.setFieldsValue(pick(this.model, 'name'))
      // })
      this.getSceneDeviceList().then(buildingList => {
      if (this.sceneNumber) { // when there is a sceneNumber, It's in an editable mode
        this.isEditScene = true
        this.loadingEditData = true
        this.getSceneDataBySceneNumber()
      } else {
        this.isEditScene = false
      }
    })
    },
    // 确定
    handleOk () {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true
          let formData = Object.assign(this.model, values)
          console.log(formData)
          let obj = editOboxName(formData)
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
    }
  },
}
</script>

<style lang="less" scoped>

</style>
