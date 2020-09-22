<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @submit.prevent="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="序列号">
              <a-input placeholder="请输入序列号" v-model="queryParam.obox_serial_id"></a-input>

            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="状态">
              <a-select placeholder="请选择状态" v-model="queryParam.obox_status" allowClear>
                <a-select-option :value="1">在线</a-select-option>
                <a-select-option :value="0">离线</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>


          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="名称">
                <a-input placeholder="请输入名称" v-model="queryParam.obox_name"></a-input>
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
      <a-button v-isPermitted="'device:gateway:add'" @click="handleScan" type="primary" icon="plus">添加网关</a-button>
    </div>

    <!-- table区域-begin -->
    <div>
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
          <a v-isPermitted="'device:gateway:edit'" @click="handleEdit(record)">编辑</a>

          <a-divider v-isPermitted="'device:gateway:edit'" type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-isPermitted="'device:gateway:delete'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.obox_serial_id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <gateway-modal ref="modalForm" @ok="modalFormOk"></gateway-modal>
    <gateway-scan-modal ref="scanModal" @ok="scanModalOk"></gateway-scan-modal>
  </a-card>
</template>

<script>
  import GatewayModal from './modules/GatewayModal'
  import GatewayScanModal from './modules/GatewayScanModal'
  import { getOboxList, delObox } from '@/api/device'
  import { ProListMixin } from '@/utils/mixins/ProListMixin'

  export default {
    name: '',
    mixins: [ ProListMixin ],
    components: {
      GatewayModal,
      GatewayScanModal
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
            dataIndex: 'obox_serial_id',
          },
          {
            title: '名称',
            align: 'center',
            dataIndex: 'obox_name',
          },
          {
            title: '状态',
            align: 'center',
            dataIndex: 'obox_status',
            customRender (status) {
              return status ? '在线' : '离线'
            }
          },
          {
            title: '版本',
            align: 'center',
            dataIndex: 'obox_version'
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            align: 'center',
            width: 170
          }
        ]
      }
    },
    mounted () {
      this.$bus.$on('obox-state', () => this.loadData())
    },
    methods: {
      loadData (arg) {
        this.getDataList(arg)
      },
      getDataList (arg) {
        if (arg === 1) {
          this.ipagination.current = 1
        }
        const params = {...this.queryParam}
        params.pageNo = this.ipagination.current
        params.pageSize = this.ipagination.pageSize
        this.loading = true
        getOboxList(params).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.dataSource = res.result.records
            this.ipagination.total = res.result.total || 0
          } else {
            this.$message.warning(res.message)
          }
          this.loading = false
        })
      },
      handleDelete (id) {
        delObox(id).then(res => {
          if (this.$isAjaxSuccess(res.code)) {
            this.loadData(1)
            this.$message.success('删除成功')
          } else {
            this.$message.error(res.message)
          }
        })
      },
      handleScan () {
        this.$refs.scanModal.edit()
      },
      scanModalOk () {
        this.loadData()
      }
    }

  }
</script>
