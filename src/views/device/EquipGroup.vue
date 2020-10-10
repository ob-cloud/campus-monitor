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
          </a-col> -->

          <a-col :md="6" :sm="8">
            <a-form-item label="网关">
              <a-select placeholder="请选择网关" v-model="queryParam.oboxSerialId" allowClear>
                <a-select-option v-for="item in oboxList" :key="item.obox_serial_id" :value="item.obox_serial_id">
                  {{ item.obox_name }}（{{ item.obox_status === 1 ? '在线' : '离线' }}）
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>


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
    <div v-isPermitted="'device:equip:add'" class="table-operator" style="border-top: 5px">
      <a-button @click="handleAdd" type="primary" icon="plus">添加</a-button>
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
        rowKey="groupId"
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
          <a v-isPermitted="'device:equip:edit'" @click="handleEditName(record)">编辑</a>

          <a-divider v-isPermitted="'device:equip:edit'" type="vertical" />

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="TypeHints.isSimpleLed(record.groupChildType)" v-isPermitted="'device:equip:control'" @click="handleControl(record)">
                组控
              </a-menu-item>
              <a-menu-item v-isPermitted="'device:equip:member'" @click="handleMember(record)">
                成员
              </a-menu-item>
              <a-menu-item v-isPermitted="'device:equip:delete'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.groupId)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <equip-group-modal ref="modalForm" @ok="modalFormOk" @close="modalClose"></equip-group-modal>
    <edit-equip-group-modal ref="editModal" @ok="loadData()"></edit-equip-group-modal>
    <equip-group-member-control-modal ref="memberModal" @ok="loadData()"></equip-group-member-control-modal>
    <equip-group-lamp-control-modal ref="lampModal" @ok="loadData()"></equip-group-lamp-control-modal>
  </a-card>
</template>

<script>
import EquipGroupModal from './modules/EquipGroupModal'
import EditEquipGroupModal from './modules/EditEquipGroupModal'
import EquipGroupMemberControlModal from './modules/EquipGroupMemberControlModal'
import EquipGroupLampControlModal from './modules/EquipGroupLampControlModal'
import { getLocalDeviceGroupList, delDeviceGroup, getAllOboxList } from '@/api/device'
import { ProListMixin } from '@/utils/mixins/ProListMixin'
import { Descriptor, TypeHints } from 'hardware-suit'
export default {
  name: '',
  mixins: [ ProListMixin ],
  components: {
    EquipGroupModal,
    EditEquipGroupModal,
    EquipGroupMemberControlModal,
    EquipGroupLampControlModal
  },
  data() {
    return {
      description: '这是用户管理页面',
      queryParam: {
        pageNo: 1,
        pageSize: 10
      },
      oboxList: [],
      TypeHints,
      columns: [
        {
          title: '组号',
          align: 'center',
          dataIndex: 'groupId',
        },
        {
          title: '名称',
          align: 'center',
          dataIndex: 'groupName',
        },
        {
          title: '网关序列号',
          align: 'center',
          dataIndex: 'oboxSerialId',
        },
        {
          title: '组类型',
          align: 'center',
          dataIndex: 'groupType',
          customRender (t) {
            return Descriptor.getTypeDescriptor(t)
          }
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'groupState',
          customRender (status, record) {
            return Descriptor.getStatusDescriptor(status, record.groupType, record.groupChildType)
          }
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
  created () {
    this.getOboxList()
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
      getLocalDeviceGroupList(params).then((res) => {
        if (this.$isAjaxSuccess(res.code)) {
          this.dataSource = res.result.records
          this.ipagination.total = res.result.total || 0
        } else {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },
    getOboxList () {
      getAllOboxList().then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.oboxList = res.result
        }
      })
    },
    handleDelete (id) {
      delDeviceGroup(id).then(res => {
        if (this.$isAjaxSuccess(res.code)) {
          this.loadData(1)
          this.$message.success('删除成功')
        } else {
          this.$message.error(res.message)
        }
      })
    },
    handleEditName (record) {
      this.$refs.editModal.edit(record)
    },
    handleMember (record) {
      this.$refs.memberModal.edit(record)
    },
    handleControl (record) {
      this.$refs.lampModal.edit(record)
    },
    modalFormOk () {
      this.loadData()
    },
    modalClose (refresh) {
      refresh && this.loadData()
    }
  }

}
</script>
