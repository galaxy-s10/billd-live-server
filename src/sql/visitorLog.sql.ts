export const getAnalysisSql = (data: {
  rangTimeStart: string;
  rangTimeEnd: string;
  orderName: string;
  orderBy: string;
}) => `
SELECT
  COALESCE ( sum( duration ), 0 ) AS sum_duration,
  t3.day AS format_date,
  GROUP_CONCAT( DISTINCT ip SEPARATOR ', ' ) AS unique_ip_str,
	GROUP_CONCAT( DISTINCT user_id SEPARATOR ', ' ) AS unique_user_id_str,
	GROUP_CONCAT( ip SEPARATOR ', ' ) AS ip_str,
	GROUP_CONCAT( user_id SEPARATOR ', ' ) AS user_id_str,
	GROUP_CONCAT( duration SEPARATOR ', ' ) AS duration_str
FROM
	(
	SELECT
		id,
		ip,
		user_id,
		live_room_id,
		duration,
		DATE_FORMAT( visitor_log.created_at, '%Y-%m-%d 00:00:00' ) AS format_created_at
	FROM
		visitor_log AS visitor_log
	WHERE
	( visitor_log.deleted_at IS NULL AND created_at >= '${data.rangTimeStart}' AND created_at <= '${data.rangTimeEnd}')) AS t2
	RIGHT JOIN mock_day_data AS t3 ON t2.format_created_at = t3.day
WHERE
	t3.day >= '${data.rangTimeStart}'
	AND t3.day <= '${data.rangTimeEnd}'
GROUP BY
	format_date
ORDER BY ${data.orderName} ${data.orderBy}
`;

export const getUserVisitRecordSql = (data: {
  userId: number;
  rangTimeStart: string;
  rangTimeEnd: string;
}) => {
  return `
  SELECT
    t3.day AS format_date,
    COALESCE ( user_id, ${data.userId} ) AS user_id,
    count( user_id ) AS user_id_nums,
    COALESCE ( sum( duration ), 0 ) AS sum_duration,
    COALESCE ( GROUP_CONCAT( DISTINCT live_room_id SEPARATOR ', ' ), '' ) AS live_room_id_str,
    COALESCE ( GROUP_CONCAT( duration SEPARATOR ', ' ), '' ) AS duration_str
  FROM
    ( SELECT user_id, duration, live_room_id, DATE_FORMAT( created_at, '%Y-%m-%d' ) AS format_date FROM visitor_log WHERE deleted_at IS NULL AND user_id = ${data.userId} AND created_at >= '${data.rangTimeStart}' AND created_at <= '${data.rangTimeEnd}' ) AS subquery
    RIGHT JOIN mock_day_data AS t3 ON t3.day = subquery.format_date
  WHERE
    t3.day >= '${data.rangTimeStart}'
    AND t3.day <= '${data.rangTimeEnd}'
  GROUP BY
  day
  `;
};

export const getIpVisitRecordSql = (data: {
  ip: string;
  rangTimeStart: string;
  rangTimeEnd: string;
}) => {
  return `
  SELECT
    t3.day AS format_date,
    COALESCE ( ip, '${data.ip}' ) AS ip,
    count( ip ) AS ip_nums,
    COALESCE ( sum( duration ), 0 ) AS sum_duration,
    COALESCE ( GROUP_CONCAT( DISTINCT live_room_id SEPARATOR ', ' ), '' ) AS live_room_id_str,
    COALESCE ( GROUP_CONCAT( duration SEPARATOR ', ' ), '' ) AS duration_str
  FROM
    ( SELECT ip, duration, live_room_id, DATE_FORMAT( created_at, '%Y-%m-%d' ) AS format_date FROM visitor_log WHERE deleted_at IS NULL AND ip = '${data.ip}' AND created_at >= '${data.rangTimeStart}' AND created_at <= '${data.rangTimeEnd}' ) AS subquery
    RIGHT JOIN mock_day_data AS t3 ON t3.day = subquery.format_date
  WHERE
    t3.day >= '${data.rangTimeStart}'
    AND t3.day <= '${data.rangTimeEnd}'
  GROUP BY
  day
  `;
};
