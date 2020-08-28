<template>
  <div class="logo">
    <router-link :to="{name:'dashboard'}">
      <!-- <LogoSvg alt="logo" /> -->
      <!-- <Logo alt="logo" /> -->
      <!-- <img :src="Logo" alt="logo">
      <h1 v-if="showTitle">{{ title }}</h1> -->
      <img :src="systemLogo" alt="logo">
      <h1 v-if="showTitle">{{ systemTitle }}</h1>
    </router-link>
  </div>
</template>

<script>
// import LogoSvg from '@/assets/logo.svg?inline'
// import Logo from '@/assets/logo.png'
import config from '@/config/defaultSettings'
export default {
  name: 'Logo',
  data () {
    return {
      // Logo
    }
  },
  computed: {
    systemTitle () {
      return config.pageOptions.title
    },
    systemLogo () {
      return require('@/assets/' + config.pageOptions.logo)
    },
  },
  props: {
    title: {
      type: String,
      default: 'Admin Pro',
      required: false
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false
    }
  }
}
</script>
<style lang="less" scoped>
@height: 59px;

.sider {
  box-shadow: none !important;
  .logo {
    height: @height !important;
    line-height: @height !important;
    box-shadow: none !important;
    transition: background 300ms;

    a {
      color: white;
      &:hover {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  &.light .logo {
    background-color: #1890ff;
  }
}
</style>
