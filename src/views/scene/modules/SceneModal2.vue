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
          <a-card>
            <a-tabs class="condition" v-model="conditionsTab" :animated="false">
              <a-tab-pane key="c1" class="panel">
                <span slot="tab">条件1<span class="or">OR</span></span>
                <div class="condition-item clearfix" v-for="(condition, index) in conditionMapList['c1']" :key="index">
                  <i class="obicon obicon-node fl"></i>
                  <a-icon type="close" class="fr" @click="removeCondition(index)"></a-icon>
                  <!-- <i class="el-icon-close fr" ></i> -->
                  <p>
                    {{ parseCondition(condition) }}
                    <span class="and" v-if="conditionMapList['c1'].length !== 1 && index !== conditionMapList['c1'].length - 1">AND</span>
                  </p>
                </div>
                <a-button class="add-btn" size="small" icon="plus" @click="addCondition"></a-button>
              </a-tab-pane>

              <a-tab-pane key="c2" class="panel">
                <span slot="tab">条件2<span class="or">OR</span></span>
                <div class="condition-item clearfix" v-for="(condition, index) in conditionMapList['c2']" :key="index">
                  <i class="obicon obicon-node fl"></i>
                  <!-- <i class="el-icon-close fr" @click="removeCondition(index)"></i> -->
                  <a-icon type="close" class="fr" @click="removeCondition(index)"></a-icon>
                  <p>
                    {{ parseCondition(condition) }}
                    <span class="and" v-if="conditionMapList['c2'].length !== 1 && index !== conditionMapList['c2'].length - 1">AND</span>
                  </p>
                </div>
                <a-button class="add-btn" size="small" icon="plus" @click="addCondition"></a-button>
              </a-tab-pane>
              <a-tab-pane tab="条件3" key="c3" class="panel">
                <div class="condition-item clearfix" v-for="(condition, index) in conditionMapList['c3']" :key="index">
                  <i class="obicon obicon-node fl"></i>
                  <!-- <i class="el-icon-close fr" @click="removeCondition(index)"></i> -->
                  <a-icon type="close" class="fr" @click="removeCondition(index)"></a-icon>
                  <p>
                    {{ parseCondition(condition) }}
                    <span class="and" v-if="conditionMapList['c3'].length !== 1 && index !== conditionMapList['c3'].length - 1">AND</span>
                  </p>
                </div>
                <a-button class="add-btn" size="small" icon="plus" @click="addCondition"></a-button>
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </a-form-model-item>

        <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="设备行为">
          <div class="action-content">
            <a-button class="add-btn" size="small" icon="plus" @click="handleAddAction"></a-button>
            <div class="condition-item clearfix" v-for="(deviceAction, index) in deviceActionModel" :key="index">
              <!-- <i v-if="index !== 0" class="el-icon-close fr" @click="handleRemoveAction(index)"></i> -->
              <a-icon v-if="index !== 0" type="close" class="fr" @click="handleRemoveAction(index)"></a-icon>
              <div class="action-item">
                <a-tooltip title="行为执行时间(单位秒)" placement="top">
                  <a-input-number v-model="deviceAction.action_time" :min="0" @change="onSelectDevice('', index, '', 1)"></a-input-number>
                </a-tooltip>
                <!-- 编辑状态 -->
                <a-select v-if="deviceAction.serialId" placeholder="选择设备类型" v-model="deviceAction.serialId" @change="onSelectDevice(deviceAction.serialId, index)">
                  <a-select-option v-for="(item, index1) in deviceAction.deviceTypeList" :key="index1" :value="item.deviceSerialId">
                    {{ deviceTypeFilter(item.deviceType, item.deviceChildType) }}
                  </a-select-option>
                </a-select>
                <!-- 添加状态 -->
                <a-select v-else placeholder="选择设备类型" v-model="deviceAction.deviceType" @change="onSelectDevice(deviceAction.serialId, index, deviceAction.deviceType)">
                  <!-- <template v-for="(item, index2) in deviceAction.deviceTypeList">
                    <a-select-option :key="index2" :value="item.deviceSerialId" v-if="item.deviceSerialId">
                      {{ deviceTypeFilter(item.deviceType, item.deviceChildType) }}
                    </a-select-option>
                    <a-select-option :key="index2" :value="item.deviceType" v-else>
                      {{ deviceTypeFilter(item.deviceType, item.deviceChildType) }}
                    </a-select-option>
                  </template> -->
                  <a-select-option v-for="(item, index2) in deviceAction.deviceTypeList" :key="index2" :value="item.deviceType">
                    {{ deviceTypeFilter(item.deviceType, item.deviceChildType) }}
                  </a-select-option>
                </a-select>
                <div v-if="deviceAction.serialId || deviceAction.deviceType" class="action-item__behavior" @click="settingAction(deviceAction.serialId, index, deviceAction.deviceType, 2)" :title="deviceAction.actionDescriptor">
                  <p>{{ deviceAction.actionDescriptor || '配置设备动作' }}</p>
                </div>
              </div>
            </div>
          </div>
        </a-form-model-item>
      </a-form-model>
    </a-spin>
    <scene-condition-modal ref="conditionModal" @ok="conditionModalOk"></scene-condition-modal>
    <scene-action-modal ref="actionModal" @ok="actionModalOk"></scene-action-modal>
  </a-modal>
</template>

<script>
// import pick from 'lodash.pick'
import { getSmartSceneById, addSmartScene, editSmartScene } from '@/api/scene'
import SceneMixin from '../SceneMixin'
import { Descriptor, Converter } from 'hardware-suit'
import SceneConditionModal from './SceneConditionModal'
import SceneActionModal from './SceneActionModal'
import { LedLampEquip } from 'hardware-suit'
export default {
  components: { SceneConditionModal, SceneActionModal },
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
      deviceActionModel: this.initActionModel(),
      currentAction: null, // current handling action
      activeDevice: null, // current active device
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
    'sceneModel.location.buildingId' (id) { // get floor's list by building id
      this.handleBuildingChange(id)
    },
    'sceneModel.location.floorId' (id) { // get room's list by floor id
      this.handleFloorChange(id)
    },
    'sceneModel.location.roomId' (id) { // get device's list by room id
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
          buildingId: '',
          floorId: '',
          roomId: ''
        }
      }
    },
    handleBuildingChange (id) {
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
    handleFloorChange (id) {
      !this.isEditScene && (this.sceneModel.location.roomId = '')
      this.roomList = []
      this.getRoomList(id)
      this.deviceActionModel = this.initActionModel()
      this.deviceActionModel[0].deviceTypeList = this.initDeviceType()
    },
    handleRoomChange (id) {
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
      this.deviceTypeList = this.uniqList(this.deviceTypeList)
      this.deviceActionModel = this.initActionModel()
      this.deviceActionModel[0].deviceTypeList = this.deviceTypeList
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
      return Descriptor.getTypeDescriptor(type, subtype)
    },
    settingAction (serialId, index, deviceType, type) { // click area of the action behavior and set
      this.onSelectDevice(serialId, index, deviceType, type)
      this.$refs.actionModal.show(this.activeDevice)
    },
    // 添加设备条件
    addCondition () {
      this.$refs.conditionModal.edit({})
    },
    removeCondition (index) {
      this.conditionMapList[this.conditionsTab].splice(index, 1)
    },
    conditionModalOk (condition) { // when finishing choosing conditions, enter this callback function
      if (this.conditionMapList[this.conditionsTab].length >= 3) {
        this.$message.warning('一组最多三个条件')
        return
      }
      this.conditionMapList[this.conditionsTab].push(condition)
    },
    actionModalOk (actionData) {
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
      } else if (deviceType) { // by device's type  添加场景，选择楼栋、楼层时为deviceType, 具体到房间时是serialId
        // let item = {}
        // if (deviceType && deviceType.length > 2) { // 序列号
        //   item = activeActionModel.deviceTypeList.find(item => item.deviceSerialId === deviceType)
        // } else { // 类型
        //   item = activeActionModel.deviceTypeList.find(type => type.deviceType === deviceType)
        // }
        const item = activeActionModel.deviceTypeList.find(type => type.deviceType === deviceType)
        this.activeDevice.device_type = item.deviceType
        this.activeDevice.device_child_type = item.deviceChildType
        this.activeDevice.action_time = activeActionModel.action_time
        this.activeDevice.serialId = item.deviceSerialId
        this.activeDevice.state = item.deviceState
        this.activeDevice.device_name = item.deviceName
        this.activeDevice.obox_serial_id = item.oboxSerialId
      }
      console.log('activeDevice  ', this.activeDevice)
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
    parseCondition (condition) { // parse condition to readable text
      let str = ''
      if (condition.model.type === '1') {
        str = `定时 ${condition.model.condition}`
      } else if (condition.model.type === '2') {
        const type = condition.selected && Descriptor.getTypeDescriptor(condition.selected.device_type, condition.selected.device_child_type)
        str = `联动 ${type} ${condition.model.action}`
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
      const location = {...this.sceneModel.location}
      // const location = { buildingId: this.buildingId, floorId: this.floorId, roomId: this.roomId}
      location.buildingId === '' && delete location.buildingId
      location.floorId === '' && delete location.floorId
      location.roomId === '' && delete location.roomId
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

          const conditions = res.result.conditions
          this.conditionMapList.c1 = this.inverseCondition(conditions[0] || [])
          this.conditionMapList.c2 = this.inverseCondition(conditions[1] || [])
          this.conditionMapList.c3 = this.inverseCondition(conditions[2] || [])
          setTimeout(() => {
            // action 去重，保留一个同类型action
            const actions = this.uniqList(res.result.actions, 'device_type')
            this.deviceActionModel = this.parseActions(actions)
          }, 0)


        }
        this.loadingEditData = false
      })
    },
    // 解析回显action
    parseActions (actions) { // convert action data to created structure
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
      const parseLamp = ledEquip => {
        return `亮度:${ledEquip.getBrightness()} / 色温:${ledEquip.getColdColor()} (${ledEquip.getStatus()})`
      }
      return actions.map(action => {
        let actionDesc = ''
        const ledLampEquip = new LedLampEquip(action.action, action.device_type, action.device_type)

        if (action.action) {
          actionDesc = isTransponder(action.action) ? parseKey(action.action) : ledLampEquip.isBicolor() ? parseLamp(ledLampEquip) : parseSwitch(action.action)
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
        const temperature = condition.slice(2, 4) === '4C' ? '' : new Converter(condition.slice(2, 4), 16).toDecimal() - 30
        const humSymbol = condition.slice(4, 6)
        const humidifier = condition.slice(6, 8) === '00' ? '' : new Converter(condition.slice(6, 8), 16).toDecimal()
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
      // this.form.resetFields()
      // this.$refs.sceneForm.resetFields();
      this.initSceneModel()
      this.model = Object.assign({}, record)
      this.sceneNumber = record.sceneNumber
      this.visible = true

      this.getSceneDeviceList().then(() => {
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
      const actions = this.getModelAction()
      const conditions = this.getModelCondition()
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
      this. conditionMapList =  { // condition tab map list
        'c1': [],
        'c2': [],
        'c3': []
      }
      this.deviceActionModel = this.initActionModel()
    }
  },
}
</script>

<style lang="less" scoped>
.close{
  font-size: 20px;
  color: #999;
  line-height: 41px;
  cursor: pointer;
}
.w8{
  width: 80%;
}
.w140px{
  width: 140px;
}
.w440px{
  width: 440px;
}
.h200{
  min-height: 200px;
}
.fl{
  float: left;
}
.fr{
  float: right;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
.center{
  text-align: center;
}
.left{
  text-align: left;
}
.condition{
  // margin: 0 20px;
  .condition-item > p{
    position: relative;
  }
}
.condition .panel{
  position: relative;
  padding: 20px 20px 20px 0;
}
.condition .panel .add-btn{
  position: absolute;
  // top: 26px;
  // right: 10px;
  top: 0;
  right: 0;
  // padding: 5px;
  // font-size: 16px;
}
.action-content{
  position: relative;
}
.action-content .add-btn{
  float: right;
  margin: 24px 5px 0;
}
.action-content .condition-item{
  // width: 80%;
  padding: 14px 5px;
  border-radius: 4px;
  // padding: 5px;
  // margin: 0 auto;
}
.condition-item .action-item > div{
  width: 130px;
  margin-right: 5px;
}
.condition-item .action-item > div:first-of-type{
  width: 70px;
}
.condition-item .action-item > .action-item__behavior{
  width: 150px;
  vertical-align: bottom;
  & p{
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
.action-item__behavior{
  display: inline-block;
  text-align: center;
  border: 1px dashed #ccc;
  border-radius: 4px;
  color: #ccc;
  cursor: pointer;
}
.condition-item{
  width: 90%;
  border: 1px solid #eee;
  padding: 0 10px;
  font-size: 14px;
  color: #777;
}

.condition-item + .condition-item{
  margin-top: 6px;
}
.condition-item i{
  position: relative;
  line-height: 40px;
  font-size: 14px;
  padding-right: 5px;
  z-index: 9;
}
.condition-item i:last-of-type{
  cursor: pointer;
}
.condition-item p{
  // padding: 0 30px 0 20px;
  padding: 0 10px 0 10px;
  margin-bottom: 0;
  line-height: 40px;
}
.actions .header{
  padding: 0 20px;
  border-bottom: 1px solid #eee;
}
.actions .content{
  padding: 10px 20px;
}
.footer{
  padding: 18px 8px 0;
  text-align: right;
}
.or{
  position: absolute;
  right: -25px;
  top: 12px;
  font-size: 12px;
  font-family: Consolas;
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 1px solid #000;
  border-radius: 100%;
  vertical-align: middle;
  text-align: center;
  line-height: 21px;
  background-color: #000;
  color: #fff;
  z-index: 9999;
}
.and{
  position: absolute;
  right: -40px;
  top: 30px;
  font-family: Consolas;
  display: inline-block;
  font-size: 11px;
  transform: scale(1);
  font-family: Consolas;
  display: inline-block;
  width: 26px;
  height: 26px;
  border: 1px solid #000;
  border-radius: 100%;
  vertical-align: middle;
  text-align: center;
  line-height: 24px;
  background-color: #000;
  color: #fff;
}
.and::before,
.and::after{
  display: inline-block;
  content: ' ';
  width: 15px;
  height: 8px;
  border: 1px dashed #999;
  position: absolute;
  border-left: none;
}
.and::before{
  top: -10px;
  left: -3px;
  border-bottom: none;
}
.and::after{
  bottom: -10px;
  left: -3px;
  border-top: none;
}
.location .ant-select{
  margin-right: 28px;
}
</style>
<style lang="css">
.condition-type.ant-tabs,
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
.condition-type > .ant-tabs-nav-wrap{
  background: #f2f2f2;
}
.timing .ant-radio-button .ant-radio-button__inner{
  border-left: 1px solid #DCDFE6;
  width: 80px;
  border-radius: 4px;
}
.timing .ant-radio-button__orig-radio:checked + .ant-radio-button__inner{
  border-left-color: #409EFF;
}
.action-content .ant-input-number__increase, .action-content .ant-input-number__decrease{
  width: 30px;
}
.action-content .ant-input-number.is-controls-right .ant-input__inner{
  padding-left: 2px;
  padding-right: 30px;
}
</style>
