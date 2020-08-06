<template>
  <global-layout>
    <multi-tab v-if="!isMobile() && multiTab" :class="this.fixedMultiTab && 'ant-multitab-fixedMultiTab'" :isHomeTabFix="tabConfig.fix" :homeIndex="tabConfig.index"></multi-tab>
    <transition name="page-transition">
      <IRouteView :style="{'margin-top': !isMobile() && this.fixedMultiTab ? '41px' : '0'}" />
    </transition>
  </global-layout>
</template>

<script>
import GlobalLayout from '@/components/Base/GlobalLayout'
import IRouteView from '@layout/RouteView'
import { mixin, mixinDevice } from '@/utils/mixin'
import config from '@/config/defaultSettings'

export default {
  name: 'BasicLayout',
  mixins: [ mixin, mixinDevice ],
  components: {
    GlobalLayout,
    IRouteView
  },
  data () {
    return {
      tabConfig: {
        fix: config.routerOptions.isStaticHomeTab,
        index: config.routerOptions.index
      }
    }
  }
}
</script>

<style lang="less">

  /*
 * The following styles are auto-applied to elements with
 * transition="page-transition" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the page transition by editing
 * these styles.
 */

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
