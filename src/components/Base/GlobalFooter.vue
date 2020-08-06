<script>
import config from '@/config/defaultSettings'
export default {
  name: 'GlobalFooter',
  data () {
    return {}
  },
  render () {
    const links = config.GlobalFooter.links
    const copyright = config.GlobalFooter.copyright
    const hasLinks = links && links.length
    const hasCopyRight = copyright && copyright.text
    return (
      <div class="footer">
      {
        hasLinks && (
          <div class="links">
            {
              Array.from(links).map(link => {
                return (
                  <a href={link.href || '#'} target={link.target || '_self'}>
                    { link.iconType && <a-icon type={link.iconType} /> }
                    { link.text }
                  </a>
                )
              })
            }
          </div>
        )
      }
      {
        hasCopyRight && (
          <div class="copyright">
            Copyright
            <a-icon type="copyright" /> { copyright.text }
          </div>
        )
      }
      </div>
    )
  },
}
</script>

<style lang="less" scoped>
.footer {
  padding: 0 16px;
  margin: 48px 0 24px;
  text-align: center;

  .links {
    margin-bottom: 8px;

    a {
      color: rgba(0, 0, 0, 0.45);

      &:hover {
        color: rgba(0, 0, 0, 0.65);
      }

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
</style>
