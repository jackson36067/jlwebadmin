import type { menuVO } from "./menu";

export type userLogin = {
  id: string;
  nickName: string;
  avatarPath: string;
  token: string;
  menuVOList: menuVO[];
  deptName: string;
  username: string;
  phone: string;
  email: string;
  gender: string;
};

export type rowUser = {
  id: string;
  username: string;
  nickName: string;
  gender: string;
  phone: string;
  email: string;
  deptName: string;
  enabled: boolean;
  createTime: string;
  isAdmin: boolean;
};
