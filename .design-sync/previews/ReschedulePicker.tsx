import { ReschedulePicker } from 'keren-sarig-ui'

export const Default = () => (
  <div style={{ padding: 24, background: '#F5F1EA', maxWidth: 480 }}>
    <ReschedulePicker
      onSubmit={async () => ({ ok: true })}
      onClose={() => {}}
    />
  </div>
)
