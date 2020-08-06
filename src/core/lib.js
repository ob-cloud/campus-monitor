import Vue from 'vue'
import VueStorage from 'vue-ls'
import config from '@/config/defaultSettings'

// styles
import '@/assets/styles/global.less'
import '@/assets/styles/pro.less'

// base library
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
// import Viser from 'viser-vue'

// ext library
import MultiTab from '@/components/MultiTab'

// util
import { isAjaxSuccess } from '@/utils/util'

// global filter
import '@/utils/filter'

Vue.use(Antd)
// Vue.use(Viser)
Vue.use(MultiTab)
Vue.use(VueStorage, config.storageOptions)

Vue.prototype.$isAjaxSuccess = isAjaxSuccess
