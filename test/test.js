const data = [
  {
    id: 7,
    p_id: 1, // 示例：生活的父节点ID
    status: 0,
    hot_status: 1,
    name: '生活',
    priority: 16,
    remark: '生活分区',
    created_at: '2025-01-02 14:03:43',
    updated_at: '2025-01-02 14:03:43',
    deleted_at: null,
  },
  {
    id: 88,
    p_id: 7, // 时尚的父节点为生活
    status: 0,
    hot_status: 1,
    name: '时尚',
    priority: 9,
    remark: '',
    created_at: '2025-01-02 14:03:43',
    updated_at: '2025-01-02 14:03:43',
    deleted_at: null,
  },
  {
    id: 89,
    p_id: 88, // 时尚-1的父节点为时尚
    status: 0,
    hot_status: 1,
    name: '时尚-1',
    priority: 9,
    remark: '',
    created_at: '2025-01-02 14:03:43',
    updated_at: '2025-01-02 14:03:43',
    deleted_at: null,
  },
];

function buildTree(data) {
  const map = {};
  const tree = [];

  // 创建节点映射
  data.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  // 构建树形结构
  data.forEach((item) => {
    if (map[item.p_id]) {
      // 如果父节点存在，添加到父节点的子节点数组中
      map[item.p_id].children.push(map[item.id]);
    } else {
      // 如果父节点不存在，则将其作为顶级节点
      tree.push(map[item.id]);
    }
  });

  return tree;
}

const treeStructure = buildTree(data);
console.log(JSON.stringify(treeStructure, null, 2));
