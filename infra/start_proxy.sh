if [ ! -f ./cert.pem ]; then
    brew install mkcert
    brew install nss
    mkcert -install
    mkcert -key-file key.pem -cert-file cert.pem '*.mudev.local' localhost 127.0.0.1 ::1
fi

docker build -t mudev_proxy -f - . <<-DOCKERFILE_EOF
FROM nginx:alpine-slim

ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/\$TZ /etc/localtime && echo \$TZ > /etc/timezone

COPY ./key.pem          /root/key.pem
COPY ./cert.pem         /root/cert.pem

RUN echo $'\n\
user                    nginx;  \n\
worker_processes        auto;  \n\
pid                     /run/nginx.pid;  \n\
events {  \n\
    worker_connections  65535;  \n\
    multi_accept        on;  \n\
}  \n\
http {  \n\
    include             /etc/nginx/mime.types;  \n\
    default_type        application/octet-stream;  \n\
    ssl_certificate     /root/cert.pem;  \n\
    ssl_certificate_key /root/key.pem;  \n\
    sendfile            on;  \n\
    server {  \n\
        listen          443 ssl;  \n\
        location / {  \n\
            rewrite ^/(.*) /\$1 break;  \n\
            proxy_pass            http://host.docker.internal:23000/;  \n\
            proxy_http_version    1.1;  \n\
            proxy_set_header      Upgrade \$http_upgrade;  \n\
            proxy_set_header      Connection "upgrade";  \n\
            proxy_set_header      Host \$host;  \n\
            proxy_set_header      Origin "";  \n\
            proxy_read_timeout    86400;  \n\
            proxy_buffering       off;  \n\
        }  \n\
        location /storybook/ {  \n\
            proxy_pass            http://host.docker.internal:23001/;  \n\
            proxy_http_version    1.1;  \n\
            proxy_set_header      Upgrade \$http_upgrade;  \n\
            proxy_set_header      Connection "upgrade";  \n\
            proxy_set_header      Host \$host;  \n\
            proxy_set_header      Origin "";  \n\
            proxy_read_timeout    86400;  \n\
            proxy_buffering       off;  \n\
        }  \n\
    }  \n\
}' > /etc/nginx/nginx.conf

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE_EOF

(docker system prune -f) > /dev/null 2>&1
(docker stop mudev_proxy_container || true && docker rm mudev_proxy_container || true) > /dev/null 2>&1
docker run -d --name mudev_proxy_container -p 443:443 --rm mudev_proxy
