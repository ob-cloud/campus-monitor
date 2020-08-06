<script>
import RouteView from '@layout/RouteView'
import { mixinDevice } from '@/utils/mixin'
import config from '@/config/defaultSettings'

export default {
  name: 'UserLayout',
  components: { RouteView },
  mixins: [ mixinDevice ],
  mounted () {
    document.body.classList.add('userLayout')
    config.LoginLayout.mode === 'simple' && document.body.classList.add('simple')
  },
  beforeDestroy () {
    document.body.classList.remove('userLayout', 'simple')
  },
  methods: {
    renderHeader () {
      return (
        <div class="top">
          <div class="header">
            <a href="/">
              {
                config.pageOptions.logo && (
                  <img src={config.pageOptions.logo} class="logo" alt="logo" />
                )
              }
              <span class="title">{config.pageOptions.title || 'Admin-Pro'}</span>
            </a>
          </div>
          {
            config.pageOptions.description && (
              <div class="desc">
                {config.pageOptions.description}
              </div>
            )
          }
        </div>
      )
    },
    renderFooter () {
      return (
        <div class="footer">
          <div class="links">
            {
              config.pageOptions.links.map(item => {
                return (<a href={item.href || '_self'}>{item.label}</a>)
              })
            }
          </div>
          {
            config.pageOptions.copyright && (
              <div class="copyright">
                Copyright &copy; {config.pageOptions.copyright}
              </div>
            )
          }
        </div>
      )
    }
  },
  render () {
    return (
      <div id="userLayout" class={['user-layout-wrapper', this.device]}>
        <div class="container">
          {this.renderHeader()}
          <route-view></route-view>
          {
            config.pageOptions.hasFooter && this.renderFooter()
          }
        </div>
      </div>
    )
  }
}
</script>
<style lang="less" scoped>
#userLayout.user-layout-wrapper {
  height: 100%;

  &.mobile {
    .container {
      .main {
        max-width: 368px;
        width: 98%;
      }
    }
  }

  .container {
    width: 100%;
    min-height: 100%;
    // background: #f0f2f5 url(~@/assets/background.svg) no-repeat 50%;
    background-size: 100%;
    padding: 110px 0 144px;
    position: relative;

    a {
      text-decoration: none;
    }

    .top {
      text-align: center;

      .header {
        height: 44px;
        line-height: 44px;

        .badge {
          position: absolute;
          display: inline-block;
          line-height: 1;
          vertical-align: middle;
          margin-left: -12px;
          margin-top: -10px;
          opacity: 0.8;
        }

        .logo {
          height: 44px;
          vertical-align: top;
          margin-right: 16px;
          border-style: none;
        }

        .title {
          font-size: 33px;
          color: rgba(0, 0, 0, .85);
          font-family: Avenir, 'Helvetica Neue', Arial, Helvetica, sans-serif;
          font-weight: 600;
          position: relative;
          top: 2px;
        }
      }
      .desc {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.45);
        margin-top: 12px;
        margin-bottom: 40px;
      }
    }

    .main {
      min-width: 260px;
      width: 368px;
      margin: 0 auto;
    }

    .footer {
      position: absolute;
      width: 100%;
      bottom: 0;
      padding: 0 16px;
      margin: 48px 0 24px;
      text-align: center;

      .links {
        margin-bottom: 8px;
        font-size: 14px;
        a {
          color: rgba(0, 0, 0, 0.45);
          transition: all 0.3s;
          &:not(:last-child) {
            margin-right: 40px;
          }
        }
      }
      .copyright {
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
      }
    }
  }
}
</style>
