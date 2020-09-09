<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :height="drawerWidth"
    placement="bottom"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
    :destroyOnClose="true"
  >
    <a-layout class="expand humidifier">
      <a-layout-sider width="200px" theme="light">
        <div class="humidifier-status">
          <div class="item">
            <p><i class="obicon obicon-temperature-o"></i><span>温度</span></p>
            <span>{{ temperature }}℃</span>
          </div>
          <div class="item">
            <p><i class="obicon obicon-humidity"></i><span>湿度</span></p>
            <span>{{ humidifier }}%</span>
          </div>
        </div>
      </a-layout-sider>
      <a-layout-content>
        <a-card>
          <a-tabs v-model="activeName" tab-position="right" class="humidifier-table" style="height: 345px;">
            <a-tab-pane tab="历史数据" key="1">
              <a-table
                ref="table"
                bordered
                size="middle"
                rowKey="id"
                :columns="columns"
                :dataSource="tableData"
                :loading="tableLoading"
                :pagination="false"
                :scroll="{ y: 290 }"
              >
              </a-table>
            </a-tab-pane>
            <a-tab-pane tab="今日数据" key="2">
              <Chart v-if="isCharListValid" :data="series" :xAxis="labels" :legend="['温度', '湿度']" style="margin: 0 auto;"></Chart>
              <div v-else style="color: rgba(0, 0, 0, 0.25); text-align: center;">暂无数据</div>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-layout-content>
    </a-layout>
  </a-drawer>
</template>


<script>
import Chart from '@/components/IoT/Chart'
import { getDeviceStatusHistory } from '@/api/device'
import { parseTime } from '@/utils/util'
import { Descriptor } from 'hardware-suit'
export default {
  components: { Chart },
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

      activeName: '1',
      tableLoading: false,
      tableData: [],
      columns: [{title: '温度', dataIndex: 'temperature', align: 'center' }, {title: '湿度', dataIndex: 'humidifier', align: 'center' }, {title: '日期', dataIndex: 'time', align: 'center' }],
      isCharListValid: false,
      series: [],
      labels: [],
      temperature: 0,
      humidifier: 0
    }
  },
  methods: {
    show (record) {
      this.model = Object.assign({}, record)
      this.visible = true
      this.handleData(record.serialId)
      const tempValue = +parseInt(record.state.slice(2, 4), 16).toString(10)
      this.temperature = tempValue ? tempValue - 30 : 0
      this.humidifier = +parseInt(record.state.slice(6, 8), 16).toString(10)
      this.title = `${Descriptor.getTypeDescriptor(record.device_type, record.device_child_type)}(${record.serialId})`
    },
    close () {
      this.$emit('close')
      this.disableSubmit = false
      this.visible = false
    },
    handleCancel () {
      this.close()
    },
    getDateDetail (date) {
      return {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate()
      }
    },
    resetDateTime (date) {
      date.setHours(0, 0, 0, 0)
      return date
    },
    async getHumidifierStatusHistoryByWeek (serialId) {
      const nowaday = new Date()
      const weeksago = new Date(nowaday.getTime() - (6 * 24 * 60 * 60 * 1000))
      const nowadayReset = this.resetDateTime(nowaday)
      const weeksagoReset = this.resetDateTime(weeksago)

      const toDate = parseInt(nowadayReset.getTime() / 1000)
      const fromDate = parseInt(weeksagoReset.getTime() / 1000)
      const response = await getDeviceStatusHistory(serialId, fromDate, toDate, '02')
      return this.parseHumidifierHistoryByDay(response.result.history, '{m}-{d}')
    },
    async getHumidifierStatusHistoryByDay (serialId) {
      const date = new Date()
      const fromDate = parseInt(date.setHours(0, 0, 0, 0) / 1000)
      const toDate = parseInt(date.setHours(23, 59, 0, 0) / 1000)
      this.tableLoading = true
      const response = await getDeviceStatusHistory(serialId, fromDate, toDate, '01')
      this.tableLoading = false
      return this.parseHumidifierHistoryByDay(response.result.history)
    },
    parseHumidifierHistoryByDay (list, fmt) {
      return Array.from(list).map(item => {
        const tempValue = +parseInt(item.status.slice(2, 4), 16).toString(10)
        const temperature = tempValue ? tempValue - 30 : 0
        const humidifier = +parseInt(item.status.slice(6, 8), 16).toString(10)
        const time = parseTime(new Date(item.time * 1000), fmt || '{h}:{i}')
        return {
          id: Math.random(10000),
          temperature,
          humidifier,
          time
        }
      })
    },
    async handleData (serialId) {
      this.dialogVisible = true
      const list = await this.getHumidifierStatusHistoryByWeek(serialId)
      const chartList = await this.getHumidifierStatusHistoryByDay(serialId)

      this.tableData = list
      const isCharListValid = chartList && chartList.length
      this.isCharListValid = isCharListValid
      if (isCharListValid) {
        this.labels = chartList.map(item => item.time)
        const temperature = chartList.map(item => item.temperature)
        const humidifier = chartList.map(item => item.humidifier)
        this.series = []
        this.series.push({
          name: '温度',
          type: 'line',
          data: temperature,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            normal: {
              color: '#2C3449',
              borderColor: '#45D9FF',
              borderWidth: 1,
            }
          },
          lineStyle: {
            color: '#45D9FF'
          }
        })
        this.series.push({
          name: '湿度',
          type: 'line',
          smooth: true,
          data: humidifier,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            normal: {
              color: '#2C3449',
              borderColor: '#0FFF7B',
              borderWidth: 1,
            }
          },
          lineStyle: {
            color: '#0FFF7B'
          }
        })
      }
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
.expand.humidifier {
  // margin: 20px;
  // padding: 20px 10px;
  // background: rgba(7, 16, 33, 0.24);
  // border-radius: 20px;
  // box-shadow: 0 0 2px 1px #ababab;
  // position: relative;

  .humidifier-status{
    // width: 30%;
    // display: inline-block;
    // border: 1px solid #eee;
    // vertical-align: top;
    // box-shadow: 0 0 2px 1px #f2f2f2;
    // position: absolute;
    // top: 50%;
    // transform: translateY(-50%);

    .item {
      // display: inline-block;
      // width: 50%;
      padding: 25px;
      text-align: center;
      // border-right: 1px solid #eee;
      // &:last-of-type{
      //   border-right: none;
      // }
    }
    .item p{
      padding: 5px;
      color: #666;
      span{
        font-size: 12px;
      }
    }
    .item i {
      font-size: 32px;
      // color: rgba(5, 100, 184, 0.9);
      color: #0FFF7B;

      &.obicon-temperature-o{
        color: #45D9FF;
      }
    }
    .item > span{
      display: inline-block;
      padding: 5px;
      font-size: 20px;
    }

  }
  .humidifier-table{
    // display: inline-block;
    // width: 70%;
    // padding-left: 5px;
    // width: 100%;
    // padding-left: 30%;
  }
}
</style>
