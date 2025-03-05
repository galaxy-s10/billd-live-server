## SRS

### 拉镜像

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200
```

### 复制配置文件到本地

创建一个临时的容器，在它里面复制配置文件到本地：

> 注意，本地需要存在/node/docker/srs/ 这个目录

本地复制时用这个命令：

```bash
LOCAL_DOCKER_SRS_PATH=/node/docker/srs \
DOCKER_SRS_TMP=`docker run -d registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200` \
&& docker cp $DOCKER_SRS_TMP:/usr/local/srs/conf $LOCAL_DOCKER_SRS_PATH \
&& docker cp $DOCKER_SRS_TMP:/usr/local/srs/objs $LOCAL_DOCKER_SRS_PATH \
&& docker stop $DOCKER_SRS_TMP \
&& docker rm $DOCKER_SRS_TMP
```

### 启动容器

```bash
LOCAL_DOCKER_SRS_PATH=/node/docker/srs \
&& docker run -d \
--name billd_live_srs \
--env CANDIDATE=$(ifconfig en0 inet | grep 'inet ' | awk '{print $2}') \
-p 1935:1935 \
-p 5001:8080 \
-p 1985:1985 \
-p 8000:8000/udp \
-v $LOCAL_DOCKER_SRS_PATH/conf:/usr/local/srs/conf/ \
-v $LOCAL_DOCKER_SRS_PATH/objs:/usr/local/srs/objs/ \
registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200 objs/srs \
-c conf/rtc2rtmp.conf
```

## Coturn

### 拉镜像

```bash
docker pull coturn/coturn
```

### 启动容器

```bash
LOCAL_DOCKER_COTURN_PATH=/node/docker/coturn \
&& docker run -d --network=host  \
--name billd_live_coturn \
-v $LOCAL_DOCKER_COTURN_PATH/coturn.conf:/my/coturn.conf \
coturn/coturn -c /my/coturn.conf
```

## Rabbit

### 拉镜像

```bash
docker pull rabbitmq:3.11-management
```

### 启动容器

```bash
docker run -d \
--name billd_live_rabbitmq \
-p 5672:5672 \
-p 15672:15672 \
rabbitmq:3.11-management
```
