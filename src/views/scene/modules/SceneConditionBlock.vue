<template>
  <a-card :bodyStyle="{padding: '10px'}">
    <a-tabs class="condition" v-model="activeTab" :animated="false">
      <template v-for="(item, index1) in tabList">
        <a-tab-pane :key="item" class="panel">
          <span slot="tab">条件{{ index1 + 1 }}<span v-if="tabList.length - 1 !== index1" class="or">OR</span></span>
          <div class="condition-item clearfix" v-for="(condition, index) in conditionList[item]" :key="index">
            <i class="obicon obicon-node fl"></i>
            <a-icon type="close" class="fr" @click="handleDel(index)"></a-icon>
            <p>
              {{ parseConditionText(condition) }}
              <span class="and" v-if="conditionList[item].length !== 1 && index !== conditionList[item].length - 1">AND</span>
            </p>
          </div>
          <a-button class="add-btn" size="small" icon="plus" @click="handleAdd"></a-button>
        </a-tab-pane>
      </template>
    </a-tabs>
    <scene-condition-modal ref="conditionModal" @ok="ModalOk"></scene-condition-modal>
  </a-card>
</template>

<script>
import SceneConditionModal from './SceneConditionModal'
import { Descriptor, HumidityEquip } from 'hardware-suit'
export default {
  name: 'SceneConditionBlock',
  props: {
    conditions: {
      type: Object,
      default: () => {}
    }
  },
  components: { SceneConditionModal },
  data () {
    return {
      activeTab: '1',
      tabList: ['1', '2', '3'],
      conditionList: {
        '1': [],
        '2': [],
        '3': []
      },
    }
  },
  mounted () {
    // this.conditionList = this.conditions
  },
  methods: {
    reset () {
      this.conditionList = {
        '1': [],
        '2': [],
        '3': []
      }
    },
    parseConditionText (condition) {
      const type = condition.model.type
      const deviceTypeDescriptor = condition.selected && Descriptor.getTypeDescriptor(condition.selected.device_type, condition.selected.device_child_type)
      const conditionTextMap = {
        '1': `定时 ${condition.model.condition}`,
        '2': `联动 ${deviceTypeDescriptor} ${condition.model.action}`
      }
      return conditionTextMap[type] || ''
    },
    // 添加设备条件
    handleAdd () {
      this.$refs.conditionModal.edit({})
    },
    handleDel (index) {
      this.conditionList[this.activeTab].splice(index, 1)
    },
    ModalOk (condition) {
      if (this.conditionList[this.activeTab].length >= 3) return this.$message.warning('一组最多三个条件')
      this.conditionList[this.activeTab].push(condition)
      this.$emit('change', this.conditionList)
    },
    toCondition (conditions) { // 转为条件列表，回显
      const parseChainAction = state => {
        const humidity = new HumidityEquip(state)
        const temSymbol = state.slice(0, 2)
        const temperature = state.slice(2, 4) === '4C' ? '' : humidity.getTemperature()
        const humSymbol = state.slice(4, 6)
        const humidifier = state.slice(6, 8) === '00' ? '' : humidity.getHumidity()
        const symbol = {'49': '>', '4a': '=', '4b': '>=', '4c': '<', '4e': '<=', '4C': '无', '00': '无'}
        return `温度${symbol[temSymbol]}${temperature} / 湿度${symbol[humSymbol]}${humidifier}`
      }
      return conditions.map(condition => {
        const conObj = {
          model: {
            type: '',
            action: condition.condition,
            condition: condition.condition,
            conditionType: '00'
          },
          selected: null
        }
        if (condition.serialId) { // 联动条件
          conObj.model.type = '2'
          conObj.model.conditionType = '01'
          conObj.model.action = parseChainAction(condition.condition)
          conObj.selected = {...condition}
        } else { // 定时条件
          conObj.model.type = '1'
          conObj.model.conditionType = '00'
        }
        return conObj
      })
    },
    toConditionList (conditionArr) {
      if (!conditionArr || !conditionArr.length) return
      this.conditionList['1'] = this.toCondition(conditionArr[0])
      this.conditionList['2'] = this.toCondition(conditionArr[1])
      this.conditionList['3'] = this.toCondition(conditionArr[2])
    },
    getSceneCondition () {
      const conditionList = Object.keys(this.conditionList).map(key => {
        return this.conditionList[key].map(condition => {
          const device = condition.selected
          let _condition = { // 定时条件
            condition: condition.model.condition,
            condition_type: condition.model.conditionType,
          }
          if (device) { // 联动条件
            const chain = {
              addr: device.addr,
              conditionID: device.name,
              device_child_type: device.device_child_type,
              device_type: device.device_type,
              obox_serial_id: device.obox_serial_id,
              serialId: device.serialId
            }
            _condition = { ..._condition, ...chain }
          }
          return _condition
        })
      })
      return conditionList
    },
  },
}
</script>

<style lang="less" scoped>
.condition{
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
    position: relative;
    padding: 0 10px 0 10px;
    margin-bottom: 0;
    line-height: 40px;
  }
  .panel{
    position: relative;
    padding: 20px 20px 20px 0;
  }
  .panel .add-btn{
    position: absolute;
    top: 0;
    right: 0;
  }

  .or,.and{
    position: absolute;
    font-family: Consolas;
    display: inline-block;
    border: 1px solid #000;
    border-radius: 100%;
    vertical-align: middle;
    text-align: center;
    background-color: #000;
    color: #fff;
  }
  .or{
    right: -25px;
    top: 12px;
    font-size: 12px;
    width: 22px;
    height: 22px;
    line-height: 21px;
    z-index: 9999;
  }
  .and{
    right: -40px;
    top: 30px;
    font-size: 11px;
    transform: scale(1);
    width: 26px;
    height: 26px;
    line-height: 24px;
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
  content: " ";
}
.clearfix:after {
  clear: both
}
</style>
