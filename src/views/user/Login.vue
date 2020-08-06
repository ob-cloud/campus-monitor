<script>
import SimpleLogin from './components/SimpleLogin'
// import MultipleLogin from './components/MultiLogin'
import config from '@/config/defaultSettings'
export default {
  name: 'Login',
  components: { SimpleLogin },
  beforeCreate () {
    // config.LoginLayout.mode === 'simple' && require('./components/login.less')
    require('./components/login.less')
  },
  render () {
    return (
      <div class="main">
        {
          // config.LoginLayout.mode === 'simple' ? (<SimpleLogin></SimpleLogin>) : (<MultipleLogin></MultipleLogin>)
          config.LoginLayout.mode === 'simple' ? (<SimpleLogin></SimpleLogin>) : (<span></span>)
        }
      </div>
    )
  },
}
</script>
