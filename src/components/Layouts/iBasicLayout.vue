<script>
import { triggerWindowResizeEvent } from '@/utils/util'
import { mapState, mapActions } from 'vuex'
import { mixin, mixinDevice } from '@/utils/mixin'
import config from '@/config/defaultSettings'

import RouteView from '@layout/RouteView'
import SideMenu from '@/components/Menu/SideMenu'
import GlobalHeader from '@/components/Base/GlobalHeader'
import GlobalFooter from '@/components/Base/GlobalFooter'

export default {
  name: 'BasicLayout',
  mixins: [mixin, mixinDevice],
  components: {
    RouteView,
    SideMenu,
    GlobalHeader,
    GlobalFooter
    // SettingDrawer
  },
  data () {
    return {
      production: config.production,
      collapsed: false,
      menus: [],
      tabConfig: {
        fix: config.routerOptions.isStaticHomeTab,
        index: config.routerOptions.index
      }
    }
  },
  computed: {
    ...mapState({
      mainMenu: state => state.permission.addRouters,
      permissionMenuList: state => state.user.permissionList
    }),
    contentPaddingLeft () {
      if (!this.fixSidebar || this.isMobile()) {
        return '0'
      }
      if (this.sidebarOpened) {
        return '256px'
      }
      return '80px'
    }
  },
  watch: {
    sidebarOpened (val) {
      this.collapsed = !val
    }
  },
  created () {
    this.menus = this.permissionMenuList
    this.collapsed = !this.sidebarOpened
  },
  mounted () {
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }
  },
  methods: {
    ...mapActions(['setSidebar']),
    toggle () {
      this.collapsed = !this.collapsed
      this.setSidebar(!this.collapsed)
      triggerWindowResizeEvent()
    },
    paddingCalc () {
      let left = ''
      if (this.sidebarOpened) {
        left = this.isDesktop() ? '256px' : '80px'
      } else {
        left = (this.isMobile() && '0') || ((this.fixSidebar && '80px') || '0')
      }
      return left
    },
    menuSelect () {
      if (!this.isDesktop()) {
        this.collapsed = false
      }
    },
    drawerClose () {
      this.collapsed = false
    },
    renderMobileSidebar () {
      return (
        <a-drawer
          placement="left"
          wrapClassName={`drawer-sider ${this.navTheme}`}
          closable={false}
          visible={this.collapsed}
          onClose={this.drawerClose}
        >
          <side-menu
            mode="inline"
            menus={this.menus}
            theme={this.navTheme}
            collapsed={false}
            collapsible={true}
            onMenuSelect={this.menuSelect}
          ></side-menu>
        </a-drawer>
      )
    },
    renderSidebar () {
      return (
        <side-menu
          mode="inline"
          menus={this.menus}
          theme={this.navTheme}
          collapsed={this.collapsed}
          collapsible={true}
        ></side-menu>
      )
    }
  },
  render () {
    const sidebar = this.isMobile() ? this.renderMobileSidebar() : (this.isSideMenu() && this.renderSidebar())
    return (
      <a-layout class={['layout', this.device]}>
        {sidebar}
        <a-layout class={[this.layoutMode, `content-width-${this.contentWidth}`]} style={{ paddingLeft: this.contentPaddingLeft, minHeight: '100vh' }}>
          {/* layout header */}
          <global-header
            mode={this.layoutMode}
            menus={this.menus}
            theme={this.navTheme}
            collapsed={this.collapsed}
            device={this.device}
            onToggle={this.toggle}
          />

          {/* <!-- layout content --> */}
          <a-layout-content style={{ height: '100%', margin: '24px 24px 0', paddingTop: this.fixedHeader ? '64px' : '0' }}>
            {
              this.multiTab && (<multi-tab isHomeTabFix={this.tabConfig.fix} homeIndex={this.tabConfig.index}></multi-tab>)
            }
            <transition name="page-transition">
              <route-view />
            </transition>
          </a-layout-content>

          {/* <!-- layout footer --> */}
          <a-layout-footer>
            <global-footer />
          </a-layout-footer>

          {/* <!-- Setting Drawer (show in development mode) --> */}
          {/* <!-- <setting-drawer v-if="!production"></setting-drawer> --> */}
        </a-layout>
      </a-layout>
    )
  }
}
</script>
<style lang="less">
.page-transition-enter {
  opacity: 0;
}

.page-transition-leave-active {
  opacity: 0;
}

.page-transition-enter .page-transition-container,
.page-transition-leave-active .page-transition-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
