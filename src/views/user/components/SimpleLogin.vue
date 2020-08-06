<script>
import md5 from 'md5'
import { mapActions } from 'vuex'
import { timeFix, isAjaxSuccess } from '@/utils/util'
import { isEmail } from '@/utils/validator'
import config from '@/config/defaultSettings'
export default {
  name: 'SimpleLogin',
  data () {
    return {
      LoginForm: this.$form.createForm(this),
      LoginRules: {
        username: [ 'username', { initialValue: 'admin', rules: [{ required: true, message: '请输入帐户名或邮箱地址' }, { validator: this.handleUsernameOrEmail }], validateTrigger: ['blur', 'change'] } ],
        password: [ 'password', { initialValue: '12345678', rules: [{ required: true, message: '请输入密码' }], validateTrigger: 'blur' } ]
      },
      state: {
        time: 60,
        loginStatus: false,
        // login type: 0 email, 1 username, 2 telephone
        loginType: 0
      }
    }
  },
  methods: {
    ...mapActions(['Login', 'Logout']),
    handleUsernameOrEmail (rule, value, callback) {
      const { state } = this
      state.loginType = 1 - isEmail(value)
      callback()
    },
    handleSubmit (e) {
      e.preventDefault()
      const {
        LoginForm: { validateFields },
        state,
        Login
      } = this

      state.loginStatus = true

      validateFields(['username', 'password'], { force: true }, (err, values) => {
        if (!err) {
          console.log('login form', values)
          const loginParams = { ...values }
          delete loginParams.username
          loginParams[!state.loginType ? 'email' : 'username'] = values.username
          loginParams.password = md5(values.password)
          Login(loginParams)
            .then((res) => this.loginSuccess(res))
            .catch(err => this.requestFailed(err))
            .finally(() => {
              state.loginStatus = false
            })
        } else {
          setTimeout(() => {
            state.loginStatus = false
          }, 600)
        }
      })
    },
    loginSuccess (res) {
      if (isAjaxSuccess(res.code)) {
        this.$router.push({ path: '/' })
        setTimeout(() => {
          this.$notification.success({
            message: '欢迎',
            description: `${timeFix()}，欢迎回来`
          })
        }, 1000)
      } else {
        this.$notification.error({
            message: '错误',
            description: res.message
          })
      }
      this.isLoginError = false
    },
    requestFailed (err) {
      this.isLoginError = true
      this.$notification['error']({
        message: '错误',
        description: ((err.response || {}).data || {}).message || '请求出现错误，请稍后再试',
        duration: 4
      })
    },
  },
  render () {
    const placeholderIconStl = { color: 'rgba(0,0,0,.25)' }
    return (
      <a-form id="formLogin" class="user-layout-login" ref="formLogin" form={this.LoginForm} onSubmit={this.handleSubmit}>
        <a-form-item>
          <a-input size="large" type="text" placeholder="输入登录账户" v-decorator={this.LoginRules.username}>
            <a-icon slot="prefix" type="user" style={ placeholderIconStl } />
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input size="large" type="password" autocomplete="false" placeholder="输入用户密码" v-decorator={this.LoginRules.password}>
            <a-icon slot="prefix" type="lock" style={ placeholderIconStl } />
          </a-input>
        </a-form-item>
        {
          config.LoginLayout.forgetPassword && (
            <a-form-item>
              <a-checkbox v-decorator={['rememberMe']}>自动登录</a-checkbox>
              <router-link
                to={{ name: 'recover', params: { user: 'aaa' } }}
                class="forge-password"
                style="float: right;"
              >忘记密码</router-link>
            </a-form-item>
          )
        }
        <a-form-item>
          <a-button
            html-type="submit"
            size="large"
            type="primary"
            class="login-button"
            loading={this.state.loginStatus}
            disabled={this.state.loginStatus}
          >确定</a-button>
        </a-form-item>
        {
          config.LoginLayout.otherLoginTypes && config.LoginLayout.otherLoginTypes.length && (
            <div class="user-login-other">
              <span>其他登录方式</span>
              {
                config.LoginLayout.otherLoginTypes.map(type => {
                  return (<a><a-icon class="item-icon" type={type.iconCls}></a-icon></a>)
                })
              }
              <router-link class="register" to={{ name: 'register' }}>注册账户</router-link>
            </div>
          )
        }
      </a-form>
    )
  },
}
</script>

<style lang="less" scoped>
.user-layout-login{
  user-select: none;
  margin-top: 20px;

  .forge-password {
    font-size: 14px;
  }
  a-form-item:last-of-type{
    margin-top: 24px;
  }
  .login-button{
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}
</style>
