export type NobleAdapterEvents = {
  stateChange: (state: string) => void;
  addressChange: (...args: any[]) => void;
  scanStart: (...args: any[]) => void;
  scanStop: (...args: any[]) => void;
  discover: (...args: any[]) => void;
  connect: (...args: any[]) => void;
  disconnect: (...args: any[]) => void;
  rssiUpdate: (...args: any[]) => void;
  servicesDiscover: (...args: any[]) => void;
  includedServicesDiscover: (...args: any[]) => void;
  characteristicsDiscover: (...args: any[]) => void;
  read: (...args: any[]) => void;
  write: (...args: any[]) => void;
  broadcast: (...args: any[]) => void;
  notify: (...args: any[]) => void;
  descriptorsDiscover: (...args: any[]) => void;
  valueRead: (...args: any[]) => void;
  valueWrite: (...args: any[]) => void;
  handleRead: (...args: any[]) => void;
  handleWrite: (...args: any[]) => void;
  handleNotify: (...args: any[]) => void;
};

export interface NobleAdapter {}
