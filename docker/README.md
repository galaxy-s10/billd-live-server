# Mysql 配置文件

未修改过

# Redis 配置文件

## conf/redis.conf

```
# TIP redis外部访问
bind 0.0.0.0

# TIP 默认yes，如果设置为yes，则只允许在本机的回环连接，其他机器无法连接
protected-mode no

# TIP ACL配置
aclfile /etc/redis/users.acl

# TIP redis持久化
appendonly yes
```

## conf/users.acl

> 即允许空账号登录，或者使用账号：`billd_live_redis_test`，密码：`redis123.`登录

```
user default on nopass ~* &* +@all
user billd_live_redis_test on #874b810175570e2b33e44677fee1ce30c5c83282034b047db7b6a0501195f62b ~* &* +@all
```

# SRS 配置文件

## conf/rtc2rtmp

```
# TIP http回调
  http_hooks {
    enabled on;
    on_publish http://192.168.1.102:4300/live_room/publish;
    on_unpublish http://192.168.1.102:4300/live_room/unpublish;
  }
```
