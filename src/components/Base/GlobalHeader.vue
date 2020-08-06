<script>
import UserMenu from '../tools/UserMenu'
import SMenu from '../Menu'
import Logo from '../tools/Logo'
import { mixin } from '@/utils/mixin'

export default {
  name: 'GlobalHeader',
  components: {
    UserMenu,
    SMenu,
    Logo
  },
  mixins: [mixin],
  props: {
    mode: {
      type: String,
      // sidemenu, topmenu
      default: 'sidemenu'
    },
    menus: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    device: {
      type: String,
      required: false,
      default: 'desktop'
    }
  },
  data () {
    return {
      visible: true,
      oldScrollTop: 0
    }
  },
  mounted () {
    document.addEventListener('scroll', this.handleScroll, { passive: true })
  },
  methods: {
    handleScroll () {
      if (!this.autoHideHeader) {
        return
      }

      const scrollTop = document.body.scrollTop + document.documentElement.scrollTop
      if (!this.ticking) {
        this.ticking = true
        requestAnimationFrame(() => {
          if (this.oldScrollTop > scrollTop) {
            this.visible = true
          } else if (scrollTop > 300 && this.visible) {
            this.visible = false
          } else if (scrollTop < 300 && !this.visible) {
            this.visible = true
          }
          this.oldScrollTop = scrollTop
          this.ticking = false
        })
      }
    },
    toggle () {
      this.$emit('toggle')
    }
  },
  beforeDestroy () {
    document.body.removeEventListener('scroll', this.handleScroll, true)
  },
  render () {
    const isMobile = this.device === 'mobile'
    return (
      this.visible && (
        <a-layout-header
          class={[this.fixedHeader && 'ant-header-fixedHeader', this.sidebarOpened ? 'ant-header-side-opened' : 'ant-header-side-closed' ]}
          style={{padding: '0'}}>
          {
            this.mode === 'sidemenu' ?
            (
              <div class="header">
                { isMobile && <a-icon class="trigger" type={this.collapsed ? 'menu-fold' : 'menu-unfold'} onClick={this.toggle} />  }
                { !isMobile && <a-icon class="trigger" type={this.collapsed ? 'menu-unfold' : 'menu-fold'} onClick={this.toggle} /> }
                <user-menu></user-menu>
              </div>
            ) : (
              <div class={['top-nav-header-index', this.theme]}>
                <div class="header-index-wide">
                  <div class="header-index-left">
                    <logo class="top-nav-header" show-title={!isMobile} />
                    { isMobile && <a-icon class="trigger" type={this.collapsed ? 'menu-fold' : 'menu-unfold'} onClick={this.toggle}></a-icon> }
                    { !isMobile && <s-menu mode="horizontal" menu={this.menus} theme={this.theme}></s-menu> }
                  </div>
                  <user-menu class="header-index-right"></user-menu>
                </div>
              </div>
            )
          }
        </a-layout-header>
      )
    )
  },
}
</script>
