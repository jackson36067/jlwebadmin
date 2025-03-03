export type subMenu = {
  pid: string;
  title: string;
  name: string;
  component: string;
  icon: string;
  path: string;
};
export type menuVO = {
  id: string;
  type: number;
  icon: string;
  iFrame: string;
  cache: string;
  hidden: string;
  title: string;
  permission: string;
  path: string;
  name: string;
  component: string;
  menuSort: number;
  pid: string;
  createTime: string;
  menuListVOList: menuVO[];
  subMenuVOList: menuVO[];
};

export type menuRowInfo = {
  id: string;
  type: number;
  icon: string;
  iFrame: string;
  cache: string;
  hidden: string;
  title: string;
  permission: string;
  path: string;
  name: string;
  component: string;
  menuSort: number;
  pid: string;
  createTime: string;
  children: menuRowInfo[];
};
export type menuUpdateRow = {
  id: string;
  type: number;
  icon: string;
  iFrame: boolean;
  cache: boolean;
  hidden: boolean;
  title: string;
  permission: string;
  path: string;
  name: string;
  component: string;
  menuSort: number;
  pid: string;
};
