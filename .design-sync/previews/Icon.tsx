import { Icon } from 'keren-sarig-ui'

const row = (icons: [string, JSX.Element][]) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
    {icons.map(([label, el]) => (
      <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {el}
        <span style={{ fontSize: 9, color: '#4A6B5C', fontFamily: 'monospace' }}>{label}</span>
      </div>
    ))}
  </div>
)

export const AllIcons = () => (
  <div style={{ padding: 24, background: '#F5F1EA', display: 'flex', flexDirection: 'column', gap: 24 }}>
    {row([
      ['Needle', <Icon.Needle s={20} />],
      ['Leaf', <Icon.Leaf s={20} />],
      ['Cup', <Icon.Cup s={20} />],
      ['Calendar', <Icon.Calendar s={20} />],
      ['Clock', <Icon.Clock s={20} />],
      ['Check', <Icon.Check s={20} />],
      ['Close', <Icon.Close s={20} />],
      ['ArrowLeft', <Icon.ArrowLeft s={20} />],
    ])}
    {row([
      ['Phone', <Icon.Phone s={20} />],
      ['Mail', <Icon.Mail s={20} />],
      ['Pin', <Icon.Pin s={20} />],
      ['Menu', <Icon.Menu s={20} />],
      ['Users', <Icon.Users s={20} />],
      ['Dot', <Icon.Dot s={20} />],
      ['Inbox', <Icon.Inbox s={20} />],
      ['Chart', <Icon.Chart s={20} />],
    ])}
    {row([
      ['Settings', <Icon.Settings s={20} />],
      ['Search', <Icon.Search s={20} />],
      ['ChevronPrev', <Icon.ChevronPrev s={20} />],
      ['ChevronNext', <Icon.ChevronNext s={20} />],
      ['Instagram', <Icon.Instagram s={20} />],
      ['Facebook', <Icon.Facebook s={20} />],
      ['Whatsapp', <Icon.Whatsapp s={20} />],
    ])}
  </div>
)

export const Sizes = () => (
  <div style={{ padding: 24, background: '#F5F1EA', display: 'flex', alignItems: 'center', gap: 20 }}>
    <Icon.Needle s={14} />
    <Icon.Needle s={20} />
    <Icon.Needle s={28} />
    <Icon.Needle s={36} />
  </div>
)
