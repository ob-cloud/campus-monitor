/**
 * 项目默认配置项
 * primaryColor - 默认主题色, 如果修改颜色不生效，请清理 localStorage
 * navTheme - sidebar theme ['dark', 'light'] 两种主题
 * colorWeak - 色盲模式
 * layout - 整体布局方式 ['sidemenu', 'topmenu'] 两种布局
 * fixedHeader - 固定 Header : boolean
 * fixSiderbar - 固定左侧菜单栏 ： boolean
 * autoHideHeader - 向下滚动时，隐藏 Header : boolean
 * contentWidth - 内容区布局： 流式 |  固定
 *
 * storageOptions: {} - Vue-ls 插件配置项 (localStorage/sessionStorage)
 *
 */

export default {
  primaryColor: '#52C41A', // primary color of ant design
  navTheme: 'light', // theme for nav menu
  layout: 'sidemenu', // nav menu position: sidemenu or topmenu
  contentWidth: 'Fixed', // layout of content: Fluid or Fixed, only works when layout is topmenu
  fixedHeader: true, // sticky header
  fixSiderbar: true, // sticky siderbar /// when using topmenu layout, fixSiderbar should be false
  autoHideHeader: false, //  auto hide header
  colorWeak: false,
  multiTab: true,
  fixedMultiTab: true,
  production: process.env.NODE_ENV === 'production' && process.env.VUE_APP_PREVIEW !== 'true',
  // vue-ls options
  storageOptions: {
    namespace: 'PRO__', // key prefix
    name: 'ls', // name variable Vue.[ls] or this.[$ls],
    storage: 'local' // storage name session, local, memory
  },
  ///// 此下面配置忽略
  // TODO Delete
  pageOptions: {
    logo: 'http://placehold.it/50x50/333/fff/?text=pro',
    title: 'Admin-Pro',
    // description: 'On-Bright Admin Pro',
    hasFooter: false, // hasFooter 为 true 时， 下面脚注配置生效
    copyright: 'OnBright.tld',
    links: [{
      href: 'www.baidu.com',
      label: '条款'
    }, {
      href: 'www.baidu.com',
      label: '声明'
    }]
  },
  // TODO 路由业务配置
  routerOptions: {
    isStaticHomeTab: true,  // 首页固定显示 用于MultiTab
    index: {
      name: 'dashboard-analysis',
      path: '/dashboard/analysis',
      fullPath: '/dashboard/analysis',
      meta: {
        icon: 'dashboard',
        title: '首页'
      }
    }
  },
  // TODO Delete 登录页面配置 - 迁移至脚手架
  LoginLayout: {
    mode: 'simple', // mode: simple, multiple
    forgetPassword: false, // password forgotten
  },
  GlobalFooter: {

  }
}
