// 封装生成select-tree数据函数
export function transformData(data) {
  return data.map((item) => {
    return {
      value: item.id,
      label: item.name,
      children: item.subDeptVOList ? transformData(item.subDeptVOList) : [], // 递归转换子部门
    };
  });
}
