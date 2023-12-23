docker build -t mudev_proxy -f - . <<-DOCKERFILE_EOF
FROM nginx:alpine-slim

ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/\$TZ /etc/localtime && echo \$TZ > /etc/timezone

RUN echo $'\n\
user                    nginx;  \n\
worker_processes        auto;  \n\
pid                     /run/nginx.pid;  \n\
events {  \n\
    worker_connections  1024;  \n\
    multi_accept        on;  \n\
}  \n\
http {  \n\
    include             /etc/nginx/mime.types;  \n\
    default_type        application/octet-stream;  \n\
    upstream api {  \n\
        server          host.docker.internal:28000;  \n\
        keepalive       1024;  \n\
    }  \n\
    upstream front {  \n\
        server          host.docker.internal:23000;  \n\
        keepalive       1024;  \n\
    }  \n\
    upstream storybook {  \n\
        server          host.docker.internal:23001;  \n\
        keepalive       1024;  \n\
    }  \n\
    server {  \n\
        listen          80;  \n\
        location / {  \n\
            proxy_pass  http://front;  \n\
        }  \n\
        location /api {  \n\
            rewrite ^/api(.*)$ $1 break;  \n\
            proxy_pass  http://api;  \n\
        }  \n\
        location /sb {  \n\
            rewrite ^/sb(.*)$ $1 break;  \n\
            proxy_pass  http://storybook;  \n\
        }  \n\
    }  \n\
    access_log          /var/log/nginx/access.log;  \n\
    error_log           /var/log/nginx/error.log;  \n\
    sendfile            on;  \n\
    keepalive_timeout   65;  \n\
    include             /etc/nginx/conf.d/*.conf;  \n\
}' > /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE_EOF

(docker system prune -f) > /dev/null 2>&1
(docker stop mudev_proxy_container || true && docker rm mudev_proxy_container || true) > /dev/null 2>&1
docker run -d --name mudev_proxy_container -p 80:80 --rm mudev_proxy
