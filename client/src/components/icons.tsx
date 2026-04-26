const iconStub = (s: number) => <span style={{ display: 'inline-block', width: s, height: s }} />

export const Icon = {
  Needle:    ({ s = 20 }: { s?: number }) => iconStub(s),
  Leaf:      ({ s = 20 }: { s?: number }) => iconStub(s),
  Leaf2:     ({ s = 20 }: { s?: number }) => iconStub(s),
  Cup:       ({ s = 20 }: { s?: number }) => iconStub(s),
  Calendar:  ({ s = 20 }: { s?: number }) => iconStub(s),
  ArrowLeft: ({ s = 16 }: { s?: number }) => iconStub(s),
  Close:     ({ s = 18 }: { s?: number }) => iconStub(s),
  Check:     ({ s = 16 }: { s?: number }) => iconStub(s),
  Phone:     ({ s = 16 }: { s?: number }) => iconStub(s),
  Mail:      ({ s = 16 }: { s?: number }) => iconStub(s),
  Clock:     ({ s = 16 }: { s?: number }) => iconStub(s),
  Pin:       ({ s = 16 }: { s?: number }) => iconStub(s),
  Menu:      ({ s = 22 }: { s?: number }) => iconStub(s),
  Users:     ({ s = 20 }: { s?: number }) => iconStub(s),
  Dot:       ({ s = 20 }: { s?: number }) => iconStub(s),
  Inbox:     ({ s = 20 }: { s?: number }) => iconStub(s),
  Chart:     ({ s = 20 }: { s?: number }) => iconStub(s),
  Settings:  ({ s = 20 }: { s?: number }) => iconStub(s),
  Search:    ({ s = 20 }: { s?: number }) => iconStub(s),
}
