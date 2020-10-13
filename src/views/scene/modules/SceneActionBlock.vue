<template>
  <div>
    <div class="action">
      <a-button class="add-btn" size="small" icon="plus" @click="handleAdd"></a-button>
      <div class="action-content" v-for="(deviceAction, index) in sceneActionModel" :key="index">
        <a-icon v-if="index !== 0" type="close" class="fr" @click="handleDel(index)" title="删除组"></a-icon>
        <div class="action-item">
          <a-tooltip title="行为执行时间(单位秒)" placement="top">
            <a-input-number class="time" v-model="deviceAction.action_time" :min="0" @change="setActionTime(deviceAction)"></a-input-number>
          </a-tooltip>
          <a-select placeholder="选择设备类型" v-model="deviceAction.deviceType" @change="setDeviceByDeviceType(deviceAction, index)">
            <template v-for="(item, index2) in deviceAction.deviceTypeList">
              <a-select-option :key="index2" :value="item.deviceType">
                {{ item.title }}
              </a-select-option>
            </template>
          </a-select>
          <div v-if="deviceAction.serialId || deviceAction.deviceType" class="action-item__behavior" @click="handleAction(deviceAction, index)" :title="deviceAction.actionDescriptor">
            <p>{{ deviceAction.actionDescriptor || '配置设备动作' }}</p>
          </div>
        </div>
        <!-- 子 Action -->
        <div v-if="deviceAction.childVisible">
          <div class="sub-action-content" v-for="(item, index4) in deviceAction.childAction" :key="index4">
            <a-icon type="close" class="fr" title="删除" @click="handleDelChild(deviceAction, index4, index)"></a-icon>
            <div class="action-item">
              <a-tooltip title="行为执行时间(单位秒)" placement="top">
                <a-input-number v-model="item.action_time" class="time" :min="0"></a-input-number>
              </a-tooltip>
              <!-- ({{ item.serialId }}) -->
              <div class="subtype" :title="`${item.subtitle}(${item.serialId})`">{{ item.subtitle }}</div>
              <div class="action-item__behavior" :title="item.actionDescriptor" @click="handleChildAction(item, deviceAction, index4)">
                <p>{{ item.actionDescriptor || '配置设备动作' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <scene-action-modal ref="actionBehaviorModal" @ok="actionBehaviorModalOk"></scene-action-modal>
  </div>
</template>

<script>
import SceneMixin from '../SceneMixin'
import SceneActionModal from './SceneActionModal'
import { classifyTypeList, getClassify, getActionModel } from '../ActionUtil'
import { Descriptor, LedLampEquip } from 'hardware-suit'
export default {
  name: 'SceneActionBlock',
  mixins: [ SceneMixin ],
  components: { SceneActionModal },
  data () {
    return {
      sceneActionModel: this.initActionModel(),
      activeObj: {},    // 当前活跃设备对象
      activeAction: {}, // 当前活跃Action
      Descriptor
    }
  },
  methods: {
    handleAdd () {
      this.sceneActionModel.push({
        ...getActionModel(),
        childAction: [],
        childVisible: false,
        deviceTypeList: this.deviceTypeList
      })
    },
    handleDel (index) {
      this.sceneActionModel.splice(index, 1)
    },
    // 删除子action
    handleDelChild (parentAction, childIndex, parentIndex) {
      parentAction.childAction.splice(childIndex, 1)
      // 子 action 空移除父 action
      if (!parentAction.childAction.length) this.handleDel(parentIndex)
    },
    // 设置父级action
    handleAction (device) {
      this.setActionTime(device)
      this.setActionDescriptor(device)
      const subtypeList = device.deviceTypeList.find(type => type.deviceType === device.deviceType)
      device.childVisible = true
      this.activeObj = this.toDeviceObj({ ...device, deviceChildType: subtypeList.deviceChildType }, device.action_time)
      // 操作action时，重置action类型状态值
      this.$refs.actionBehaviorModal.reset()
      this.$refs.actionBehaviorModal.show(this.activeObj)
    },
    // 设置子action
    handleChildAction (childAction, parentAction, index) {
      this.activeAction = parentAction
      this.activeObj = this.toDeviceObj({ ...childAction, childActionIndex: index }, childAction.action_time)
      // 操作action时，重置action类型状态值
      this.$refs.actionBehaviorModal.reset()
      this.$refs.actionBehaviorModal.show(this.activeObj)
    },
    toDeviceObj (device, action_time) {
      if (!device) return null
      return {
        device_child_type: device.deviceChildType,
        device_type: device.deviceType,
        device_name: device.deviceName,
        serialId: device.deviceSerialId,
        obox_serial_id: device.oboxSerialId,
        state: device.deviceState,
        addr: device.rfAddress,
        action_time: action_time,
        ...device
      }
    },
    // 根据类型设置当前设备信息
    setDeviceByDeviceType (action) {
      this.activeAction = action
      this.setActionDescriptor(action)
      const subtypeList = action.deviceTypeList.find(type => type.deviceType === action.deviceType)
      const children = subtypeList.children ? subtypeList.children.map(item => Object.assign({}, item)) : []
      action.childVisible = true
      action.childAction = [...(children)]
      this.activeObj = this.toDeviceObj({ ...action, deviceChildType: subtypeList.deviceChildType }, action.action_time)

      // 类型切换时，重置action类型状态值
      // this.$refs.actionBehaviorModal.reset()
    },
    // 设置行为执行时间
    setActionTime (action) {
      this.activeAction = action
      this.activeObj.action_time = action.action_time
      action.childAction.forEach(item => item.action_time = action.action_time)
    },
    // 设置行为描述
    setActionDescriptor (action, msg = '') {
      action.actionDescriptor = msg
      action.childAction.forEach(item => item.actionDescriptor = action.actionDescriptor)
    },
    // 完成action设置回调，设置描述
    actionBehaviorModalOk (actionData, index) {
      if (index === undefined) { // 父级action
        this.activeAction.actionDescriptor = actionData.extra
        if (this.activeAction.childAction.length) { // 同步父分类action
          this.activeAction.childAction.forEach(item => {
            item.actionDescriptor = actionData.extra
            item.action = actionData.action.action
            item.node_type = actionData.action.node_type
          })
        } else { // 栋、层批量处理
          this.activeAction.action = actionData.action.action
          this.activeAction.node_type = actionData.action.node_type
          // TODO 之前不知为何移除
          this.activeAction.device_child_type = actionData.action.device_child_type || actionData.action.deviceChildType
        }
      } else { // 子 action
        let activeChildAction = this.activeAction.childAction[index]
        // 父action无设置时，默认取第一个子action
        if (index === 0 && !this.activeAction.actionDescriptor) this.activeAction.actionDescriptor = actionData.extra
        activeChildAction.actionDescriptor = actionData.extra
        activeChildAction.action = actionData.action.action
        activeChildAction.node_type = actionData.action.node_type
      }
    },
    initActionModel () {
      return [{
        ...getActionModel(),
        deviceTypeList: [],
        childVisible: false,
        childAction: []
      }]
    },
    // 初始化设备类型
    initDeviceType () {
      return [{
        title: '插座开关',
        deviceType: '04',
        deviceChildType: '17'
      }, {
        title: '灯',
        deviceType: '01',
        deviceChildType: '02'
      }, {
        title: '红外转发器',
        deviceType: '51'
      }]
    },
    reset () {
      this.sceneActionModel = this.initActionModel()
    },
    resetDeviceTypes () {
      this.deviceTypeList = this.initDeviceType()
    },
    resetActionTypeList () {
      this.reset()
      this.resetDeviceTypes()
      this.sceneActionModel[0].deviceTypeList = this.initDeviceType()
    },
    getTypeListByRoom (id) {
      this.getDeviceTypeListByRoomId(id)
      let typeList = this.deviceTypeList.filter(item => {
        return this.isActionDevice(item.deviceType, item.deviceChildType)
      })
      // 对类型进行分类
      typeList = getClassify(classifyTypeList(typeList))
      this.deviceTypeList = typeList
      return typeList
    },
    setActionTypeList (typeList) {
      this.sceneActionModel[0].deviceTypeList = typeList
    },
    // 改为驼峰命名
    toCamelNaming (list) {
      return list.map(item => {
        return {
          node_type: item.node_type,
          deviceType: item.device_type,
          deviceChildType: item.device_child_type,
          serialId: item.serialId,
          action: item.action,
          action_time: item.action_time,
          ...item
        }
      })
    },
    // Action 回显
    toActionList (actions) {
      const parseKey = act => {
        let actObj = {}
        try { actObj = JSON.parse(act) } catch (err) { console.log(err) }
        return actObj.key
      }
      const parseSwitch = act => act.slice(0, 2) === '00' ? '关' : '开'
      const isTransponder = act => act.indexOf('{') !== -1
      const parseLamp = ledEquip => `亮度:${ledEquip.getBrightness()} / 色温:${ledEquip.getColdColor()} (${ledEquip.getStatus()})`
      const getDescriptor = (action) => {
        let actionDesc = ''
        const ledLampEquip = new LedLampEquip(action.action, action.deviceType, action.deviceChildType)
        if (action.action) {
          actionDesc = isTransponder(action.action) ? parseKey(action.action) : ledLampEquip.isBicolor() ? parseLamp(ledLampEquip) : parseSwitch(action.action)
        }
        return actionDesc
      }

      const typeList = getClassify(classifyTypeList(this.toCamelNaming(actions)))
      const sceneModel = []
      typeList.forEach(item => {
        item.children.forEach(item => item.actionDescriptor = getDescriptor(item))

        const model = getActionModel()
        model.action_time = item.children[0].action_time
        model.deviceType = item.deviceType
        model.deviceChildType = item.deviceChildType
        model.action = item.children[0].action
        model.actionDescriptor = item.children[0].actionDescriptor
        model.deviceTypeList = typeList
        model.childVisible = true
        model.childAction = item.children

        sceneModel.push(model)
      })
      this.sceneActionModel = sceneModel
    },
    getSceneAction () { // 获取场景Action
      const getAction = (item) => {
        return {
          node_type: item.node_type,
          device_type: item.device_type || item.deviceType,
          device_child_type: item.device_child_type || item.deviceChildType,
          serialId: item.serialId || item.deviceSerialId,
          obox_serial_id: item.obox_serial_id || item.oboxSerialId,
          addr: item.addr,
          action: item.action,
          action_time: item.action_time
        }
      }
      // let action = this.sceneActionModel.length === 1 ? this.sceneActionModel[0].childAction : this.sceneActionModel.reduce((prev, next) => {prev.childAction.concat(next.childAction)})
      let action = this.sceneActionModel.reduce((prev, next) => { return {childAction: prev.childAction.concat(next.childAction)} })
      action = action.childAction
      if (!action.length) { // 栋、层批量处理
        action = this.sceneActionModel.map(item => {
          return { ...item, actionDescriptor: item.actionDescriptor, action_time: item.action_time }
        })
        return action.map(item => getAction(item))
      } else { // 房处理
        return action.map(item => getAction(typeof item.action === 'string' ? item : item.action))
      }
    },
  },
}
</script>

<style lang="less" scoped>
.action {
  position: relative;

  .add-btn {
    float: right;
    margin: 24px 5px 0;
  }

  .action-content {
    width: 90%;
    border: 1px solid #eee;
    // padding: 0 10px;
    font-size: 14px;
    color: #777;
    padding: 10px 14px;
    border-radius: 4px;

    .action-item>div {
      width: 130px;
      margin-right: 5px;
    }

    .action-item .time{
      vertical-align: middle;
    }

    .action-item>div:first-of-type {
      width: 70px;
    }

    .action-item>.action-item__behavior {
      width: 210px;
      vertical-align: middle;

      & p {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    p {
      padding: 0 10px 0 10px;
      margin-bottom: 0;
      line-height: 32px;
    }

    i {
      position: relative;
      line-height: 40px;
      font-size: 14px;
      padding-right: 5px;
      z-index: 9;
    }

    i:last-of-type {
      cursor: pointer;
    }
  }

  .action-content+.action-content {
    margin-top: 6px;
  }
}

.action-item__behavior {
  display: inline-block;
  text-align: center;
  border: 1px dashed #ccc;
  border-radius: 4px;
  color: #ccc;
  cursor: pointer;
}

.fr {
  float: right;
}

.sub-action-content{
  position: relative;
  padding-left: 20px;
}
.sub-action-content{
  &:first-child::before{
    top: -2px;
    height: 26px;
  }
  &::before {
    display: inline-block;
    content: ' ';
    width: 12px;
    height: 40px;
    border: 1px dashed #d9d9d9;
    position: absolute;
    left: 8px;
    top: -16px;
    border-right: none;
    border-top: none;
  }
}
.subtype {
  display: inline-block;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  position: relative;
  height: 32px;
  line-height: 32px;
  box-sizing: border-box;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  text-align: center;
  vertical-align: middle;
  width: 110px!important;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
<style lang="less">
.action-content .ant-input-number__increase, .action-content .ant-input-number__decrease{
  width: 30px;
}
.action-content .ant-input-number.is-controls-right .ant-input__inner{
  padding-left: 2px;
  padding-right: 30px;
}
</style>
