<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @submit.prevent="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="序列号">
              <a-input placeholder="请输入设备序列号" v-model="queryParam.serialId"></a-input>

            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="网关">
              <a-select placeholder="请选择网关" v-model="queryParam.obox_serial_id" allowClear>
                <a-select-option v-for="item in oboxList" :key="item.obox_serial_id" :value="item.obox_serial_id">
                  {{ item.obox_name }}（{{ item.obox_status === 1 ? '在线' : '离线' }}）
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>


          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="设备名称">
                <a-input placeholder="请输入设备名称" v-model="queryParam.name"></a-input>
              </a-form-item>
            </a-col>
          </template>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator" style="border-top: 5px">
      <a-button v-isPermitted="'device:normal:add'" @click="handleScan" type="primary" icon="plus">添加设备</a-button>
    </div>

    <!-- table区域-begin -->
    <div>
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>已选择&nbsp;<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->

      <a-table
        ref="table"
        bordered
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >

        <span slot="action" slot-scope="text, record">
          <a v-isPermitted="'device:normal:edit'" @click="handleEdit(record)">编辑</a>

          <a-divider v-isPermitted="'device:normal:edit'" type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-isPermitted="'device:normal:control'" v-if="TypeHints.isXkeySocketSwitch(record.device_child_type)">
                <a @click="handleAction(0, record)">开关</a>
              </a-menu-item>

              <a-menu-item v-isPermitted="'device:normal:control'" v-if="TypeHints.isHumidifierSensors(record.device_child_type)">
                <a @click="handleAction(1, record)">温湿度</a>
              </a-menu-item>

              <a-menu-item v-isPermitted="'device:normal:control'" v-if="TypeHints.isSettableSceneSocketSwitch(record.device_child_type)">
                <a @click="handleAction(2, record)">设置</a>
              </a-menu-item>

              <a-menu-item v-isPermitted="'device:normal:control'" v-if="TypeHints.isSimpleLed(record.device_child_type)">
                <a @click="handleAction(3, record)">灯控</a>
              </a-menu-item>

              <a-menu-item v-isPermitted="'device:normal:delete'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <normal-modal ref="modalForm" @ok="modalFormOk"></normal-modal>
    <normal-device-modal ref="modalDeviceForm" @ok="modalDeviceFormOk" @close="modalDeviceFormOk"></normal-device-modal>
    <humidity-action-modal ref="humidityModal" @close="actionModalClose"></humidity-action-modal>
    <lamp-action-modal ref="lampModal" @close="actionModalClose"></lamp-action-modal>
    <keypanel-action-modal ref="keypanelModal" @ok="actionModalClose" @close="actionModalClose"></keypanel-action-modal>
    <power-switch-modal ref="powerModal" @close="actionModalClose"></power-switch-modal>
  </a-card>
</template>

<script>
  import NormalModal from './modules/NormalModal'
  import NormalDeviceModal from './modules/NormalDeviceModal'
  import LampActionModal from './modules/LampActionModal'
  import KeypanelActionModal from './modules/KeyPanelActionModal'
  import HumidityActionModal from './modules/HumidityActionModal'
  import PowerSwitchModal from './modules/PowerSwitchModal'
  // import PasswordModal from './modules/PasswordModal'
  import { getOboxDeviceList, getAllOboxList, delDevice } from '@/api/device'
  import { ProListMixin } from '@/utils/mixins/ProListMixin'
  import { Descriptor, TypeHints, LedLampEquip } from 'hardware-suit'

  export default {
    name: 'UserList',
    mixins: [ ProListMixin ],
    components: {
      NormalModal,
      NormalDeviceModal,
      LampActionModal,
      KeypanelActionModal,
      HumidityActionModal,
      PowerSwitchModal
      // PasswordModal
    },
    data() {
      return {
        description: '这是用户管理页面',
        queryParam: {},
        columns: [
          {
            title: '序列号',
            align: 'center',
            dataIndex: 'serialId',
          },
          {
            title: '设备名称',
            align: 'center',
            dataIndex: 'name',
          },
          {
            title: '设备状态',
            align: 'center',
            dataIndex: 'state',
            customRender (status, row) {
              return Descriptor.getStatusDescriptor(status, row.device_type, row.device_child_type)
            }
          },
          {
            title: '设备类型',
            align: 'center',
            dataIndex: 'device_type',
            customRender (t) {
              return Descriptor.getTypeDescriptor(t)
            }
          },
          {
            title: '设备子类型',
            align: 'center',
            dataIndex: 'device_child_type',
            customRender (t, row) {
              return Descriptor.getTypeDescriptor(row.device_type, t)
            }
          },
          {
            title: '异常状态',
            align: 'center',
            customRender (row) {
              if (TypeHints.isSimpleLed(row.device_child_type)) {
                const ledLampEquip = new LedLampEquip(row.state, row.device_type, row.device_child_type)
                return ledLampEquip.getLampExceptionStatus()
                // const exception = row.state.slice(14) || '00'
                // const bits = exception.split('')
                // if (!bits || !bits.length) return '无异常'
                // return bits[0] === '1' ? '开路' : bits[1] === '1' ? '短路' : '无异常'
              }
              return '-'
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            align: 'center',
            width: 170
          }
        ],
        oboxList: [],
        TypeHints,
      }
    },
    mounted () {
      this.getOboxList()
      this.$bus.$on('state', () => this.loadData())
    },
    methods: {
      loadData (arg) {
        this.getDeviceList(arg)
      },
      getDeviceList (arg) {
        if (arg === 1) {
          this.ipagination.current = 1
        }
        const params = {...this.queryParam}
        params.pageNo = this.ipagination.current
        params.pageSize = this.ipagination.pageSize
        this.loading = true
        getOboxDeviceList(params).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.dataSource = res.result.records
            this.ipagination.total = res.result.total
          } else {
            this.$message.warning(res.message)
          }
        }).finally(() => this.loading = false)
      },
      getOboxList () {
        getAllOboxList().then(res => {
          if (this.$isAjaxSuccess(res.code)) {
            this.oboxList = res.result
          }
        })
      },
      handleAction (type, record) {
        type === 0 && this.$refs.powerModal.show(record)
        type === 1 && this.$refs.humidityModal.show(record)
        type === 2 && this.$refs.keypanelModal.show(record)
        type === 3 && this.$refs.lampModal.show(record)
      },
      actionModalClose () {
        this.loadData()
      },
      handleDelete (record) {
        delDevice(record.serialId, record.name).then(res => {
          if (this.$isAjaxSuccess(res.code)) {
            this.loadData(1)
            this.$message.success('删除成功')
          } else {
            this.$message.error(res.message)
          }
        })
      },
      handleScan () {
        this.$refs.modalDeviceForm.edit({})
      },
      modalDeviceFormOk () {
        this.loadData()
      }
    }
  }
</script>
