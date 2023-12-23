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
    server {  \n\
        listen          80;  \n\
        location / {  \n\
            rewrite ^/(.*) /\$1 break;  \n\
            proxy_pass  http://host.docker.internal:23000/;  \n\
        }  \n\
        location /api/ {  \n\
            rewrite ^/api/(.*) /\$1 break;  \n\
            proxy_pass  http://host.docker.internal:28000/;  \n\
        }  \n\
        location /storybook/ {  \n\
            proxy_pass  http://host.docker.internal:23001/;  \n\
            proxy_http_version 1.1;  \n\
            proxy_set_header   Upgrade \$http_upgrade;  \n\
            proxy_set_header   Connection "upgrade";  \n\
            proxy_set_header   Host \$host;  \n\
            proxy_set_header   Origin "";  \n\
            proxy_buffering    off;  \n\
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
