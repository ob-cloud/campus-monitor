<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @submit.prevent="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="组名">
              <a-input placeholder="请输入编组名称" v-model="queryParam.groupName" allowClear></a-input>
            </a-form-item>
          </a-col>

          <!-- <a-col :md="6" :sm="12">
            <a-form-item label="序列号">
              <a-input placeholder="请输入组号" v-model="queryParam.group_id"></a-input>

            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="状态">
              <a-select placeholder="请选择状态" v-model="queryParam.online" allowClear>
                <a-select-option :value="0">在线</a-select-option>
                <a-select-option :value="1">离线</a-select-option>
              </a-select>
            </a-form-item>
          </a-col> -->


          <!-- <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="设备名称">
                <a-input placeholder="请输入设备名称" v-model="queryParam.name"></a-input>
              </a-form-item>
            </a-col>
          </template> -->

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <!-- <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a> -->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div v-isPermitted="'device:group:add'" class="table-operator" style="border-top: 5px">
      <a-button @click="handleAdd" type="primary" icon="plus">添加编组</a-button>
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
        rowKey="group_id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >

        <span slot="tags" slot-scope="panel_addr">
          <a-tag color="geekblue">{{ panel_addr[0].addr }}</a-tag>
          <a-tag color="green">{{ panel_addr[0].group_addr }}</a-tag>
        </span>
        <span slot="action" slot-scope="text, record">
          <a v-isPermitted="'device:group:edit'" @click="handleEdit(record)">编辑</a>

          <a-divider v-isPermitted="'device:group:edit'" type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-isPermitted="'device:group:equip'" @click="handleDevice(record)">
                设备
              </a-menu-item>
              <a-menu-item v-isPermitted="'device:group:grouping'" @click="handleGrouping(record)">
                分组
              </a-menu-item>
              <a-menu-item v-isPermitted="'device:group:delete'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.group_id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <group-modal ref="modalForm" @ok="modalFormOk"></group-modal>
    <add-group-block-modal ref="addBlockModal" @ok="modalFormOk"></add-group-block-modal>
    <add-device-block-modal ref="addDeviceModal"></add-device-block-modal>
    <add-member-block-modal ref="addMemberModal"></add-member-block-modal>
  </a-card>
</template>

<script>
  import GroupModal from './modules/group/GroupModal'
  import AddGroupBlockModal from './modules/group/AddGroupBlockModal'
  import AddDeviceBlockModal from './modules/group/AddDeviceBlockModal'
  import AddMemberBlockModal from './modules/group/AddMemberBlockModal'
  import { getPanelGroupList, delPanelGroup } from '@/api/device'
  import { ProListMixin } from '@/utils/mixins/ProListMixin'
  import { Converter } from 'hardware-suit'
  export default {
    name: '',
    mixins: [ ProListMixin ],
    components: {
      GroupModal,
      AddGroupBlockModal,
      AddDeviceBlockModal,
      AddMemberBlockModal
    },
    data() {
      return {
        description: '这是用户管理页面',
        queryParam: {
          current: 1,
          size: 10
        },
        columns: [
          {
            title: '编号',
            align: 'center',
            dataIndex: 'panel_addr',
            customRender (t) {
              return t[0] && new Converter(t[0].addr, 16).toDecimal()
            }
          },
          {
            title: '名称',
            align: 'center',
            dataIndex: 'group_name',
          },
          // {
          //   title: '编号',
          //   align: 'center',
          //   dataIndex: 'panel_addr',
          //   scopedSlots: { customRender: 'tags' }
          // },
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
    methods: {
      loadData (arg) {
        this.getDataList(arg)
      },
      getDataList (arg) {
        if (arg === 1) {
          this.ipagination.current = 1
        }
        const params = {...this.queryParam}
        params.current = this.ipagination.current
        params.size = this.ipagination.pageSize
        this.loading = true
        getPanelGroupList(params).then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            this.dataSource = res.result.records
            this.ipagination.total = res.result.total || 0
          } else {
            this.$message.warning(res.message)
          }
          this.loading = false
        })
      },
      handleEdit (record) {
        this.$refs.addBlockModal.edit(record)
      },
      handleDevice (record) {
        this.$refs.addDeviceModal.edit(record)
      },
      handleGrouping (record) {
        this.$refs.addMemberModal.edit(record)
      },
      handleDelete (id) {
        delPanelGroup(id, '00').then(res => {
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
