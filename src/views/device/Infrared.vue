<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @submit.prevent="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="序列号">
              <a-input placeholder="请输入设备序列号" v-model="queryParam.deviceId"></a-input>

            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="状态">
              <a-select placeholder="请选择状态" v-model="queryParam.online" allowClear>
                <a-select-option :value="0">在线</a-select-option>
                <a-select-option :value="1">离线</a-select-option>
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
    <!-- <div class="table-operator" style="border-top: 5px">
      <a-button @click="handleAdd" type="primary" icon="plus">添加设备</a-button>
    </div> -->

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
          <a v-isPermitted="'device:infrared:edit'" @click="handleEdit(record)">编辑</a>

          <a-divider v-isPermitted="'device:infrared:edit'" type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-isPermitted="'device:infrared:control'" v-if="TypeHints.isTransponder(record.type)">
                <a @click="handleAction(record)">红外控制</a>
              </a-menu-item>

              <a-menu-item v-isPermitted="'device:infrared:delete'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.deviceId)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <infrared-modal ref="modalForm" @ok="modalFormOk"></infrared-modal>
  </a-card>
</template>

<script>
  import InfraredModal from './modules/InfraredModal'
  import { getInfratedDeviceList, delInfratedDevice } from '@/api/device'
  import { ProListMixin } from '@/utils/mixins/ProListMixin'
  import { Descriptor, TypeHints } from 'hardware-suit'

  export default {
    name: '',
    mixins: [ ProListMixin ],
    components: {
      InfraredModal,
    },
    data() {
      return {
        description: '这是用户管理页面',
        queryParam: {
          pageNo: 1,
          pageSize: 10
        },
        columns: [
          {
            title: '序列号',
            align: 'center',
            dataIndex: 'deviceId',
          },
          {
            title: '设备名称',
            align: 'center',
            dataIndex: 'name',
          },
          {
            title: '设备状态',
            align: 'center',
            dataIndex: 'online',
            customRender (status) {
              return status === 0 ? '在线' : '离线'
            }
          },
          {
            title: '设备类型',
            align: 'center',
            dataIndex: 'type',
            customRender (t) {
              return Descriptor.getEquipTypeDescriptor(t)
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
        getInfratedDeviceList(params).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.dataSource = res.result.records
            this.ipagination.total = res.result.total || 0
          } else {
            this.$message.warning(res.message)
          }
          this.loading = false
        })
      },
      handleAction (type, record) {
        type === 1 && this.$refs.humidityModal.show(record)
        type === 2 && this.$refs.keypanelModal.show(record)
        type === 3 && this.$refs.lampModal.show(record)
      },
      actionModalClose () {
        this.loadData()
      },
      handleDelete (id) {
        delInfratedDevice(id).then(res => {
          if (this.$isAjaxSuccess(res.code)) {
            this.loadData(1)
            this.$message.success('删除成功')
          } else {
            this.$message.error(res.message)
          }
        })
      }
    }

  }
</script>
