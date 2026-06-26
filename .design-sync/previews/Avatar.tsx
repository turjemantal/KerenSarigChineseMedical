import { Avatar } from 'keren-sarig-ui'

export const Names = () => (
  <div style={{ padding: 24, background: '#F5F1EA', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
    <Avatar name="קרן שריג" />
    <Avatar name="דנה לוי" />
    <Avatar name="יובל כהן" />
    <Avatar name="מיכל גולן" />
  </div>
)

export const Sizes = () => (
  <div style={{ padding: 24, background: '#F5F1EA', display: 'flex', gap: 16, alignItems: 'center' }}>
    <Avatar name="קרן שריג" size={24} />
    <Avatar name="קרן שריג" size={32} />
    <Avatar name="קרן שריג" size={48} />
    <Avatar name="קרן שריג" size={64} />
  </div>
)

export const WithTone = () => (
  <div style={{ padding: 24, background: '#F5F1EA', display: 'flex', gap: 16, alignItems: 'center' }}>
    <Avatar name="A" tone="#4A6B5C" />
    <Avatar name="B" tone="#C4634A" />
    <Avatar name="C" tone="#8B6F47" />
    <Avatar name="D" tone="#5C6F8B" />
  </div>
)
