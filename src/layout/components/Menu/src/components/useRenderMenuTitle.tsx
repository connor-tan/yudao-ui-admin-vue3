import type { RouteMeta } from 'vue-router'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/hooks/web/useI18n'

export const useRenderMenuTitle = () => {
  const renderMenuTitle = (meta: RouteMeta) => {
    const { t } = useI18n()
    const { title = 'Please set title', icon } = meta

    return icon ? (
      <>
        <Icon icon={meta.icon}></Icon>
        <span
          class="v-menu__title truncate"
          style="padding-right: calc(var(--el-menu-base-level-padding) + 12px);"
          title={t(title as string)}
        >
          {t(title as string)}
        </span>
      </>
    ) : (
      <span
        class="v-menu__title truncate"
        style="padding-right: calc(var(--el-menu-base-level-padding) + 12px);"
        title={t(title as string)}
      >
        {t(title as string)}
      </span>
    )
  }

  return {
    renderMenuTitle
  }
}
