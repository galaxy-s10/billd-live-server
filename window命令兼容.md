mac、linux 本地复制时用这个命令：

```bash
LOCAL_DOCKER_SRS_PATH=/Users/huangshuisheng/Desktop/docker/srs \
DOCKER_SRS_TMP=`docker run -d registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200` \
&& docker cp $DOCKER_SRS_TMP:/usr/local/srs/conf $LOCAL_DOCKER_SRS_PATH \
&& docker cp $DOCKER_SRS_TMP:/usr/local/srs/objs $LOCAL_DOCKER_SRS_PATH \
&& docker stop $DOCKER_SRS_TMP \
&& docker rm $DOCKER_SRS_TMP
```

window 本地复制时用这个命令：

```bash
LOCAL_DOCKER_SRS_PATH=C:\Users\\huangshuisheng\\Desktop\\docker\\srs \
DOCKER_SRS_TMP=`docker run -d registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200` \
&& docker cp $DOCKER_SRS_TMP:/usr/local/srs/conf $LOCAL_DOCKER_SRS_PATH \
&& docker cp $DOCKER_SRS_TMP:/usr/local/srs/objs $LOCAL_DOCKER_SRS_PATH \
&& docker stop $DOCKER_SRS_TMP \
&& docker rm $DOCKER_SRS_TMP
```
