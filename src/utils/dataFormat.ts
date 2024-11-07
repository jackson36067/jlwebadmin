// 封装生成select-tree数据函数
export function transformData(data: any) {
  return data.map((item: any) => {
    return {
      value: item.id,
      label: item.name,
      children: item.subDeptVOList ? transformData(item.subDeptVOList) : [], // 递归转换子部门
    };
  });
}
