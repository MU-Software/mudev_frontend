# [MUdev.cc](https://mudev.cc) 프론트엔드 저장소 <small><small>(with [PlayCo](https://mudev.cc/playco))</small></small>

> [여기](README.md)에 영어 버전의 README가 있어요!  
> [Click here](README.md) to read a README written in English.  

> [여기](https://github.com/MU-Software/mudev_backend)를 눌러 백엔드 저장소로 가실 수 있어요!  

이 곳은 [MUdev.cc](https://mudev.cc)와 하위 서비스인 [PlayCo](https://mudev.cc/playco)의 프론트엔드에 대한 코드 저장소입니다.  

* 이 프로젝트는 Yarn berry와 zero install 기능을 사용하고 있습니다. 이 저장소를 클론받으신 후, `yarn start`나 `yarn build`를 실행해주세요.
* 이 프로젝트는 Create-React-App가 흔히 사용하는 3000번 포트 대신 5500번 포트를 사용합니다. 이 포트 번호는 [package.json](./package.json)에서 설정하실 수 있지만, 서버에서는 `localhost:5500`만을 허락하기 때문에 CORS 문제가 발생할 수 있습니다.
* 현재, MUdev.cc는 React 17을 사용하고 있습니다, 현재 React 18로의 마이그레이션을 계획 중입니다.
* ...네, 부족한 실력으로 급하게 만들었다보니 코드도 더럽고, TypeScript의 타입도 제대로 적용되지 않았습니다. 조금 시간이 걸릴지라도 차근차근 정리해 나가겠습니다ㅠㅜ

# 이슈
만약 문의사항이 있으시거나 버그를 찾으신 분은 Issue를 생성해주세요! 이슈는 언제나 환영이에요!
