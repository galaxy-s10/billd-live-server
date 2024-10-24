/**
 * 判断版本号大小，版本号是三位数，如：0.0.100
 */
function compareVersions(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  // console.log('v1Parts', v1Parts);
  // console.log('v2Parts', v2Parts);
  // 比较每个部分
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i += 1) {
    const v1Part = v1Parts[i] || 0; // 如果 v1Parts 没有该部分，视为 0
    const v2Part = v2Parts[i] || 0; // 如果 v2Parts 没有该部分，视为 0
    // console.log('v1Part', v1Part);
    // console.log('v2Part', v2Part);
    if (v1Part > v2Part) return 1; // version1 更大
    if (v1Part < v2Part) return 2; // version2 更大
  }

  return 0; // 两个版本相等
}

console.log(compareVersions('0.0.128', '0.0.130'));
