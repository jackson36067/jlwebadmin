export type deptList = {
  id: string;
  pid: string;
  name: string;
  deptSort: number;
  enabled: boolean;
  createTime: string;
  subDeptVOList: deptList[];
};

export type deptTree = {
  id: string;
  pid: string;
  name: string;
  deptSort: number;
  enabled: boolean;
  createTime: string;
  children: deptTree[];
};

export type deptRowInfo = {
  id: string;
  name: string;
  deptSort: string;
  enabled: boolean;
  pid: string;
  type: string;
};
