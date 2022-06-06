# [MUdev.cc](https://mudev.cc) Frontend Repository <small><small>(with [PlayCo](https://mudev.cc/playco))</small></small>

> [여기](README-ko_kr.md)에 한국어 버전의 README가 있어요!  
> [Click here](README-ko_kr.md) to read a README written in Korean.  

> [Click here](https://github.com/MU-Software/mudev_backend) to visit backend repository.  

This repository contains the Frontend code of [MUdev.cc](https://mudev.cc) and [PlayCo](https://mudev.cc/playco) service.  

* This project uses Yarn berry with zero install. Just clone this repository, and run `yarn start` or `yarn build`.
* This project uses port 5500 instead of 3000. You can change it on [package.json](./package.json), but this can cause CORS problem as API server only allows `localhost:5500`.
* Currently, MUdev.cc frontend is using React 17, and we are planning to migrate with React 18.
* I know, as this project was written in hurry, so codes are dirty and TypeScript's typing is currently not applied correctly, but I'll clean it up continuously.

# Issues
If you have any questions, or if you found any bugs, please submit an new issue. I'm open to suggestions!
