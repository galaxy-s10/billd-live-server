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
LOCAL_DOCKER_SRS_PATH=C:\\Users\\huangshuisheng\\Desktop\\docker\\srs \
DOCKER_SRS_TMP=`docker run -d registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200` \
&& docker cp $DOCKER_SRS_TMP:/usr/local/srs/conf $LOCAL_DOCKER_SRS_PATH \
&& docker cp $DOCKER_SRS_TMP:/usr/local/srs/objs $LOCAL_DOCKER_SRS_PATH \
&& docker stop $DOCKER_SRS_TMP \
&& docker rm $DOCKER_SRS_TMP
```

如果上面的命令报错，则一步步来：

1.启动一个临时容器

```bash
docker run -d registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200
```

实际执行效果：

```bash
➜  billd-live-server git:(master) ✗ docker run -d registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200
946e41646b6ab02fa0a34f417b3560ddc620b0e2032f755faa7f60a68d3b9834
➜  billd-live-server git:(master) ✗
```

> 启动容器后，会返回容器的 id

2.复制 conf

```bash
docker cp 946e41646b6ab02fa0a34f417b3560ddc620b0e2032f755faa7f60a68d3b9834:/usr/local/srs/conf C:\\Users\\huangshuisheng\\Desktop\\docker\\srs
```

3.复制 objs

```bash
docker cp 946e41646b6ab02fa0a34f417b3560ddc620b0e2032f755faa7f60a68d3b9834:/usr/local/srs/objs C:\\Users\\huangshuisheng\\Desktop\\docker\\srs
```

4.复制完成了，停止和删除临时容器

```bash
docker stop 946e41646b6ab02fa0a34f417b3560ddc620b0e2032f755faa7f60a68d3b9834
```

```bash
docker rm 946e41646b6ab02fa0a34f417b3560ddc620b0e2032f755faa7f60a68d3b9834
```

mac、linux 启动容器

```bash
LOCAL_DOCKER_SRS_PATH=/Users/huangshuisheng/Desktop/docker/srs \
&& docker run -d --rm \
--name billd-live-srs \
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

window 启动容器

```bash
LOCAL_DOCKER_SRS_PATH=C:\\Users\\huangshuisheng\\Desktop\\docker\\srs \
&& docker run -d --rm \
--name billd-live-srs \
--env CANDIDATE='ip地址' \
-p 1935:1935 \
-p 5001:8080 \
-p 1985:1985 \
-p 8000:8000/udp \
-v $LOCAL_DOCKER_SRS_PATH\\conf:/usr/local/srs/conf/ \
-v $LOCAL_DOCKER_SRS_PATH\\objs:/usr/local/srs/objs/ \
registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5.0.200 objs/srs \
-c conf/rtc2rtmp.conf
```
