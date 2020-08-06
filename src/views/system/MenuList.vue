<template>
  <a-card :bordered="false">

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button @click="batchDel" v-if="selectedRowKeys.length > 0" ghost type="primary" icon="delete">批量删除
      </a-button>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>已选择&nbsp;
        <a style="font-weight: 600">
          {{ selectedRowKeys.length }}
        </a>项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table :columns="columns" size="middle" :pagination="false" :dataSource="dataSource" :loading="loading"
               :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
      >

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">
              更多
              <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="handleAddSub(record)">添加子菜单</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
        <!-- 字符串超长截取省略号显示 -->
        <span slot="url" slot-scope="text">
          <ellipsis :length="25" tooltip>
            {{ text }}
          </ellipsis>
        </span>
        <!-- 字符串超长截取省略号显示-->
        <span slot="component" slot-scope="text">
          <ellipsis :length="25" tooltip>
            {{ text }}
          </ellipsis>
        </span>
      </a-table>

    </div>
    <!-- table区域-end -->

    <menu-modal ref="modalForm" @ok="modalFormOk"></menu-modal>

  </a-card>
</template>

<script>
  import MenuModal from './modules/MenuModal'
  import { getMenuList } from '@/api/system'
  import { ProListMixin } from '@/utils/mixins/ProListMixin'
  import Ellipsis from '@/components/Ellipsis'
  // import { isAjaxSuccess } from '@/utils/util'

  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name'
    }, {
      title: '菜单类型',
      dataIndex: 'menuType',
      key: 'menuType',
      customRender: function(text) {
        return ['菜单', '子菜单', '按钮/权限'][text] || text
      }
    }, {
      title: 'icon',
      dataIndex: 'icon',
      key: 'icon'
    }, {
      title: '组件',
      dataIndex: 'component',
      key: 'component',
      scopedSlots: { customRender: 'component' }
    }, {
      title: '路径',
      dataIndex: 'url',
      key: 'url',
      scopedSlots: { customRender: 'url' }
    }, {
      title: '排序',
      dataIndex: 'sortNo',
      key: 'sortNo'
    }, {
      title: '操作',
      dataIndex: 'action',
      scopedSlots: { customRender: 'action' },
      align: 'center',
      width: 150
    }
  ]

  export default {
    name: 'MenuList',
    mixins: [ProListMixin],
    components: {
      MenuModal,
      Ellipsis
    },
    data () {
      return {
        description: '这是菜单管理页面',
        // 表头
        columns: columns,
        loading: false,
        url: {
          list: '/sys/permission/list',
          delete: '/sys/permission/delete',
          deleteBatch: '/sys/permission/deleteBatch'
        }
      }
    },
    methods: {
      loadData () {
        this.dataSource = []
        getMenuList().then((res) => {
          if (this.$isAjaxSuccess(res.code)) {
            console.log(res.result)
            this.dataSource = res.result
          }
        })
      },
      handleAddSub (record) {
        this.$refs.modalForm.title = "添加子菜单"
        this.$refs.modalForm.localMenuType = 1
        this.$refs.modalForm.disableSubmit = false
        this.$refs.modalForm.edit({
          status: '1',
          permsType: '1',
          route: true,
          parentId: record.id
        })
      }
    }
  }
</script>
