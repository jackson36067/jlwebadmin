import httpInstance from "@/utils/http";

/**
 * 获取任务调度列表
 * @param params
 * @returns
 */
export const getTaskListAPI = (params: object) => {
  return httpInstance({
    method: "get",
    url: "quartz/list",
    params,
  });
};

/**
 * 新增任务
 * @param data
 * @returns
 */
export const addTaskAPI = (data: object) => {
  return httpInstance({
    method: "post",
    url: "quartz/add",
    data,
  });
};

/**
 * 执行任务操作
 * @param data
 * @returns
 */
export const resumeTaskAPI = (data: object) => {
  return httpInstance({
    method: "post",
    url: "quartz/resume",
    data,
  });
};

/**
 * 暂停任务
 * @param data
 * @returns
 */
export const pauseTaskAPI = (data: object) => {
  return httpInstance({
    method: "post",
    url: "quartz/pause",
    data,
  });
};

/**
 * 根据id获取任务信息
 * @param id
 * @returns
 */
export const getTaskInfoByIdAPI = (id: string) => {
  return httpInstance({
    method: "get",
    url: `quartz/${id}`,
  });
};

/**
 * 编辑任务
 * @param data
 * @returns
 */
export const updateTaskAPI = (data: object) => {
  return httpInstance({
    method: "put",
    url: "quartz/update",
    data,
  });
};

/**
 * 删除任务
 * @param data
 * @returns
 */
export const deleteTaskAPI = (data: Array<object>) => {
  return httpInstance({
    method: "delete",
    url: "quartz/delete",
    data,
  });
};
